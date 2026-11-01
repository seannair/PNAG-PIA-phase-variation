# IS256 × *ica* locus — phase-variation animation

A single-file, responsive HTML/SVG animation of the insertion sequence **IS256** jumping in and out of the ***icaC*** gene of *Staphylococcus aureus*, switching PIA/PNAG biosynthesis and biofilm formation on and off. Combines genome dynamics (cut-and-paste transposition, 8-bp target-site duplications, precise excision) with the biology it drives (operon → transferase chain → IcaC export → PNAG coat → device biofilm). Written for teaching.

No dependencies — open `index.html` in any modern browser. Works on desktop and phone (uniform SVG scaling, viewBox 1600×900), including straight from the filesystem (`file://`). A pre-rendered MP4 of the full loop is available as `is256_ica_loop.mp4`.

![The ON chapter — chain threading through IcaC, PNAG coat, biofilm on the device](docs/guide/ica-01.png)

**[Student guide](study-guide.html)** — the colour key, a chapter-by-chapter walkthrough with figures, and self-check questions. Also as a printable [PDF](docs/is256-study-guide.pdf) for handing out.

## The loop (36 s, four 9-s chapters)

The film is one seamless round of phase variation — frame 0 is identical to frame 36.

| # | Chapter | Starts | What happens on screen |
|---|---------|--------|------------------------|
| 01 | ON | 0:00 | *icaADBC* transcribes; IcaA·D builds the GlcNAc chain from UDP-GlcNAc and threads it through IcaC; IcaB deacetylates each unit on exit (navy→green) → PNAG coat → biofilm sticks to the device |
| 02 | JUMP IN | 0:09 | transposase *tnp256* excises IS256 (~1.3 kb) from its home site; cut-and-paste integration lands in the *icaC* hot spot, duplicating 8 bp at each end (TSD); export blocked → the chain retracts to a trapped short oligomer |
| 03 | OFF | 0:18 | no functional IcaC — no coat, smooth cells drift free, biofilm disassembles; the operon keeps transcribing (*icaC* is the last gene — no polar effect) |
| 04 | JUMP OUT | 0:27 | precise excision removes IS256 together with both duplicated 8-bp copies, restoring *icaC* base-for-base; the channel reopens (protein turnover lags the gene); PNAG⁺ and biofilm return |

## Controls

| Input | Action |
|-------|--------|
| `Space` or tap/click | Play / pause |
| Timeline slider | Scrub to **any** point of the 36-s loop, while playing or paused (doubles as a progress bar) |
| Four chapter dots | Jump to ON / JUMP IN / OFF / JUMP OUT |
| Speed slider | 0.5×–2× |
| 🔊/🔇 button | Mute/unmute the synthesized sound cues (Web Audio only — no files; silent in capture modes) |

With `prefers-reduced-motion` it starts paused. Five short synthesized cues mark chapter changes and key events (IS256 landing, excision, coat regrowth, biofilm disassembly); sound arms on your first tap/click/keypress.

### URL modes

| URL | Behaviour |
|---|---|
| `index.html?t=17.5` | Seek to that time (seconds) and **freeze** — handy for sharing a single frame |
| `index.html?render=1` | Hide interactive chrome, letterbox 16:9, freeze at boot — capture mode |
| `index.html?test=1` | Run the built-in self-test; badge bottom-right shows `self-test: PASS/FAIL` (also in console) |

## Where the animation is simplified

Most teaching animations are simplified somewhere. These are the places this one is, so that the exaggerations are not mistaken for scale:

- IS256 is drawn huge — it is ~1.3 kb inside a ~2.8 Mb chromosome; at true scale neither the element nor its 8-bp duplications would be visible. The cyan TSD dots are markers, not to-scale DNA.
- One cell's fate is shown as the whole story. Real phase variation is stochastic and population-level: each division carries ~10⁻⁹ odds of insertion or excision, so PNAG⁺ and PNAG⁻ cells coexist in one culture.
- The beaded chain is a deterministic conveyor (constant length, one unit per beat) standing in for stochastic polymerisation and transport. What it keeps exact is the teaching point: deacetylation happens at IcaB, on exit — never inside the cell or at the membrane.
- Seven biofilm cells are drawn for legibility; a real film holds thousands of cells in a hydrated PNAG matrix (the soft halos stand in for that corona).
- Time is compressed and even by design: each chapter gets nine seconds regardless of how long the state lasts in reality — an OFF cell can stay OFF for generations.

## Technical notes

