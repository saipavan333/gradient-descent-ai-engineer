# Tools

## `qa-labs.js` — interactive-lab QA

A dependency-free, browser-free checker for the full-screen interactive labs
(`lessons/*-lab.html` and the masterclass labs). It catches the visual bugs that
are easy to ship by accident:

- draws that fall **outside the `<canvas>`** (clipped / off-screen content)
- **non-finite** (`NaN` / `Infinity`) draw coordinates — always a logic bug
- inline `<script>` **runtime errors**

### How it works

It executes each lab's inline script against a mock DOM whose 2D canvas context
**records every draw call's coordinates** (honouring `save`/`restore`/`translate`
so rotated axis labels don't false-positive), then fires each control
(`oninput` / `onchange` / `onclick`) to exercise different states. No browser,
no network, no packages — just Node.

It is a *fast sanity net*, not a pixel-perfect renderer: it proves nothing is
drawn off-canvas and no coordinate is `NaN`. Pair it with a real screenshot pass
when you can run a browser.

### Usage

```bash
# check every flagship lab listed in lessons/labs.html
node tools/qa-labs.js

# check specific files
node tools/qa-labs.js nn-playground.html backprop-lab.html
```

Exit code is `0` when everything is clean and `1` when any lab has an issue, so
it drops straight into a pre-commit hook or CI step:

```bash
node tools/qa-labs.js || { echo "Lab QA failed"; exit 1; }
```

### Adding a new lab

1. Build the lab as `lessons/<name>-lab.html` (self-contained: inline CSS + JS,
   one or more `<canvas id="..." width="..." height="...">`).
2. Add its card to `lessons/labs.html` (the checker auto-discovers labs from there).
3. Run `node tools/qa-labs.js` — the new lab is picked up automatically. Fix any
   out-of-bounds draws (usually: clamp/scale generated data to the canvas domain).

### Note on the original masterclass labs

`convolution-masterclass.html` uses a few browser APIs the mock doesn't fully
implement; the checker skips rather than fails it. Those three labs predate this
tool and were verified separately.
