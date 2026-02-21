import { useState, useRef } from "react";
import { supabase } from "../../supabase.js";
import { compressImage } from "../../utils/helpers.js";

// Slimmed-down upload zone for profile photos — reuses compressImage and the
// same "artworks" bucket as ImagePicker, under an "avatars/" path prefix.
const AvatarUploadZone = ({ imageUrl, onImageUrl, userId }) => {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const handleFile = async (file) => {
    if (!file?.type.startsWith("image/")) return;
    setUploading(true);
    try {
      const compressed = await compressImage(file);
      try {
        const res = await fetch(compressed);
        const blob = await res.blob();
        const path = `avatars/${userId}-${Date.now()}.jpg`;
        const { error: uploadErr } = await supabase.storage
          .from("artworks")
          .upload(path, blob, { contentType: "image/jpeg", upsert: true });
        if (!uploadErr) {
          const { data: { publicUrl } } = supabase.storage.from("artworks").getPublicUrl(path);
          onImageUrl(publicUrl);
          setUploading(false);
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
    setUploading(false);
  };

  const hasPhoto = imageUrl && (imageUrl.startsWith("http") || imageUrl.startsWith("data:"));

  return (
    <div>
      <div
        className={`avatar-upload-zone ${dragOver ? "drag-over" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
        onClick={() => !uploading && fileRef.current?.click()}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => handleFile(e.target.files[0])}
        />
        {hasPhoto ? (
          <div className="avatar-upload-preview-wrap">
            <img src={imageUrl} alt="Avatar preview" className="avatar-upload-preview" />
            <div className="avatar-upload-sub">Click or drag to replace</div>
          </div>
        ) : (
          <div className="avatar-upload-empty">
            <i className="fa-regular fa-image" style={{ fontSize:"1.8rem", color:"var(--mist)", marginBottom:"0.5rem" }}></i>
            <div className="avatar-upload-label">{uploading ? "Uploading…" : "Upload a profile photo"}</div>
            <div className="avatar-upload-sub">JPG, PNG, WEBP · Click or drag to browse</div>
          </div>
        )}
      </div>
      {hasPhoto && (
        <button
          className="btn btn-ghost btn-sm"
          style={{ marginTop: "0.5rem" }}
          onClick={(e) => { e.stopPropagation(); onImageUrl(""); }}
        >
          <i className="fa-solid fa-xmark"></i> Remove photo
        </button>
      )}
    </div>
  );
};

export default AvatarUploadZone;
