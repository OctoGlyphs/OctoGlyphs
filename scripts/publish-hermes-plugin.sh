#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
HERMES_SRC="$ROOT_DIR/plugin/hosts/hermes"
GAME_DIR="$ROOT_DIR/game"
MIRROR_URL="${HERMES_MIRROR_URL:-git@github.com:OctoGlyphs/hermes-octoglyphs.git}"
MIRROR_DIR="${HERMES_MIRROR_DIR:-/tmp/octoglyphs-hermes-octoglyphs}"
PUSH=0

if [[ "${1:-}" == "--push" ]]; then
    PUSH=1
fi

echo "Building shared OctoGlyphs game..."
npm --prefix "$GAME_DIR" install
npm --prefix "$GAME_DIR" test
npm --prefix "$GAME_DIR" run build -- --logLevel warn

echo "Syncing game build into Hermes plugin public folder..."
rm -rf "$HERMES_SRC/public"
mkdir -p "$HERMES_SRC/public"
cp -R "$GAME_DIR/dist/." "$HERMES_SRC/public/"

echo "Verifying Hermes plugin..."
(
    cd "$HERMES_SRC"
    python3 -m py_compile __init__.py octoglyphs_sidecar.py
    python3 -m unittest discover -s tests
)

if [[ ! -d "$MIRROR_DIR/.git" ]]; then
    echo "Cloning Hermes release mirror into $MIRROR_DIR..."
    rm -rf "$MIRROR_DIR"
    git clone "$MIRROR_URL" "$MIRROR_DIR"
fi

echo "Copying Hermes plugin root into release mirror..."
find "$MIRROR_DIR" -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +
rsync -a \
    --exclude '__pycache__/' \
    --exclude '*.pyc' \
    --exclude '.pytest_cache/' \
    "$HERMES_SRC/" "$MIRROR_DIR/"

(
    cd "$MIRROR_DIR"
    git status --short
    if [[ -n "$(git status --porcelain)" ]]; then
        git add -A
        git commit -m "Release Hermes OctoGlyphs plugin"
        if [[ "$PUSH" -eq 1 ]]; then
            git push
        else
            echo "Mirror commit created locally. Run with --push to push automatically, or push from $MIRROR_DIR."
        fi
    else
        echo "Hermes release mirror already up to date."
    fi
)

echo "Hermes plugin mirror is ready."
