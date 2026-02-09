

# Fix Currency Sign in Notification Panel

## Problem
The notification panel displays the Bengali Taka sign (৳) instead of the dollar sign ($) for order amounts.

## Change
In `src/components/admin/NotificationPanel.tsx`, line 166, replace `৳` with `$`.

**Before:** `৳{Number(order.total_amount).toLocaleString()}`
**After:** `${Number(order.total_amount).toLocaleString()}`

## Files to Change
1. `src/components/admin/NotificationPanel.tsx` -- single character fix on line 166

