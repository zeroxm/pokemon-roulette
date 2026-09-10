#!/usr/bin/env bash
# Rehearse the domain move locally, against two genuinely different origins.
#
# `http://127.0.0.1:4201` and `http://localhost:4200` are separate origins by
# exactly the rule that separates zeroxm.github.io from zeroxm.com.br, so the
# storage isolation being tested here is real rather than simulated.
#
# Old origin: the actual gh-pages build, at the path players use.
# New origin: whatever `ng serve` is running.
set -euo pipefail

cd "$(dirname "$0")/.."

NEW_ORIGIN=${NEW_ORIGIN:-http://localhost:4200}
ROOT=${REHEARSAL_DIR:-$(mktemp -d)}
SITE="$ROOT/pokemon-roulette"

rm -rf "$SITE"; mkdir -p "$SITE"

case ${1:-game} in
  game)
    echo "==> serving the live gh-pages build as the old origin"
    git fetch --quiet origin gh-pages
    git archive origin/gh-pages | tar -x -C "$SITE"
    ;;
  handoff)
    echo "==> serving the handoff page as the old origin, pointing at $NEW_ORIGIN"
    cp handoff/index.html "$SITE/"
    cp handoff/index.html "$SITE/404.html"
    node_modules/.bin/esbuild src/app/migration/handoff-page.ts \
      --bundle --format=iife --target=es2018 \
      --define:__NEW_ORIGIN__="\"$NEW_ORIGIN\"" \
      --outfile="$SITE/handoff.js"
    ;;
  *)
    echo "usage: $0 [game|handoff]" >&2; exit 1 ;;
esac

echo "==> http://127.0.0.1:4201/pokemon-roulette/  (ctrl-c to stop)"
cd "$ROOT" && exec python3 -m http.server 4201 --bind 127.0.0.1
