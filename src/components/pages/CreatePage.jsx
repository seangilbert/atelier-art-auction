import { useState } from "react";
import { supabase } from "../../supabase.js";
import { generateId, fmt$ } from "../../utils/helpers.js";
import ImagePicker from "../ui/ImagePicker.jsx";
import AvatarImg from "../ui/AvatarImg.jsx";

const CreatePage = ({ artist, onNavigate, store, updateStore, galleryItemId, editDraftId }) => {
  const galleryItem   = galleryItemId ? store.gallery[galleryItemId] : null;
  const draftAuction  = editDraftId   ? store.auctions.find(a => a.id === editDraftId) : null;

  const [step, setStep] = useState(draftAuction ? 0 : galleryItemId ? 2 : 0);
  const [f, setF] = useState({
    title:          draftAuction?.title          || galleryItem?.title       || "",
    description:    draftAuction?.description    || galleryItem?.description || "",
    medium:         draftAuction?.medium         || galleryItem?.medium      || "",
    dimensions:     draftAuction?.dimensions     || galleryItem?.dimensions  || "",
    imageUrl:       draftAuction?.imageUrl       || galleryItem?.imageUrl    || "",
    emoji:          draftAuction?.emoji          || galleryItem?.emoji       || "🎨",
    startingPrice:  draftAuction?.startingPrice?.toString() || "",
    minIncrement:   draftAuction?.minIncrement?.toString()  || "25",
    durationDays:   draftAuction?.durationDays?.toString()  || "7",
    paymentMethods: draftAuction?.paymentMethods || ["venmo","paypal"],
    venmoHandle:    draftAuction?.venmoHandle    || "",
    paypalEmail:    draftAuction?.paypalEmail    || "",
    cashappHandle:  draftAuction?.cashappHandle  || "",
  });
  const [busy, setBusy] = useState(false);
  const [showSchedulePicker, setShowSchedulePicker] = useState(false);
  const [scheduleInput, setScheduleInput] = useState("");

  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const togglePay = (m) => set("paymentMethods", f.paymentMethods.includes(m) ? f.paymentMethods.filter((x) => x !== m) : [...f.paymentMethods, m]);

  // Save with one of three modes: "draft" | "schedule" | "now"
  const save = async (mode, scheduledAt = null) => {
    setBusy(true);
    const id = editDraftId || generateId();
    const startDate = mode === "draft"    ? null
                    : mode === "schedule" ? new Date(scheduledAt).toISOString()
                    : new Date().toISOString();
    const endDate = startDate
      ? new Date(new Date(startDate).getTime() + parseInt(f.durationDays) * 86400000).toISOString()
      : null;
    const row = {
      id,
      artist_id: artist.id, artist_name: artist.name, artist_avatar: artist.avatar,
      title: f.title, description: f.description, medium: f.medium, dimensions: f.dimensions,
      starting_price: parseFloat(f.startingPrice) || 50,
      min_increment:  parseFloat(f.minIncrement)  || 25,
      start_date: startDate, end_date: endDate, duration_days: parseInt(f.durationDays),
      payment_methods: f.paymentMethods,
      venmo_handle: f.venmoHandle, paypal_email: f.paypalEmail, cashapp_handle: f.cashappHandle,
      image_url: f.imageUrl, emoji: f.emoji,
      paused: false, removed: false,
      gallery_item_id: galleryItemId || draftAuction?.galleryItemId || null,
    };
    let saveErr;
    if (editDraftId) {
      ({ error: saveErr } = await supabase.from("auctions").update(row).eq("id", editDraftId));
    } else {
      ({ error: saveErr } = await supabase.from("auctions").insert(row));
    }
    if (saveErr) { console.error("save error:", saveErr); setBusy(false); return; }
    await updateStore();
    setBusy(false);
    if (mode === "now") onNavigate("auction", id);
    else onNavigate("dashboard");
  };

  const STEPS = ["Artwork", "Details", "Pricing", "Payment", "Publish"];

  // Min datetime for schedule picker: 1 minute from now
  const minDatetime = new Date(Date.now() + 60000).toISOString().slice(0, 16);

  return (
    <div className="page-container">
      <h1 className="page-title">{editDraftId ? "Edit Draft" : <>New <em>Drop</em></>}</h1>
      <p className="page-subtitle">Listing as <strong><span style={{ display:"inline-flex", width:"1.2rem", height:"1.2rem", borderRadius:"50%", overflow:"hidden", verticalAlign:"middle", marginRight:"0.25rem", background:"var(--grad-accent)", fontSize:"0.85rem" }}><AvatarImg avatar={artist.avatar} alt={artist.name} /></span>{artist.name}</strong></p>

      {galleryItem && !editDraftId && (
        <div className="alert alert-info" style={{ marginBottom:"1.5rem" }}>
          <i className="fa-solid fa-images"></i>
          Artwork details pre-filled from your gallery: <strong>{galleryItem.title}</strong>
        </div>
      )}

      <div className="step-indicator">
        {STEPS.map((s, i) => (
          <div key={s} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? 1 : 0 }}>
            <div className={`step-num ${i === step ? "active" : (i < step || (galleryItemId && !editDraftId && i < 2)) ? "done" : ""}`}>{(i < step || (galleryItemId && !editDraftId && i < 2)) ? <i className="fa-solid fa-check"></i> : i + 1}</div>
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
            <button className="btn btn-ghost" onClick={() => galleryItemId && !editDraftId ? onNavigate("dashboard") : setStep(1)}><i className="fa-solid fa-arrow-left"></i> Back</button>
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
          {/* Summary card */}
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

          {/* Info banner */}
          <div className="alert alert-info" style={{ marginBottom:"1rem" }}>
            <i className="fa-solid fa-circle-info"></i>{" "}
            {editDraftId
              ? "Update your draft, schedule for a future date, or publish now."
              : "Save as a draft to finish later, schedule for a specific date, or go live now."}
          </div>

          {/* Inline schedule picker */}
          {showSchedulePicker && (
            <div style={{ background:"white", border:"1px solid var(--border)", borderRadius:"var(--radius)", padding:"1.25rem", marginBottom:"1rem" }}>
              <label className="form-label" style={{ marginBottom:"0.5rem", display:"block" }}>
                <i className="fa-solid fa-calendar"></i> Publish date &amp; time
              </label>
              <input
                type="datetime-local"
                className="form-input"
                min={minDatetime}
                value={scheduleInput}
                onChange={e => setScheduleInput(e.target.value)}
                style={{ marginBottom:"0.75rem" }}
              />
              <button
                className="btn btn-primary"
                disabled={!scheduleInput || busy}
                onClick={() => save("schedule", scheduleInput)}
                style={{ width:"100%" }}
              >
                <i className="fa-solid fa-calendar-check"></i>{" "}
                {busy ? "Scheduling…" : "Confirm Schedule"}
              </button>
            </div>
          )}

          {/* Action row */}
          <div className="form-actions" style={{ flexWrap:"wrap", gap:"0.5rem" }}>
            <button className="btn btn-ghost" onClick={() => setStep(3)} disabled={busy}>
              <i className="fa-solid fa-arrow-left"></i> Back
            </button>
            <div style={{ display:"flex", gap:"0.5rem", flexWrap:"wrap", marginLeft:"auto" }}>
              <button className="btn btn-ghost" onClick={() => save("draft")} disabled={busy}>
                {busy ? "Saving…" : <><i className="fa-solid fa-floppy-disk"></i> Save as Draft</>}
              </button>
              <button
                className={`btn btn-outline${showSchedulePicker ? " active" : ""}`}
                onClick={() => setShowSchedulePicker(s => !s)}
                disabled={busy}
              >
                <i className="fa-solid fa-calendar"></i> Schedule
              </button>
              <button className="btn btn-primary btn-lg" onClick={() => save("now")} disabled={busy}>
                {busy ? "Publishing…" : <><i className="fa-solid fa-rocket"></i> Publish Now</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatePage;
