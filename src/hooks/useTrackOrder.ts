import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { buildTimeline, type OrderResult } from "@/lib/orderTracking";

interface State {
  loading: boolean;
  error: string | null;
  result: OrderResult | null;
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
      const { data: order, error: orderErr } = await supabase
        .from("orders")
        .select("id, order_number, status, created_at")
        .eq("order_number", trimmed)
        .maybeSingle();

      if (orderErr) throw orderErr;
      if (!order) {
        setState({
          loading: false,
          error: `We couldn't find an order with ID "${trimmed}". Please double-check and try again.`,
          result: null,
        });
        return;
      }

      const { data: history, error: histErr } = await supabase
        .from("order_status_history")
        .select("status, changed_at")
        .eq("order_id", order.id)
        .order("changed_at", { ascending: true });

      if (histErr) throw histErr;

      setState({
        loading: false,
        error: null,
        result: {
          orderNumber: order.order_number,
          status: order.status,
          steps: buildTimeline(history ?? [], order.created_at),
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
