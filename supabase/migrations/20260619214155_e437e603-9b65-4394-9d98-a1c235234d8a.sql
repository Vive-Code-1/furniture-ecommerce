-- Remove public SELECT on coupons. Validation already happens server-side
-- inside the SECURITY DEFINER create_order() RPC, so the client never needs
-- to read the coupons table directly.
DROP POLICY IF EXISTS "Anyone can view active coupons" ON public.coupons;

-- Revoke any lingering Data API SELECT access for anon/authenticated.
REVOKE SELECT ON public.coupons FROM anon;
REVOKE SELECT ON public.coupons FROM authenticated;

-- Admins retain full access via the existing "Admins can manage coupons" policy.