
# Admin Dashboard Enhancement Plan

## Overview
5 major enhancements to the admin panel and storefront: accurate dashboard data, bulk operations, reviews system, order management upgrades, and dark mode.

---

## 1. Dashboard - Accurate Sales Statistics

**Current Problem:** The Sales Chart uses hardcoded mock data (Jan-Dec with fixed values). The Sales Overview also uses hardcoded category percentages.

**Changes:**
- **SalesChart.tsx** - Rewrite to fetch actual order data from the database, grouped by month or week depending on the selected filter (Monthly/Weekly). When "Monthly" is selected, aggregate `orders.total_amount` by month. When "Weekly" is selected, aggregate by week for the current month.
- **SalesOverview.tsx** - Fetch actual category-wise sales data by joining `order_items` with `products` to calculate real category percentages.
- **MetricsCards.tsx** - Fix the Total Customers metric (currently counting unique order IDs instead of profiles). Fetch actual customer count from the `profiles` table.
- **Dashboard.tsx** - Pass real data to the SalesChart component instead of relying on its internal hardcoded data.

---

## 2. Products - Bulk Select + Image Upload

**Changes:**
- **Products.tsx** - Add checkbox column for bulk selection with "Select All" in header. When items are selected, show a bulk action bar (like the reference image) with "Delete Selected" option.
- **Image Upload** - Create a storage bucket called `product-images` for storing product thumbnails. In the Add/Edit Product dialog, add a file upload input alongside the existing URL input. Users can either upload from their device or paste a URL. Uploaded files go to cloud storage and the URL is saved in `thumbnail_url`.

**Database Changes:**
- Create storage bucket `product-images` with public access for reading.
- Add storage RLS policies so admins can upload/delete images.

---

## 3. Reviews Section

**Database Changes:**
- Create a new `reviews` table with columns: `id`, `reviewer_name`, `reviewer_avatar`, `rating` (1-5), `review_text`, `product_id` (nullable FK to products), `is_featured` (boolean for homepage display), `created_at`.
- Add RLS: Admins can manage all reviews, public can read featured reviews.
- Insert dummy review data (6-8 reviews).

**Frontend Changes:**
- **Homepage Review Section** (`src/components/home/ReviewsSection.tsx`) - A new component showing featured reviews in a carousel/grid with star ratings, reviewer name, avatar, and review text. Add this between WhyChooseUs and QualityBanner on the Index page.
- **Admin Reviews Page** (`src/pages/admin/Reviews.tsx`) - Full CRUD for reviews: list all reviews, add/edit/delete. Include bulk select and delete functionality.
- **AdminSidebar.tsx** - Add "Reviews" link with Star icon.
- **App.tsx** - Add route `/admin/reviews`.

---

## 4. Orders - Bulk Select, Invoice, Trash

**Changes to Orders.tsx:**
- **Bulk Selection** - Add checkbox column with "Select All". When items are selected, show a bulk action bar (matching the reference image style) with:
  - **Bulk Status Change** - Dropdown to change status of all selected orders at once.
  - **Bulk Invoice Generate** - Generate and download PDF invoices for all selected orders.
  - **Bulk Trash/Delete** - Soft-delete selected orders (add `is_trashed` column to orders table).
- **Individual Invoice** - Add an invoice download button per row.
- **Trash View** - Add tabs at the top: "Active Orders" and "Trash (count)". Trash tab shows soft-deleted orders with restore option.

**Database Changes:**
- Add `is_trashed` boolean column (default false) to orders table.
- Update existing queries to filter `is_trashed = false` by default.

**Invoice Generation:**
- Build a client-side PDF invoice generator using the browser's print/PDF capabilities (create a styled HTML invoice, open in new window for print-to-PDF). Each invoice will include: order number, customer details, items list, amounts, date.

---

## 5. Dark Mode

**Changes:**
- Dark mode CSS variables already exist in `index.css` (`.dark` class). Tailwind is configured with `darkMode: ["class"]`.
- Install/use `next-themes` (already in dependencies) - wrap the App with `ThemeProvider`.
- **main.tsx** - Add ThemeProvider wrapper.
- **AdminSidebar.tsx** - Add a dark/light mode toggle button (Sun/Moon icon) in the sidebar footer.
- **Navbar.tsx** - Optionally add toggle for the storefront too.

---

## Technical Details

### New Files to Create
- `src/components/home/ReviewsSection.tsx` - Homepage reviews carousel
- `src/pages/admin/Reviews.tsx` - Admin reviews management page

### Files to Modify
- `src/components/admin/SalesChart.tsx` - Real data with weekly/monthly toggle
- `src/components/admin/SalesOverview.tsx` - Real category sales data
- `src/components/admin/MetricsCards.tsx` - Fix customer count
- `src/pages/admin/Dashboard.tsx` - Pass real sales data
- `src/pages/admin/Products.tsx` - Bulk select + image upload
- `src/pages/admin/Orders.tsx` - Bulk select, invoice, trash
- `src/components/admin/AdminSidebar.tsx` - Add Reviews link + dark mode toggle
- `src/pages/Index.tsx` - Add ReviewsSection
- `src/App.tsx` - Add Reviews route
- `src/main.tsx` - Add ThemeProvider

### Database Migration
```sql
-- Add is_trashed to orders
ALTER TABLE public.orders ADD COLUMN is_trashed boolean NOT NULL DEFAULT false;

-- Create reviews table
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_name text NOT NULL,
  reviewer_avatar text,
  rating integer NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  review_text text NOT NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  is_featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Admins can manage reviews
CREATE POLICY "Admins can manage reviews"
ON public.reviews FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Anyone can view featured reviews
CREATE POLICY "Anyone can view featured reviews"
ON public.reviews FOR SELECT TO anon, authenticated
USING (is_featured = true);

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

-- Storage policies for admin uploads
CREATE POLICY "Admins can upload product images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete product images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view product images"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'product-images');

-- Insert dummy reviews
INSERT INTO public.reviews (reviewer_name, rating, review_text, is_featured) VALUES
('Sarah Johnson', 5, 'Absolutely love my new Oslo Sofa! The quality is outstanding and it looks even better in person.', true),
('Michael Chen', 4, 'The Ella Chair is both comfortable and stylish. Perfect for my home office setup.', true),
('Emily Rahman', 5, 'Fast delivery and excellent packaging. The Nordic Cabinet exceeded my expectations!', true),
('David Kim', 5, 'Best furniture store I have found online. Premium quality at reasonable prices.', true),
('Priya Sharma', 4, 'The Zen Coffee Table is a perfect centerpiece for my living room. Highly recommend!', true),
('James Wilson', 5, 'Outstanding customer service and the Garden Bench is beautifully crafted.', true);
```

### Implementation Sequence
1. Database migration (reviews table, is_trashed column, storage bucket)
2. Dark mode setup (ThemeProvider + toggle)
3. Dashboard accurate data (SalesChart, SalesOverview, MetricsCards fixes)
4. Products bulk select + image upload
5. Orders bulk select + invoice + trash
6. Reviews section (homepage + admin page)
