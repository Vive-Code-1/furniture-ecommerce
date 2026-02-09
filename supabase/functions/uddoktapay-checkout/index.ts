import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("UDDOKTAPAY_API_KEY");
    if (!apiKey) throw new Error("UDDOKTAPAY_API_KEY is not configured");

    const baseUrl = Deno.env.get("UDDOKTAPAY_BASE_URL");
    if (!baseUrl) throw new Error("UDDOKTAPAY_BASE_URL is not configured");

    const { full_name, email, amount, order_id, order_number, redirect_url, cancel_url } = await req.json();

    if (!full_name || !email || !amount || !order_id || !redirect_url || !cancel_url) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch(`${baseUrl}/checkout-v2`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "RT-UDDOKTAPAY-API-KEY": apiKey,
      },
      body: JSON.stringify({
        full_name,
        email,
        amount: String(amount),
        metadata: { order_id, order_number },
        redirect_url,
        return_type: "GET",
        cancel_url,
      }),
    });

    const data = await response.json();

    if (!data.status) {
      console.error("UddoktaPay error:", data);
      return new Response(JSON.stringify({ error: data.message || "Payment creation failed" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ payment_url: data.payment_url }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message || "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
