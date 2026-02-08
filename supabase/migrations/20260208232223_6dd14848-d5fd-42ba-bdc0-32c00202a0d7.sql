
-- Newsletter subscribers table
CREATE TABLE public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe" ON public.newsletter_subscribers
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can view subscribers" ON public.newsletter_subscribers
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete subscribers" ON public.newsletter_subscribers
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Contact leads table
CREATE TABLE public.contact_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  subject text NOT NULL,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.contact_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit contact form" ON public.contact_leads
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can manage contact leads" ON public.contact_leads
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Add user_id to orders
ALTER TABLE public.orders ADD COLUMN user_id uuid;

-- Add user_id, is_approved, order_id to reviews
ALTER TABLE public.reviews ADD COLUMN user_id uuid;
ALTER TABLE public.reviews ADD COLUMN is_approved boolean NOT NULL DEFAULT false;
ALTER TABLE public.reviews ADD COLUMN order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL;

-- Update existing reviews to be approved (admin-created ones)
UPDATE public.reviews SET is_approved = true;

-- RLS: Users can view their own orders
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- RLS: Users can insert orders (for checkout)
CREATE POLICY "Users can create orders" ON public.orders
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- RLS: Anonymous can create orders (guest checkout)
CREATE POLICY "Guest can create orders" ON public.orders
  FOR INSERT TO anon WITH CHECK (user_id IS NULL);

-- RLS: Users can insert order items for their orders
CREATE POLICY "Users can create order items" ON public.order_items
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_id AND orders.user_id = auth.uid())
  );

-- RLS: Guest can insert order items
CREATE POLICY "Guest can create order items" ON public.order_items
  FOR INSERT TO anon WITH CHECK (true);

-- RLS: Users can view own order items
CREATE POLICY "Users can view own order items" ON public.order_items
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_id AND orders.user_id = auth.uid())
  );

-- RLS: Users can submit reviews
CREATE POLICY "Users can submit reviews" ON public.reviews
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- RLS: Users can view own reviews
CREATE POLICY "Users can view own reviews" ON public.reviews
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Update featured reviews policy to also require is_approved
DROP POLICY "Anyone can view featured reviews" ON public.reviews;
CREATE POLICY "Anyone can view approved featured reviews" ON public.reviews
  FOR SELECT TO anon, authenticated
  USING (is_featured = true AND is_approved = true);

-- Allow viewing approved reviews for products (QuickView)
CREATE POLICY "Anyone can view approved product reviews" ON public.reviews
  FOR SELECT TO anon, authenticated
  USING (is_approved = true AND product_id IS NOT NULL);
