#!/usr/bin/env bash
# Replace the game on GitHub Pages with the progress handoff page.
#
# This is the irreversible step of the domain move. After it, every player who
# opens zeroxm.github.io/pokemon-roulette/ meets the handoff page instead of
# the game, and their only route to their collection is the button on it.
#
# Do not run this until #71 says the product is ready to release.
set -euo pipefail

cd "$(dirname "$0")/.."

if [[ ${1:-} != --yes-replace-the-live-game ]]; then
  cat >&2 <<'WARN'
This replaces the live game at zeroxm.github.io/pokemon-roulette/ with the
handoff page, for every existing player, permanently.

Re-run with --yes-replace-the-live-game once that is genuinely the intent.
WARN
  exit 1
fi

echo "==> bundling the handoff script"
node_modules/.bin/esbuild src/app/migration/handoff-page.ts \
  --bundle --format=iife --target=es2018 --minify \
  --outfile=handoff/handoff.js

# The page is inert without its script: it would tell a player their progress
# is being checked, forever, and offer them a link that carries nothing.
grep -q 'migrate=' handoff/handoff.js || {
  echo "error: the bundled script does not build a migrate link: refusing to publish." >&2
  exit 1
}

# A CNAME here is the one unrecoverable mistake in this project: GitHub would
# 301 this URL before any script runs, and no player's localStorage could ever
# be read again.
if [[ -e handoff/CNAME ]]; then
  echo "error: handoff/CNAME exists. Publishing it would make GitHub 301 this" >&2
  echo "       URL and destroy the only migration path that exists." >&2
  exit 1
fi

# GitHub Pages serves 404.html for any path it does not have a file for, and
# players have bookmarked deep links like /pokemon-roulette/settings. Without
# this they would meet GitHub's own 404 page and never see the transfer button.
cp handoff/index.html handoff/404.html

echo "==> publishing handoff/ to gh-pages"
# The locally pinned copy, not `npx --yes`: this is the one command whose
# failure mode is "every existing player loses the route to their collection",
# so it should not depend on a fetch from the network at the moment it runs.
npx angular-cli-ghpages --dir=handoff --no-silent

echo "==> done. https://zeroxm.github.io/pokemon-roulette/"
