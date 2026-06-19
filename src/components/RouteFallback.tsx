import { useEffect, useState } from "react";

/**
 * Branded route-transition preloader.
 * Only renders if loading takes longer than `delay` ms — avoids flashing
 * on fast loads / hard refresh when the route chunk is already cached.
 */
const RouteFallback = ({ delay = 300 }: { delay?: number }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background animate-in fade-in duration-200">
      <div className="flex flex-col items-center gap-6">
        {/* Animated logo mark */}
        <div className="relative">
          {/* Pulsing glow ring */}
          <span
            aria-hidden
            className="absolute inset-0 rounded-full bg-foreground/10 animate-ping"
          />
          {/* Rotating gradient ring */}
          <span
            aria-hidden
            className="absolute -inset-2 rounded-full opacity-70 blur-[2px]"
            style={{
              background:
                "conic-gradient(from 0deg, transparent 0deg, hsl(var(--foreground) / 0.55) 90deg, transparent 180deg, hsl(var(--foreground) / 0.55) 270deg, transparent 360deg)",
              WebkitMask:
                "radial-gradient(circle, transparent 56%, #000 58%, #000 100%)",
              mask: "radial-gradient(circle, transparent 56%, #000 58%, #000 100%)",
              animation: "lv-spin 1.4s linear infinite",
            }}
          />
          {/* Logo dot */}
          <div className="relative w-14 h-14 bg-foreground rounded-full flex items-center justify-center shadow-[0_8px_28px_hsl(var(--foreground)/0.25)]">
            <div className="w-5 h-5 border-2 border-primary-foreground rounded-full" />
          </div>
        </div>

        {/* Wordmark */}
        <div className="flex flex-col items-center gap-3">
          <span className="font-heading text-lg font-bold tracking-[0.18em] text-foreground/90">
            MODULIVE
          </span>
          {/* Shimmer progress bar */}
          <div className="relative h-[3px] w-40 overflow-hidden rounded-full bg-foreground/10">
            <span
              aria-hidden
              className="absolute inset-y-0 left-0 w-1/3 rounded-full bg-foreground"
              style={{ animation: "lv-loader-slide 1.3s cubic-bezier(0.4,0,0.2,1) infinite" }}
            />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes lv-spin { to { transform: rotate(360deg); } }
        @keyframes lv-loader-slide {
          0%   { transform: translateX(-110%); }
          100% { transform: translateX(420%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .lv-reveal { transition: none !important; }
        }
      `}</style>
    </div>
  );
};

export default RouteFallback;
