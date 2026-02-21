// ─────────────────────────────────────────────────────────────────────────────
// HELPERS & CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

export const fmt$ = (n) => "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
export const fmtDate = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
export const timeLeft = (endDate) => {
  const diff = new Date(endDate) - new Date();
  if (diff <= 0) return null;
  return { d: Math.floor(diff / 86400000), h: Math.floor((diff % 86400000) / 3600000), m: Math.floor((diff % 3600000) / 60000), s: Math.floor((diff % 60000) / 1000) };
};
export const shortName = (n) => { const p = n.trim().split(" "); return p[0] + (p[1] ? " " + p[1][0] + "." : ""); };
export const generateId = () => Math.random().toString(36).slice(2, 10);
export const timeAgo = (iso) => {
  const diff = Date.now() - new Date(iso);
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

export const AVATARS = ["🎨", "🖌️", "🌊", "🌿", "🦋", "🌙", "🏔️", "🌺", "🦚", "✨"];

const MAX_IMG_DIM = 1200;
export const compressImage = (file) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, MAX_IMG_DIM / Math.max(img.naturalWidth, img.naturalHeight));
      const canvas = document.createElement("canvas");
      canvas.width  = Math.round(img.naturalWidth  * scale);
      canvas.height = Math.round(img.naturalHeight * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = reject;
    img.src = url;
  });

export const getStatus = (a) => {
  if (a.removed) return "removed";
  if (a.paused) return "paused";
  if (new Date(a.endDate) <= new Date()) return "ended";
  return "live";
};

export const EMOJI_OPTIONS = ["🎨","🌊","🌺","🦋","🌙","🏔️","🌿","🦚","✨","🌸"];

export const REACTION_EMOJIS = ["❤️", "👏", "🔥"];
