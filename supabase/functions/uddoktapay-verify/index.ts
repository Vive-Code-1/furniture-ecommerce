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

    const { invoice_id } = await req.json();

    if (!invoice_id) {
      return new Response(JSON.stringify({ error: "invoice_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch(`${baseUrl}/verify-payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "RT-UDDOKTAPAY-API-KEY": apiKey,
      },
      body: JSON.stringify({ invoice_id }),
    });

    const data = await response.json();

    if (data.status === "COMPLETED" && data.metadata?.order_id) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, serviceRoleKey);

      await supabase
        .from("orders")
        .update({
          payment_status: "paid",
          payment_invoice_id: invoice_id,
        })
        .eq("id", data.metadata.order_id);
    }

    return new Response(
      JSON.stringify({
        status: data.status,
        full_name: data.full_name,
        amount: data.amount,
        payment_method: data.payment_method,
        transaction_id: data.transaction_id,
        order_id: data.metadata?.order_id,
        order_number: data.metadata?.order_number,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message || "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
