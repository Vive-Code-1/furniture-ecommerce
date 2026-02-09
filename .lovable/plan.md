
# Coupon/Discount Code System

## Overview
Add a complete coupon management system: admin can create/edit/delete coupons, and customers can apply coupon codes at checkout for percentage or fixed amount discounts with usage limits.

## 1. Database: New `coupons` Table

Create a `coupons` table with the following columns:
- `id` (UUID, primary key)
- `code` (TEXT, unique, not null) -- the coupon code customers enter
- `discount_type` (TEXT, not null, default 'percentage') -- 'percentage' or 'fixed'
- `discount_value` (NUMERIC, not null) -- e.g. 10 for 10% or 10 for $10
- `min_order_amount` (NUMERIC, default 0) -- minimum cart total to use coupon
- `max_uses` (INTEGER, nullable) -- total usage limit (null = unlimited)
- `used_count` (INTEGER, default 0) -- how many times used
- `is_active` (BOOLEAN, default true)
- `expires_at` (TIMESTAMP WITH TIME ZONE, nullable)
- `created_at` (TIMESTAMP WITH TIME ZONE, default now())

**RLS Policies:**
- Admins: ALL access
- Anyone: SELECT active coupons (needed for checkout validation)

**Also:** Add `discount_amount` and `coupon_code` columns to the `orders` table to track applied discounts.

**Database function:** Update `create_order` to accept `p_coupon_code` and `p_discount_amount` params, and increment `used_count` on the coupon.

## 2. Admin Panel: Coupon Management Page

**New file:** `src/pages/admin/Coupons.tsx`

Features:
- Table listing all coupons (code, type, value, usage, status, expiry)
- "Add Coupon" button opens a dialog/form
- Edit and delete actions per coupon
- Toggle active/inactive status
- Show used_count / max_uses

**Sidebar update:** Add "Coupons" link with `Tag` icon in `AdminSidebar.tsx` between "Reviews" and "Newsletter Leads".

**Route:** Add `/admin/coupons` route in `App.tsx`.

## 3. Checkout: Coupon Input Field

**File:** `src/pages/Checkout.tsx`

Add a coupon section in the Order Summary card:
- Input field + "Apply" button
- On apply: query `coupons` table to validate code (active, not expired, under usage limit, meets min order)
- Show discount line in the summary (between Subtotal and Delivery)
- Recalculate `grandTotal` with discount applied
- Pass `coupon_code` and `discount_amount` to `create_order` RPC

## Technical Details

### Database Migration SQL
```sql
CREATE TABLE public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL DEFAULT 'percentage',
  discount_value NUMERIC NOT NULL DEFAULT 0,
  min_order_amount NUMERIC NOT NULL DEFAULT 0,
  max_uses INTEGER,
  used_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage coupons" ON public.coupons FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view active coupons" ON public.coupons FOR SELECT
  USING (is_active = true);

-- Add tracking columns to orders
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS coupon_code TEXT,
  ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0;
```

### Updated `create_order` Function
Add parameters `p_coupon_code TEXT DEFAULT NULL` and `p_discount_amount NUMERIC DEFAULT 0`. Store them on the order row. If a coupon code is provided, increment `used_count` on the matching coupon.

### Checkout Coupon Logic (Checkout.tsx)
- New state: `couponCode`, `appliedCoupon`, `discount`
- "Apply" handler queries coupons table by code, validates conditions
- Discount calculation: percentage = `totalPrice * value / 100`, fixed = `value`
- `grandTotal = totalPrice - discount + deliveryCharge`
- "Remove" button to clear applied coupon

### Admin Coupons Page (Coupons.tsx)
- CRUD operations on `coupons` table
- Dialog form with fields: code, discount_type (select), discount_value, min_order_amount, max_uses, expires_at, is_active
- Table with columns: Code, Type, Value, Min Order, Usage, Status, Expires, Actions

### AdminSidebar.tsx
Add entry: `{ label: "Coupons", href: "/admin/coupons", icon: Tag }`

### App.tsx
Add route: `<Route path="coupons" element={<AdminCoupons />} />`

## Files to Create/Modify
1. **New migration** -- coupons table, order columns, updated create_order function
2. **New:** `src/pages/admin/Coupons.tsx` -- admin coupon management
3. **Modified:** `src/components/admin/AdminSidebar.tsx` -- add Coupons link
4. **Modified:** `src/App.tsx` -- add coupon route
5. **Modified:** `src/pages/Checkout.tsx` -- coupon input + discount logic
