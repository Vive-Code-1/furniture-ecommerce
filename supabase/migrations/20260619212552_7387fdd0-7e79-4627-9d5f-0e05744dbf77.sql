
-- 1. Drop guest-readable orders policy
DROP POLICY IF EXISTS "Guest can view guest orders" ON public.orders;

-- 2. Fix order_status_history policy (remove guest leak branch)
DROP POLICY IF EXISTS "Users can view own order status history" ON public.order_status_history;
CREATE POLICY "Users can view own order status history"
  ON public.order_status_history
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_status_history.order_id
      AND o.user_id = auth.uid()
  ));

-- 3. Drop unrestricted guest insert on order_items (create_order RPC handles inserts)
DROP POLICY IF EXISTS "Guest can create order items" ON public.order_items;

-- 4. Token-less guest order tracking via SECURITY DEFINER RPC.
-- Returns only the requested order's basic tracking info — never lists orders.
CREATE OR REPLACE FUNCTION public.track_order(p_order_number text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order record;
  v_history jsonb;
BEGIN
  IF p_order_number IS NULL OR length(trim(p_order_number)) = 0 THEN
    RETURN NULL;
  END IF;

  SELECT id, order_number, status, created_at
    INTO v_order
  FROM public.orders
  WHERE order_number = upper(trim(p_order_number))
    AND is_trashed = false
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  SELECT COALESCE(jsonb_agg(jsonb_build_object('status', status, 'changed_at', changed_at) ORDER BY changed_at ASC), '[]'::jsonb)
    INTO v_history
  FROM public.order_status_history
  WHERE order_id = v_order.id;

  RETURN jsonb_build_object(
    'order_number', v_order.order_number,
    'status', v_order.status,
    'created_at', v_order.created_at,
    'history', v_history
  );
END;
$$;

REVOKE ALL ON FUNCTION public.track_order(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.track_order(text) TO anon, authenticated;

-- 5. Restrict admin stats functions to admins only
CREATE OR REPLACE FUNCTION public.get_admin_notification_counts()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  RETURN jsonb_build_object(
    'orders', (SELECT count(*) FROM orders WHERE status = 'pending' AND is_trashed = false),
    'reviews', (SELECT count(*) FROM reviews WHERE is_approved = false),
    'newsletter', (SELECT count(*) FROM newsletter_subscribers),
    'contacts', (SELECT count(*) FROM contact_leads WHERE is_read = false)
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_category_sales()
RETURNS TABLE(category text, total numeric)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  RETURN QUERY
  SELECT COALESCE(p.category, 'Uncategorized') AS category,
         SUM(oi.unit_price * oi.quantity)::numeric AS total
  FROM order_items oi
  LEFT JOIN products p ON p.id = oi.product_id
  LEFT JOIN orders o ON o.id = oi.order_id
  WHERE o.is_trashed = false
  GROUP BY COALESCE(p.category, 'Uncategorized')
  ORDER BY 2 DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.get_admin_notification_counts() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_category_sales() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_admin_notification_counts() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_category_sales() TO authenticated;

-- 6. Storage: remove listing policy. Public bucket still serves files via public URL.
DROP POLICY IF EXISTS "Anyone can view product images" ON storage.objects;

-- 7. Remove sensitive tables from realtime publication
ALTER PUBLICATION supabase_realtime DROP TABLE public.orders;
ALTER PUBLICATION supabase_realtime DROP TABLE public.contact_leads;
ALTER PUBLICATION supabase_realtime DROP TABLE public.newsletter_subscribers;
ALTER PUBLICATION supabase_realtime DROP TABLE public.reviews;
