
-- Replace create_order with a server-side-priced version
DROP FUNCTION IF EXISTS public.create_order(text, text, text, numeric, uuid, jsonb);
DROP FUNCTION IF EXISTS public.create_order(text, text, text, numeric, uuid, jsonb, text, numeric);

CREATE OR REPLACE FUNCTION public.create_order(
  p_customer_name text,
  p_customer_email text,
  p_shipping_address text,
  p_user_id uuid DEFAULT NULL,
  p_items jsonb DEFAULT '[]'::jsonb,
  p_coupon_code text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_order_id uuid;
  v_order_number text;
  v_item jsonb;
  v_product_id uuid;
  v_qty integer;
  v_unit_price numeric;
  v_product_name text;
  v_subtotal numeric := 0;
  v_delivery numeric := 15;
  v_discount numeric := 0;
  v_total numeric;
  v_coupon record;
  v_applied_code text := NULL;
BEGIN
  IF p_customer_name IS NULL OR length(trim(p_customer_name)) = 0 THEN
    RAISE EXCEPTION 'Customer name required';
  END IF;
  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Order must contain at least one item';
  END IF;

  -- Compute subtotal server-side from products table
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := NULLIF(v_item->>'product_id','')::uuid;
    v_qty := COALESCE((v_item->>'quantity')::integer, 0);
    IF v_product_id IS NULL OR v_qty <= 0 THEN
      RAISE EXCEPTION 'Invalid item in order';
    END IF;

    SELECT price, name INTO v_unit_price, v_product_name
    FROM products
    WHERE id = v_product_id AND is_active = true;

    IF v_unit_price IS NULL THEN
      RAISE EXCEPTION 'Product not available: %', v_product_id;
    END IF;

    v_subtotal := v_subtotal + (v_unit_price * v_qty);
  END LOOP;

  -- Validate and apply coupon (server-side)
  IF p_coupon_code IS NOT NULL AND length(trim(p_coupon_code)) > 0 THEN
    SELECT * INTO v_coupon FROM coupons
    WHERE code = p_coupon_code
      AND is_active = true
      AND (expires_at IS NULL OR expires_at > now())
      AND (max_uses IS NULL OR used_count < max_uses)
      AND min_order_amount <= v_subtotal
    LIMIT 1;

    IF FOUND THEN
      IF v_coupon.discount_type = 'percentage' THEN
        v_discount := round(v_subtotal * v_coupon.discount_value / 100, 2);
      ELSE
        v_discount := v_coupon.discount_value;
      END IF;
      IF v_discount > v_subtotal THEN v_discount := v_subtotal; END IF;
      v_applied_code := v_coupon.code;
    END IF;
  END IF;

  v_total := v_subtotal + v_delivery - v_discount;

  INSERT INTO orders (customer_name, customer_email, shipping_address, total_amount, status, user_id, coupon_code, discount_amount)
  VALUES (trim(p_customer_name), p_customer_email, p_shipping_address, v_total, 'pending', p_user_id, v_applied_code, v_discount)
  RETURNING id, order_number INTO v_order_id, v_order_number;

  -- Insert items with server-priced unit_price
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := (v_item->>'product_id')::uuid;
    v_qty := (v_item->>'quantity')::integer;
    SELECT price, name INTO v_unit_price, v_product_name FROM products WHERE id = v_product_id;
    INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price)
    VALUES (v_order_id, v_product_id, v_product_name, v_qty, v_unit_price);
  END LOOP;

  IF v_applied_code IS NOT NULL THEN
    UPDATE coupons SET used_count = used_count + 1 WHERE code = v_applied_code;
  END IF;

  RETURN jsonb_build_object(
    'id', v_order_id,
    'order_number', v_order_number,
    'subtotal', v_subtotal,
    'delivery', v_delivery,
    'discount', v_discount,
    'total', v_total,
    'coupon_code', v_applied_code
  );
END;
$$;

REVOKE ALL ON FUNCTION public.create_order(text, text, text, uuid, jsonb, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_order(text, text, text, uuid, jsonb, text) TO anon, authenticated;

-- Tighten order_status_history visibility (no more table-wide read)
DROP POLICY IF EXISTS "Anyone can view order status history" ON public.order_status_history;

CREATE POLICY "Users can view own order status history"
ON public.order_status_history
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_status_history.order_id
      AND (o.user_id = auth.uid() OR o.user_id IS NULL)
  )
);
