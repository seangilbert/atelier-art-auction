import { useState } from "react";
import { supabase } from "../../supabase.js";
import ImagePicker from "../ui/ImagePicker.jsx";

const EditPage = ({ auctionId, artist, onNavigate, store, updateStore }) => {
  const auction = store.auctions.find((a) => a.id === auctionId);
  if (!auction || auction.artistId !== artist?.id) {
    return <div className="page-container" style={{ textAlign: "center", paddingTop: "6rem" }}><h2>Drop not found.</h2><button className="btn btn-primary" style={{ marginTop: "1.5rem" }} onClick={() => onNavigate("dashboard")}>Back to Dashboard</button></div>;
  }

  const [f, setF] = useState({
    title: auction.title,
    description: auction.description || "",
    medium: auction.medium || "",
    dimensions: auction.dimensions || "",
    paymentMethods: auction.paymentMethods || [],
    venmoHandle: auction.venmoHandle || "",
    paypalEmail: auction.paypalEmail || "",
    cashappHandle: auction.cashappHandle || "",
    imageUrl: auction.imageUrl || "",
    emoji: auction.emoji || "🎨",
  });
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const togglePay = (m) => set("paymentMethods", f.paymentMethods.includes(m) ? f.paymentMethods.filter((x) => x !== m) : [...f.paymentMethods, m]);

  const save = async () => {
    if (!f.title.trim()) return;
    setBusy(true);
    const { error: saveErr } = await supabase.from("auctions").update({
      title: f.title.trim(), description: f.description, medium: f.medium, dimensions: f.dimensions,
      payment_methods: f.paymentMethods, venmo_handle: f.venmoHandle,
      paypal_email: f.paypalEmail, cashapp_handle: f.cashappHandle,
      image_url: f.imageUrl, emoji: f.emoji,
    }).eq("id", auctionId);
    if (saveErr) { console.error("save error:", saveErr); setBusy(false); return; }
    await updateStore();
    setBusy(false);
    setSaved(true);
    setTimeout(() => { setSaved(false); onNavigate("auction", auctionId); }, 1200);
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Edit <em>Drop</em></h1>
      <p className="page-subtitle">Changes apply immediately. Bids and timer are unaffected.</p>

      {saved && <div className="alert alert-success" style={{ marginBottom: "1.5rem" }}><i className="fa-solid fa-check"></i> Saved! Redirecting…</div>}

      <div className="form-group">
        <label className="form-label">Artwork Photo</label>
        <ImagePicker
          imageUrl={f.imageUrl}
          emoji={f.emoji}
          onImageUrl={(url) => set("imageUrl", url)}
          onEmoji={(em) => set("emoji", em)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Artwork Title *</label>
        <input className="form-input" value={f.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Ocean at Dawn, Series III" />
      </div>

      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea className="form-textarea" rows={4} value={f.description} onChange={(e) => set("description", e.target.value)} placeholder="Tell collectors about the piece…" />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Medium</label>
          <input className="form-input" value={f.medium} onChange={(e) => set("medium", e.target.value)} placeholder="e.g. Oil on canvas" />
        </div>
        <div className="form-group">
          <label className="form-label">Dimensions</label>
          <input className="form-input" value={f.dimensions} onChange={(e) => set("dimensions", e.target.value)} placeholder='e.g. 24" × 36"' />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" style={{ marginBottom: "0.75rem" }}>Payment Methods</label>
        {[
          { key: "venmo",   label: "Venmo",         icon: "💙", field: "venmoHandle",   ph: "@your-venmo" },
          { key: "paypal",  label: "PayPal",         icon: "🅿️", field: "paypalEmail",   ph: "your@email.com" },
          { key: "cashapp", label: "Cash App",       icon: "💚", field: "cashappHandle", ph: "$yourcashtag" },
          { key: "zelle",   label: "Zelle",          icon: "💜", field: null },
          { key: "check",   label: "Personal Check", icon: "📝", field: null },
          { key: "contact", label: "Contact Artist", icon: "📧", field: null },
        ].map(({ key, label, icon, field, ph }) => (
          <div key={key} style={{ marginBottom: "0.6rem" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"0.75rem", padding:"0.85rem 1rem", border:`1px solid ${f.paymentMethods.includes(key)?"var(--gold)":"var(--border)"}`, borderRadius:"var(--radius)", background:f.paymentMethods.includes(key)?"rgba(201,168,76,0.05)":"white", cursor:"pointer", transition:"all 0.15s" }} onClick={() => togglePay(key)}>
              <span style={{ fontSize:"1.15rem" }}>{icon}</span>
              <span style={{ flex:1, fontWeight:500, fontSize:"0.92rem" }}>{label}</span>
              <span style={{ color:f.paymentMethods.includes(key)?"var(--gold-dark)":"var(--border)" }}>{f.paymentMethods.includes(key) ? <i className="fa-solid fa-check"></i> : <i className="fa-solid fa-plus"></i>}</span>
            </div>
            {f.paymentMethods.includes(key) && field && <input className="form-input" style={{ marginTop:"0.4rem", borderRadius:`0 0 var(--radius) var(--radius)`, borderTop:"none" }} placeholder={ph} value={f[field]} onChange={(e) => set(field, e.target.value)} />}
          </div>
        ))}
      </div>

      <div className="form-actions">
        <button className="btn btn-ghost" onClick={() => onNavigate("auction", auctionId)}>Cancel</button>
        <button className="btn btn-primary" onClick={save} disabled={busy || !f.title.trim()}>{busy ? "Saving…" : "Save Changes"}</button>
      </div>
    </div>
  );
};

export default EditPage;
