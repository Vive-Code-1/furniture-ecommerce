

# Admin Notification Panel - Dynamic Notifications

## Overview
Bell icon-এ ক্লিক করলে একটি dropdown panel খুলবে যেখানে সব ধরনের নতুন activities-এর summary দেখা যাবে -- নতুন অর্ডার, নতুন রিভিউ, নতুন নিউজলেটার সাবস্ক্রাইবার, এবং নতুন কন্টাক্ট মেসেজ। যতক্ষণ unread items থাকবে, ততক্ষণ Bell icon-এ লাল dot দেখাবে এবং মোট সংখ্যা দেখাবে।

## How It Works

1. **Dynamic Red Badge**: Bell icon-এর উপরে একটি লাল badge থাকবে যেখানে মোট unread notification সংখ্যা দেখাবে। কোনো unread না থাকলে badge hide হবে।

2. **Notification Panel**: Bell-এ ক্লিক করলে Popover dropdown খুলবে। এখানে ৪ ধরনের items দেখাবে:
   - **New Orders** (pending status-এর অর্ডার) -- অর্ডার নম্বর, customer name, amount
   - **New Reviews** (pending/unapproved reviews) -- reviewer name, rating, snippet
   - **Newsletter Leads** (recent subscribers) -- email, date
   - **Contact Messages** (unread contact form submissions) -- name, subject

3. **Navigation**: প্রতিটি item-এ ক্লিক করলে সংশ্লিষ্ট admin page-এ redirect হবে (Orders, Reviews, Newsletter Leads, Contact Leads)

4. **Mark as Read**: "Mark all as read" button থাকবে (contact leads-এর `is_read` update হবে)। প্রতিটি section-এর পাশে "View All" link থাকবে।

---

## Technical Details

### New Component: `src/components/admin/NotificationPanel.tsx`

This component will:
- Fetch counts and recent items from 4 tables:
  - `orders` where `status = 'pending'` and `is_trashed = false`
  - `reviews` where `is_approved = false`
  - `newsletter_subscribers` (latest 5)
  - `contact_leads` where `is_read = false`
- Use Radix `Popover` component for the dropdown
- Use `ScrollArea` for scrollable content
- Group notifications by type with icons and color-coded badges
- Include "View All" links that navigate using `react-router-dom`

### Modify: `src/pages/admin/Dashboard.tsx`

- Replace the static Bell button (lines 87-90) with the new `NotificationPanel` component
- Remove the hardcoded red dot and replace with dynamic count from the panel

### Implementation Sequence

1. Create `NotificationPanel.tsx` component with all data fetching and UI
2. Update `Dashboard.tsx` to import and use the new component

### Data Fetching Strategy

Each notification type queries the database on panel open (not continuously polling), keeping things lightweight. The total unread count is fetched on component mount and refreshed every 30 seconds to keep the badge up to date.

```text
+------------------------------------------+
|  Bell Icon [3]  <-- red badge with count  |
+------------------------------------------+
         |
         v (click)
+------------------------------------------+
| Notifications                  Mark Read |
|------------------------------------------|
| ORDERS (2 pending)          View All ->  |
|  - ORD-123456  John Doe    $150.00       |
|  - ORD-789012  Jane Smith  $89.99        |
|------------------------------------------|
| REVIEWS (1 pending)         View All ->  |
|  - Alice B.  ★★★★☆  "Great product..."  |
|------------------------------------------|
| NEWSLETTER (3 new)          View All ->  |
|  - user@email.com  Feb 9, 2026           |
|------------------------------------------|
| CONTACTS (1 unread)         View All ->  |
|  - Bob K.  "Product inquiry"             |
+------------------------------------------+
```

