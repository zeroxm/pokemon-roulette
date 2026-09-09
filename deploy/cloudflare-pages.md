# Moving the game to Cloudflare Pages

The game currently runs on **automaton**, behind Traefik and the Cloudflare tunnel. This is how to
move it to Cloudflare Pages, and how to keep deploying once it is there.

Nothing here is urgent. Automaton works, and the two differ mainly in who is responsible for uptime.

| | automaton (today) | Cloudflare Pages |
|---|---|---|
| Cost | free | free |
| Uptime | your server | Cloudflare's |
| CDN | none — every request crosses the tunnel | global |
| Deploy | `scripts/deploy.sh` from the skill | `scripts/deploy-cloudflare.sh` |
| Repo access | none | none, with Direct Upload |

---

## One-time setup

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

That publishes to `pokemon-roulette.pages.dev`. **Open it and check the game works there** — the
whole point of doing this before the DNS change is that automaton keeps serving players while you
look.

---

## The cutover

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

Keep the directory. Bringing it back is `docker compose up -d`, which is the rollback if Pages
disappoints.

---

## Deploying after that

```bash
source ~/.config/pokemon-roulette/cloudflare.env
./scripts/deploy-cloudflare.sh
```

That is the whole loop. The script builds, checks two things that would otherwise fail silently, and
publishes.

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
