import { useState } from "react";
import { supabase } from "../../supabase.js";
import ImagePicker from "../ui/ImagePicker.jsx";

const AddArtworkPage = ({ artist, store, updateStore, onNavigate, editItemId }) => {
  const existing = editItemId ? store.gallery[editItemId] : null;
  const [f, setF] = useState({
    title: existing?.title || "",
    description: existing?.description || "",
    medium: existing?.medium || "",
    dimensions: existing?.dimensions || "",
    imageUrl: existing?.imageUrl || "",
    emoji: existing?.emoji || "🎨",
  });
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));

  const save = async () => {
    if (!f.title.trim()) return;
    setBusy(true);
    if (editItemId) {
      await supabase.from("gallery").update({
        title: f.title.trim(), description: f.description, medium: f.medium,
        dimensions: f.dimensions, image_url: f.imageUrl, emoji: f.emoji,
      }).eq("id", editItemId);
    } else {
      await supabase.from("gallery").insert({
        artist_id: artist.id,
        title: f.title.trim(), description: f.description, medium: f.medium,
        dimensions: f.dimensions, image_url: f.imageUrl, emoji: f.emoji,
      });
    }
    await updateStore();
    setBusy(false);
    onNavigate("dashboard");
  };

  return (
    <div className="page-container">
      <button className="btn btn-ghost btn-sm" style={{ marginBottom:"1.5rem" }} onClick={() => onNavigate("dashboard")}>
        <i className="fa-solid fa-arrow-left"></i> Back
      </button>
      <h1 className="page-title">{editItemId ? "Edit" : "Add"} <em>Artwork</em></h1>
      <p className="page-subtitle">Add artwork to your gallery — set drop details later when you're ready to go live.</p>
      <div className="form-group">
        <label className="form-label">Artwork Photo</label>
        <ImagePicker imageUrl={f.imageUrl} emoji={f.emoji}
          onImageUrl={url => set("imageUrl", url)} onEmoji={em => set("emoji", em)} />
      </div>
      <div className="form-group">
        <label className="form-label">Title *</label>
        <input className="form-input" value={f.title} onChange={e => set("title", e.target.value)} placeholder="e.g. Ocean at Dawn" />
      </div>
      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea className="form-textarea" rows={3} value={f.description} onChange={e => set("description", e.target.value)} placeholder="Tell collectors about the piece — story, technique, inspiration…" />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Medium</label>
          <input className="form-input" value={f.medium} onChange={e => set("medium", e.target.value)} placeholder="Oil on canvas" />
        </div>
        <div className="form-group">
          <label className="form-label">Dimensions</label>
          <input className="form-input" value={f.dimensions} onChange={e => set("dimensions", e.target.value)} placeholder='24" × 36"' />
        </div>
      </div>
      <div className="form-actions">
        <button className="btn btn-ghost" onClick={() => onNavigate("dashboard")}>Cancel</button>
        <button className="btn btn-primary" onClick={save} disabled={!f.title.trim() || busy}>
          {busy ? "Saving…" : <><i className="fa-solid fa-check"></i> Save Artwork</>}
        </button>
      </div>
    </div>
  );
};

export default AddArtworkPage;
