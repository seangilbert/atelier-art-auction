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
      artistEmail,
      winnerName,
      winnerEmail,
      winningAmount,
      paymentMethod,
      paymentInstruction,
      shippingName,
      shippingAddress,
      shippingCity,
      shippingState,
      shippingZip,
      shippingCountry,
      shippingNotes,
    } = await req.json();

    const auctionLink = `${APP_URL}/#auction-${auctionId}`;
    const fmt = (n: number) => `$${Number(n).toLocaleString("en-US")}`;

    const shippingBlock = `
      <div style="background:#f0f4f8;border-radius:14px;padding:1.25rem 1.5rem;margin-bottom:1.5rem;font-size:0.9rem;color:#4a5568;line-height:1.8;">
        <div style="font-size:0.72rem;color:#a0aec0;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:0.5rem;">Ship To</div>
        <div>${shippingName}</div>
        <div>${shippingAddress}</div>
        <div>${shippingCity}${shippingState ? ", " + shippingState : ""} ${shippingZip}</div>
        <div>${shippingCountry}</div>
        ${shippingNotes ? `<div style="margin-top:0.5rem;color:#718096;">Note: ${shippingNotes}</div>` : ""}
      </div>`;

    // ── Email 1: to the winner ────────────────────────────────────────────────
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "onboarding@resend.dev",
        to: [winnerEmail],
        subject: `Your order is confirmed — "${auctionTitle}"`,
        html: `
          <div style="font-family:Inter,system-ui,sans-serif;max-width:520px;margin:0 auto;padding:2rem;color:#1a1a2e;">
            <h1 style="font-size:1.4rem;font-weight:700;margin-bottom:0.5rem;">Order Confirmed 🎉</h1>
            <p style="color:#4a5568;font-size:0.95rem;line-height:1.6;margin-bottom:1.25rem;">
              Hi ${winnerName}, congratulations on winning <strong>"${auctionTitle}"</strong> by ${artistName}!
              Your shipping details have been sent to the artist.
            </p>
            <div style="background:#f0f4f8;border-radius:14px;padding:1.25rem 1.5rem;margin-bottom:1.5rem;">
              <div style="font-size:0.72rem;color:#a0aec0;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:0.25rem;">Winning Bid</div>
              <div style="font-size:2rem;font-weight:700;color:#c73652;">${fmt(winningAmount)}</div>
            </div>
            <div style="background:#fffbf0;border:1px solid #f6e05e;border-radius:14px;padding:1.25rem 1.5rem;margin-bottom:1.5rem;">
              <div style="font-size:0.72rem;color:#a0aec0;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:0.5rem;">Payment Instructions</div>
              <div style="font-size:0.9rem;font-weight:600;color:#1a1a2e;margin-bottom:0.25rem;">${paymentMethod}</div>
              <div style="font-size:0.9rem;color:#4a5568;line-height:1.6;">${paymentInstruction}</div>
            </div>
            ${shippingBlock}
            <p style="font-size:0.82rem;color:#a0aec0;margin-bottom:1.5rem;">
              The artist will ship your artwork once payment is confirmed. You'll receive a tracking number when it ships.
            </p>
            <a href="${auctionLink}" style="display:block;background:linear-gradient(135deg,#e8526a,#cc2366);color:white;text-decoration:none;padding:0.85rem 2rem;border-radius:100px;font-weight:600;font-size:0.95rem;text-align:center;">
              View Auction →
            </a>
          </div>`,
      }),
    });

    // ── Email 2: to the artist ────────────────────────────────────────────────
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "onboarding@resend.dev",
        to: [artistEmail],
        subject: `Payment submitted for "${auctionTitle}" — ship to ${shippingName}`,
        html: `
          <div style="font-family:Inter,system-ui,sans-serif;max-width:520px;margin:0 auto;padding:2rem;color:#1a1a2e;">
            <h1 style="font-size:1.4rem;font-weight:700;margin-bottom:0.5rem;">Payment Submitted 💰</h1>
            <p style="color:#4a5568;font-size:0.95rem;line-height:1.6;margin-bottom:1.25rem;">
              Hi ${artistName}, <strong>${winnerName}</strong> has submitted payment for
              <strong>"${auctionTitle}"</strong>. Here are the details you need to ship the artwork.
            </p>
            <div style="background:#f0f4f8;border-radius:14px;padding:1.25rem 1.5rem;margin-bottom:1.5rem;">
              <div style="font-size:0.72rem;color:#a0aec0;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:0.25rem;">Winning Bid</div>
              <div style="font-size:2rem;font-weight:700;color:#c73652;">${fmt(winningAmount)}</div>
              <div style="font-size:0.9rem;color:#4a5568;margin-top:0.5rem;">
                Payment via: <strong>${paymentMethod}</strong><br/>
                Winner email: <a href="mailto:${winnerEmail}" style="color:#e8526a;">${winnerEmail}</a>
              </div>
            </div>
            ${shippingBlock}
            <p style="font-size:0.82rem;color:#a0aec0;margin-bottom:1.5rem;">
              Log in to your dashboard to mark this order as paid and ship it.
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
