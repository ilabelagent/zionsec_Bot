# Repository Guidelines

## Project Structure & Module Organization
The TypeScript Express backend lives in `server/`, with orchestrator wiring in `server/index.ts` and service modules in `server/*.ts`. React UI and Tailwind components are under `client/src`, bundled alongside static assets near `client/index.html`. Multi-agent runtimes and launch scripts sit in `agents/` and `deployment/`, while shared schemas land in `shared/schema.ts` and database migrations in `drizzle/`. Integration tests and diagnostic scripts reside in `tests/` and the top-level `test_*.py` and `.ts` files.

## Build, Test, and Development Commands
- `npm run dev` starts the Express server via `tsx` for interactive development.
- `npm run build` bundles the client and emits the server ESM bundle into `dist/`.
- `npm run start` serves the compiled backend; run it against the bundled agents.
- `npm run check` runs the TypeScript compiler as a preflight sanity check.
- `npm run db:push` syncs Drizzle migrations.
- `./start_agents.sh` or `python deployment/start_agents.py` launches the terminal + SDK agents.

## Coding Style & Naming Conventions
Stick to ES modules with 2-space indentation and trailing commas on multi-line lists. React components, services, and hooks use PascalCase filenames paired with camelCase exports, while Python utilities stay snake_case. Prefer Tailwind utility classes inside JSX over ad-hoc CSS, and run Prettier/Black in "format-on-save" mode without introducing unrelated churn.

## Testing Guidelines
Keep agent smoke tests in `tests/` or adjacent `test_*.ts`/`test_*.py` scripts. Run `python tests/test_all_agents.py` to exercise both HTTP agents and `tsx test_orchestrator_integration.ts` to validate orchestrator flows once services are up. Capture failing payloads in fixtures or comments so reviewers can reproduce issues quickly.

## Commit & Pull Request Guidelines
Match the repository's imperative commit style (e.g., `Add agent health endpoints`). Commit small, reviewable slices and avoid mixing refactors with feature work. Pull requests should describe intent, list local verification commands, and link any related tickets. Provide screenshots or terminal captures when changing UI dashboards or agent responses.

## Security & Configuration Tips
Load secrets through `.env` files consumed by `dotenv` and exclude them from version control. Touching database connectivity requires verifying `CONNECTION_INFO.md` and running `confirm_db_push.sh` before deployment. Rotate API keys used in `agents/sdk_agent` and document required environment variables in your PR notes.
