

# Hero Section Design Fix

Based on the marked screenshot, there are two main layout issues to fix in the hero section:

## Issues Identified

### 1. Main Sofa Image (Left Side)
The sofa image container has a visible empty beige/secondary space BELOW the sofa image. This happens because the image has a fixed height (`h-[420px]`) but the container stretches taller due to `items-stretch` on the flex parent, making the `bg-secondary` background visible below the image.

### 2. Right Product Cards (Muffin Chair + Ella Chair)
The product images inside the cards are not properly contained. The images use `object-cover` which crops them awkwardly, and the `flex-1` height distribution doesn't give each card enough space to display the product properly. Images appear to overflow or get cut between cards.

---

## Fix Details

### Fix 1: Main Sofa Image Container
- Remove the fixed height from the image (`h-[280px] md:h-[420px]`)
- Instead, set the image to fill the full container height using `h-full object-cover`
- Set a minimum height on the container to keep it looking good (`min-h-[280px] md:min-h-[420px]`)
- This ensures the sofa image stretches to match whatever height the right column dictates, eliminating the empty space below

### Fix 2: Right Product Cards
- Change product images from `object-cover` to `object-contain` so the full product is visible without cropping
- Give each card image area a specific height (`h-[140px] md:h-[180px]`) instead of relying on `flex-1` to distribute space
- Center the images within their containers with proper padding
- Ensure both cards have equal height and their images sit nicely within the card boundaries

### Technical Changes
- **File:** `src/components/home/HeroSection.tsx`
  - Update the sofa image element: replace fixed height with `h-full` and set container min-height
  - Update the right-side card image containers: use fixed heights and `object-contain`
  - Adjust card padding and image centering for a cleaner look

