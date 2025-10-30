#!/usr/bin/env bash
set -euo pipefail

NOTEBOOK_PATH="${1:-}"

if [ -z "${NOTEBOOK_PATH}" ]; then
  NOTEBOOK_PATH=$(find . -type f -iname "*influencer*.ipynb" | head -n 1 || true)
fi

if [ -z "${NOTEBOOK_PATH}" ]; then
  echo "couldn't find a notebook. pass a path, e.g.:"
  echo "bash scripts/run_influencer_notebook.sh path/to/notebook.ipynb"
  exit 1
fi

echo "executing: ${NOTEBOOK_PATH}"
jupyter nbconvert --to notebook --execute --inplace "${NOTEBOOK_PATH}" --ExecutePreprocessor.timeout=-1