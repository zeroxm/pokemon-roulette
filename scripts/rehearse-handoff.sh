#!/usr/bin/env bash
# Rehearse the domain move, against two genuinely different origins.
#
# `http://127.0.0.1:4201` and the production domain are separate origins by
# exactly the rule that separates zeroxm.github.io from zeroxm.com.br, so the
# storage isolation being tested here is real rather than simulated.
#
#   ./scripts/rehearse-handoff.sh game
#       Serves the *live gh-pages build* at http://127.0.0.1:4201/pokemon-roulette/
#       Play for a few minutes. What you build up is stored against that origin,
#       exactly as a real player's collection is stored against zeroxm.github.io.
#
#   ctrl-c, then:
#
#   ./scripts/rehearse-handoff.sh handoff
#       Replaces the game with the handoff page at the same address, which is
#       the irreversible step, performed on a copy that costs nothing.
#       Reload, press "Transfer my progress", and check what arrives.
#
# Override the destination with NEW_ORIGIN=... for a local target.
set -euo pipefail

cd "$(dirname "$0")/.."

NEW_ORIGIN=${NEW_ORIGIN:-https://pokemon-roulette.zeroxm.com.br}
# A fixed directory, so `game` and `handoff` are two states of one rehearsal
# rather than two unrelated ones.
ROOT=${REHEARSAL_DIR:-${TMPDIR:-/tmp}/pokemon-roulette-rehearsal}
SITE="$ROOT/pokemon-roulette"

rm -rf "$SITE"; mkdir -p "$SITE"

case ${1:-game} in
  game)
    echo "==> serving the live gh-pages build as the old origin"
    git fetch --quiet origin gh-pages
    git archive origin/gh-pages | tar -x -C "$SITE"
    echo "    play a little; your collection is stored against 127.0.0.1:4201"
    ;;
  handoff)
    echo "==> replacing it with the handoff page, pointing at $NEW_ORIGIN"
    cp handoff/index.html "$SITE/index.html"
    # GitHub Pages serves 404.html for deep bookmarks like /settings.
    cp handoff/index.html "$SITE/404.html"
    node_modules/.bin/esbuild src/app/migration/handoff-page.ts \
      --bundle --format=iife --target=es2018 \
      --define:__NEW_ORIGIN__="\"$NEW_ORIGIN\"" \
      --outfile="$SITE/handoff.js"
    echo "    reload the page and press \"Transfer my progress\""
    ;;
  *)
    echo "usage: $0 [game|handoff]" >&2; exit 1 ;;
esac

echo
echo "    http://127.0.0.1:4201/pokemon-roulette/      (ctrl-c to stop)"
echo
cd "$ROOT" && exec python3 -m http.server 4201 --bind 127.0.0.1
