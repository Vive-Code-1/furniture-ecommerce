
# Three Changes: Full Amount Payment, Admin UI Labels, and Stripe Option

## 1. Send Full Product Total to UddoktaPay (Not Just 10%)

Currently, the checkout sends `partialPayment` (10% of total or delivery charge) to UddoktaPay. You want the **full grandTotal** amount to show on UddoktaPay's payment page instead.

**File:** `src/pages/Checkout.tsx`
- Change `amount: partialPayment.toFixed(2)` to `amount: grandTotal.toFixed(2)` in the edge function call (line 85)
- Update the "Online Payment" button text from `Pay $XX (10%)` to show the full total
- Remove the "Pay 10% now" messaging from the payment method card and order summary
- Update button text from `Pay $${partialPayment.toFixed(2)} & Order` to `Pay $${grandTotal.toFixed(2)} & Order`

## 2. Rename Admin Sidebar and Settings Page Labels

**File:** `src/components/admin/AdminSidebar.tsx`
- Change sidebar label from `"Settings"` to `"Payment Gateway"` (line 30)

**File:** `src/pages/admin/Settings.tsx`
- Change page heading from `"Settings"` to `"Payment Gateway"`
- Change subtitle from `"Manage payment gateway and site configuration"` to something simpler
- Change card heading from `"Payment Gateway (UddoktaPay)"` to just `"UddoktaPay"`

## 3. Add Stripe API Configuration Card

**File:** `src/pages/admin/Settings.tsx`
- Add a second card below the UddoktaPay card for **Stripe** configuration
- Include fields for: Stripe API Key (Secret Key) and Stripe Publishable Key
- Save them to the same `site_settings` table with keys like `stripe_api_key` and `stripe_publishable_key`
- Same save/load pattern as UddoktaPay

## Technical Details

### Checkout.tsx Changes
```text
Line 33: Remove partialPayment calculation (or keep for reference but don't use for payment)
Line 85: amount: grandTotal.toFixed(2)  (was partialPayment.toFixed(2))
Line 257: Remove "Pay 10% now ($XX)" text
Line 299: Remove "Pay now: $XX (10%) - Remaining on delivery" text
Line 304: Button text: `Pay $${grandTotal.toFixed(2)} & Order`
```

### AdminSidebar.tsx Changes
```text
Line 30: { label: "Payment Gateway", href: "/admin/settings", icon: Settings }
```

### Settings.tsx Changes
- Page title: "Payment Gateway"
- UddoktaPay card title: "UddoktaPay"
- New Stripe card with fields:
  - `stripe_secret_key` (sensitive)
  - `stripe_publishable_key` (not sensitive)
- Both cards save independently with their own Save button

### Database
No migration needed -- reuses existing `site_settings` table with new keys for Stripe.

## Files Modified
1. `src/pages/Checkout.tsx` -- send full amount, update UI text
2. `src/components/admin/AdminSidebar.tsx` -- rename "Settings" to "Payment Gateway"
3. `src/pages/admin/Settings.tsx` -- rename headings, add Stripe card
