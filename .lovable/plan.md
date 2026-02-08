

# Furniture Ecommerce Store — Full Implementation Plan

Inspired by the **Modulive** furniture store design — minimal, premium, mobile-first.

**Typography:** Montserrat (headings) + Open Sans (body)
**Color Palette:** Warm neutrals (beige/cream background), black accents, clean whites — matching the reference image
**Tech:** React + Vite, ShadCN UI, Supabase (database + auth + storage), Stripe + UddoktaPay payments

---

## Phase 1: Homepage & Design Foundation

### 1.1 Global Layout & Navigation
- Top navigation bar with logo, menu links (Products, About Us, Our Store, Delivery), search icon, cart icon with item count badge, and user/account icon
- Sticky header on scroll
- Mobile hamburger menu with smooth slide-in drawer
- Footer with service links, newsletter section, social links, and contact info

### 1.2 Homepage Sections (matching the reference image)
- **Hero Section:** Large headline "Transform Your Space with Sustainable Furniture" with featured product images, floating product cards with prices, and a "Shop Now" CTA button
- **Stats Bar:** 18K+ happy customers, 700+ products, 95% satisfaction rate
- **Best Quality Products:** Product grid with category filter pills (All, Chair, Cabinet, Sofa, Bed), product cards with image, name, price, and quick-add button
- **Why Choose Us:** Split layout with video thumbnail on left, accordion-style feature list on right (Sustainability, Unrivaled Quality, Unmatched Variety, Legacy of Excellence)
- **Quality Banner:** Full-width lifestyle image with overlay text "When We Create Furniture, We Strive For The Finest Quality" and CTA buttons
- **Newsletter Section:** Subscribe form with "grab 30% OFF" offer

---

## Phase 2: Product Catalog & Details

### 2.1 Product Listing Page
- Grid/list view toggle
- Category filtering and sorting (price, newest, popularity)
- Pagination or infinite scroll
- Product cards with hover effects showing quick view

### 2.2 Product Detail Page
- Large product image gallery with thumbnails
- Product name, price, description, dimensions, materials
- Quantity selector
- "Add to Cart" and "Buy Now" buttons
- Related products section
- Breadcrumb navigation

---

## Phase 3: Cart & Checkout

### 3.1 Shopping Cart
- Slide-out cart drawer for quick access
- Full cart page with product list, quantity adjusters, remove buttons
- Order summary with subtotal, delivery charges, and total
- "Continue Shopping" and "Proceed to Checkout" buttons

### 3.2 Checkout Flow
- Guest checkout option (no account required)
- Shipping address form with international address support
- Delivery method selection
- Payment method selection:
  - **Cash on Delivery (COD)**
  - **Online Partial Payment** (10% of product total or delivery charge — whichever applies)
  - **Stripe** for full/partial online payment
  - **UddoktaPay** as alternative online payment gateway
- Order review before confirmation
- Order confirmation page with order number

### 3.3 Invoice & Order Tracking
- Downloadable PDF invoice after order placement
- Order tracking page with status updates (Pending → Confirmed → Shipped → Delivered)
- Order status visible on user dashboard

---

## Phase 4: User Authentication & Dashboard

### 4.1 Authentication
- Sign up / Login page (email + password)
- Guest users can checkout without an account
- Redirect to dashboard after login

### 4.2 User Dashboard
- Order history with status tracking
- Reorder functionality
- Profile management (name, email, shipping addresses)
- Saved addresses for faster checkout
- Invoice download from past orders

---

## Phase 5: Admin Panel

### 5.1 Admin Dashboard
- Overview cards: total orders, revenue, pending orders, total customers
- Recent orders list
- Sales charts and analytics

### 5.2 Product Management
- Add/edit/delete products with images, descriptions, pricing, categories
- Product image upload to Supabase Storage
- Category management
- Stock/inventory tracking

### 5.3 Order Management
- View all orders with filters (status, date, payment method)
- Update order status (Pending → Confirmed → Shipped → Delivered → Cancelled)
- View incomplete/abandoned orders
- Order details with customer info, items, payment status

### 5.4 Customer Management
- Customer list with search
- View customer details, order history
- Guest vs registered customer tracking

### 5.5 Payment Management
- View all payments with status (paid, partial, COD pending)
- Track partial payments and remaining balances
- Payment reconciliation

---

## Phase 6: Database & Backend (Supabase)

### Database Tables
- **products** — name, description, price, images, category, stock, dimensions, materials
- **categories** — product categories
- **orders** — order details, status, total, payment method, tracking
- **order_items** — individual items in each order
- **customers/profiles** — user profile data, addresses
- **payments** — payment records, amounts, status, gateway used
- **user_roles** — admin role management (separate table for security)

### Storage
- Product images bucket
- Invoice PDF storage

### Edge Functions
- Payment processing (Stripe + UddoktaPay integration)
- Invoice PDF generation
- Order status webhook handlers

---

## Summary

This plan delivers a complete, production-ready furniture ecommerce store with a premium Modulive-inspired design. The mobile-first approach ensures it looks great on all devices. Starting with the homepage and working through to the admin panel gives you a fully functional store with guest checkout, user accounts, multiple payment options, and comprehensive admin controls.

