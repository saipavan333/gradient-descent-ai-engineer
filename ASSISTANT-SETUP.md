# Turn on AI answers for your Course Assistant (free, ~10 minutes, no coding)

Your course already has the assistant built in. Out of the box it answers from your lessons
("offline mode"). This guide switches it into full **AI mode**, where it reads each student's
question and writes a real, reasoned answer grounded in your course — for free.

You do three things, once: **(1)** get a free Google Gemini key, **(2)** deploy a tiny "worker"
that keeps that key safe, **(3)** paste the worker's address into one file.

**Cost: free.** The Gemini free tier needs no credit card, and the worker's free tier covers
100,000 requests/day. Because no card is attached, **you can never be charged** — worst case,
the free daily quota pauses until the next day and the assistant falls back to offline mode.

---

## Step 1 — Get a free Gemini API key (2 min)

1. Go to **https://aistudio.google.com/apikey** and sign in with a Google account.
2. Click **Create API key**.
3. Copy the key (a long string starting with `AIza…`). Keep it handy for Step 3.

No card, no billing.

## Step 2 — Create the free "worker" (5 min)

1. Go to **https://dash.cloudflare.com** and create a free account (or sign in).
2. Left menu → **Workers & Pages** → **Create** → **Create Worker**.
3. Name it `gd-assistant-proxy`, then click **Deploy** (a placeholder deploys — that's fine).
4. Click **Edit code**. Select everything in the editor and delete it.
5. Open **`worker/assistant-proxy.js`** from your course folder, copy the whole file, and paste it in.
6. Click **Deploy** (top right).

## Step 3 — Give the worker your Gemini key (2 min)

1. Still in the worker: **Settings** → **Variables and Secrets**.
2. Click **Add**, choose **Secret** (encrypted):
   - **Name:** `GEMINI_API_KEY`
   - **Value:** paste your Gemini key from Step 1
3. Click **Save and deploy**.
4. *(Optional, recommended)* Add a plain **Variable** named `ALLOWED_ORIGINS` with your site
   address (e.g. `https://yourname.github.io`) so only your site can use the worker.

## Step 4 — Connect it to your site (1 min)

1. At the top of the worker page, copy its URL — like `https://gd-assistant-proxy.yourname.workers.dev`.
2. Open **`assets/assistant-config.js`** in your course folder and paste the URL between the quotes:
   ```js
   window.GD_ASSIST_PROXY = "https://gd-assistant-proxy.yourname.workers.dev";
   ```
3. Save, then push your site (the usual PowerShell push).

## Step 5 — Test it

Open your live course, click **Ask AI**, and ask *"what is RAG?"*. You should get a written,
reasoned answer, and the dot at the bottom of the panel reads **AI mode**. If the AI is ever
unreachable, it quietly falls back to the offline answer — students never see a raw error.

---

## Troubleshooting

- **Still says "Offline mode":** confirm you saved `assets/assistant-config.js` with the URL and
  pushed, then hard-refresh the page (Ctrl+Shift+R).
- **"Couldn't get an AI answer":** in the worker's **Settings → Variables and Secrets**, confirm
  `GEMINI_API_KEY` is set and re-deploy.
- **Rate-limit errors when many students use it at once:** add a **Variable** `GEMINI_MODEL` =
  `gemini-2.5-flash-lite` (higher free daily limit). If a model name ever stops working, check the
  current free models at https://aistudio.google.com and set `GEMINI_MODEL` to one of them.
- **Lock it to your site only:** set `ALLOWED_ORIGINS` (Step 3.4).

## Later, when you charge for the course
Right now anyone on your site can use the assistant. When you add student logins (subscriptions),
the worker can be extended to require a valid login token, so only paying students use your quota.
Ask me and I'll wire that in.
