#!/usr/bin/env bash
# Engine-free verification (works anywhere Python + gdtoolkit are available):
#   pip install gdtoolkit pillow
#   ./tools/check.sh
set -euo pipefail
cd "$(dirname "$0")/.."

echo "== gdparse (GDScript 4 grammar) =="
find . -name '*.gd' -not -path './web-prototype/*' -not -path './.godot/*' -print0 \
  | xargs -0 gdparse
echo "  all scripts parse"

echo "== project & content validation =="
python3 tools/validate_project.py

echo "== asset generator determinism =="
python3 tools/gen_assets.py >/dev/null
git diff --quiet -- assets/generated && echo "  assets stable" || {
  echo "  WARNING: regenerating assets produced changes"; git diff --stat -- assets/generated | tail -3; }
