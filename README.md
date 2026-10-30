# IS256 × *ica* locus — phase-variation animation

A single-file, responsive HTML/SVG animation of the insertion sequence **IS256** jumping in and out of the
***icaC*** gene of *Staphylococcus aureus*, switching PIA/PNAG biosynthesis and biofilm formation on and off.
Combines genome dynamics (cut-and-paste transposition, 8-bp target-site duplications, precise excision) with
the biology it drives (operon → transferase chain → IcaC export → PNAG coat → device biofilm).

No dependencies — open `index.html` in any modern browser. Works on desktop and phone (uniform SVG scaling,
viewBox 1600×900). A pre-rendered MP4 of the full loop is available as `is256_ica_loop.mp4`.

## Usage

- **Open:** double-click `index.html` (or serve the folder). Autoplays; tap to play/pause.
- **Interactive chrome** (bottom): play/pause, 4 chapter dots (jump to a phase), speed slider 0.5–2×, restart.
  With `prefers-reduced-motion`, it starts paused.

### URL modes

| URL | Behaviour |
|---|---|
| `index.html?t=17.5` | Seek to that time (seconds) and **freeze** — handy for sharing a single frame |
| `index.html?render=1` | Hide interactive chrome, letterbox 16:9, freeze at boot — capture mode |
| `index.html?test=1` | Run the built-in self-test; badge bottom-right shows `self-test: PASS/FAIL` (also in console) |

### External frame capture handle

The page exposes a deterministic render hook for screen-capture tooling:

```js
window.__IS256 = {
  render(t),   // pure function of t — set any frame, no reload needed
  D,           // loop duration (36 s)
  state()      // current simulation state (chapter, is256 position, icaC broken, biofilm…)
}
```

Every visual property is a pure function of `t`, and all motion is loop-periodic, so frame 0 ≡ frame 36 —
the MP4 loops seamlessly.

## Timeline (36 s loop, four 9-s chapters)

1. **ON** — *icaADBC* operon transcribes; IcaA·D transferase builds GlcNAc chain from UDP-GlcNAc; IcaB
   deacetylates; IcaC channel extends + exports full-length PNAG → cell coat → multilayered biofilm on the device.
2. **JUMP IN** — transposase *tnp256* cuts IS256 out of its home site (ghost left behind) and cut-and-paste
   integrates it into the icaC hot spot, duplicating 8 bp at each end (TSD). *icaC* is broken → transcription
   blocked, only short oligomers (<20 units), no export.
3. **OFF** — PNAG coat gone; cells are smooth and planktonic; biofilm disassembles — no adhesion to the device.
4. **JUMP OUT** — precise excision: IS256 leaves icaC carrying the duplicated 8-bp copies, restoring the exact
   original sequence. Operon refires; PNAG⁺ and biofilm return. Phase variation complete.

## Rendering the MP4

Deterministic frame capture (`_capture.mjs`) + ffmpeg — this is how `is256_ica_loop.mp4` was produced:

```bat
node _capture.mjs
:: → _frames/frame_0000.png … frame_1079.png (Playwright drives window.__IS256.render(i/30) at 1920×1080; ~90 s total)
ffmpeg -framerate 30 -start_number 0 -i _frames\frame_%04d.png -c:v libx264 -pix_fmt yuv420p is256_ica_loop.mp4
```

`_capture.mjs [start] [endExclusive]` makes the run resumable (e.g. `node _capture.mjs 540 1080`). It reuses the
Playwright/Chromium install from `C:\Users\sfaas\html-video\node_modules`. Any ffmpeg with libx264 works — note
the one at `D:\RVC1006Nvidia\RVC1006Nvidia\ffmpeg.exe` is built **without** libx264 (and its NVENC rejects the
preset), so a full build such as the WinGet Gyan.FFmpeg package was used here.

Verify with `ffprobe` (expect 36 s, 1920×1080, 30 fps, 1080 frames) + a full decode pass:
`ffmpeg -v error -i is256_ica_loop.mp4 -an -f null -`.

## Files

| File | Purpose |
|---|---|
| `index.html` | The animation (self-contained: markup + styles + timeline engine) |
| `is256_ica_loop.mp4` | Full 36-s loop rendered at 1920×1080/30 fps |
| `_capture.mjs` | MP4 frame-capture harness (Playwright, drives `window.__IS256.render`) — see "Rendering the MP4" |
| `_shots.cjs`, `_selftest.cjs` | Playwright QA harnesses (responsive screenshots, self-test run) — not needed to view the animation |
| `HANDOFF.md` | Session handoff doc: design coordinates, verification order, biology fact sheet |

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