Rendering is a pure function of elapsed time — every visual property derives from `render(t)`, so scrubbing, seeking and speed changes are exact, all motion is loop-periodic (frame 0 ≡ frame 36), and the MP4 loops seamlessly. The page exposes a deterministic render hook for screen-capture tooling:

```js
window.__IS256 = {
  render(t),   // pure function of t — set any frame, no reload needed
  D,           // loop duration (36 s)
  state()      // current simulation state (chapter, is256 position, icaC broken, biofilm…)
}
```

Tested in Chrome, Firefox and Safari.

## Rendering the MP4

Deterministic frame capture (`_capture.mjs`) + ffmpeg — this is how `is256_ica_loop.mp4` was produced:

```bat
node _capture.mjs
:: → _frames/frame_0000.png … frame_1079.png (Playwright drives window.__IS256.render(i/30) at 1920×1080; ~90 s total)
ffmpeg -framerate 30 -start_number 0 -i _frames\frame_%04d.png -c:v libx264 -pix_fmt yuv420p is256_ica_loop.mp4
```

`_capture.mjs [start] [endExclusive]` makes the run resumable (e.g. `node _capture.mjs 540 1080`). It reuses the Playwright/Chromium install from `C:\Users\sfaas\html-video\node_modules`. Any ffmpeg with libx264 works — note the one at `D:\RVC1006Nvidia\RVC1006Nvidia\ffmpeg.exe` is built **without** libx264 (and its NVENC rejects the preset), so a full build such as the WinGet Gyan.FFmpeg package was used here.

Verify with `ffprobe` (expect 36 s, 1920×1080, 30 fps, 1080 frames) + a full decode pass:
`ffmpeg -v error -i is256_ica_loop.mp4 -an -f null -`.

## Files

| File | Purpose |
|---|---|
| `index.html` | The animation (self-contained: markup + styles + timeline engine) |
| `study-guide.html` | Student guide — colour key, chapter walkthrough with figures, self-check questions (open in a browser; prints via its own print stylesheet) |
| `is256_ica_loop.mp4` | Full 36-s loop rendered at 1920×1080/30 fps |
| `LICENSE`, `LICENSE-MIT`, `LICENSE-CC-BY-4.0` | Dual licence — MIT for the software, CC BY 4.0 for the content (captions, visual design, captures); see `LICENSE` for the split and suggested attribution |
| `docs/guide/ica-01…05.png` | Chapter figures used by the student guide (captured from `?t=…&render=1`) |
| `docs/is256-study-guide.pdf` | Printable PDF of the student guide |
| `_capture.mjs` | MP4 frame-capture harness (Playwright, drives `window.__IS256.render`) — see "Rendering the MP4" |
| `_shots.cjs`, `_selftest.cjs` | Playwright QA harnesses (responsive screenshots — extra timestamps as CLI args; self-test run) — not needed to view the animation |
| `_syntax.cjs` | Parse-only check of the inline `<script>` (`node _syntax.cjs`) |

## Biology notes & references

Simplified for teaching; species-specific facts verified against primary literature:

- Locus order **icaR–icaA–icaD–icaB–icaC**; *icaADBC* is one co-transcribed operon (Gerke et al., *J Biol Chem*
  1998 — pubmed.ncbi.nlm.nih.gov/9660830; Cue et al. 2012 — pmc.ncbi.nlm.nih.gov/articles/PMC3459252).
- IcaR is the DNA repressor (TetR-family dimer) on a 28-bp operator between icaR and icaA (Jeng et al.,
  *Nucleic Acids Res* 2008 — pubmed.ncbi.nlm.nih.gov/18208836). IcaD is the accessory subunit of the transferase, not a repressor.
- PNAG/PIA = poly-**β-(1→6)-GlcNAc**, partially deacetylated by IcaB (Cramton et al., *Infect Immun* 1999 —
  pubmed.ncbi.nlm.nih.gov/10496925; Pokrovskaya et al., *Biochemistry* 2013 — pubmed.ncbi.nlm.nih.gov/23866051).
- IcaC is an integral-membrane transporter required to extend and externalize the polymer (Gerke 1998;
  Arciola et al. 2015 — pmc.ncbi.nlm.nih.gov/articles/PMC4322838).
- IS256 ≈ **1,324 bp**, single transposase gene *tnp256*, cut-and-paste via covalent intermediate, leaving an
  **8-bp target-site duplication** per end (GenBank OR413981; Loessner et al., *J Bacteriol* 2002 —
  pmc.ncbi.nlm.nih.gov/articles/PMC135277).
