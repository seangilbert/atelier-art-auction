import { useState } from "react";
import { supabase } from "../../supabase.js";
import { generateId, fmt$ } from "../../utils/helpers.js";
import ImagePicker from "../ui/ImagePicker.jsx";
import AvatarImg from "../ui/AvatarImg.jsx";

const CreatePage = ({ artist, onNavigate, store, updateStore, galleryItemId }) => {
  const galleryItem = galleryItemId ? store.gallery[galleryItemId] : null;
  const [step, setStep] = useState(galleryItemId ? 2 : 0);
  const [f, setF] = useState({
    title: galleryItem?.title || "", description: galleryItem?.description || "",
    medium: galleryItem?.medium || "", dimensions: galleryItem?.dimensions || "",
    imageUrl: galleryItem?.imageUrl || "", emoji: galleryItem?.emoji || "🎨",
    startingPrice: "", minIncrement: "25", durationDays: "7",
    paymentMethods: ["venmo","paypal"], venmoHandle: "", paypalEmail: "", cashappHandle: "",
  });
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  const togglePay = (m) => set("paymentMethods", f.paymentMethods.includes(m) ? f.paymentMethods.filter((x) => x !== m) : [...f.paymentMethods, m]);

  const publish = async () => {
    setBusy(true);
    const id = generateId();
    const endDate = new Date(Date.now() + parseInt(f.durationDays) * 86400000).toISOString();
    const auctionRow = {
      id, artist_id: artist.id, artist_name: artist.name, artist_avatar: artist.avatar,
      title: f.title, description: f.description, medium: f.medium, dimensions: f.dimensions,
      starting_price: parseFloat(f.startingPrice) || 50, min_increment: parseFloat(f.minIncrement) || 25,
      end_date: endDate, duration_days: parseInt(f.durationDays),
      payment_methods: f.paymentMethods, venmo_handle: f.venmoHandle,
      paypal_email: f.paypalEmail, cashapp_handle: f.cashappHandle,
      image_url: f.imageUrl, emoji: f.emoji, paused: false, removed: false,
      gallery_item_id: galleryItemId || null,
    };
    const { error: insertErr } = await supabase.from("auctions").insert(auctionRow);
    if (insertErr) { console.error("publish error:", insertErr); setBusy(false); return; }
    await updateStore(); // refresh store so new auction is visible
    setBusy(false);
    onNavigate("auction", id);
  };

  const STEPS = ["Artwork", "Details", "Pricing", "Payment", "Publish"];

  return (
    <div className="page-container">
      <h1 className="page-title">New <em>Drop</em></h1>
      <p className="page-subtitle">Listing as <strong><span style={{ display:"inline-flex", width:"1.2rem", height:"1.2rem", borderRadius:"50%", overflow:"hidden", verticalAlign:"middle", marginRight:"0.25rem", background:"var(--grad-accent)", fontSize:"0.85rem" }}><AvatarImg avatar={artist.avatar} alt={artist.name} /></span>{artist.name}</strong></p>

      {galleryItem && (
        <div className="alert alert-info" style={{ marginBottom:"1.5rem" }}>
          <i className="fa-solid fa-images"></i>
          Artwork details pre-filled from your gallery: <strong>{galleryItem.title}</strong>
        </div>
      )}

      <div className="step-indicator">
        {STEPS.map((s, i) => (
          <div key={s} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? 1 : 0 }}>
            <div className={`step-num ${i === step ? "active" : (i < step || (galleryItemId && i < 2)) ? "done" : ""}`}>{(i < step || (galleryItemId && i < 2)) ? <i className="fa-solid fa-check"></i> : i + 1}</div>
            <span className={`step-label ${i === step ? "active" : ""}`}>{s}</span>
            {i < STEPS.length - 1 && <div className="step-line" />}
          </div>
        ))}
      </div>

      {step === 0 && (
        <div>
          <div className="form-group">
            <label className="form-label">Artwork Photo</label>
            <ImagePicker
              imageUrl={f.imageUrl}
              emoji={f.emoji}
              onImageUrl={(url) => set("imageUrl", url)}
              onEmoji={(em) => set("emoji", em)}
            />
          </div>
          <div className="form-group"><label className="form-label">Artwork Title *</label><input className="form-input" placeholder="e.g. Ocean at Dawn, Series III" value={f.title} onChange={(e) => set("title", e.target.value)} /></div>
          <div className="form-actions"><button className="btn btn-ghost" onClick={() => onNavigate("dashboard")}>Cancel</button><button className="btn btn-primary" onClick={() => setStep(1)} disabled={!f.title.trim()}>Continue <i className="fa-solid fa-arrow-right"></i></button></div>
        </div>
      )}

      {step === 1 && (
        <div>
          <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" rows={4} placeholder="Tell collectors about the piece — story, technique, inspiration…" value={f.description} onChange={(e) => set("description", e.target.value)} /></div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Medium</label><input className="form-input" placeholder="e.g. Oil on canvas" value={f.medium} onChange={(e) => set("medium", e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Dimensions</label><input className="form-input" placeholder='e.g. 24" × 36"' value={f.dimensions} onChange={(e) => set("dimensions", e.target.value)} /></div>
          </div>
          <div className="form-actions"><button className="btn btn-ghost" onClick={() => setStep(0)}><i className="fa-solid fa-arrow-left"></i> Back</button><button className="btn btn-primary" onClick={() => setStep(2)}>Continue <i className="fa-solid fa-arrow-right"></i></button></div>
        </div>
      )}

      {step === 2 && (
        <div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Starting Bid *</label><div className="input-prefix"><span className="input-prefix-sym">$</span><input className="form-input" type="number" min="1" placeholder="100" value={f.startingPrice} onChange={(e) => set("startingPrice", e.target.value)} /></div></div>
            <div className="form-group"><label className="form-label">Minimum Increment</label><div className="input-prefix"><span className="input-prefix-sym">$</span><input className="form-input" type="number" min="1" placeholder="25" value={f.minIncrement} onChange={(e) => set("minIncrement", e.target.value)} /></div><p className="form-hint">Each new bid must raise by at least this amount</p></div>
          </div>
          <div className="form-group"><label className="form-label">Drop Duration</label><select className="form-select" value={f.durationDays} onChange={(e) => set("durationDays", e.target.value)}>{[["1","1 day"],["3","3 days"],["5","5 days"],["7","7 days (recommended)"],["14","14 days"],["30","30 days"]].map(([v,l]) => <option key={v} value={v}>{l}</option>)}</select></div>
          <div className="form-actions">
            <button className="btn btn-ghost" onClick={() => galleryItemId ? onNavigate("dashboard") : setStep(1)}><i className="fa-solid fa-arrow-left"></i> Back</button>
            <button className="btn btn-primary" onClick={() => setStep(3)} disabled={!f.startingPrice}>Continue <i className="fa-solid fa-arrow-right"></i></button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <p style={{ color: "var(--mist)", fontSize: "0.88rem", marginBottom: "1.5rem" }}>Choose which payment methods you'll accept from the winning bidder.</p>
          {[
            { key: "venmo",   label: "Venmo",          icon: "💙", field: "venmoHandle",   ph: "@your-venmo" },
            { key: "paypal",  label: "PayPal",          icon: "🅿️", field: "paypalEmail",   ph: "your@email.com" },
            { key: "cashapp", label: "Cash App",        icon: "💚", field: "cashappHandle", ph: "$yourcashtag" },
            { key: "zelle",   label: "Zelle",           icon: "💜", field: null },
            { key: "check",   label: "Personal Check",  icon: "📝", field: null },
            { key: "contact", label: "Contact Artist",  icon: "📧", field: null },
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
          <div className="form-actions"><button className="btn btn-ghost" onClick={() => setStep(2)}><i className="fa-solid fa-arrow-left"></i> Back</button><button className="btn btn-primary" onClick={() => setStep(4)} disabled={f.paymentMethods.length === 0}>Continue <i className="fa-solid fa-arrow-right"></i></button></div>
        </div>
      )}

      {step === 4 && (
        <div>
          <div style={{ background:"white", border:"1px solid var(--border)", borderRadius:"var(--radius-lg)", padding:"1.5rem", marginBottom:"1.5rem" }}>
            <div style={{ display:"flex", gap:"1.25rem", alignItems:"flex-start" }}>
              <div style={{ width:72, height:72, background:"var(--parchment)", borderRadius:"var(--radius)", overflow:"hidden", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"2rem" }}>
                {f.imageUrl ? <img src={f.imageUrl} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} /> : f.emoji}
              </div>
              <div>
                <div style={{ fontFamily:"var(--font-display)", fontSize:"1.2rem", fontWeight:700 }}>{f.title}</div>
                <div style={{ color:"var(--mist)", fontSize:"0.82rem", marginBottom:"0.4rem" }}>by {artist.name}</div>
                <div style={{ display:"flex", gap:"0.5rem", flexWrap:"wrap" }}>{f.medium && <span className="tag">{f.medium}</span>}{f.dimensions && <span className="tag">{f.dimensions}</span>}</div>
              </div>
            </div>
            <div className="divider" />
            <div className="publish-summary-grid">
              {[["Starting Bid", fmt$(f.startingPrice||0)], ["Duration", `${f.durationDays} days`], ["Payments", `${f.paymentMethods.length} method${f.paymentMethods.length!==1?"s":""}`]].map(([l,v]) => (
                <div key={l}><div style={{ color:"var(--mist)", fontSize:"0.7rem", textTransform:"uppercase", letterSpacing:"0.06em" }}>{l}</div><div style={{ fontWeight:600, marginTop:"0.15rem" }}>{v}</div></div>
              ))}
            </div>
          </div>
          <div className="alert alert-info"><i className="fa-solid fa-circle-info"></i> Once published, your drop goes live immediately. You'll get a shareable link to send to collectors.</div>
          <div className="form-actions"><button className="btn btn-ghost" onClick={() => setStep(3)}><i className="fa-solid fa-arrow-left"></i> Back</button><button className="btn btn-primary btn-lg" onClick={publish} disabled={busy}>{busy ? "Publishing…" : <><i className="fa-solid fa-rocket"></i> Publish Drop</>}</button></div>
        </div>
      )}
    </div>
  );
};

export default CreatePage;
