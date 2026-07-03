#!/usr/bin/env bash
# TRINITY RIFT — engine bootstrap & verification loop.
#
# Downloads Godot 4.4.1 into tools/, imports assets, syntax-checks every
# script with the real engine, runs the headless unit tests, and captures
# gameplay screenshots under Xvfb (Linux) into docs/screenshots/.
#
# Usage:   ./tools/bootstrap.sh            # everything
#          ./tools/bootstrap.sh check      # import + script checks + tests only
set -euo pipefail
cd "$(dirname "$0")/.."

GODOT=tools/godot
VER=4.4.1-stable
URL="https://github.com/godotengine/godot/releases/download/${VER}/Godot_v${VER}_linux.x86_64.zip"

if [ ! -x "$GODOT" ]; then
  echo "== downloading Godot ${VER} =="
  curl -L -o tools/godot.zip "$URL"
  unzip -o -q tools/godot.zip -d tools/
  mv "tools/Godot_v${VER}_linux.x86_64" "$GODOT"
  rm -f tools/godot.zip
fi
"$GODOT" --version

echo "== importing assets (headless) =="
"$GODOT" --headless --path . --import

echo "== engine syntax check: every .gd =="
fail=0
while IFS= read -r f; do
  if ! "$GODOT" --headless --path . --check-only --script "$f" >/dev/null 2>&1; then
    echo "  SCRIPT ERROR: $f"
    "$GODOT" --headless --path . --check-only --script "$f" || true
    fail=1
  fi
done < <(find . -name '*.gd' -not -path './web-prototype/*' -not -path './.godot/*')
[ "$fail" -eq 0 ] && echo "  all scripts OK"

echo "== unit tests (headless) =="
"$GODOT" --headless --path . --script tools/run_tests.gd

if [ "${1:-all}" = "check" ]; then exit $fail; fi

echo "== screenshots under Xvfb =="
if command -v xvfb-run >/dev/null; then
  xvfb-run -a "$GODOT" --path . --rendering-driver opengl3 --resolution 1280x720 \
    --script tools/screenshot.gd || {
      echo "  opengl3 failed; retrying with default driver"
      xvfb-run -a "$GODOT" --path . --resolution 1280x720 --script tools/screenshot.gd
    }
  ls -la docs/screenshots/ || true
else
  echo "  xvfb-run not found — run the game manually: $GODOT --path ."
fi
exit $fail
