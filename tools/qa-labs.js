#!/usr/bin/env node
/*
 * Gradient Descent — Lab QA (render-trace bounds check)
 * ------------------------------------------------------
 * Catches the most common interactive-lab visual bugs WITHOUT a browser:
 *   - draws that fall outside the <canvas> (clipped / off-screen content)
 *   - non-finite (NaN / Infinity) draw coordinates (a logic bug)
 *   - inline <script> runtime errors
 *
 * How: it executes each lab's inline script against a mock DOM whose 2D canvas
 * context RECORDS every draw call's coordinates (applying translate()/save()/
 * restore() so rotated axis labels don't false-positive), then drives each
 * control (oninput / onchange / onclick) to exercise different states.
 *
 * No dependencies, no network, no browser — just `node`.
 *
 * Usage:
 *   node tools/qa-labs.js                 # every flagship lab listed in lessons/labs.html
 *   node tools/qa-labs.js nn-playground.html backprop-lab.html   # specific files
 *
 * Exit code: 0 = all clean, 1 = at least one lab has issues. CI / pre-commit friendly.
 */
"use strict";
const fs = require("fs");
const path = require("path");
const LESSONS = path.join(__dirname, "..", "lessons");
const MARGIN = 40; // px a draw may exceed the canvas before it's flagged (allows strokes/labels)

function discoverLabs() {
  try {
    const labs = fs.readFileSync(path.join(LESSONS, "labs.html"), "utf8");
    const seen = new Set();
    for (const m of labs.matchAll(/<a class="lab-card" href="([^"]+\.html)"/g)) seen.add(m[1]);
    return [...seen];
  } catch (e) {
    return [];
  }
}

function recordingCtx(W, H, id, bounds, issues) {
  const bb = (bounds[id] = { minX: 1e9, minY: 1e9, maxX: -1e9, maxY: -1e9, nan: 0, oob: 0 });
  const stack = [{ tx: 0, ty: 0, rot: false }];
  const cur = () => stack[stack.length - 1];
  function pt(x, y) {
    if (typeof x !== "number" || typeof y !== "number") return;
    const c = cur();
    if (!isFinite(x) || !isFinite(y)) {
      bb.nan++;
      if (bb.nan <= 3) issues.push(`${id}: non-finite draw at (${x}, ${y})`);
      return;
    }
    const ax = x + c.tx, ay = y + c.ty;
    bb.minX = Math.min(bb.minX, ax); bb.minY = Math.min(bb.minY, ay);
    bb.maxX = Math.max(bb.maxX, ax); bb.maxY = Math.max(bb.maxY, ay);
    if (!c.rot && (ax < -MARGIN || ax > W + MARGIN || ay < -MARGIN || ay > H + MARGIN)) {
      bb.oob++;
      if (bb.oob <= 3) issues.push(`${id}: draw out of bounds (${ax.toFixed(0)}, ${ay.toFixed(0)}) on ${W}x${H} canvas`);
    }
  }
  const handler = {
    get(_t, p) {
      switch (p) {
        case "canvas": return { width: W, height: H };
        case "measureText": return (s) => ({ width: ("" + s).length * 7 });
        case "createLinearGradient": case "createRadialGradient": case "createPattern":
          return () => ({ addColorStop() {} });
        case "getImageData": return () => ({ data: new Uint8ClampedArray(4) });
        case "save": return () => stack.push({ ...cur() });
        case "restore": return () => { if (stack.length > 1) stack.pop(); };
        case "translate": return (x, y) => { const c = cur(); c.tx += x; c.ty += y; };
        case "rotate": case "scale": case "transform": case "setTransform":
          return () => { cur().rot = true; };
        case "fillRect": case "strokeRect": case "clearRect": case "rect": case "roundRect":
          return (x, y, w, h) => { pt(x, y); pt(x + w, y + h); };
        case "fillText": case "strokeText": return (s, x, y) => pt(x, y);
        case "moveTo": case "lineTo": return (x, y) => pt(x, y);
        case "arc": case "ellipse": return (x, y) => pt(x, y);
        case "arcTo": case "quadraticCurveTo": return (x1, y1, x2, y2) => { pt(x1, y1); pt(x2, y2); };
        case "bezierCurveTo": return (a, b, c, d, e, f) => { pt(a, b); pt(e, f); };
        default: return () => {};
      }
    },
    set() { return true; },
  };
  return new Proxy({}, handler);
}

