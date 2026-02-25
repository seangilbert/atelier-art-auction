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
    const { auctionId, auctionTitle, artistName, recipientEmail, recipientName } = await req.json();

    const auctionLink = `${APP_URL}/#auction-${auctionId}`;

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "onboarding@resend.dev",
        to: [recipientEmail],
        subject: `⏰ Ending soon: "${auctionTitle}"`,
        html: `
          <div style="font-family:Inter,system-ui,sans-serif;max-width:520px;margin:0 auto;padding:2rem;color:#1a1a2e;">
            <h1 style="font-size:1.4rem;font-weight:700;margin-bottom:0.5rem;">⏰ Ending in ~1 Hour</h1>
            <p style="color:#4a5568;font-size:0.95rem;line-height:1.6;margin-bottom:1.25rem;">
              Hi ${recipientName}, a drop you're watching is closing soon — don't miss your chance to bid.
            </p>
            <div style="background:#f0f4f8;border-radius:14px;padding:1.25rem 1.5rem;margin-bottom:1.5rem;">
              <div style="font-size:0.72rem;color:#a0aec0;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:0.25rem;">Watched Drop</div>
              <div style="font-size:1.15rem;font-weight:700;color:#1a1a2e;margin-bottom:0.2rem;">"${auctionTitle}"</div>
              <div style="font-size:0.9rem;color:#4a5568;">by ${artistName}</div>
            </div>
            <a href="${auctionLink}" style="display:block;background:linear-gradient(135deg,#e8526a,#cc2366);color:white;text-decoration:none;padding:0.85rem 2rem;border-radius:100px;font-weight:600;font-size:0.95rem;text-align:center;">
              View Drop →
            </a>
            <p style="font-size:0.78rem;color:#a0aec0;margin-top:1.5rem;text-align:center;">
              You're receiving this because you're watching this drop on ArtDrop.
            </p>
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
