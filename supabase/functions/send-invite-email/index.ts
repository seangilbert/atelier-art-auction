import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const APP_URL = Deno.env.get("APP_URL") ?? "https://artdrop.com";
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, x-client-info, apikey",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response("Unauthorized", { status: 401 });

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const { data: { user }, error: userErr } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (userErr || !user) return new Response("Unauthorized", { status: 401 });

    const { recipientEmail, senderName, inviteCode } = await req.json();
    if (!recipientEmail || !senderName || !inviteCode) {
      return new Response("Missing fields", { status: 400 });
    }

    const inviteLink = `${APP_URL}/?invite=${inviteCode}`;

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "onboarding@resend.dev",
        to: [recipientEmail],
        subject: `${senderName} invited you to ArtDrop`,
        html: `
          <div style="font-family:Inter,system-ui,sans-serif;max-width:520px;margin:0 auto;padding:2rem;color:#1a1a2e;">
            <h1 style="font-size:1.6rem;font-weight:700;margin-bottom:0.5rem;">You're invited to ArtDrop</h1>
            <p style="color:#4a5568;font-size:0.95rem;line-height:1.6;margin-bottom:1.5rem;">
              <strong>${senderName}</strong> invited you to join ArtDrop — the live art auction house where collectors bid on original artwork in real time.
            </p>
            <a href="${inviteLink}" style="display:inline-block;background:linear-gradient(135deg,#e8526a,#cc2366);color:white;text-decoration:none;padding:0.85rem 2rem;border-radius:100px;font-weight:600;font-size:0.95rem;margin-bottom:1.5rem;">
              Accept Invitation →
            </a>
            <p style="color:#a0aec0;font-size:0.78rem;margin-top:1.5rem;">Or copy this link: <a href="${inviteLink}" style="color:#e8526a;">${inviteLink}</a></p>
            <p style="color:#a0aec0;font-size:0.78rem;">Your invite code: <strong>${inviteCode}</strong></p>
          </div>`,
      }),
    });

    if (!emailRes.ok) return new Response(await emailRes.text(), { status: 500 });
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json", ...CORS },
    });
  } catch (e) {
    return new Response(`Error: ${e.message}`, { status: 500 });
  }
});
