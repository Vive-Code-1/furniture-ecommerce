

# Comprehensive Feature Enhancement Plan

## Overview
This plan covers 7 major changes: removing edge fade from reviews, customer dashboard with order history, customer product reviews, admin review approval system, product reviews in QuickView, newsletter lead storage, and contact form lead storage.

---

## 1. Remove Edge Fade from Review Slider

**File:** `src/components/home/ReviewsSection.tsx`

Remove the two gradient overlay divs (lines 103-105) that create the edge fade effect on the infinite scroll container.

---

## 2. Database Changes (Migration)

Create the following new tables and modify existing ones:

### 2a. Newsletter Subscribers Table
- `id` (uuid, PK)
- `email` (text, unique, not null)
- `created_at` (timestamptz)
- RLS: Public can insert (subscribe), Admins can read/delete

### 2b. Contact Form Leads Table
- `id` (uuid, PK)
- `name` (text, not null)
- `email` (text, not null)
- `phone` (text, nullable)
- `subject` (text, not null)
- `message` (text, not null)
- `is_read` (boolean, default false)
- `created_at` (timestamptz)
- RLS: Public can insert, Admins can read/update/delete

### 2c. Modify Reviews Table
- Add `user_id` (uuid, nullable) -- to link customer reviews
- Add `is_approved` (boolean, default false) -- admin approval flow
- Add `order_id` (uuid, nullable, FK to orders) -- to verify delivered order

### 2d. Modify Orders Table
- Add `user_id` (uuid, nullable) -- to link orders to registered users

### 2e. RLS Policy Updates
- Orders: Add policy so users can view their own orders (`user_id = auth.uid()`)
- Reviews: Update to allow authenticated users to insert their own reviews
- Newsletter: Allow anonymous inserts, admin select
- Contact leads: Allow anonymous inserts, admin select/update/delete

---

## 3. Customer Dashboard (User Account Page)

**New File:** `src/pages/Account.tsx`

A user dashboard page at `/account` route, accessible after login:
- **My Orders tab:** Shows all orders linked to the logged-in user, with order number, date, status, total amount
- **My Profile tab:** Shows user name and email from `profiles` table
- **My Reviews tab:** Shows reviews submitted by the user with approval status
- Redirects to `/auth` if not logged in
- "Write Review" button appears on delivered orders

**File:** `src/App.tsx` -- Add `/account` route

**File:** `src/components/layout/Navbar.tsx` -- User icon links to `/account` (already does, confirmed at line 72)

---

## 4. Checkout Integration with User Account

**File:** `src/pages/Checkout.tsx`

- When a logged-in user places an order, save the order to the database with `user_id` set to `auth.uid()`
- Also save order items to `order_items` table
- Guest checkout continues to work (orders saved without `user_id`)
- After order placement, redirect to account page to see order status

---

## 5. Customer Review Submission

**New Component:** `src/components/account/WriteReviewDialog.tsx`

- Opens from "Write Review" button on delivered orders in the account page
- User selects a product from their order items
- Provides star rating (1-5) and review text
- Saves to `reviews` table with `user_id`, `product_id`, `order_id`, `is_approved = false`
- Shows toast: "Review submitted! It will appear after admin approval."

---

## 6. Admin Review Approval System

**File:** `src/pages/admin/Reviews.tsx`

- Add `is_approved` column display in the table
- Add "Pending Approval" / "Approved" badge for each review
- Add approve/reject buttons for customer-submitted reviews
- Add filter tabs: "All", "Pending", "Approved", "Featured"
- When admin approves a review, set `is_approved = true`
- Admin can also add reviews directly from the "Add Review" dialog with a `product_id` selector

**File:** `src/pages/admin/Reviews.tsx` (Add Review dialog)
- Add product dropdown selector so admin can assign reviews to specific products

---

## 7. Product Reviews in QuickView Modal

**File:** `src/components/product/QuickViewModal.tsx`

- Fetch approved reviews for the current product from `reviews` table where `is_approved = true` and `product_id` matches
- Display reviews below the product info with star rating, reviewer name, avatar, and review text
- Show average rating and review count (replacing the hardcoded "4.7 Rating (5 customer reviews)")
- If no reviews yet, show "No reviews yet"

---

## 8. Newsletter Subscriber Storage

**File:** `src/components/home/Newsletter.tsx`

- On form submit, save email to `newsletter_subscribers` table via Supabase
- Handle duplicate email gracefully (show "Already subscribed!" message)
- Keep existing toast notification

---

## 9. Contact Form Lead Storage

**File:** `src/pages/Contact.tsx`

- On form submit, save name, email, phone, subject, message to `contact_leads` table
- Show success toast after save
- Remove the `setTimeout` mock and use actual database insert

---

## 10. Admin Newsletter Leads Page

**New File:** `src/pages/admin/NewsletterLeads.tsx`

- Table showing all newsletter subscribers: email, subscribed date
- Search functionality
- Delete option for individual/bulk subscribers

---

## 11. Admin Contact Form Leads Page

**New File:** `src/pages/admin/ContactLeads.tsx`

- Table showing all contact form submissions: name, email, phone, subject, message, date, read status
- Mark as read/unread
- Search and filter
- Delete individual/bulk leads

---

## 12. Admin Sidebar Updates

**File:** `src/components/admin/AdminSidebar.tsx`

- Add "Newsletter Leads" link with Mail icon
- Add "Contact Leads" link with MessageSquare icon

**File:** `src/App.tsx`

- Add routes: `/admin/newsletter-leads` and `/admin/contact-leads`

---

## Technical Details

### Database Migration SQL

```sql
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
```

### New Files to Create
- `src/pages/Account.tsx` -- Customer dashboard
- `src/components/account/WriteReviewDialog.tsx` -- Review submission dialog
- `src/pages/admin/NewsletterLeads.tsx` -- Admin newsletter leads
- `src/pages/admin/ContactLeads.tsx` -- Admin contact leads

### Files to Modify
- `src/components/home/ReviewsSection.tsx` -- Remove edge fade
- `src/pages/Checkout.tsx` -- Save orders to database with user_id
- `src/components/home/Newsletter.tsx` -- Save to database
- `src/pages/Contact.tsx` -- Save to database
- `src/components/product/QuickViewModal.tsx` -- Show approved product reviews
- `src/pages/admin/Reviews.tsx` -- Add approval system, product selector
- `src/components/admin/AdminSidebar.tsx` -- Add new links
- `src/App.tsx` -- Add new routes
- `src/pages/Auth.tsx` -- Redirect non-admin users to /account after login

### Implementation Sequence
1. Database migration (all new tables + columns)
2. Remove edge fade from ReviewsSection
3. Newsletter + Contact form database integration
4. Checkout flow with database save
5. Customer Account page with orders/reviews
6. Write Review dialog for customers
7. Admin review approval system + product selector
8. Product reviews in QuickView modal
9. Admin Newsletter Leads + Contact Leads pages
10. Sidebar + routing updates