- The documented hot spot is **inside icaC**: in *S. aureus* strain SA204, IS256 insertion yields a
  PIA/PNAG-negative variant that reverts by **precise excision** (spontaneous frequency ~1–5×10⁻⁹) — Kiem et al.,
  *J Korean Med Sci* 2004 — pmc.ncbi.nlm.nih.gov/articles/PMC2816298. Same icaC hot spot in *S. epidermidis*:
  ~30% of PIA-negative variants carry IS256 in icaA/icaC (Ziebuhr et al., *Mol Microbiol* 1999 —
  pubmed.ncbi.nlm.nih.gov/10231490).
- Precise excision removes IS256 **together with one copy of each duplicated 8 bp**, restoring the original
  sequence exactly (Kiem 2004) — this is why the TSD bars fly away *with* the element in chapter 4.

## Iteration log

- **Round 1 (2026-07-08):** device surface label simplified to "surface" (dark); small © Sean P Nair credit
  top-left; Gram-positive cell rebuilt — thick labelled membrane ring + single fine cross-hatched peptidoglycan
  wall band with leader-line labels; unexplained white ✕s on the GlcNAc beads removed; sound effects added.
  Git history (one commit per round) allows reverting to any earlier state.
- **Round 2 (2026-10-30):** stepwise in-cell PIA/PNAG synthesis — during chapter 1 (ON), three conveyor cycles
  make polymerization visible: a UDP-GlcNAc pulse, the chain sliding as a new unit pops in at the growing end,
  then the oldest unit travelling down through the IcaC channel past IcaB (halo flash = deacetylation) to join
  the coat. Chapter 4 regrowth now staggers bead pop-ins left→right instead of scaling the whole chain. Seam-safe
  by construction: quiescent windows show the exact all-settled state, so frame(0) ≡ frame(36) still holds.
  `is256_ica_loop.mp4` intentionally **not** re-rendered this round — regenerate with `_capture.mjs` + ffmpeg on request.
- **Round 3 (2026-10-31):** cell layout aligned to the reference figure and the growth model fixed to
  **"grow to full, then export"**. IcaA·D is now a transmembrane block sitting on the membrane ring; the PNAG
  chain runs along an arc of the inner membrane leaflet from the transferase (growing end) down to the IcaC
  mouth (tip); IcaC straddles the peptidoglycan band as a channel; IcaB sits **outside** the cell in the
  coat zone, so its deacetylation halo fires as an exported unit crosses out. The ON chapter starts on a
  settled 6-bead chain: beats add one unit at the growing end (visible growth 6→8), and the last beat shows
  turnover — a new unit joins while the tip unit is exported through IcaC past IcaB (net steady; reads as
  flow, not loss). `S.chainLen` exposed in state + asserted by the self-test (growth curve and seam).
  MP4 re-render still deferred.
- **Round 4 (2026-10-31):** the PNAG chain now actually threads through IcaC — "steady rope flow". A
  constant-length beaded rope is anchored at the transferase; each peristaltic beat adds one unit there and pushes
  the strand forward, so every bead travels the same path: amber (acetylated) inside, converting to green
  (deacetylated) exactly as it crosses out of the IcaC channel mouth past IcaB, then absorbed into the coat. The
  PNAG coat rings are re-tinted green and the legend gains a "deacetylated PNAG (coat)" entry; each beat fires one
  IcaB halo flash at the unit that crosses. Chapter 2 breaks *icaC* → the strand retracts tail-first to a 3-unit
  stub with a new "short oligomers (<20 units) — can't be exported" label; chapter 4 regrowth re-threads the rope
  through the channel anchor-first. `S.exported` (units that crossed out this chapter) is exposed in state and
  added to the self-test's seam check, which still passes frame(0) ≡ frame(36). MP4 re-render still deferred — regenerate with `_capture.mjs` + ffmpeg on request.
