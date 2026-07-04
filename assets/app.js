/* ============================================================
   AI/ML Mentor — front-end behavior
   No external dependencies except locally-bundled KaTeX.
   ============================================================ */
(function () {
  "use strict";

  /* ---- Always land at the TOP of a freshly-loaded lesson ----
     Multi-page navigation already loads at the top, but if the browser
     tries to restore a scroll position we override it. This guarantees
     the "next/prev lands at the top" requirement. */
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  window.addEventListener("pageshow", function () {
    if (!location.hash) window.scrollTo(0, 0);
  });

  document.addEventListener("DOMContentLoaded", function () {

    /* ---------- KaTeX math rendering ---------- */
    if (window.renderMathInElement) {
      try {
        window.renderMathInElement(document.body, {
          delimiters: [
            { left: "$$", right: "$$", display: true },
            { left: "\\[", right: "\\]", display: true },
            { left: "$", right: "$", display: false },
            { left: "\\(", right: "\\)", display: false }
          ],
          throwOnError: false,
          ignoredTags: ["script", "noscript", "style", "textarea", "pre", "code"]
        });
      } catch (e) { /* never let math break the page */ }
    }

    /* ---------- Quizzes ---------- */
    document.querySelectorAll(".quiz .q").forEach(function (q) {
      var answer = q.getAttribute("data-answer");
      var opts = q.querySelector(".q-options");
      var explainBox = q.querySelector(".explain");
      q.querySelectorAll(".q-options li").forEach(function (li) {
        li.addEventListener("click", function () {
          if (opts.classList.contains("locked")) return;
          opts.classList.add("locked");
          var chosen = li.getAttribute("data-opt");
          // mark correct + the chosen-if-wrong
          opts.querySelectorAll("li").forEach(function (o) {
            var k = o.getAttribute("data-opt");
            if (k === answer) o.classList.add("correct");
            if (k === chosen && chosen !== answer) o.classList.add("wrong");
          });
          // reveal explanations: the chosen one, plus the correct one
          if (explainBox) {
            explainBox.style.display = "block";
            var toShow = new Set([chosen, answer]);
            explainBox.querySelectorAll(".ex").forEach(function (ex) {
              var f = ex.getAttribute("data-for");
              if (toShow.has(f)) {
                ex.classList.add("show");
                ex.classList.add(f === answer ? "right" : "wrongx");
              }
            });
          }
          updateScore(q.closest(".quiz"));
        });
      });
    });
    function updateScore(quiz) {
      if (!quiz) return;
      var qs = quiz.querySelectorAll(".q");
      var done = 0, right = 0;
      qs.forEach(function (q) {
        var opts = q.querySelector(".q-options");
        if (opts.classList.contains("locked")) {
          done++;
          if (opts.querySelector("li.correct.chosen") || (!opts.querySelector("li.wrong"))) right++;
        }
      });
      // simpler: count locked questions that have no .wrong as correct
      right = 0; done = 0;
      qs.forEach(function (q) {
        var opts = q.querySelector(".q-options");
        if (opts.classList.contains("locked")) { done++; if (!opts.querySelector("li.wrong")) right++; }
      });
      var s = quiz.querySelector(".score");
      if (s) s.textContent = "Score: " + right + " / " + qs.length;
    }

    /* ---------- Sidebar: collapse tracks, keep current open ---------- */
    document.querySelectorAll(".nav-track > .t-head").forEach(function (head) {
      head.addEventListener("click", function () {
        head.parentElement.classList.toggle("collapsed");
      });
    });
    // ensure the current lesson's track is expanded and scrolled into view
    var cur = document.querySelector(".nav-track .lessons a.current");
    if (cur) {
      var tr = cur.closest(".nav-track");
      if (tr) tr.classList.remove("collapsed");
      cur.scrollIntoView({ block: "center" });
    }

    /* ---------- Mobile menu ---------- */
    var menuBtn = document.querySelector(".menu-btn");
    var sidebar = document.querySelector(".sidebar");
    var scrim = document.querySelector(".scrim");
    function closeMenu() { if (sidebar) sidebar.classList.remove("open"); if (scrim) scrim.classList.remove("show"); }
    if (menuBtn) menuBtn.addEventListener("click", function () {
      sidebar.classList.toggle("open");
      if (scrim) scrim.classList.toggle("show");
    });
    if (scrim) scrim.addEventListener("click", closeMenu);

    /* ---------- Back to top ---------- */
    var totop = document.querySelector(".totop");
    if (totop) {
      window.addEventListener("scroll", function () {
        if (window.scrollY > 600) totop.classList.add("show"); else totop.classList.remove("show");
      }, { passive: true });
      totop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
    }
  });
})();
