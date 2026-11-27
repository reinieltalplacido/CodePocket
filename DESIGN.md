---
name: CodePocket
description: True black and deep obsidian landing surface framing an interactive developer code snippet vault.
colors:
  true-black: "#050608"
  obsidian-surface: "#0A0D12"
  vault-obsidian: "#090B0E"
  vault-chrome: "#0D1015"
  vault-card: "#11151B"
  slate-50: "#F8FAFC"
  slate-400: "#94A3B8"
  vault-emerald: "#10B981"
  vault-emerald-bright: "#34D399"
typography:
  display:
    fontFamily: "Bricolage Grotesque, sans-serif"
    fontSize: "3.45rem"
    fontWeight: 700
    lineHeight: 1.06
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Bricolage Grotesque, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.625
  mono:
    fontFamily: "Geist Mono, monospace"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.5
  caption:
    fontFamily: "Geist Mono, monospace"
    fontSize: "11px"
    fontWeight: 500
    lineHeight: 1.4
  micro:
    fontFamily: "Geist Mono, monospace"
    fontSize: "10px"
    fontWeight: 600
    lineHeight: 1.3
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "64px"
components:
  button-primary:
    backgroundColor: "{colors.vault-emerald}"
    textColor: "{colors.true-black}"
    rounded: "{rounded.md}"
    padding: "10px 20px"
  button-primary-hover:
    backgroundColor: "{colors.vault-emerald-bright}"
  button-secondary:
    backgroundColor: "{colors.vault-chrome}"
    textColor: "{colors.slate-50}"
    rounded: "{rounded.md}"
    padding: "10px 20px"
---

# Design System: CodePocket

## Overview

**Creative North Star: "True Black Obsidian Workbench"**

CodePocket unifies its landing surface and logged-in application around true black (`#050608`) and deep obsidian surfaces (`#0A0D12`, `#090B0E`), letting code syntax and emerald (`#10B981`) focus cues carry visual hierarchy without decorative glow or clutter.

**Key Characteristics:**
- Cohesive true black (`#050608`) ground alternating with `#0A0D12` obsidian bands separated by subtle `white/[0.08]` hairlines.
- Single emerald accent (`#10B981` / `#34D399`) with deep black `#050608` text on primary CTAs (`7.99:1` contrast).
- Interactive first-viewport vault preview rather than static feature cards or fabricated claims.

## Colors

Restrained dark obsidian base paired with emerald as the sole primary accent.

### Primary
- **Vault Emerald** (`#10B981`): Primary CTA buttons with `#050608` ink (`7.99:1` contrast), active sidebar indicators, and language accents.
- **Bright Emerald** (`#34D399`): Hover state for primary CTA buttons and mono technical specification labels (`10.54:1` on `#050608`).

### Neutral
- **True Black** (`#050608`): Primary page ground and footer.
- **Obsidian Surface** (`#0A0D12`): Alternating section ground for VS Code Sync and closing call to action.
- **Vault Obsidian** (`#090B0E`): Interactive workspace frame ground.
- **Vault Card** (`#11151B`): Embedded snippet card surface inside the preview.
- **Slate 50** (`#F8FAFC`): Primary headings and interactive labels (`19.37:1` on `#050608`).
- **Slate 400** (`#94A3B8`): Secondary body prose (`7.91:1` on `#050608`, `7.59:1` on `#0A0D12`).

## Typography

**Display Font:** Bricolage Grotesque (weights 500, 600, 700)
**Body Font:** Geist (`--font-geist-sans`)
**Label/Mono Font:** Geist Mono (`--font-geist-mono`)

### Hierarchy
- **Display** (`700`, `2.25rem` mobile to `3.45rem` desktop, `1.06`, `-0.03em`): Landing page hero headline (`h1`).
- **Headline** (`700`, `1.875rem` to `2.25rem`, `1.15`, `-0.02em`): Section headings (`h2`).
- **Title** (`600`, `1.125rem`): Ledger item titles and preview workspace panel titles.
- **Body** (`400`, `1rem` / `0.875rem`, `1.625`): Editorial copy and descriptions.
- **Label / Mono** (`500`, `0.75rem`, `1.5`): Code snippets, keyboard shortcuts, and API endpoints.

## Layout

Centered `max-w-6xl` (`72rem`) container with asymmetric 12-column desktop splits (`7/5` hero opener, `5/7` VS Code Sync, `4/5/3` ledger rows) collapsing cleanly to single-column below `lg`. Grid children use `min-w-0` and outer wrapper uses `overflow-x-clip` to prevent horizontal scroll on narrow viewports.

## Elevation & Depth

Sections stay flat with `1px` `white/[0.08]` borders and tonal shifts (`#050608` vs `#0A0D12`). Deep shadow and `white/[0.14]` rim borders lift only the embedded `VaultPreview` and `VsCodeSyncDemo` frames.

## Shapes

Sharp-edged developer tool radii: `8px` (`rounded-lg`) for buttons and inputs, `12px` (`rounded-xl`) for embedded frames and the brand mark, and `6px` (`rounded-md`) for tags and filter chips.

## Components

### Buttons
- **Shape:** `8px` (`rounded-lg`) with minimum `44px` tap height (`min-h-[44px]`).
- **Primary:** `#10B981` fill, `#050608` text, `#34D399` hover, visible `2px` focus-visible ring.
- **Secondary:** `#0D1015` fill, `#E2E8F0` text, `1px` `white/[0.14]` border.

### Navigation
- Sticky top bar (`#050608/90` with `backdrop-blur-md` and `1px` `white/[0.08]` bottom border), collapsing to a `44x44px` mobile menu drawer closable via `Escape`.

## Do's and Don'ts

### Do:
- **Do** use `#050608` dark text on `#10B981` primary CTA buttons for WCAG AAA contrast (`7.99:1`).
- **Do** maintain `>=44px` touch targets and `min-w-0` on grid containers holding code blocks.
- **Do** mark interactive demo datasets clearly (`Interactive Sample Vault`).

### Don't:
- **Don't** add eyebrow kickers above section headings, gradient headline text, or em dashes in UI copy.
- **Don't** fabricate user counts, uptime figures, testimonials, or unimplemented features.
