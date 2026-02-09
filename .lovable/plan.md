

# Integrate UddoktaPay Payment Gateway

## Overview

Add UddoktaPay as the online payment processor for the checkout page. When a customer selects "Online Payment," they pay 10% of the product total (or at least the delivery charge) via UddoktaPay. The system creates the order first, then redirects to UddoktaPay for payment.

**Important note:** This project uses Lovable Cloud (not Next.js), so the server-side option will use a backend function instead of a Next.js API route. The end result is identical.

## Flow

```text
Customer selects "Online Payment" -> Clicks "Pay & Order"
  -> Order created in database (status: "pending")
  -> Backend function calls UddoktaPay Create Charge API
  -> Customer redirected to UddoktaPay payment page
  -> After payment, UddoktaPay redirects back to our site
  -> Payment Success page calls Verify Payment API
  -> Order status updated to "paid" if successful
```

## Changes

### 1. Store API Key as a Secret

The UddoktaPay API key (`DLXyoryKLC4Vj1foeOFmZcH49zxe62kx6565WjRd`) will be stored securely as a backend secret, not in the codebase.

The base URL (`https://digitaltechdude.paymently.io/api`) will also be stored as a secret for easy configuration.

### 2. Create Edge Function: `uddoktapay-checkout`

A backend function that:
- Receives order details from the frontend
- Calls UddoktaPay's `/checkout-v2` endpoint with the API key
- Returns the `payment_url` to the frontend
- Uses the preview/published URL as the redirect base

### 3. Create Edge Function: `uddoktapay-verify`

A backend function that:
- Receives the `invoice_id` from the callback
- Calls UddoktaPay's `/verify-payment` endpoint
- If status is "COMPLETED", updates the order's payment status in the database
- Returns the verification result

### 4. Update `src/pages/Checkout.tsx`

When "Online Payment" is selected:
- Create the order first (existing `create_order` RPC)
- Call `uddoktapay-checkout` edge function with order details
- Redirect the user to the returned `payment_url`

For COD, the flow remains unchanged.

### 5. Create `src/pages/PaymentSuccess.tsx`

A new page at `/payment/success` that:
- Extracts `invoice_id` from the URL query params
- Calls `uddoktapay-verify` edge function
- Shows success/failure message with order details
- Redirects to order tracking

### 6. Create `src/pages/PaymentCancel.tsx`

A simple page at `/payment/cancel` showing the payment was cancelled with a link back to checkout.

### 7. Update `src/App.tsx`

Add routes for `/payment/success` and `/payment/cancel`.

### 8. Database Migration

Add a `payment_status` and `payment_invoice_id` column to the `orders` table to track payment state.

```sql
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid',
  ADD COLUMN IF NOT EXISTS payment_invoice_id TEXT;
```

## Technical Details

### Edge Function: uddoktapay-checkout

```typescript
// POST body: { full_name, email, amount, order_id, order_number }
// Calls: {base_URL}/checkout-v2
// Returns: { payment_url }
```

### Edge Function: uddoktapay-verify

```typescript
// POST body: { invoice_id }
// Calls: {base_URL}/verify-payment
// On COMPLETED: updates orders table payment_status = 'paid'
// Returns: { status, order_number, ... }
```

### Checkout.tsx Changes

- COD flow: unchanged (create order -> redirect to tracking)
- Online flow: create order -> call uddoktapay-checkout -> redirect to payment_url
- The `redirect_url` will point to `/payment/success`
- The `cancel_url` will point to `/payment/cancel`

## Files to Create/Modify

1. **New:** `supabase/functions/uddoktapay-checkout/index.ts`
2. **New:** `supabase/functions/uddoktapay-verify/index.ts`
3. **New:** `src/pages/PaymentSuccess.tsx`
4. **New:** `src/pages/PaymentCancel.tsx`
5. **Modified:** `src/pages/Checkout.tsx` -- add UddoktaPay redirect for online payments
6. **Modified:** `src/App.tsx` -- add payment routes
7. **New migration:** add `payment_status` and `payment_invoice_id` columns to orders

