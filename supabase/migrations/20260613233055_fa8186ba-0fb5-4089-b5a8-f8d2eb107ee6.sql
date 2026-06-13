-- Phase C: Performance optimizations
-- 1. Category sales aggregation RPC (avoids N+1 client-side join)
CREATE OR REPLACE FUNCTION public.get_category_sales()
RETURNS TABLE(category text, total numeric)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(p.category, 'Uncategorized') AS category,
         SUM(oi.unit_price * oi.quantity)::numeric AS total
  FROM order_items oi
  LEFT JOIN products p ON p.id = oi.product_id
  LEFT JOIN orders o ON o.id = oi.order_id
  WHERE o.is_trashed = false
  GROUP BY COALESCE(p.category, 'Uncategorized')
  ORDER BY total DESC;
$$;

REVOKE ALL ON FUNCTION public.get_category_sales() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_category_sales() TO authenticated;

-- 2. Admin notification counts aggregation RPC (1 round trip vs 4)
CREATE OR REPLACE FUNCTION public.get_admin_notification_counts()
RETURNS jsonb
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'orders', (SELECT count(*) FROM orders WHERE status = 'pending' AND is_trashed = false),
    'reviews', (SELECT count(*) FROM reviews WHERE is_approved = false),
    'newsletter', (SELECT count(*) FROM newsletter_subscribers),
    'contacts', (SELECT count(*) FROM contact_leads WHERE is_read = false)
  )
$$;

REVOKE ALL ON FUNCTION public.get_admin_notification_counts() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_admin_notification_counts() TO authenticated;

-- 3. Enable Realtime on key admin tables for live notification updates
ALTER TABLE public.orders REPLICA IDENTITY FULL;
ALTER TABLE public.reviews REPLICA IDENTITY FULL;
ALTER TABLE public.newsletter_subscribers REPLICA IDENTITY FULL;
ALTER TABLE public.contact_leads REPLICA IDENTITY FULL;

DO $$
BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.orders; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.reviews; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.newsletter_subscribers; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.contact_leads; EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;