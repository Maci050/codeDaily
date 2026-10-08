---
version: 1
slug: "codedaily-src-pages-homepage-jsx"
primary_target: "codedaily/src/pages/HomePage.jsx"
related_targets: ["codedaily/src/App.jsx","codedaily/src/components/challenge/ChallengePlayer.jsx"]
---

# CodeDaily: whole-app redesign

Scope: every surface of the app (Inicio, Daily Challenge, Archivo, Progreso, Modos, tutorial, result and give-up dialogs). Home is Persuade; the challenge players, archive and progress are Operate inside the same world.

Audience and job: learners practicing Python/Java who should try today's challenge within seconds of landing and come back daily. Constraints: static, no account, same puzzle for everyone, Spanish/English, fast on phones, never childish, never corporate, never a LeetCode-style dark clone.

Memorable moment: windows zoom open from what you clicked, and checking a solution runs like a system job (wait cursor, tests ticking in one by one, a result dialog zooming out of the Check button).

## Direction contract

THESIS: CodeDaily is a tiny one-bit computer you switch on once a day: the challenge, your code, the tests and the hints are real windows on a dithered desktop. It refuses the category default of a dark IDE with a neon accent, and the generic hero-plus-card-row page.

OWN-WORLD: pure #000 ink on #fff paper, no other hues; every gray is an ordered dither (12.5% desktop, 25%, 50%, 75%). Windows have 2px black frames, striped title bars with a white title plaque and a square close box, and a hard dithered drop shadow. Pressed means inverted, focus and selection wear marching ants, disabled is dithered. Pixel display face (Pixelify Sans) for titles, menus and buttons; Atkinson Hyperlegible for reading text; JetBrains Mono only for code. Icons are authored 16-px bitmaps in one stroke.

STORY: the visitor sees today's real challenge already open in a window, understands "one short real-code challenge a day, same for everyone, free", presses the primary button and lands in the editor window. Inside, failures teach (hints window, per-test rows) and success ends in a shareable dialog.

FIRST VIEWPORT: menu bar across the top (brand computer icon + CodeDaily, nav as menu titles, ES/EN, help). Dithered desktop. Left: a column of desktop icons launching the three extra modes and the archive. Centre-left, the largest window, "CodeDaily", holding the pixel headline at ~4.5rem, one line of description and the primary button "Jugar Daily Challenge". Overlapping it on the right, a document window titled with today's file name showing the real challenge number, date, title, statement and starter code, with its own "Abrir reto" button. Below the fold, a Léeme.txt window with the four facts.

FORM: one-bit early desktop (catalog challenger medium-native-one-bit-desktop, chosen from the bolder re-roll over the assigned darkroom), seed key 4e3cb131. Signature interaction: the zoom-rectangle window open (stepped outlines from origin to window) on page change and dialogs; motion grammar is stepped (steps()), never eased glides, and reduced motion removes it.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
