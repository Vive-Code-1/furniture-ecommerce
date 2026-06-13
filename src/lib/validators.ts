import { z } from "zod";

export const checkoutSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name too long"),
  email: z.string().trim().email("Invalid email address").max(255, "Email too long"),
  phone: z
    .string()
    .trim()
    .min(7, "Phone number too short")
    .max(20, "Phone number too long")
    .regex(/^[+0-9()\-\s]+$/, "Phone may only contain digits, spaces, +, -, ()"),
  address: z.string().trim().min(3, "Address required").max(200, "Address too long"),
  city: z.string().trim().min(1, "City required").max(80, "City too long"),
  zip: z.string().trim().min(1, "ZIP required").max(20, "ZIP too long"),
  country: z.string().trim().min(2, "Country required").max(80, "Country too long"),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

/**
 * Allow-list for image URLs that the admin can paste.
 * Blocks `javascript:`, `data:`, `file:`, `about:`, etc. (XSS / phishing vectors)
 * and requires a valid http(s) URL.
 */
export const isSafeImageUrl = (raw: string | null | undefined): boolean => {
  if (!raw) return true; // empty allowed (column nullable)
  const trimmed = raw.trim();
  if (!trimmed) return true;
  try {
    const u = new URL(trimmed);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
};
