#!/usr/bin/env bash
# Build the game and publish it to Cloudflare Pages.
#
# Direct Upload: Cloudflare is given an API token and the built files, and has
# no access to this repository. Releases happen when this is run, not on every
# push.
#
# One-time setup and the DNS cutover are in deploy/cloudflare-pages.md.
set -euo pipefail

PROJECT=${CLOUDFLARE_PAGES_PROJECT:-pokemon-roulette}
OUTPUT=dist/pokemon-roulette/browser
WRANGLER=${WRANGLER_VERSION:-wrangler@4}

cd "$(dirname "$0")/.."

: "${CLOUDFLARE_API_TOKEN:?set CLOUDFLARE_API_TOKEN (a token with the 'Cloudflare Pages: Edit' permission)}"
: "${CLOUDFLARE_ACCOUNT_ID:?set CLOUDFLARE_ACCOUNT_ID (Cloudflare dashboard -> Workers & Pages -> Account ID)}"

if [[ -n $(git status --porcelain) ]]; then
  echo "warning: working tree is dirty — deploying files that are not committed" >&2
fi

COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo unknown)

echo "==> building (base href defaults to /, which is what a domain root wants)"
npm run build

# A wrong base href is the failure that looks like a broken CDN: the page loads
# and every asset 404s.
if ! grep -q '<base href="/">' "$OUTPUT/index.html"; then
  echo "error: $OUTPUT/index.html does not have <base href=\"/\">." >&2
  echo "       Did this build run with --base-href=/pokemon-roulette/ by mistake?" >&2
  exit 1
fi

for required in _redirects _headers; do
  [[ -f "$OUTPUT/$required" ]] || {
    echo "error: $required missing from the build output." >&2
    echo "       It lives in public/ and Angular copies it; without it, every" >&2
    echo "       client-side route 404s on Pages." >&2
    exit 1
  }
done

echo "==> publishing $COMMIT to Cloudflare Pages project '$PROJECT'"
# --branch main marks this a PRODUCTION deployment. Any other value publishes a
# preview URL instead, which is a quiet way to deploy nothing.
npx --yes "$WRANGLER" pages deploy "$OUTPUT" \
  --project-name "$PROJECT" \
  --branch main \
  --commit-hash "$COMMIT" \
  --commit-dirty=true

echo "==> done. https://pokemon-roulette.zeroxm.com.br"
