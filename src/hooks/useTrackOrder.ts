import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { buildTimeline, type OrderResult } from "@/lib/orderTracking";

interface State {
  loading: boolean;
  error: string | null;
  result: OrderResult | null;
}

interface TrackOrderRpcResult {
  order_number: string;
  status: string;
  created_at: string | null;
  history: { status: string; changed_at: string }[];
}

export const useTrackOrder = () => {
  const [state, setState] = useState<State>({
    loading: false,
    error: null,
    result: null,
  });

  const track = useCallback(async (rawOrderId: string) => {
    const trimmed = rawOrderId.trim().toUpperCase();
    if (!trimmed) return;

    setState({ loading: true, error: null, result: null });

    try {
      const { data, error } = await supabase.rpc("track_order", {
        p_order_number: trimmed,
      });

      if (error) throw error;

      const order = data as TrackOrderRpcResult | null;

      if (!order) {
        setState({
          loading: false,
          error: `We couldn't find an order with ID "${trimmed}". Please double-check and try again.`,
          result: null,
        });
        return;
      }

      setState({
        loading: false,
        error: null,
        result: {
          orderNumber: order.order_number,
          status: order.status,
          steps: buildTimeline(order.history ?? [], order.created_at),
        },
      });
    } catch (err) {
      console.error("Order tracking error:", err);
      setState({
        loading: false,
        error:
          "Something went wrong while fetching your order. Please try again.",
        result: null,
      });
    }
  }, []);

  return { ...state, track };
};
