

# Fix Order Tracking - Sync with Real Database Data

## Problem
The Order Track page currently uses **hardcoded fake tracking steps** with wrong statuses and dates. When a customer tracks their order, it shows "Confirmed", "Shipped" etc. even though the order is still "Pending". This is misleading.

For example, order `ORD-892976` is actually:
- Status: **pending**
- Date: **Feb 9, 2026**

But the page shows it as already Confirmed, Shipped with fake dates from Feb 5-6.

## Solution

### 1. Create an `order_status_history` table
A new database table to log every status change with its timestamp. When an admin changes an order's status in the admin panel, a record is automatically inserted.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| order_id | uuid | FK to orders |
| status | text | Status name (pending, processing, shipped, etc.) |
| changed_at | timestamptz | When the status changed |

A database trigger will automatically insert a history record whenever the `status` column in the `orders` table is updated.

### 2. Update OrderTrack page to fetch real data
- When user clicks "Track", query the `orders` table by `order_number` to get the current status and order date
- Query `order_status_history` to get all past status changes with real timestamps
- Build the timeline dynamically from real data instead of hardcoded steps
- Show the correct current status badge (e.g., "Pending" instead of "In Transit")
- Show "Not found" message if the order number doesn't exist

### 3. Auto-insert initial "pending" status for existing and new orders
- Insert history records for all existing orders with their current status
- The trigger will handle future orders automatically — when `create_order` inserts with status `pending`, the trigger fires and logs it

### 4. Update Admin Orders page
- When admin changes order status via the dropdown, the database trigger automatically logs the change — no frontend code change needed for logging

## What Customers Will See
- Only completed status steps (with real dates/times) will be shown as completed
- Future steps will appear greyed out without dates
- The status badge will reflect the actual current status
- If order not found, an error message will be displayed

## Technical Details

**New migration SQL:**
- Create `order_status_history` table with RLS policies (public read by order_number, admin full access)
- Create trigger function `log_order_status_change()` on `orders` table
- Seed existing orders into history table

**Files to modify:**
- `src/pages/OrderTrack.tsx` — Replace hardcoded data with real database queries
- `src/integrations/supabase/types.ts` — Will auto-update after migration

**Status mapping for timeline:**
| DB Status | Timeline Step | Icon |
|-----------|--------------|------|
| pending | Order Placed | Package |
| processing | Confirmed | CheckCircle2 |
| shipped | Shipped | Truck |
| out_for_delivery | Out for Delivery | MapPin |
| delivered | Delivered | CheckCircle2 |