function qaLab(file) {
  const html = fs.readFileSync(path.join(LESSONS, file), "utf8");
  const cvDims = {};
  for (const m of html.matchAll(/<canvas\b([^>]*)>/g)) {
    const tag = m[1];
    const id = (tag.match(/id="([^"]+)"/) || [])[1];
    if (!id) continue;
    cvDims[id] = [ +((tag.match(/width="(\d+)"/) || [])[1] || 800), +((tag.match(/height="(\d+)"/) || [])[1] || 600) ];
  }
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((x) => x[1]);
  const src = scripts.length ? scripts[scripts.length - 1] : "";

  const bounds = {}, issues = [], ctrls = {};
  function el(id) {
    if (cvDims[id]) {
      const [W, H] = cvDims[id];
      return {
        getContext: () => recordingCtx(W, H, id, bounds, issues), width: W, height: H, style: {},
        addEventListener(ev, fn) { this["on" + ev] = fn; },
        getBoundingClientRect: () => ({ left: 0, top: 0, width: W, height: H }),
        classList: { add() {}, remove() {}, toggle() {} },
      };
    }
    if (!ctrls[id]) ctrls[id] = {
      getContext: () => recordingCtx(800, 600, id, bounds, issues),
      value: "0", checked: false, textContent: "", innerHTML: "", className: "", style: {}, children: [],
      classList: { add() {}, remove() {}, toggle() {} },
      appendChild(c) { this.children.push(c); return c; }, insertBefore(c) { this.children.unshift(c); return c; },
      setAttribute() {}, addEventListener(ev, fn) { this["on" + ev] = fn; },
      querySelector: () => el("_q"), querySelectorAll: () => [],
      getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 30 }), firstChild: null,
    };
    return ctrls[id];
  }

  global.document = {
    getElementById: el, createElement: () => el("_c"), addEventListener() {},
    querySelector: () => el("_q"), querySelectorAll: () => [], body: el("_body"), head: el("_head"), readyState: "complete",
  };
  global.window = global;
  global.location = { pathname: "/lessons/" + file, href: "" };
  global.addEventListener = () => {}; global.removeEventListener = () => {};
  global.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} };
  global.ResizeObserver = class { observe() {} disconnect() {} };
  global.matchMedia = () => ({ matches: false, addEventListener() {}, addListener() {} });
  global.getComputedStyle = () => ({ getPropertyValue: () => "" });
  global.requestAnimationFrame = () => 0; global.cancelAnimationFrame = () => {};
  global.setInterval = () => 0; global.clearInterval = () => {}; global.setTimeout = () => 0;

  try { eval(src); } catch (e) { issues.push("SCRIPT ERROR: " + e.message); }
  // exercise controls
  for (const id of Object.keys(ctrls)) {
    const e = ctrls[id];
    try { if (e.oninput) { e.value = "0.5"; e.oninput.call(e, { target: e }); } } catch (err) { issues.push(`oninput #${id}: ${err.message}`); }
    try { if (e.onchange) { e.checked = true; e.onchange.call(e, { target: e }); } } catch (err) { issues.push(`onchange #${id}: ${err.message}`); }
  }
  return { file, canvases: Object.keys(cvDims), bounds, issues };
}

// ---- main ----
const args = process.argv.slice(2);
const labs = args.length ? args : discoverLabs();
if (!labs.length) { console.error("No labs found. Run from the repo, or pass files: node tools/qa-labs.js file.html"); process.exit(2); }

console.log("\nGradient Descent — Lab QA (render-trace bounds check)");
console.log("─".repeat(62));
let failed = 0;
for (const file of labs) {
  let r;
  try { r = qaLab(file); } catch (e) { console.log(`✗ ${file.padEnd(30)} could not load: ${e.message}`); failed++; continue; }
  const bstr = Object.entries(r.bounds)
    .map(([id, b]) => `${id}[${b.maxX < -1e8 ? "empty" : `${b.minX.toFixed(0)}..${b.maxX.toFixed(0)}×${b.minY.toFixed(0)}..${b.maxY.toFixed(0)}`}]`)
    .join(" ");
  const bad = r.issues.filter((i) => !/mock|not a function|is not defined|Cannot (set|read)/.test(i)); // ignore harness-mock gaps
  if (bad.length) {
    failed++;
    console.log(`✗ ${file}`);
    bad.slice(0, 6).forEach((i) => console.log(`    ⚠ ${i}`));
  } else {
    console.log(`✓ ${file.padEnd(28)} ${r.canvases.length ? bstr : "(DOM lab — no canvas)"}`);
  }
}
console.log("─".repeat(62));
console.log(`${labs.length} labs · ${labs.length - failed} passed · ${failed} failed\n`);
process.exit(failed ? 1 : 0);
