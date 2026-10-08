---
name: CodeDaily
description: A tiny one-bit computer you switch on once a day to solve one real-code challenge.
colors:
  ink: "#000000"
  paper: "#ffffff"
typography:
  display:
    fontFamily: "'Pixelify Sans Variable', 'Pixelify Sans', system-ui, sans-serif"
    fontSize: "clamp(2.4rem, 4.5vw, 4.4rem)"
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: "normal"
  headline:
    fontFamily: "'Pixelify Sans Variable', 'Pixelify Sans', system-ui, sans-serif"
    fontSize: "clamp(1.9rem, 3.6vw, 2.8rem)"
    fontWeight: 700
    lineHeight: 1.02
  title:
    fontFamily: "'Pixelify Sans Variable', 'Pixelify Sans', system-ui, sans-serif"
    fontSize: "clamp(1.55rem, 2.6vw, 2.05rem)"
    fontWeight: 700
    lineHeight: 1.08
  window-title:
    fontFamily: "'Pixelify Sans Variable', 'Pixelify Sans', system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.6
    letterSpacing: "0.02em"
  control:
    fontFamily: "'Pixelify Sans Variable', 'Pixelify Sans', system-ui, sans-serif"
    fontSize: "1.08rem"
    fontWeight: 600
    letterSpacing: "0.02em"
  body:
    fontFamily: "'Atkinson Hyperlegible', system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.55
  lede:
    fontFamily: "'Atkinson Hyperlegible', system-ui, sans-serif"
    fontSize: "1.12rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "'Atkinson Hyperlegible', system-ui, sans-serif"
    fontSize: "0.86rem"
    fontWeight: 700
  code:
    fontFamily: "'JetBrains Mono', 'Cascadia Code', monospace"
    fontSize: "0.98rem"
    fontWeight: 400
    lineHeight: 1.7
    fontFeature: "'liga' 0, 'calt' 0"
  numeric:
    fontFamily: "'JetBrains Mono', 'Cascadia Code', monospace"
    fontWeight: 600
    fontFeature: "'tnum' 1"
rounded:
  none: "0px"
  button: "7px"
spacing:
  frame: "2px"
  xs: "6px"
  sm: "14px"
  md: "22px"
  lg: "30px"
  gutter: "clamp(16px, 3vw, 32px)"
  max-width: "1240px"
components:
  button-primary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.control}"
    rounded: "{rounded.button}"
    padding: "6px 22px"
    height: "44px"
  button-primary-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  button-secondary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.control}"
    rounded: "{rounded.button}"
    padding: "6px 22px"
    height: "44px"
  button-danger-solid:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.button}"
    padding: "6px 22px"
  option-button:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.numeric}"
    rounded: "{rounded.button}"
    height: "64px"
  option-button-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  menu-item:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    padding: "0 14px"
    height: "46px"
  menu-item-current:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  window:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "22px"
  input-text:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.code}"
    rounded: "{rounded.none}"
    padding: "6px 12px"
    height: "50px"
  select:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "6px 36px 6px 12px"
    height: "42px"
  pill:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "1px 9px"
  pill-inverse:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
---

# Design System: CodeDaily

## Overview

**Creative North Star: "The One-Bit Desktop"**

CodeDaily is a small black-and-white computer from the early desktop era, switched on once a day. The challenge, the editor, the tests and the hints are real windows sitting on a dithered desktop, with a menu bar across the top and desktop icons that launch the extra modes. Everything is ink on paper: there is no second hue, and every intermediate tone is an ordered dither, never a flat grey.

The density is that of a working machine, not a landing page. Windows overlap, carry a striped title bar with a paper title plaque and a square box, and drop a hard dithered shadow. State is spoken in the machine's own vocabulary: pressed and selected invert, focus and selection wear marching ants, disabled is dithered. Motion is stepped, never eased: windows zoom open as outline rectangles growing from the element that was activated, and checking a solution runs like a system job (wait cursor, test rows ticking in one per step).

Three voices share the screen with strict jobs: a pixel face for the machine's chrome (titles, menus, buttons), a hyperlegible humanist sans for anything the learner has to read, and a monospace for code and tabular numbers. The world explicitly refuses the category default of a dark IDE with a neon accent.

