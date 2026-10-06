---
name: Vasco News
description: Portal independente de notícias do Vasco, em carvão quente e duas tintas.
colors:
  charcoal: "#2c2624"
  rail: "#241e1c"
  ink: "#f3ece4"
  ink-soft: "#e6d3c4"
  cross-red: "#e23b3b"
  shadow: "#120e0d"
typography:
  display:
    fontFamily: "Bebas Neue, sans-serif"
    fontSize: "clamp(3.1rem, 6.4vw, 6rem)"
    fontWeight: 400
    lineHeight: 0.9
    letterSpacing: "-0.04em"
  body:
    fontFamily: "Source Serif 4, Georgia, serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
  ui:
    fontFamily: "Manrope Variable, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: "normal"
rounded:
  none: "0"
spacing:
  sm: "8px"
  md: "16px"
  lg: "32px"
components:
  button-primary:
    backgroundColor: "{colors.cross-red}"
    textColor: "{colors.charcoal}"
    typography: "{typography.display}"
    rounded: "{rounded.none}"
    padding: "11px 14px"
  nav-active:
    backgroundColor: "{colors.cross-red}"
    textColor: "{colors.charcoal}"
    typography: "{typography.ui}"
    rounded: "{rounded.none}"
    padding: "7px 9px"
  search:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.ui}"
    rounded: "{rounded.none}"
    padding: "9px 0"
---

## Overview

**Creative North Star: "A charge read off a two-ink poster."**

The capa is a postwar one-sheet translated onto warm charcoal: a small figure, a hard shadow climbing a red wall, and the headline set like an accusation. The cream paper and amber of that poster become charcoal and the red of the Maltese cross, because the portal stays dark without going black.

**Key Characteristics:**

- Two inks only: cream type and cross red, on charcoal.
- The shadow is a shape, not a glow.
- Titles are condensed caps. The article column is a serif at a calm measure.
- Stories continue as ruled credit lines. Nothing sits in a box.

## Colors

The ground is charcoal `#2c2624`. The left rail is one step darker, `#241e1c`. Type is cream `#f3ece4`. Secondary type is the same cream pulled toward the red, `#e6d3c4`, never a neutral gray. The only saturated color is the cross red `#e23b3b`, and it owns a region: the active section, the primary button, and the wall behind the shadow.

**The One Ink Rule.** Red does structural work. It is not a sprinkle of links across a gray page.

## Typography

Bebas Neue carries headlines, billing lines, and buttons, in uppercase, with tracking no tighter than `-0.04em`. Source Serif 4 carries the summary and the article body, around 65–68 characters. Manrope carries navigation, search, and the footer note.

**The Billing Rule.** Time, source, and section sit in a ruled line under the title. They never sit as a label above it.

## Layout

On wide screens the sections live in a sticky left rail. The sheet to the right holds the poster, then the credit lines, then a ruled footer. Below 860px the rail becomes a drawer and the poster stacks: title, summary, billing, then the figure and its wall.

The way forward is a list of credit lines, full width of the sheet, separated by hairlines.

## Elevation & Depth

Depth is the cast shadow and the red wall, not a drop shadow on a card. The shadow swings once, on a long ease, and holds still when the reader prefers reduced motion. The lead text does not move.

## Shapes

Corners are square. Rules are 1px cream at low opacity. The photo, when the story has one, is a small rectangle. The cross is the mark in the rail and, on the capa, the figure only when the story has no photo.

## Components

The primary button is a red block with charcoal condensed caps. The active nav item uses the same fill. Search is an underline field with a red caret. A credit row is a title plus a billing line, with a small photo only when `imageUrl` exists. The one-sheet is the capa's first viewport: headline, serif dek, billing, cast.

## Do's and Don'ts

- Do use only stories, photos, and sources that the API returned.
- Do keep the cross as the mark, and a photo as a photo.
- Do keep the capa free of keyword chips and of a copy-link button.
- Don't turn the ground white, cream, or near-black.
- Don't put stories in cards, pills, or rounded plates.
- Don't invent a headline, a photo, or a source.
