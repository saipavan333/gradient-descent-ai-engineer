# Gradient Descent — a zero-to-job-ready AI/ML engineer curriculum

A complete, self-paced static website: **14 tracks, 127 pages, 107 runnable notebooks**.
Open **`index.html`** to start. New here? Read **`lessons/start-here.html`** first.

Everything is self-contained (KaTeX is bundled), so it works **online or fully offline**.

## Run it locally
Just open `index.html` in any web browser. No server or internet needed.

## Put it online (pick one — all free)

**Netlify Drop (fastest, ~1 min):**
1. Go to https://app.netlify.com/drop
2. Drag this whole folder onto the page.
3. You get a live URL instantly. (Make a free account to keep it permanent.)

**GitHub Pages (permanent):**
1. Create a new GitHub repo and upload these files to it (keep the folder structure; `index.html` at the root).
2. Repo → **Settings → Pages** → Source: **Deploy from a branch** → Branch: **main** / **/(root)** → Save.
3. Your site goes live at `https://<username>.github.io/<repo>/` in a minute or two.

**Cloudflare Pages / Vercel:** connect the GitHub repo (build command: none; output dir: `/`), or drag-and-drop the folder.

## Structure
- `index.html` — home / the learning path
- `lessons/` — all lesson pages (+ `start-here.html`, `glossary.html`)
- `assets/` — styles, fonts, KaTeX, images
- `notebooks/` — runnable Jupyter notebooks (`.ipynb`) linked from lessons