- **Round 5 (2026-11-05):** PNAG chain visibility fixes. (1) The monomer links were missing and the strand was
  hard to see against the palette — a navy backbone line now connects every bead frame-by-frame, and the in-cell
  monomers are dark blue (#1e3a8a) instead of amber; legend swatch matches ("PNAG (GlcNAc, inside)"). (2) The
  IcaC box is taller with its label at the top, so the passing strand no longer covers "IcaC". (3) Green
  (deacetylated) beads now appear **only on exit of IcaB** — previously they started at the channel mouth; the
  colour split point moved to a new `S_ICAB` arclength measured just past IcaB's bottom edge, and the deacetylation
  halo flash fires there too. The strand is also drawn in the foreground over the IcaC/IcaB boxes so it reads as
  a growing chain threading through them. Self-test still passes; seam unchanged (frame(0) ≡ frame(36)).
  MP4 re-render still deferred — regenerate with `_capture.mjs` + ffmpeg on request.
- **Round 6 (2026-10-31):** two user-requested fixes. (1) **Deacetylated beads at IcaB exit** — in the steady ON
  state exactly the last TWO rope units now read coat-green (#34d399): `S_ICAB = ROPE_LEN − 21` places the colour
  split just past the third-last bead on the 16-px lattice, so two deacetylated beads trail out of IcaB while all
  upstream units stay navy. (2) ***icaC* split by insertion** — while IS256 is in situ the gene no longer reads as
  replaced: it renders as **two labelled fragments flanking the element** (`#icaCSplitG`: a left fragment + a right
  arrow-head fragment), so the icaC–IS256–icaC region spans ~340 px versus ~190 px intact; the TSD bars sit at both
  junctions, the block ✕ moves over the downstream (right) fragment, and on precise excision the fragments
  crossfade back into the single restored arrow. Flight centre, hotspot triangle and the excision callout all moved
  to the in-situ element centre ix=1089; `S.is256.insideIcaC` now spans [1004,1174]. Self-test updated (in-situ
  assertions) and passing; seam unchanged (frame(0) ≡ frame(36)). MP4 re-render still deferred — regenerate with `_capture.mjs` + ffmpeg on request.
- **Round 7 (2026-10-31):** user-requested fix — one more deacetylated bead at IcaB exit. In the steady ON state
  exactly the last THREE rope units now read coat-green (#34d399) instead of two: `S_ICAB = ROPE_LEN − 37` moves
  the colour split one full 16-px pitch earlier (≈8 px clear of both lattice neighbours), so beads s=310/326/342
  trail out of IcaB while all upstream units stay navy. No logic changed — the fill rule and the deacetylation
  halo already key off `S_ICAB`. Self-test still passing; seam unchanged (frame(0) ≡ frame(36)). MP4 re-render
  still deferred — regenerate with `_capture.mjs` + ffmpeg on request.
- **Round 8 (2026-10-31):** three user-requested choreography fixes after a vision review of the shipped animation.
  (1) **PNAG synthesis now runs until IS256 inserts** — peristaltic beats extended to five (`t₀∈{0.8,3.6,6.4,9.8,12.7}`),
  so the rope keeps flowing through the jump-in and is still essentially full (green tip visible) at touchdown; a new φ
  contraction in ch1 pulls the strand back to the anchor as the tail retracts, keeping the OFF-chapter stub exact.
  (2) **IS256 inserts straight into the centre of *icaC*** — the hotspot mark moved to the true gene centre and the
  element lands on it; the gene parts into two labelled fragments at the same instant as touchdown (split + TSD bars fire
  with landing, no "lands at the end then shifts" beat). The operon-off cascade re-gates to t≈13.9.
  (3) **Instant gapless reformation on excision** — the moment IS256 takes off, *icaC* reads as one closed arrow again
  (hard step, no crossfade gap); only the membrane channel ✕ lags until the element lands home (protein turnover trails
  the gene). Self-test gains a chainLen guard at t=14 and passes; seam unchanged (frame(0) ≡ frame(D)); zero pageerrors
  ×3 viewports. MP4 re-render still deferred — regenerate with `_capture.mjs` + ffmpeg on request.
- **Round 9 (2026-10-31):** three user-requested fixes after a vision review of the shipped animation.
  (1) **TSD bars are now static hot-spot markers** — tsdL stays fixed at x=999 (icaC insertion site), opacity gated to ch1/ch2/early-ch3 only; tsdR moved to x=1380 (home centre), visible while IS256 is away. No transform ever applied — the bars no longer ride the element flight like a conveyor. Seam-safe: both invisible at t≈0 and t≈D.
  (2) **Per-cell diffuse PNAG halos replace the solid matrix blob** — removed `matrixG` (impossible pre-formed green ellipse). Each attached cell now has its own soft radial-gradient halo (`coatGlow`: #6ee7b7 → transparent) that blooms in with a staggered cascade as biofilm regrows, and swells on each peristaltic beat. No solid matrix before cells attach.
  (3) **Coat rings sync to phi and thicken like an overlay** — `coatDepth = 1 + 1.6·clamp(φ/3)` grows ring thickness from single-bead to multi-bead as the chain exports; dashoffsets are exact multiples of one bead pitch per φ unit, so coat beads advance in lockstep with the secreted strand (inner ring trails outer → sliding-overlay look). `NCOAT1=64`, `NCOAT2=56` integer bead counts keep the pattern seamless. Self-test passes; seam unchanged (frame(0)≡frame(D)). MP4 re-render still deferred — regenerate with `_capture.mjs` + ffmpeg on request.
- **Round 10 (2026-10-31):** scientific fix flagged by user review of the OFF chapter ("do not remove IcaA and IcaD from the cell"). IS256 inserts in *icaC*, the **last** gene of the co-transcribed operon, so there is no polar effect: the IcaA·D transferase, UDP-GlcNAc supply and IcaB now stay visible in every chapter, and the mRNA line keeps flowing with no block ✕ — a new amber pill reads "icaADBC still transcribed — only icaC lost". Only IcaC export is blocked while IS256 is in situ (the membrane-channel ✕ remains), so short oligomers form but cannot be exported. Basis: Arciola et al. 2015 (PMC4322838) — IcaC externalizes the nascent polymer; Kiem et al. 2004 (PMC2816298); Ziebuhr et al. 1999. New `S.exportBlocked` state, self-test updated (t=17.5: in situ + export blocked + mRNA on) and passing; seam unchanged (frame(0)≡frame(D)). MP4 re-render still deferred — regenerate with `_capture.mjs` + ffmpeg on request.
- **Round 11 (2026-10-31):** two user-requested visual fixes. (1) The TSD hot-spot markers were full gene-arrow-height bars; they are now small cyan dots the same height as the DNA strand itself, sitting centred on the backbone at the *icaC* insertion junction and the home site — positions and opacity behaviour unchanged. (2) The per-cell PNAG coat rings around the surface-attached biofilm cells were too diffuse to read against the white background; the halo gradient is tightened so its opacity peaks in the rim band that actually shows around each opaque cell, with a steeper edge falloff and deeper emerald rim — defined green rings instead of a soft blob. Static markup-only changes (no JS touched), self-test still passing; seam unchanged (frame(0)≡frame(D)). MP4 re-render still deferred — regenerate with `_capture.mjs` + ffmpeg on request.
- **Round 12 (2026-10-31):** biology-accuracy fix after the question "should the TSD be present at both ends of IS256 upon insertion into IcaC?" — yes: cut-and-paste transposition duplicates 8 bp at EACH end, so two identical TSDs flank the inserted element. The animation previously showed only one cyan dot (left junction; Round 9 had repurposed `tsdR` as the home-site marker). A second static dot (`tsdRJ`) now sits on the DNA strand at the right *icaC* junction with the same fade-in/fade-out gating, so both duplicated copies are visible while IS256 is in situ and both leave with it on precise excision. Markup-only plus one `setOp` line — no logic change; self-test still passing; seam unchanged (frame(0)≡frame(D)). MP4 re-render still deferred — regenerate with `_capture.mjs` + ffmpeg on request.
- **Round 13 (2026-11-01):** user-requested fix — the ↺ Restart button was dead because `seek()` rendered frame t but never updated the raf clock (`curT`), so while playing any seek snapped back to the stale time on the next tick. It is replaced by a **timeline scrubber**: a range slider spanning the full 36-s loop (step 0.01) with a live "t s" label — drag or click it to jump to ANY point of the run, while playing or paused; the thumb tracks playback each frame so it doubles as a progress bar (`seek` now sets `curT` first, which also fixed chapter-dot jumps during playback). The slider reuses the existing range styling (260 px on desktop, wraps to its own line in the phone control bar) and stays inert in `?t=` freeze mode as before. Interaction-layer change only — render(t) untouched; self-test still passing; seam unchanged (frame(0)≡frame(D)). **MP4 re-rendered 2026-11-01** on explicit request (`_capture.mjs` → 1080 frames + ffmpeg libx264: h264, 1920×1080/30 fps, exactly 36.000 s / 1080 frames, decode-clean) — `is256_ica_loop.mp4` is now current through Round 13.
- **Round 14 (2026-11-01):** user-reported legibility/overlap fix for the chapter captions ("too light to be seen… collides with the control panel"). Root cause: they were SVG `<text>` inside the scaling viewBox — ~3 CSS px at phone widths, and their y-band mapped onto the fixed `#ui` bar. They are now a **fixed-CSS-px HTML pill above the control bar** (dark text on white, bolded chapter labels + italicized gene names; positioned higher via media query for the two-line phone bar), deliberately kept visible in render mode so MP4 captures retain captions. Caption depends only on chapter → self-test still passing; seam unchanged (frame(0)≡frame(D)); zero pageerrors ×3 viewports, vision-checked desktop/phone-por/phone-land/render-mode. `is256_ica_loop.mp4` is stale again (shows the old faint/overlapping SVG caption) — regenerate with `_capture.mjs` + ffmpeg on request.
