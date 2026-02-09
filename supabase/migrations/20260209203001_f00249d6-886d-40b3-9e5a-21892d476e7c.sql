
-- Create coupons table
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
  ADD COLUMN IF NOT EXISTS discount_amount NUMERIC NOT NULL DEFAULT 0;

-- Update create_order function to handle coupon
CREATE OR REPLACE FUNCTION public.create_order(
  p_customer_name text,
  p_customer_email text,
  p_shipping_address text,
  p_total_amount numeric,
  p_user_id uuid DEFAULT NULL,
  p_items jsonb DEFAULT '[]'::jsonb,
  p_coupon_code text DEFAULT NULL,
  p_discount_amount numeric DEFAULT 0
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_order_id UUID;
  v_order_number TEXT;
  v_item JSONB;
BEGIN
  INSERT INTO orders (customer_name, customer_email, shipping_address, total_amount, status, user_id, coupon_code, discount_amount)
  VALUES (p_customer_name, p_customer_email, p_shipping_address, p_total_amount, 'pending', p_user_id, p_coupon_code, p_discount_amount)
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

  -- Increment coupon used_count if coupon was applied
  IF p_coupon_code IS NOT NULL AND p_coupon_code != '' THEN
    UPDATE coupons SET used_count = used_count + 1 WHERE code = p_coupon_code;
  END IF;

  RETURN jsonb_build_object('id', v_order_id, 'order_number', v_order_number);
END;
$$;
