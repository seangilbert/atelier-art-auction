import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const APP_URL = Deno.env.get("APP_URL") ?? "https://artdrop.com";
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, x-client-info, apikey",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  try {
    const {
      auctionId,
      auctionTitle,
      artistName,
      winnerName,
      winnerEmail,
      winningAmount,
    } = await req.json();

    const auctionLink = `${APP_URL}/#auction-${auctionId}`;
    const fmt = (n: number) => `$${Number(n).toLocaleString("en-US")}`;

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "onboarding@resend.dev",
        to: [winnerEmail],
        subject: `Payment received — "${auctionTitle}"`,
        html: `
          <div style="font-family:Inter,system-ui,sans-serif;max-width:520px;margin:0 auto;padding:2rem;color:#1a1a2e;">
            <h1 style="font-size:1.4rem;font-weight:700;margin-bottom:0.5rem;">Payment Received ✅</h1>
            <p style="color:#4a5568;font-size:0.95rem;line-height:1.6;margin-bottom:1.25rem;">
              Hi ${winnerName}, ${artistName} has confirmed your payment for
              <strong>"${auctionTitle}"</strong>. Your artwork will be on its way soon!
            </p>
            <div style="background:#f0f4f8;border-radius:14px;padding:1.25rem 1.5rem;margin-bottom:1.5rem;">
              <div style="font-size:0.72rem;color:#a0aec0;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:0.25rem;">Winning Bid</div>
              <div style="font-size:2rem;font-weight:700;color:#c73652;">${fmt(winningAmount)}</div>
            </div>
            <p style="font-size:0.82rem;color:#a0aec0;margin-bottom:1.5rem;">
              You'll receive another email with a tracking number once the artist ships your artwork.
            </p>
            <a href="${auctionLink}" style="display:block;background:linear-gradient(135deg,#e8526a,#cc2366);color:white;text-decoration:none;padding:0.85rem 2rem;border-radius:100px;font-weight:600;font-size:0.95rem;text-align:center;">
              View Auction →
            </a>
          </div>`,
      }),
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json", ...CORS },
    });
  } catch (e) {
    return new Response(`Error: ${e.message}`, { status: 500 });
  }
});
