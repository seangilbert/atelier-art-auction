// ─────────────────────────────────────────────────────────────────────────────
// HELPERS & CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

export const fmt$ = (n) => { const v = Number(n); return "$" + (Number.isFinite(v) ? v : 0).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 }); };
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

// Read a file as a base64 data URL (reliable fallback for HEIC and other formats)
const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = (e) => resolve(e.target.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });

export const compressImage = async (file) => {
  // HEIC/HEIF (common on iOS camera) can't be drawn on Canvas in WKWebView —
  // skip compression and return the raw data URL instead.
  const isHeic = file.type === "image/heic" || file.type === "image/heif" ||
    file.name?.toLowerCase().endsWith(".heic") || file.name?.toLowerCase().endsWith(".heif");
  if (isHeic) return fileToDataUrl(file);

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      try {
        const scale = Math.min(1, MAX_IMG_DIM / Math.max(img.naturalWidth, img.naturalHeight));
        const canvas = document.createElement("canvas");
        canvas.width  = Math.round(img.naturalWidth  * scale);
        canvas.height = Math.round(img.naturalHeight * scale);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      } catch {
        // Canvas failed (e.g. tainted or unsupported format) — fall back to raw data URL
        fileToDataUrl(file).then(resolve).catch(reject);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      // Image couldn't be decoded by the browser — fall back to raw data URL
      fileToDataUrl(file).then(resolve).catch(reject);
    };
    img.src = url;
  });
};

export const getStatus = (a) => {
  if (a.removed) return "removed";
  if (!a.startDate) return "draft";
  if (new Date(a.startDate) > new Date()) return "scheduled";
  if (a.paused) return "paused";
  if (a.endDate && new Date(a.endDate) <= new Date()) return "ended";
  return "live";
};

export const EMOJI_OPTIONS = ["🎨","🌊","🌺","🦋","🌙","🏔️","🌿","🦚","✨","🌸"];

export const REACTION_EMOJIS = ["❤️", "👏", "🔥"];
