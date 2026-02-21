import { useState } from "react";
import { supabase } from "../../supabase.js";
import { AVATARS } from "../../utils/helpers.js";
import AvatarImg from "../ui/AvatarImg.jsx";
import AvatarUploadZone from "../ui/AvatarUploadZone.jsx";

const EditProfilePage = ({ user, userType, onNavigate, updateStore, onProfileSaved }) => {
  const isUrl = (s) => s && (s.startsWith("http") || s.startsWith("data:"));
  const [f, setF] = useState({
    name: user.name || "",
    bio: user.bio || "",
    photoUrl: isUrl(user.avatar) ? user.avatar : "",
    emojiAvatar: !isUrl(user.avatar) ? (user.avatar || "🎨") : "🎨",
  });
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  const effectiveAvatar = f.photoUrl || f.emojiAvatar;

  const save = async () => {
    if (!f.name.trim()) { setError("Display name is required."); return; }
    setError("");
    setBusy(true);
    try {
      await supabase.from("profiles").update({
        name: f.name.trim(), bio: f.bio.trim(), avatar: effectiveAvatar,
      }).eq("id", user.id);

      if (userType === "artist") {
        await supabase.from("auctions")
          .update({ artist_avatar: effectiveAvatar, artist_name: f.name.trim() })
          .eq("artist_id", user.id)
          .neq("removed", true);
      }

      await updateStore(user.id);
      onProfileSaved({ ...user, name: f.name.trim(), bio: f.bio.trim(), avatar: effectiveAvatar });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError("Failed to save. Please try again.");
      console.error("EditProfilePage save error:", err);
    }
    setBusy(false);
  };

  const backPage = userType === "artist" ? "dashboard" : "collector-dashboard";

  return (
    <div className="page-container">
      <button className="btn btn-ghost btn-sm" style={{ marginBottom:"1.5rem" }} onClick={() => onNavigate(backPage)}>
        <i className="fa-solid fa-arrow-left"></i> Back
      </button>
      <h1 className="page-title">Edit <em>Profile</em></h1>
      <p className="page-subtitle">Update your display name, bio, and profile photo.</p>

      {error && <div className="alert alert-error" style={{ marginBottom:"1rem" }}>{error}</div>}
      {saved && <div className="alert alert-success" style={{ marginBottom:"1rem" }}><i className="fa-solid fa-check"></i> Profile saved!</div>}

      <div className="form-group">
        <label className="form-label">Profile Photo</label>
        <div className="edit-profile-avatar-row">
          <div className="edit-profile-avatar-preview">
            <AvatarImg avatar={effectiveAvatar} alt={f.name} />
          </div>
          <div style={{ flex:1 }}>
            <AvatarUploadZone imageUrl={f.photoUrl} onImageUrl={(url) => set("photoUrl", url || "")} userId={user.id} />
          </div>
        </div>
      </div>

      {!f.photoUrl && (
        <div className="form-group">
          <label className="form-label">Emoji Avatar</label>
          <div className="avatar-picker">
            {AVATARS.map((av) => (
              <div key={av} className={`avatar-opt ${f.emojiAvatar === av ? "selected" : ""}`} onClick={() => set("emojiAvatar", av)}>{av}</div>
            ))}
          </div>
        </div>
      )}

      <div className="form-group">
        <label className="form-label">Display Name *</label>
        <input className="form-input" value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="Your public name" />
      </div>

      <div className="form-group">
        <label className="form-label">Bio</label>
        <textarea className="form-textarea" rows={3} value={f.bio} onChange={(e) => set("bio", e.target.value)}
          placeholder={userType === "artist" ? "Tell collectors about yourself and your art…" : "Tell us what kind of art you love…"} />
      </div>

      <div className="form-actions">
        <button className="btn btn-ghost" onClick={() => onNavigate(backPage)}>Cancel</button>
        <button className="btn btn-primary" onClick={save} disabled={busy}>
          {busy ? "Saving…" : "Save Profile"}
        </button>
      </div>
    </div>
  );
};

export default EditProfilePage;
