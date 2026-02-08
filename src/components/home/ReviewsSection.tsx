import { useEffect, useState, useMemo } from "react";
import { Star, Quote } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Review {
  id: string;
  reviewer_name: string;
  reviewer_avatar: string | null;
  rating: number;
  review_text: string;
}

const ReviewCard = ({ review }: { review: Review }) => (
  <div className="flex-shrink-0 w-[350px] md:w-[400px] mx-3">
    <div className="relative bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)] transition-shadow duration-300 h-full">
      {/* Quotation mark */}
      <Quote className="absolute top-4 right-4 w-8 h-8 text-primary/15 fill-primary/10" />

      <div className="flex items-center gap-1 mb-4">
        {[...Array(5)].map((_, s) => (
          <Star
            key={s}
            className={`w-4 h-4 ${
              s < review.rating
                ? "fill-amber-400 text-amber-400"
                : "fill-muted text-muted"
            }`}
          />
        ))}
      </div>

      <p className="text-sm leading-relaxed text-muted-foreground mb-5 line-clamp-3">
        "{review.review_text}"
      </p>

      <div className="flex items-center gap-3">
        {review.reviewer_avatar ? (
          <img
            src={review.reviewer_avatar}
            alt={review.reviewer_name}
            className="w-10 h-10 rounded-full object-cover border-2 border-border/50"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border-2 border-border/50">
            <span className="text-sm font-bold text-primary">
              {review.reviewer_name.charAt(0)}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{review.reviewer_name}</span>
          <Quote className="w-4 h-4 text-primary/30 fill-primary/20" />
        </div>
      </div>
    </div>
  </div>
);

const ReviewsSection = () => {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const fetchReviews = async () => {
      const { data } = await supabase
        .from("reviews")
        .select("*")
        .eq("is_featured", true)
        .order("created_at", { ascending: false })
        .limit(6);

      if (data) setReviews(data);
    };

    fetchReviews();
  }, []);

  // Duplicate reviews for seamless infinite loop
  const scrollItems = useMemo(() => {
    if (reviews.length === 0) return [];
    return [...reviews, ...reviews, ...reviews];
  }, [reviews]);

  if (reviews.length === 0) return null;

  // Calculate animation duration based on number of items
  const animationDuration = reviews.length * 8;

  return (
    <section className="py-20 px-4 overflow-hidden bg-background">
      <div className="container mx-auto">
        <div className="text-center mb-14">
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
            What Our Customers Say
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Discover why thousands of customers trust us for their furniture needs
          </p>
        </div>
      </div>

      {/* Infinite scroll container */}
      <div className="relative overflow-hidden">
        <div
          className="flex animate-scroll-left"
          style={{
            animationDuration: `${animationDuration}s`,
          }}
        >
          {scrollItems.map((review, i) => (
            <ReviewCard key={`${review.id}-${i}`} review={review} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;
