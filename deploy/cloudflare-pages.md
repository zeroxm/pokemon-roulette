# Deploying the game to Cloudflare Pages

`pokemon-roulette.zeroxm.com.br` is served by **Cloudflare Pages**, by Direct Upload — Cloudflare
has no access to the repository. The interim copy on automaton is gone; the **API stays on
automaton**, because it is not a static site and Pages cannot host it.

**To deploy, this is the whole loop:**

```bash
source ~/.config/pokemon-roulette/cloudflare.env
./scripts/deploy-cloudflare.sh
```

The rest of this file is the setup that is already done, kept because it is how to rebuild this
from nothing.

---

## One-time setup (done)

### 1. An API token

Cloudflare dashboard → **My Profile → API Tokens → Create Token → Custom token**.

- Permission: **Account → Cloudflare Pages → Edit**
- Nothing else. This token can publish a Pages project and do nothing else to the account.

Keep it somewhere your shell can read, and **not** in this repository:

```bash
# ~/.config/pokemon-roulette/cloudflare.env  (chmod 600)
export CLOUDFLARE_API_TOKEN=...
export CLOUDFLARE_ACCOUNT_ID=...   # Workers & Pages -> Account ID, right-hand column
```

### 2. The project

```bash
source ~/.config/pokemon-roulette/cloudflare.env
npx --yes wrangler@4 pages project create pokemon-roulette --production-branch main
```

### 3. First deploy, before touching DNS

```bash
source ~/.config/pokemon-roulette/cloudflare.env
./scripts/deploy-cloudflare.sh
```

That publishes to a `*.pages.dev` URL. **Open it and check the game works there** — the point of
doing this before the DNS change is that the old deployment keeps serving players while you look.

One limit to know about: **`*.pages.dev` cannot test anything account-shaped.** The API's CORS
allowlist holds only the real hostname, and the session cookie is scoped to `.zeroxm.com.br`, which
`pages.dev` is not part of. Preview URLs are for looking at the game, not for signing in.

---

## The cutover (done)

Only after the `.pages.dev` URL is verified.

### 4. Point the domain at Pages

Cloudflare dashboard → **Workers & Pages → pokemon-roulette → Custom domains → Set up a custom
domain** → `pokemon-roulette.zeroxm.com.br`.

Cloudflare repoints the DNS record itself. **It will conflict with the existing record**, which
today sends that hostname down the tunnel — accept the replacement.

### 5. Remove the tunnel route

Cloudflare dashboard → **Zero Trust → Networks → Tunnels** → your tunnel → **Public hostnames** →
delete the entry for `pokemon-roulette.zeroxm.com.br`.

Leave `pokemon-roulette-api.zeroxm.com.br` alone. **The API stays on automaton** — it is not a
static site and Pages cannot host it.

### 6. Stop the container

```bash
ssh automaton 'cd ~/apps/pokemon-roulette-web && docker compose down'
```

Done, and the stack directory and images were removed with it — Pages is now the only host for this
hostname, so a stopped container with a live Traefik host rule was a surprise waiting to happen.
Rebuilding it is `docker build` plus the deploy skill, not `docker compose up`.

---

## What the deploy script does

The script builds, checks two things that would otherwise fail silently, and publishes.

**What it checks, and why those two:**

- **`<base href="/">`** — building with `--base-href=/pokemon-roulette/` by mistake produces a page
  that loads and then 404s every asset. It looks like a broken CDN rather than a wrong build flag.
- **`_redirects` and `_headers` reached the output** — without `_redirects`, every client-side route
  (`/settings`, `/credits`) is a 404 on a reload or a shared link.

It also deploys with `--branch main`, which is what makes a deployment **production**. Any other
branch name publishes a preview URL, which is a quiet way to deploy nothing.

---

## What does not change

**GitHub Pages keeps serving the old URL either way.** Moving to Cloudflare Pages is not the
migration cutover — that is #59, and it comes only after UAT (#60). Until then existing players stay
on `zeroxm.github.io/pokemon-roulette/` with their Pokédex intact.

**Never add a `CNAME` file to this repo.** GitHub Pages would then 301 the old URL to the custom
domain, and that redirect happens before any JavaScript can run — destroying the only path by which
an existing player's `localStorage` can ever be read.
