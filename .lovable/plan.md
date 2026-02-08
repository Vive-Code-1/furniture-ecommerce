

# রিভিউ স্লাইডার Edge Fade ফিক্স

## সমস্যা
স্ক্রিনশটে দেখা যাচ্ছে বাম এবং ডান পাশে gradient fade খুবই ছোট (মাত্র 80px)। এতে কার্ডগুলো হঠাৎ করে কেটে যাচ্ছে, স্মুথ ফেড হচ্ছে না।

## সমাধান
`ReviewsSection.tsx` ফাইলে gradient overlay গুলোর width বাড়িয়ে দেওয়া হবে এবং gradient আরো স্মুথ করা হবে।

### পরিবর্তন:
- **বাম ও ডান gradient width:** `w-20` (80px) থেকে `w-32 md:w-48` (128px - 192px) এ বাড়ানো হবে
- Gradient কে multi-stop করা হবে যাতে আরো smooth transition হয় — `from-background via-background/70 to-transparent` ব্যবহার করা হবে

## Technical Details

**File:** `src/components/home/ReviewsSection.tsx`

Lines 104-105 এর gradient divs আপডেট করা হবে:

```text
Before:
  w-20 bg-gradient-to-r from-background to-transparent
  w-20 bg-gradient-to-l from-background to-transparent

After:
  w-32 md:w-48 bg-gradient-to-r from-background via-background/80 to-transparent
  w-32 md:w-48 bg-gradient-to-l from-background via-background/80 to-transparent
```

এতে gradient আরো wide হবে এবং via stop থাকায় ফেড অনেক বেশি smooth দেখাবে।

