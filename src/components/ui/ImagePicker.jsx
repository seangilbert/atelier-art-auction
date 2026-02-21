import { useState, useRef } from "react";
import { supabase } from "../../supabase.js";
import { compressImage, EMOJI_OPTIONS } from "../../utils/helpers.js";

const ImagePicker = ({ imageUrl, emoji, onImageUrl, onEmoji }) => {
  const [tab, setTab]         = useState(imageUrl ? "upload" : "upload");
  const [urlInput, setUrlInput] = useState(imageUrl && !imageUrl.startsWith("data:") ? imageUrl : "");
  const [urlErr, setUrlErr]   = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();

  // Local preview: if imageUrl is already set (e.g. edit mode), show it immediately
  const preview = imageUrl || null;

  const handleFile = async (file) => {
    if (!file?.type.startsWith("image/")) return;
    try {
      const compressed = await compressImage(file);
      // Try to upload to Supabase Storage; fall back to base64 data URI if unavailable
      try {
        const res = await fetch(compressed);
        const blob = await res.blob();
        const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
        const { error: uploadErr } = await supabase.storage.from("artworks").upload(path, blob, { contentType: "image/jpeg", upsert: true });
        if (!uploadErr) {
          const { data: { publicUrl } } = supabase.storage.from("artworks").getPublicUrl(path);
          onImageUrl(publicUrl);
          return;
        }
      } catch {}
      // Fallback: store as base64 data URI
      onImageUrl(compressed);
    } catch {
      const r = new FileReader();
      r.onload = (e) => onImageUrl(e.target.result);
      r.readAsDataURL(file);
    }
  };

  const handleUseUrl = () => {
    const url = urlInput.trim();
    if (!url) return;
    setUrlErr("");
    onImageUrl(url);
  };

  return (
    <div>
      <div className="img-picker-tabs">
        <button className={`btn btn-sm ${tab === "upload" ? "btn-primary" : "btn-ghost"}`} onClick={() => setTab("upload")}>Upload File</button>
        <button className={`btn btn-sm ${tab === "url"    ? "btn-primary" : "btn-ghost"}`} onClick={() => setTab("url")}>Paste URL</button>
      </div>

      {tab === "upload" && (
        <div
          className={`upload-zone ${dragOver ? "drag-over" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
          onClick={() => fileRef.current?.click()}
        >
          <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={(e) => handleFile(e.target.files[0])} />
          {preview
            ? <><img src={preview} alt="preview" className="upload-preview" /><p className="upload-sub">Click or drag to replace</p></>
            : <><div className="upload-icon">🖼️</div><div className="upload-label">Drag & drop your artwork photo</div><div className="upload-sub">JPG, PNG, WEBP · Compressed automatically · or click to browse</div></>
          }
        </div>
      )}

      {tab === "url" && (
        <div>
          <div className="img-picker-url-row">
            <input
              className="form-input"
              placeholder="https://example.com/artwork.jpg"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleUseUrl()}
            />
            <button className="btn btn-primary btn-sm" onClick={handleUseUrl}>Use</button>
          </div>
          {urlErr && <div className="alert alert-error" style={{ marginTop:"0.5rem" }}>{urlErr}</div>}
          {preview && tab === "url" && (
            <img src={preview} alt="preview" className="upload-preview" style={{ marginTop:"0.75rem" }}
              onError={() => { onImageUrl(""); setUrlErr("Couldn't load that URL — try a direct image link (.jpg, .png, .webp)."); }} />
          )}
          <p className="form-hint" style={{ marginTop:"0.5rem" }}>Paste any public image URL. Works best with direct image links (.jpg, .png, .webp).</p>
        </div>
      )}

      {!preview && (
        <div style={{ marginTop:"1rem" }}>
          <label className="form-label">Or pick an emoji placeholder</label>
          <div className="avatar-picker" style={{ marginTop:"0.4rem" }}>
            {EMOJI_OPTIONS.map((em) => (
              <div key={em} className={`avatar-opt ${emoji === em ? "selected" : ""}`} onClick={() => onEmoji(em)}>{em}</div>
            ))}
          </div>
        </div>
      )}

      {preview && (
        <button className="btn btn-ghost btn-sm" style={{ marginTop:"0.5rem" }} onClick={() => { onImageUrl(""); setUrlInput(""); }}>
          Remove Image
        </button>
      )}
    </div>
  );
};

export default ImagePicker;
