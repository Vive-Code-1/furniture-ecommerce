
# রিভিউ স্লাইডার Edge Fade ফিক্স

## সমস্যা
ডান পাশে gradient fade শুরু হচ্ছে সেকশনের ডান প্রান্ত থেকে অনেক আগে, ফলে ফাঁকা জায়গা দেখা যাচ্ছে। গ্রেডিয়েন্ট `w-32 md:w-48` বেশি চওড়া হয়ে গেছে।

## সমাধান
আগের মতো ব্লার স্টাইলে ফিরিয়ে আনা হবে এবং সেকশনের একদম প্রান্ত থেকে শুরু হবে:

- **Width:** `w-32 md:w-48` থেকে `w-20` এ ফিরিয়ে আনা হবে (আগের মতো)
- **Gradient:** `from-background to-transparent` (আগের সিম্পল গ্রেডিয়েন্ট)
- সেকশনের `overflow-hidden` নিশ্চিত করবে যে ব্লার একদম edge থেকে শুরু হবে

## Technical Details

**File:** `src/components/home/ReviewsSection.tsx` (Lines 104-105)

```text
Before:
  w-32 md:w-48 bg-gradient-to-r from-background via-background/80 to-transparent
  w-32 md:w-48 bg-gradient-to-l from-background via-background/80 to-transparent

After:
  w-20 bg-gradient-to-r from-background to-transparent
  w-20 bg-gradient-to-l from-background to-transparent
```

এটা আগের সিম্পল ব্লার স্টাইলে ফিরিয়ে আনবে এবং সেকশনের একদম ডান ও বাম প্রান্ত থেকে ব্লার শুরু হবে।
