# Mercadex Frontend Design System

## Purpose

This document is the source of truth for frontend visual language in Mercadex.
Any new screen, component, or UI change must follow these rules.

## Design Principles

1. Clarity first: users must understand state, price, action, and next step quickly.
2. Confidence-driven UX: emphasize trust signals (condition, seller, payment, delivery).
3. Conversion-oriented hierarchy: key CTA, price, and quantity controls stay visually prominent.
4. Consistency over novelty: avoid one-off colors, spacing, and component variants.
5. Mobile parity: all primary journeys must work on small screens without hidden critical actions.

## Stack and Styling Rules

1. Styling system: Tailwind CSS only, with global tokens in `frontend/src/app/globals.css`.
2. Component style: shadcn-style primitives in `frontend/src/shared/ui/`.
3. Utility composition: `cn` helper from `frontend/src/shared/lib/cn.ts`.
4. Do not introduce inline style objects except for unavoidable runtime values.
5. Do not introduce additional UI frameworks (MUI, Chakra, Ant, etc.) unless explicitly requested.

## Typography

1. Primary font family: Inter.
2. `font-sans` must resolve to Inter globally.
3. `font-display` is allowed for emphasis but must also resolve to Inter.
4. Avoid mixing external font families in feature components.

## Color Tokens

Use semantic CSS variables defined in `frontend/src/app/globals.css` and consumed via Tailwind config:

1. `background`, `foreground`
2. `card`, `card-foreground`
3. `primary`, `primary-foreground`
4. `secondary`, `secondary-foreground`
5. `muted`, `muted-foreground`
6. `accent`, `accent-foreground`
7. `border`, `input`, `ring`

Rules:

1. Prefer semantic token classes (`bg-primary`, `text-muted-foreground`) over hardcoded hex colors.
2. If a new color is truly needed, add it to tokens first, then use through semantic class names.

## Spacing and Layout

1. Base spacing follows Tailwind scale.
2. Main content should use `container` and consistent vertical rhythm.
3. Standard corner radius must use tokenized values (`rounded-md`, `rounded-xl`, etc. from config).
4. Avoid arbitrary spacing unless there is a clear visual reason.

## Core Components

Use shared primitives before creating feature-specific UI:

1. `Button`
2. `Input`
3. `Select`
4. `Card`
5. `Badge`
6. `Drawer`
7. `Modal` (if required by flow)

Rules:

1. Extend shared components first; do not duplicate variants inside feature folders.
2. Keep variant naming semantic (`primary`, `secondary`, `ghost`, `danger`).
3. Preserve accessibility labels and keyboard interactions.

## UX Writing Guidelines

1. Prefer concise, actionable microcopy.
2. Buttons should start with a verb when possible (`Adicionar ao carrinho`, `Finalizar compra`).
3. Empty states should explain what happened and what to do next.
4. Error and fallback states should reduce ambiguity and suggest recovery actions.

## Ecommerce Experience Patterns

### Header

1. Keep search visible in primary viewport.
2. Keep cart access visible and persistent.

### Product Listing

1. Show condition and category quickly.
2. Keep product title, price, and detail CTA clearly scannable.
3. Filters and sort controls must be easy to discover.

### Product Detail

1. Prioritize title, condition, price, discount, and quantity controls above fold.
2. Keep trust blocks near CTA (seller, shipping, verification).

### Cart and Checkout

1. Step transitions must be explicit.
2. Keep totals transparent (subtotal, shipping, total).
3. Payment instructions must be clear and copy-friendly (PIX).

## Accessibility Baseline

1. Maintain color contrast for text and controls.
2. Ensure interactive targets are keyboard accessible.
3. Keep `aria-label`/`aria-*` where already used.
4. Do not remove existing test IDs that are part of automated tests unless tests are updated together.

## Implementation Checklist

Before finishing any UI task, confirm:

1. Uses Inter typography globally.
2. Uses design tokens and Tailwind semantic classes.
3. Reuses shared UI primitives.
4. Preserves responsiveness and accessibility.
5. Maintains or updates tests for changed behavior.
