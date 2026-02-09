
-- Create SECURITY DEFINER function for atomic order creation
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

-- Add guest SELECT policy for order tracking
CREATE POLICY "Guest can view guest orders"
  ON public.orders FOR SELECT TO anon
  USING (user_id IS NULL);
