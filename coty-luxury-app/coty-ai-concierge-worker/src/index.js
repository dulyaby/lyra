export default {
  async fetch(request, env, ctx) {
    // 1. Define mambo ya CORS
    const corsHeaders = {
      "Access-Control-Allow-Origin": "https://lyra-luxury.pages.dev", // Au tumia "*" kuruhusu kila mahali
      "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // 2. Kushughulikia "Preflight request" (Hii ni ile OPTIONS request inayotumwa na browser)
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: corsHeaders,
      });
    }

    // 3. Kodi yako ya kawaida ya Worker iendelee hapa
    try {
      // Mfano wa response yako ya kawaida
      const data = { message: "Habari Boss! Connection imekubali." };
      
      return new Response(JSON.stringify(data), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      return new Response("Error", { status: 500, headers: corsHeaders });
    }
  },
};