**Key Characteristics:**
- Pure 1-bit palette: ink (#000) and paper (#fff); greys exist only as dither patterns.
- Windows as the only container: 2px frame, striped title bar, square box, dithered drop shadow.
- Inversion for pressed/current/selected; marching ants for focus/selection; dither for disabled.
- Pixelify Sans for chrome at 1rem and above; Atkinson Hyperlegible for reading; JetBrains Mono for code and data numbers. No ligatures anywhere.
- Stepped motion (`steps()`) only; reduced motion removes it entirely.
- Authored 16x16 one-stroke bitmap icons.

## Colors

Two inks, no hues: the palette is a printing press with one plate.

### Primary
- **Ink** (#000000): all text, all frames and rules, inverted fills for pressed, current, selected and success states, the default-button ring, the caret, the scrollbar thumb.

### Neutral
- **Paper** (#ffffff): window bodies, title plaques, menu bar, footer, input fields, and the paper plaques that lift text off the desktop.
- **The dither ladder** (patterns, not colors; ink pixels on paper at a 2px or 4px cell, rendered `crispEdges` and `image-rendering: pixelated`):
  - **12.5%** (4px cell): the desktop itself; disabled editor and inputs; wrong options.
  - **25%** (2px cell): hover on menu items, toggles, segmented buttons, icon buttons and options; heatmap level 1.
  - **50%** (2px cell): window drop shadows; disabled button lettering; failed attempt cells; the code editor resizer; heatmap level 2.
  - **75%** (2px cell): progress bar fills.
  - **Screen 50%** (2px cell, transparent gaps): the modal overlay, darkening the desktop without hiding it.
  - **Stripes** (2px cell, horizontal 1px lines): title bar texture and the collapsed-window box.

### Named Rules
**The One-Bit Rule.** Only ink and paper are ever painted. Any tone between them is one of the dither patterns above; no flat greys, no opacity tints, no third color, not even for status.

**The Inversion Rule.** Pressed, current page, selected option, passed result and "lead" values are shown by swapping ink and paper. Inversion is the only emphasis fill the system has.

## Typography

**Display Font:** Pixelify Sans Variable (with Pixelify Sans, system-ui)
**Body Font:** Atkinson Hyperlegible 400/700 (with system-ui)
**Label/Mono Font:** JetBrains Mono 400/600 (with Cascadia Code, monospace)

All three are self-hosted via @fontsource. `font-synthesis: none`; ligatures and contextual alternates are off globally (`'liga' 0, 'calt' 0`).

**Character:** The pixel face is the machine talking (menus, title bars, buttons, headlines); Atkinson is the teacher talking (statements, descriptions, hints); JetBrains Mono is the code and the counts.

### Hierarchy
- **Display** (Pixelify 700, clamp(2.4rem, 4.5vw, 4.4rem), 0.95, uppercase, balanced): the home headline in the main window only.
- **Headline** (Pixelify 700, clamp(1.9rem, 3.6vw, 2.8rem), 1.02, uppercase): page titles on paper plaques; nested pages drop to clamp(1.4rem, 2.4vw, 1.8rem).
- **Title** (Pixelify 700, clamp(1.55rem, 2.6vw, 2.05rem), 1.08): challenge heading inside the brief window; the home "today" title at 1.6rem; section and dialog headings 1.02 to 1.3rem.
- **Window title** (Pixelify 600, 1rem, 1.6, 0.02em): title plaques, status bars, pills, field labels, desktop icon labels.
- **Control** (Pixelify 600-700, 1.02 to 1.08rem, 0.02em): buttons, segmented controls, menu items (1.05rem, 500).
- **Body** (Atkinson 400, 16px, 1.55): reading text; lede at 1.12 to 1.2rem capped at 62ch.
- **Label** (Atkinson 700, 0.86 to 0.9rem): fact terms, mini-stat captions, heatmap legend, mode descriptions (0.88rem, 400).
- **Code** (JetBrains Mono 400, 0.92rem in blocks / 0.98rem in the editor, 1.65 to 1.7): code blocks, editor, text answers.
- **Numeric** (JetBrains Mono 600, tabular): fact values, mini-stats (1.5rem), table values, bar counts, pool counts, multiple-choice options (1.2rem).

### Named Rules
**The 1rem Floor Rule.** The pixel face is never set below 1rem. Anything smaller is a label and goes to Atkinson.

**The Three Voices Rule.** Pixel for chrome, Atkinson for reading, Mono for code and data numbers. Display-scale numerals (streak count, result day) stay in the pixel face because they are headlines, not data.

**The No-Ligature Rule.** Code is shown exactly as typed: ligatures and contextual alternates stay off in every face.

## Layout

A sticky menu bar (46px, 2px bottom rule) over a dithered desktop, a centred container of `min(1240px, 100% - 2 * gutter)` with a fluid gutter (clamp(16px, 3vw, 32px)), and a paper footer bar with a top rule. The desktop pads 30px top, 52px bottom.

Pages are arrangements of windows. The home desk is a 124px icon column beside a stage where the main window and the "today" document window overlap (the second window offset 104px down and pulled 52px left over the first). Work pages use a two-column workspace (1fr / 1.15fr) and a results grid (1.35fr / 1fr); progress uses a 12-column grid of windows. The common gap between windows is 30px; within windows the rhythm runs 6 / 14 / 22px, and window bodies pad 22px (16px on phones).

Responsive: at 1080px the icon column becomes a wrapping row and two-column work grids stack; at 820px the overlapping home windows stack with a small offset (22px, then 10px at 640px) so the overlap survives; at 640px the menu nav wraps onto its own full-width row, the shadow offset drops from 6px to 4px, and primary and dialog buttons go full width.

### Named Rules
**The Paper Plaque Rule.** Text never sits directly on the dither. Page heads and toolbar labels that fall on the desktop sit on a paper plaque outlined with a 2px ink ring.

## Elevation & Depth

Depth is drawn, not lit. There are no blurred shadows. A window sits above the desktop through a hard 50% dithered shadow offset down-right; stacking is shown by overlap and z-order; a modal darkens everything behind it with a transparent-gap dither screen.

### Shadow Vocabulary
- **Window drop shadow** (pseudo-element, 50% dither, offset `var(--shadow-offset)` = 6px, 4px under 640px): every window and dialog.
- **Default-button ring** (`box-shadow: 0 0 0 3px #fff, 0 0 0 6px #000`): the one default action per window; also marks the correct option after an answer.
- **Popup shadow** (`box-shadow: 1px 1px 0 #000`): dropdown selects.
- **Plaque outline** (`box-shadow: 0 0 0 2px #000`): paper plaques on the desktop.
- **Pressed-in hover** (`box-shadow: inset 0 0 0 2px #000`): button hover thickens the frame inward.

### Named Rules
**The Drawn Depth Rule.** Shadows are hard and dithered or a solid 1px offset; blur and spread-as-glow do not exist in this world.

## Shapes

Square by default: windows, fields, pills, tables, heatmap cells, test marks and attempt cells have 0 radius and a 2px ink frame. The only rounded silhouette is the push-button (7px), which applies to primary, secondary, option and support-link buttons, as on the early desktop. Rule weight carries meaning: solid 2px frames structure, 2px dotted rules divide rows inside a frame, 2px dashed rules divide documents and mark empty states and links, and a 4px double rule marks danger and error.

## Components

### Buttons
Push-buttons from a one-bit desktop: rounded rectangle, framed, inverted when pressed.
- **Shape:** gently rounded (7px), 2px ink frame, min-height 44px, padding 6px 22px.
- **Primary (default button):** paper fill, Pixelify 700 1.08rem, wrapped in the thick default ring (3px paper gap, 3px ink). One per window.
- **Secondary:** same button without the ring, weight 600.
- **Hover / Active:** hover thickens the frame inward (inset 2px); active inverts to ink fill and paper text. Focus is the global 2px dashed ink outline at 3px offset.
- **Disabled:** dotted frame, lettering filled with 50% dither, primary ring replaced by a dotted outline.
- **Danger:** 4px double frame; the solid variant is inverted and underlines on hover.
- **Text link:** Pixelify 600 1.05rem with a 2px dashed underline that turns solid on hover.

### Chips
- **Pill:** square, 2px frame, Pixelify 600 1rem, paper fill; `inverse` swaps to ink; `dotted` for tentative info (day number, date, difficulty, mode).

### Cards / Containers
The window is the only container.
- **Corner Style:** square (0).
- **Background:** paper over the dithered desktop.
- **Shadow Strategy:** window drop shadow (see Elevation).
- **Border:** 2px ink frame; 2px rules under the title bar and above the status bar.
- **Internal Padding:** 22px (16px on phones).
- **Title bar:** 32px, stripes inset 7px by 8px, centred paper plaque with optional 16px bitmap icon and Pixelify title.
- **Status bar:** optional, Pixelify 1rem, items spread edge to edge.

### Inputs / Fields
- **Style:** square, 2px ink frame, paper fill, min-height 42px, padding 6px 12px; selects carry a bitmap triangle and a 1px popup shadow; free-text answers use JetBrains Mono at 50px height.
- **Code editor:** square framed textarea, JetBrains Mono 0.98rem / 1.7, no gutter line, ink caret, dithered resizer, min-height 300px (240px on phones).
- **Focus:** global 2px dashed ink outline, 3px offset.
- **Disabled:** 12.5% dither fill.
- **Segmented control:** one 2px frame split by 2px rules; selected segment inverts; hover gets 25% dither.

### Navigation
- **Menu bar:** sticky paper bar, brand (26px computer bitmap + Pixelify 700 1.2rem), menu titles in Pixelify 500 1.05rem with 14px side padding. Hover 25% dither; current page and press invert. ES/EN toggle group and help button sit at the right. On phones the menu titles wrap to a full-width second row.
- **Desktop icons:** 16px bitmap scaled up on a paper patch above a paper label (Pixelify 500 1rem); hover and pressed invert both; focus and selection draw marching ants (8px dashes, 0.6s, steps(4)).

### Window (signature)
Every window has a square box at the right of the title bar. On dialogs the box carries a cross bitmap and closes; on all other windows the box is empty and windowshades the window to its title bar (stripes fill the box while collapsed). Windows open with the zoom: three 2px outline rectangles grow from the activated element (`--zoom-ox/--zoom-oy`, falling back to centre) in steps(5) over 0.26s, staggered 40ms, before the window appears in one step. Sibling windows stagger by `--zoom-delay` (0.06 to 0.24s).

### Results and feedback
- **Feedback box:** framed box with a bitmap icon; success inverts, error uses the 4px double frame.
- **Test rows:** framed list divided by dotted rules, each row appearing one step after the previous (0.14s); failed marks invert.
- **Attempt grid:** 40px square cells; win inverts, fail is 50% dither.
- **Bars and heatmap:** 75% dither fill (lead bar solid ink); heatmap cells step through paper, 25%, 50%, ink, with today ringed by a dashed outline.

### Named Rules
**The Every-Window-Has-a-Box Rule.** No window ships without its square box: a cross that closes on dialogs, an empty box that windowshades everywhere else.

**The Stepped Motion Rule.** Every animation uses `steps()`; nothing glides or eases. `prefers-reduced-motion` removes zoom rectangles, row reveals, marching ants and busy dots.

## Do's and Don'ts

### Do:
- **Do** paint only #000 and #fff; reach for the dither ladder (12.5 / 25 / 50 / 75%) whenever a tone is needed.
- **Do** put every new surface in a window with a striped title bar, a square box and the dithered drop shadow.
- **Do** invert ink and paper for pressed, current and selected states, and use marching ants for focus and selection on desktop icons.
- **Do** keep the pixel face at 1rem or larger and move smaller labels to Atkinson Hyperlegible 700.
- **Do** set code and data numbers in JetBrains Mono with tabular figures and ligatures off.
- **Do** draw new icons as 16x16 one-stroke bitmaps in the PixelIcon grid.
- **Do** animate with `steps()` and let reduced motion remove the animation entirely.
- **Do** give each window exactly one default button with the thick ring.

### Don't:
- **Don't** introduce any hue, flat grey or opacity tint; a grey is a dither or it does not exist.
- **Don't** use blurred or glowing shadows; depth is a hard dither offset or a 1px solid popup shadow.
- **Don't** use eased transitions or smooth fades.
- **Don't** round windows, fields, pills or cells; the 7px radius belongs to push-buttons only.
- **Don't** set the pixel face below 1rem or use it for paragraphs of reading text.
- **Don't** use text glyphs or emoji as interface icons; use the bitmap set.
- **Don't** place text directly on the dithered desktop without a paper plaque.
- **Don't** drift toward a dark IDE with a neon accent.
