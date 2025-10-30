import argparse
import json
import sys
from pathlib import Path

from .core import Bot
from .pipeline.preprocess import preprocess_file


def cmd_clean(args):
    bot = Bot()
    params = {
        "noise_reduce": args.noise_reduce,
        "noise_floor": args.noise_floor,
        "deess_center": args.deess_center,
        "deess_strength": args.deess_strength,
        "highpass": args.highpass,
        "lowpass": args.lowpass,
        "limiter": args.limiter,
    }
    if args.use_recommend:
        params = bot.recommend("clean", params)
    res = bot.skills["clean"].run(Path(args.input), Path(args.output) if args.output else None, args.keep_float, **params)
    if args.learn:
        bot.learn_preference("clean", params)
    print(json.dumps(res, indent=2))


def cmd_separate(args):
    bot = Bot()
    res = bot.skills["separate"].run(Path(args.input), Path(args.outdir) if args.outdir else None, args.model, args.stems, args.target)
    print(json.dumps(res, indent=2))


def cmd_inspect(args):
    bot = Bot()
    res = bot.skills["inspect"].run(Path(args.input))
    print(json.dumps(res, indent=2))


def cmd_preset(args):
    bot = Bot()
    if args.action == "save":
        with open(args.file, "r", encoding="utf-8") as f:
            params = json.load(f)
        bot.memory.save_preset(args.name, params)
        print(f"Saved preset '{args.name}'")
    elif args.action == "list":
        for name, params in bot.memory.list_presets():
            print(name, json.dumps(params))
    elif args.action == "get":
        params = bot.memory.get_preset(args.name)
        print(json.dumps(params or {}))


def cmd_train(args):
    bot = Bot()
    # Basic training: accumulate preferences from a JSONL file of parameter sets
    # Each line: {"context":"clean", "params": { ... }}
    with open(args.file, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                obj = json.loads(line)
                ctx = obj.get("context", "clean")
                params = obj.get("params", {})
                bot.learn_preference(ctx, params)
            except Exception:
                continue
    print("Training data ingested and preferences updated.")


def cmd_serve(args):
    # Reuse existing web app to reduce duplication
    import uvicorn
    uvicorn.run("web.app:app", host=args.host, port=args.port, reload=False)

def cmd_preprocess(args):
    inp = Path(args.input)
    out = Path(args.output) if args.output else inp.with_name(f"{inp.stem}_preprocessed.wav")
    res = preprocess_file(inp, out)
    print(json.dumps({"ok": True, "output": str(res.output), "segments": res.segments_count}, indent=2))

def cmd_serve_lit(args):
    try:
        from audiobot.agents.litserve_app import build_server
        import uvicorn
    except Exception as e:
        print("LitServe not installed. Install with: pip install litserve")
        return 1
    server = build_server()
    app = server.to_fastapi()
    uvicorn.run(app, host=args.host, port=args.port, reload=False)

def main(argv=None):
    parser = argparse.ArgumentParser(prog="audiobot", description="Modular audio bot with memory and web UI")
    sub = parser.add_subparsers(dest="cmd")

    p_clean = sub.add_parser("clean", help="Clean a file with FFmpeg filters")
    p_clean.add_argument("input")
    p_clean.add_argument("-o", "--output")
    p_clean.add_argument("--noise-reduce", type=float, default=12)
    p_clean.add_argument("--noise-floor", type=float, default=-28)
    p_clean.add_argument("--deess-center", type=float, default=0.25)
    p_clean.add_argument("--deess-strength", type=float, default=1.2)
    p_clean.add_argument("--highpass", type=int, default=70)
    p_clean.add_argument("--lowpass", type=int, default=18000)
    p_clean.add_argument("--limiter", type=float, default=0.95)
    p_clean.add_argument("--keep-float", action="store_true")
    p_clean.add_argument("--use-recommend", action="store_true", help="Apply learned preferences")
    p_clean.add_argument("--learn", action="store_true", help="Update preferences with used params")
    p_clean.set_defaults(func=cmd_clean)

    p_sep = sub.add_parser("separate", help="Separate stems with Demucs")
    p_sep.add_argument("input")
    p_sep.add_argument("-d", "--outdir")
    p_sep.add_argument("-m", "--model", default="htdemucs")
    p_sep.add_argument("-s", "--stems", type=int, default=4)
    p_sep.add_argument("-t", "--target", default="vocals")
    p_sep.set_defaults(func=cmd_separate)

    p_insp = sub.add_parser("inspect", help="Inspect audio properties")
    p_insp.add_argument("input")
    p_insp.set_defaults(func=cmd_inspect)

    p_preset = sub.add_parser("preset", help="Manage presets")
    p_preset.add_argument("action", choices=["save", "list", "get"]) 
    p_preset.add_argument("name", nargs="?")
    p_preset.add_argument("-f", "--file")
    p_preset.set_defaults(func=cmd_preset)

    p_train = sub.add_parser("train", help="Ingest JSONL of parameter sets to learn preferences")
    p_train.add_argument("file")
    p_train.set_defaults(func=cmd_train)

    p_serve = sub.add_parser("serve", help="Run the web server")
    p_serve.add_argument("-p", "--port", type=int, default=8000)
    p_serve.add_argument("-H", "--host", default="0.0.0.0")
    p_serve.set_defaults(func=cmd_serve)

    p_lit = sub.add_parser("serve-lit", help="Run LitServe agent endpoints (/lit)")
    p_lit.add_argument("-p", "--port", type=int, default=8080)
    p_lit.add_argument("-H", "--host", default="0.0.0.0")
    p_lit.set_defaults(func=cmd_serve_lit)

    p_pre = sub.add_parser("preprocess", help="VAD→Enhance(Demucs)→Dereverb pipeline")
    p_pre.add_argument("input")
    p_pre.add_argument("-o", "--output")
    p_pre.set_defaults(func=cmd_preprocess)

    args = parser.parse_args(argv)
    if not hasattr(args, "func"):
        parser.print_help()
        return 1
    return args.func(args)


if __name__ == "__main__":
    sys.exit(main())
