/* ============================================================================
   Gradient Ascent — site engine
   - single source of truth for the curriculum
   - renders sidebar, breadcrumb, prev/next (always lands at top)
   - interactive quizzes, collapsible solutions, theme, progress, math
   ========================================================================== */
(function () {
  "use strict";

  /* --------------------------------------------------------------------------
     CURRICULUM  (the learning path; order matters — never depends on later)
     status: "done"  -> built & linkable
             "soon"  -> planned, shown greyed
     file paths are relative to the site root.
     -------------------------------------------------------------------------- */
  const T1 = "lessons/track-1-linear-algebra-probability/";
  const TRACKS = [
    {
      n: 1, id: "t1", title: "Linear Algebra & Probability",
      desc: "The language of ML — vectors, matrices, and uncertainty, built from geometric intuition.",
      lessons: [
        { id: "t1-l00", title: "Overview & how to learn this",          file: T1 + "00-overview.html",              status: "done" },
        { id: "t1-l01", title: "Vectors: the atoms of ML",              file: T1 + "01-vectors.html",               status: "done" },
        { id: "t1-l02", title: "Vector operations & geometry",          file: T1 + "02-vector-operations.html",     status: "done" },
        { id: "t1-l03", title: "The dot product: length, angle, projection", file: T1 + "03-dot-product.html",       status: "done" },
        { id: "t1-l04", title: "Linear combinations, span & basis",     file: T1 + "04-span-basis.html",            status: "done" },
        { id: "t1-l05", title: "Matrices as linear transformations",    file: T1 + "05-matrices-as-maps.html",      status: "done" },
        { id: "t1-l06", title: "Matrix multiplication = composition",   file: T1 + "06-matrix-multiplication.html", status: "done" },
        { id: "t1-l07", title: "Determinant: area, volume, invertibility", file: T1 + "07-determinant.html", status: "done" },
        { id: "t1-l08", title: "Eigenvectors & eigenvalues",            file: T1 + "08-eigenvectors.html", status: "done" },
        { id: "t1-l09", title: "Probability foundations & Bayes' rule", file: T1 + "09-probability-bayes.html", status: "done" },
        { id: "t1-l10", title: "Random variables & distributions",      file: T1 + "10-random-variables.html", status: "done" },
        { id: "t1-l11", title: "Expectation, variance, covariance",     file: T1 + "11-expectation-variance.html", status: "done" },
        { id: "t1-l12", title: "Gaussian, MLE & the bridge to ML",      file: T1 + "12-gaussian-mle.html", status: "done" },
      ],
    },
    {
      n: 2, id: "t2", title: "Optimization",
      desc: "How models learn: gradients, convexity, momentum, Adam, and second-order ideas.",
      lessons: [
        { id: "t2-l00", title: "Derivatives & gradients, geometrically", file: "lessons/track-2-optimization/00-derivatives-gradients.html", status: "done" },
        { id: "t2-l01", title: "Gradient descent from scratch",          file: "lessons/track-2-optimization/01-gradient-descent.html", status: "done" },
        { id: "t2-l02", title: "Convexity & why it matters",             file: "lessons/track-2-optimization/02-convexity.html", status: "done" },
        { id: "t2-l03", title: "Momentum, RMSProp, Adam",                file: "lessons/track-2-optimization/03-momentum-adam.html", status: "done" },
        { id: "t2-l04", title: "Newton's method & second-order ideas",   file: "lessons/track-2-optimization/04-newton-second-order.html", status: "done" },
      ],
    },
    {
      n: 3, id: "t3", title: "ML Theory",
      desc: "Why learning generalizes: bias–variance, regularization, and PAC intuition.",
      lessons: [
        { id: "t3-l00", title: "The learning problem & generalization", file: "lessons/track-3-ml-theory/00-generalization.html", status: "done" },
        { id: "t3-l01", title: "Bias–variance decomposition",          file: "lessons/track-3-ml-theory/01-bias-variance.html", status: "done" },
        { id: "t3-l02", title: "Regularization (L1/L2) geometrically",  file: "lessons/track-3-ml-theory/02-regularization.html", status: "done" },
        { id: "t3-l03", title: "PAC learning & VC dimension intuition", file: "lessons/track-3-ml-theory/03-pac-vc.html", status: "done" },
      ],
    },
    {
      n: 4, id: "t4", title: "Deep Learning from Scratch",
      desc: "Build a working autograd engine, backprop, optimizers, and train MLPs.",
      lessons: [
        { id: "t4-l00", title: "The neuron & the computational graph", file: "lessons/track-4-deep-learning/00-neuron-graph.html", status: "done" },
        { id: "t4-l01", title: "Backpropagation by hand",              file: "lessons/track-4-deep-learning/01-backpropagation.html", status: "done" },
        { id: "t4-l02", title: "Build an autograd engine",             file: "lessons/track-4-deep-learning/02-autograd-engine.html", status: "done" },
        { id: "t4-l03", title: "MLPs, activations & initialization",   file: "lessons/track-4-deep-learning/03-mlp-activations.html", status: "done" },
        { id: "t4-l04", title: "Optimizers & training loops",          file: "lessons/track-4-deep-learning/04-training-loop.html", status: "done" },
      ],
    },
    {
      n: 5, id: "t5", title: "Transformers from Scratch",
      desc: "Attention, positional encodings, and a small GPT you implement and train.",
      lessons: [
        { id: "t5-l00", title: "From sequences to attention",   file: "lessons/track-5-transformers/00-sequences-attention.html", status: "done" },
        { id: "t5-l01", title: "Self-attention, step by step",  file: "lessons/track-5-transformers/01-self-attention.html", status: "done" },
        { id: "t5-l02", title: "Multi-head attention & MLP block", file: "lessons/track-5-transformers/02-multihead-block.html", status: "done" },
        { id: "t5-l03", title: "Positional encodings",          file: "lessons/track-5-transformers/03-positional-encoding.html", status: "done" },
        { id: "t5-l04", title: "Build & train a small GPT",     file: "lessons/track-5-transformers/04-build-gpt.html", status: "done" },
      ],
    },
    {
      n: 6, id: "t6", title: "Generative Models",
      desc: "VAEs, GANs, diffusion, and autoregressive models — theory and code.",
      lessons: [
        { id: "t6-l00", title: "What is a generative model?",  file: "lessons/track-6-generative/00-what-is-generative.html", status: "done" },
        { id: "t6-l01", title: "Autoregressive models",        file: "lessons/track-6-generative/01-autoregressive.html", status: "done" },
        { id: "t6-l02", title: "Variational autoencoders",     file: "lessons/track-6-generative/02-vae.html", status: "done" },
        { id: "t6-l03", title: "GANs",                         file: "lessons/track-6-generative/03-gan.html", status: "done" },
        { id: "t6-l04", title: "Diffusion models",             file: "lessons/track-6-generative/04-diffusion.html", status: "done" },
      ],
    },
    {
      n: 7, id: "t7", title: "Reinforcement Learning",
      desc: "MDPs, value & policy methods, policy gradients, and RLHF.",
      lessons: [
        { id: "t7-l00", title: "MDPs & the RL problem",        file: "lessons/track-7-rl/00-mdps.html", status: "done" },
        { id: "t7-l01", title: "Value iteration & Q-learning", file: "lessons/track-7-rl/01-value-q-learning.html", status: "done" },
        { id: "t7-l02", title: "Policy gradients (REINFORCE)", file: "lessons/track-7-rl/02-policy-gradients.html", status: "done" },
        { id: "t7-l03", title: "Actor–critic & PPO",           file: "lessons/track-7-rl/03-actor-critic-ppo.html", status: "done" },
        { id: "t7-l04", title: "RLHF: aligning language models", file: "lessons/track-7-rl/04-rlhf.html", status: "done" },
      ],
    },
    {
      n: 8, id: "t8", title: "Reading & Reproducing Papers",
      desc: "How to dissect, reproduce, and critique research papers.",
      lessons: [
        { id: "t8-l00", title: "How to read a paper (3-pass method)", file: "lessons/track-8-papers/00-how-to-read.html", status: "done" },
        { id: "t8-l01", title: "Reproducing results faithfully",      file: "lessons/track-8-papers/01-reproducing.html", status: "done" },
        { id: "t8-l02", title: "Critiquing claims & evidence",        file: "lessons/track-8-papers/02-critiquing.html", status: "done" },
      ],
    },
    {
      n: 9, id: "t9", title: "Research Methods",
      desc: "Experiment design, ablations, honest evaluation, and writing up results.",
      lessons: [
        { id: "t9-l00", title: "Designing experiments",     file: "lessons/track-9-methods/00-designing-experiments.html", status: "done" },
        { id: "t9-l01", title: "Ablations & controls",      file: "lessons/track-9-methods/01-ablations.html", status: "done" },
        { id: "t9-l02", title: "Honest evaluation & pitfalls", file: "lessons/track-9-methods/02-honest-evaluation.html", status: "done" },
        { id: "t9-l03", title: "Writing the paper",         file: "lessons/track-9-methods/03-writing.html", status: "done" },
      ],
    },
    {
      n: 10, id: "t10", title: "Research Capstones",
      desc: "Projects that actually run: reproduce a classic, match a result, run an honest novel experiment.",
      lessons: [
        { id: "t10-l00", title: "Capstone A: ship a from-scratch GPT", file: "lessons/track-10-capstones/00-capstone-namegen.html", status: "done" },
        { id: "t10-l01", title: "Capstone B: reproduce a classic, live", file: "lessons/track-10-capstones/01-capstone-ddlab.html", status: "done" },
        { id: "t10-l02", title: "Capstone C: a live RL agent", file: "lessons/track-10-capstones/02-capstone-gridworld.html", status: "done" },
      ],
    },
    {
      n: 11, id: "t11", title: "Large Language Models",
      desc: "From toy GPT to modern LLMs: BPE, scaling laws, LoRA, efficient inference, and RAG.",
      lessons: [
        { id: "t11-l00", title: "Tokenization at scale: BPE",        file: "lessons/track-11-llms/00-tokenization-bpe.html", status: "done" },
        { id: "t11-l01", title: "Scaling laws & the training recipe", file: "lessons/track-11-llms/01-scaling-laws.html", status: "done" },
        { id: "t11-l02", title: "Fine-tuning & LoRA",                 file: "lessons/track-11-llms/02-lora-finetuning.html", status: "done" },
        { id: "t11-l03", title: "Efficient inference: KV-cache & quantization", file: "lessons/track-11-llms/03-efficient-inference.html", status: "done" },
        { id: "t11-l04", title: "Retrieval-augmented generation",     file: "lessons/track-11-llms/04-rag.html", status: "done" },
      ],
    },
    {
      n: 12, id: "t12", title: "Classical ML",
      desc: "The tabular-data workhorses: k-NN, trees, random forests, gradient boosting, and SVMs.",
      lessons: [
        { id: "t12-l00", title: "k-Nearest Neighbors",     file: "lessons/track-12-classical-ml/00-knn.html", status: "done" },
        { id: "t12-l01", title: "Decision trees",          file: "lessons/track-12-classical-ml/01-decision-trees.html", status: "done" },
        { id: "t12-l02", title: "Random forests",          file: "lessons/track-12-classical-ml/02-random-forests.html", status: "done" },
        { id: "t12-l03", title: "Gradient boosting",       file: "lessons/track-12-classical-ml/03-gradient-boosting.html", status: "done" },
        { id: "t12-l04", title: "SVMs & the kernel trick", file: "lessons/track-12-classical-ml/04-svm.html", status: "done" },
      ],
    },
  ];

  /* expose for any page that wants it */
  window.CURRICULUM = TRACKS;

  /* --------------------------------------------------------------------------
     helpers
     -------------------------------------------------------------------------- */
  const ROOT = document.documentElement.dataset.root || "";
  const CURRENT = document.documentElement.dataset.lesson || null;
  const PAGE = document.body.dataset.page || "lesson";
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.prototype.slice.call((el || document).querySelectorAll(s));
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };

  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : v; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
  };
  const isDone = (id) => store.get("done:" + id) === "1";

  // flat ordered list of *built* lessons -> drives prev/next
  const FLAT_DONE = [];
  TRACKS.forEach((t) => t.lessons.forEach((l) => { if (l.status === "done") FLAT_DONE.push(Object.assign({ track: t }, l)); }));

  /* --------------------------------------------------------------------------
     sidebar
     -------------------------------------------------------------------------- */
  function buildSidebar() {
    const sb = $("#sidebar");
    if (!sb) return;
    const theme = document.documentElement.getAttribute("data-theme") || "light";

    const head = el("div", "sb-head");
    head.innerHTML =
      '<a class="sb-brand" href="' + ROOT + 'researcher-path.html" style="text-decoration:none;color:inherit">' +
        '<span class="logo"><svg viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d="M12 26h16L20 13z" stroke="#fff" stroke-width="3.6" stroke-linejoin="round"/><circle cx="20" cy="8.6" r="2.1" fill="#fff"/></svg></span>' +
        '<span><span class="t">Gradient Ascent</span><br><span class="s">first principles → frontier</span></span>' +
      '</a>' +
      '<div class="sb-tools">' +
        '<a class="sb-home" href="' + ROOT + 'researcher-path.html">⌂ Home</a>' +
        '<button id="themeBtn" title="Toggle light/dark">' + (theme === "dark" ? "☀︎ Light" : "☾ Dark") + '</button>' +
      '</div>';
    sb.appendChild(head);

    const nav = el("nav", "sb-nav");
    TRACKS.forEach((t) => {
      const det = el("details", "sb-track");
      const hasCurrent = t.lessons.some((l) => l.id === CURRENT);
      if (hasCurrent || (PAGE === "home" && t.n === 1)) det.open = true;
      const sum = el("summary");
      sum.innerHTML = '<span class="tnum">' + t.n + '</span><span>' + t.title + '</span><span class="tchev">▸</span>';
      det.appendChild(sum);

      const ul = el("ul", "sb-lessons");
      t.lessons.forEach((l) => {
        const li = el("li");
        if (l.status === "done") {
          const a = el("a");
          a.href = ROOT + l.file;
          if (l.id === CURRENT) a.classList.add("active");
          const check = isDone(l.id) ? '<span class="ldone" data-check="' + l.id + '">✓</span>' : '<span class="ldone" data-check="' + l.id + '" style="visibility:hidden">✓</span>';
          a.innerHTML = check + "<span>" + l.title + "</span>";
          li.appendChild(a);
        } else {
          const s = el("span", "locked");
          s.innerHTML = "<span>" + l.title + "</span><span class='badge-soon'>soon</span>";
          li.appendChild(s);
        }
        ul.appendChild(li);
      });
      det.appendChild(ul);
      nav.appendChild(det);
    });
    sb.appendChild(nav);

    const tb = $("#themeBtn");
    if (tb) tb.addEventListener("click", toggleTheme);
  }

  /* --------------------------------------------------------------------------
     breadcrumb + prev/next  (full page nav => browser lands at top)
     -------------------------------------------------------------------------- */
  function pagerLink(l, dir) {
    if (!l) {
      const label = dir === "next" ? "More lessons coming soon" : "You're at the start";
      const a = el("a", "disabled " + dir);
      a.innerHTML = '<span class="dir">' + (dir === "next" ? "Next →" : "← Previous") + '</span><span class="ttl">' + label + "</span>";
      return a;
    }
    const a = el("a", dir);
    a.href = ROOT + l.file;
    a.innerHTML = '<span class="dir">' + (dir === "next" ? "Next →" : "← Previous") + '</span><span class="ttl">' + l.title + "</span>";
    return a;
  }

  function buildLessonChrome() {
    const art = $("article.lesson");
    if (!art || !CURRENT) return;
    const idx = FLAT_DONE.findIndex((l) => l.id === CURRENT);
    const prev = idx > 0 ? FLAT_DONE[idx - 1] : null;
    const next = idx >= 0 && idx < FLAT_DONE.length - 1 ? FLAT_DONE[idx + 1] : null;
    const me = FLAT_DONE[idx];

    // breadcrumb
    const crumb = el("div", "crumb");
    crumb.innerHTML =
      '<a href="' + ROOT + 'researcher-path.html">Home</a> &nbsp;›&nbsp; ' +
      '<a href="' + ROOT + 'researcher-path.html">Track ' + (me ? me.track.n : 1) + " · " + (me ? me.track.title : "") + "</a>";
    art.insertBefore(crumb, art.firstChild);

    // top pager (compact)
    const top = el("div", "pager top");
    top.appendChild(pagerLink(prev, "prev"));
    top.appendChild(pagerLink(next, "next"));
    // place top pager after the meta-row if present, else after subtitle, else after h1
    const anchor = $(".meta-row", art) || $(".subtitle", art) || $("h1", art);
    if (anchor && anchor.nextSibling) anchor.parentNode.insertBefore(top, anchor.nextSibling);
    else art.appendChild(top);

    // bottom: complete button + pager
    const foot = el("div");
    const crow = el("div", "complete-row");
    const btn = el("button", "btn-complete" + (isDone(CURRENT) ? " done" : ""));
    btn.textContent = isDone(CURRENT) ? "✓ Completed — nice work" : "Mark this lesson complete";
    btn.addEventListener("click", () => {
      const now = !isDone(CURRENT);
      store.set("done:" + CURRENT, now ? "1" : "0");
      btn.classList.toggle("done", now);
      btn.textContent = now ? "✓ Completed — nice work" : "Mark this lesson complete";
      const chk = $('[data-check="' + CURRENT + '"]');
      if (chk) chk.style.visibility = now ? "visible" : "hidden";
    });
    crow.appendChild(btn);
    foot.appendChild(crow);

    const bottom = el("div", "pager");
    bottom.appendChild(pagerLink(prev, "prev"));
    bottom.appendChild(pagerLink(next, "next"));
    foot.appendChild(bottom);

    const ft = el("div", "foot");
    ft.innerHTML = "Gradient Ascent · a self-paced path from first principles to the research frontier. " +
      "The test for this lesson: <em>could you now derive it, implement it, and explain it to a peer?</em>";
    foot.appendChild(ft);

    art.appendChild(foot);
  }

  /* --------------------------------------------------------------------------
     quiz engine
     -------------------------------------------------------------------------- */
  function initQuizzes() {
    $$(".quiz-q").forEach((q) => {
      const correct = parseInt(q.getAttribute("data-correct"), 10);
      const ul = $(".quiz-options", q);
      if (!ul) return;
      const opts = $$("li", ul);
      opts.forEach((li, i) => {
        const key = String.fromCharCode(65 + i);
        const k = el("span", "opt-key", key + ".");
        li.insertBefore(k, li.firstChild);
        li.addEventListener("click", () => {
          if (ul.classList.contains("answered")) return;
          ul.classList.add("answered");
          opts.forEach((o, j) => {
            o.classList.add("reveal");
            if (j === correct) o.classList.add("correct");
          });
          if (i !== correct) li.classList.add("wrong");
          // result tag, placed just above the options list
          const tag = el("div", "quiz-tag " + (i === correct ? "ok" : "no"), i === correct ? "✓ Correct" : "✗ Not quite — see why below");
          q.insertBefore(tag, ul);
        });
      });
    });
  }

  /* --------------------------------------------------------------------------
     tiny, safe Python syntax highlighter
     -------------------------------------------------------------------------- */
  function highlight() {
    const KW = "def|class|return|import|from|as|if|elif|else|for|while|in|not|and|or|None|True|False|with|lambda|yield|pass|break|continue|global|nonlocal|try|except|finally|raise|assert|is|del|print|self|async|await";
    const re = new RegExp(
      "(#[^\\n]*)" +                                   // 1 comment
      "|('(?:[^'\\\\]|\\\\.)*'|\"(?:[^\"\\\\]|\\\\.)*\")" + // 2 string
      "|\\b(\\d+\\.?\\d*)\\b" +                        // 3 number
      "|\\b(" + KW + ")\\b",                           // 4 keyword
      "g"
    );
    $$("pre code").forEach((code) => {
      if (code.dataset.nohl != null) return;
      try {
        let txt = code.textContent;
        txt = txt.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        txt = txt.replace(re, (m, c, s, n, k) => {
          if (c) return '<span class="tok-com">' + c + "</span>";
          if (s) return '<span class="tok-str">' + s + "</span>";
          if (n) return '<span class="tok-num">' + n + "</span>";
          if (k) return '<span class="tok-kw">' + k + "</span>";
          return m;
        });
        code.innerHTML = txt;
      } catch (e) { /* leave plain on any error */ }
    });
  }

  /* --------------------------------------------------------------------------
     KaTeX
     -------------------------------------------------------------------------- */
  function renderMath() {
    if (!window.renderMathInElement) return;
    try {
      window.renderMathInElement(document.body, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "\\[", right: "\\]", display: true },
          { left: "$", right: "$", display: false },
          { left: "\\(", right: "\\)", display: false },
        ],
        throwOnError: false,
        macros: { "\\R": "\\mathbb{R}", "\\E": "\\mathbb{E}", "\\norm": "\\left\\lVert#1\\right\\rVert", "\\vv": "\\mathbf{#1}" },
      });
    } catch (e) {}
  }

  /* --------------------------------------------------------------------------
     theme, progress bar, mobile menu, home grid
     -------------------------------------------------------------------------- */
  function applyTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    store.set("theme", t);
    const b = $("#themeBtn");
    if (b) b.innerHTML = t === "dark" ? "☀︎ Light" : "☾ Dark";
  }
  function toggleTheme() {
    const cur = document.documentElement.getAttribute("data-theme") || "light";
    applyTheme(cur === "dark" ? "light" : "dark");
  }

  function progressBar() {
    let bar = $("#progress-bar");
    if (!bar) { bar = el("div"); bar.id = "progress-bar"; document.body.appendChild(bar); }
    const upd = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const p = h > 0 ? (window.scrollY / h) * 100 : 0;
      bar.style.width = p + "%";
    };
    window.addEventListener("scroll", upd, { passive: true });
    upd();
  }

  function mobileMenu() {
    let btn = $(".nav-toggle");
    if (!btn) { btn = el("button", "nav-toggle", "☰"); btn.setAttribute("aria-label", "Menu"); document.body.appendChild(btn); }
    let ov = $("#overlay");
    if (!ov) { ov = el("div"); ov.id = "overlay"; document.body.appendChild(ov); }
    const sb = $("#sidebar");
    const close = () => { sb && sb.classList.remove("open"); ov.classList.remove("show"); };
    btn.addEventListener("click", () => { sb && sb.classList.toggle("open"); ov.classList.toggle("show"); });
    ov.addEventListener("click", close);
  }

  function buildHome() {
    const grid = $("#track-grid");
    if (!grid) return;
    TRACKS.forEach((t) => {
      const done = t.lessons.filter((l) => l.status === "done").length;
      const total = t.lessons.length;
      const ready = done > 0;
      const firstDone = t.lessons.find((l) => l.status === "done");
      const href = firstDone ? ROOT + firstDone.file : "#";
      const card = el(ready ? "a" : "div", "tcard");
      if (ready) card.href = href;
      const pct = Math.round((done / total) * 100);
      card.innerHTML =
        '<div class="tc-top"><span class="tc-num">' + t.n + '</span><h3>' + t.title + "</h3></div>" +
        '<div class="tc-desc">' + t.desc + "</div>" +
        '<div class="tprog"><span style="width:' + pct + '%"></span></div>' +
        '<div class="tc-foot"><span class="tc-stat">' + done + " / " + total + " lessons" + (ready ? "" : " planned") + "</span>" +
        '<span class="pill ' + (ready ? "ready" : "soon") + '">' + (ready ? "Start ▸" : "Coming soon") + "</span></div>";
      grid.appendChild(card);
    });
  }

  /* --------------------------------------------------------------------------
     boot
     -------------------------------------------------------------------------- */
  function boot() {
    // theme: stored or system preference
    const saved = store.get("theme", null);
    const sys = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", saved || sys);

    buildSidebar();
    buildLessonChrome();
    initQuizzes();
    highlight();
    renderMath();
    progressBar();
    mobileMenu();
    buildHome();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
