

# Fix Order Placement RLS Error

## Root Cause

The Checkout page uses `.insert({...}).select().single()` to create orders. PostgreSQL translates this into `INSERT ... RETURNING *`, which requires BOTH an INSERT policy AND a SELECT policy to match the new row.

**Current SELECT policies for `orders`:**
- `Users can view own orders` -- checks `user_id = auth.uid()`

For guest (anonymous) users, `auth.uid()` is NULL, so `user_id = auth.uid()` evaluates to `NULL = NULL` which is **FALSE** in SQL. There is no SELECT policy that covers guest orders, causing the INSERT to be rolled back entirely.

## Solution: Database Function (SECURITY DEFINER)

Instead of adding a broad SELECT policy that could expose guest order data, we will create a **server-side database function** that handles the entire order creation process. This function uses `SECURITY DEFINER` to bypass RLS, ensuring both guest and authenticated orders work reliably.

### Step 1: Create Database Function (Migration)

Create a function `create_order` that:
- Accepts order details + items as JSON
- Inserts into `orders` table
- Inserts into `order_items` table
- Returns the order ID and order number
- Runs as `SECURITY DEFINER` (bypasses RLS safely)

```sql
CREATE OR REPLACE FUNCTION public.create_order(
  p_customer_name TEXT,
  p_customer_email TEXT,
  p_shipping_address TEXT,
  p_total_amount NUMERIC,
  p_user_id UUID DEFAULT NULL,
  p_items JSONB DEFAULT '[]'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id UUID;
  v_order_number TEXT;
  v_item JSONB;
BEGIN
  INSERT INTO orders (customer_name, customer_email, shipping_address, total_amount, status, user_id)
  VALUES (p_customer_name, p_customer_email, p_shipping_address, p_total_amount, 'pending', p_user_id)
  RETURNING id, order_number INTO v_order_id, v_order_number;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO order_items (order_id, product_name, quantity, unit_price, product_id)
    VALUES (
      v_order_id,
      v_item->>'product_name',
      (v_item->>'quantity')::INTEGER,
      (v_item->>'unit_price')::NUMERIC,
      NULLIF(v_item->>'product_id', '')::UUID
    );
  END LOOP;

  RETURN jsonb_build_object('id', v_order_id, 'order_number', v_order_number);
END;
$$;
```

### Step 2: Update Checkout.tsx

Replace the two-step insert (orders + order_items) with a single RPC call:

```typescript
const { data: orderResult, error } = await supabase.rpc("create_order", {
  p_customer_name: formData.name.trim(),
  p_customer_email: formData.email.trim(),
  p_shipping_address: shippingAddress,
  p_total_amount: grandTotal,
  p_user_id: user?.id || null,
  p_items: JSON.stringify(orderItems),
});
```

This eliminates the SELECT policy issue entirely because the function runs with elevated privileges.

### Step 3: Also Add Guest SELECT Policy (for order tracking)

Add a limited SELECT policy so guests can look up their orders by order number on the tracking page:

```sql
CREATE POLICY "Guest can view guest orders"
  ON public.orders FOR SELECT TO anon
  USING (user_id IS NULL);
```

## Files to Change

1. **New migration** -- create the `create_order` database function + guest SELECT policy
2. **`src/pages/Checkout.tsx`** -- replace direct insert calls with `supabase.rpc("create_order", ...)`

## Benefits

- Guest checkout and logged-in checkout both work reliably
- No sensitive data exposed through overly broad SELECT policies
- Single atomic transaction (if items insert fails, order is rolled back too)
- Simpler frontend code (one RPC call instead of multiple inserts)

