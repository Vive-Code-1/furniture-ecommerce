# Fix Bugs in `src/pages/OrderTrack.tsx`

## Bugs Found

### 1. Logic bug (critical) — Hardcoded fake tracking data
`trackingSteps` is a static array with fixed statuses, dates (Feb 5–8, 2026) and `completed` flags. Every order shown returns the same fake timeline regardless of the real order in the DB. The "In Transit" badge is also hardcoded.

### 2. Logic bug — Fake `setTimeout` "tracking"
`handleTrack` just waits 1s then sets `tracked=true`. It never validates the order number or fetches anything. Invalid IDs still show a "successful" track result.

### 3. Markup/a11y bug — Missing label on the search input
The Input has only a placeholder, no associated `<label>` (even visually hidden). Screen readers announce nothing.

### 4. Markup bug — `<step.icon>` is non-standard JSX
Rendering a lowercase tag from an object property (`step.icon`) makes React treat it as an HTML element, not a component. It must be assigned to a capitalized variable (`const Icon = step.icon; <Icon />`) to render correctly as a component.

### 5. CSS bug — Last timeline item has extra bottom padding
Every `.pb-8` is applied unconditionally, including on the final step, leaving dead space at the bottom of the card.

### 6. CSS/className bug — Conditional string with `&&` short-circuit
`className={\`... ${!step.completed && "text-muted-foreground"}\`}` produces the string `"... false"` when the step is completed, injecting a literal `false` class. Should use ternary returning `""`.

### 7. Logic bug — Form blocks legitimate submit while loading but `required` triggers native validation on empty
Combined with the early `return` for empty input, the native required popup fires unexpectedly. Drop `required` (handled in JS) or keep one, not both.

## Fix Plan

1. **Wire to real DB**
   - On submit, query `orders` by `order_number` (uppercased, trimmed).
   - Query `order_status_history` for that order, ordered by `changed_at` ASC.
   - Map DB statuses → step config:
     | DB status | Label | Icon |
     |---|---|---|
     | pending | Order Placed | Package |
     | processing | Confirmed | CheckCircle2 |
     | shipped | Shipped | Truck |
     | out_for_delivery | Out for Delivery | MapPin |
     | delivered | Delivered | CheckCircle2 |
   - Mark a step `completed` only if a history row exists for it; attach the real `changed_at` date/time.
   - Show the order's current status in the badge (Pending / Processing / Shipped / Out for Delivery / Delivered) with an appropriate icon and color.
   - If no order is found, show a friendly "Order not found" message instead of the timeline.

2. **Fix markup/CSS issues**
   - Assign `const Icon = step.icon` before rendering.
   - Replace `${!step.completed && "..."}` with a ternary.
   - Apply `pb-8` only to non-last steps (or use `last:pb-0`).
   - Add `<label htmlFor>` (sr-only) for the order input; give the input an `id`.

3. **Verify**
   - Test with real order `ORD-892976` (currently pending) — should show only "Order Placed" as completed with its actual `created_at` time, badge = "Pending", no fake Feb 5/6 dates.
   - Test with a non-existent order ID — should show "not found" state.

## Files Touched
- `src/pages/OrderTrack.tsx` — only file.

## Out of Scope
- The DB trigger / `order_status_history` table already exists (per prior migration). No new SQL is needed. If the table is missing on your environment we'll add it as a follow-up.
