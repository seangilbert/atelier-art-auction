// ─────────────────────────────────────────────────────────────────────────────
// LOCAL STORAGE HELPERS
// ─────────────────────────────────────────────────────────────────────────────

// Bidder identity is still stored locally (anonymous bidders don't have accounts)
export const BIDDER_KEY = "atelier_bidder";
export const getBidderIdentity = () => { try { const r = localStorage.getItem(BIDDER_KEY); return r ? JSON.parse(r) : { name: "", email: "" }; } catch { return { name: "", email: "" }; } };
export const saveBidderIdentity = (name, email) => { try { localStorage.setItem(BIDDER_KEY, JSON.stringify({ name, email })); } catch {} };

// Ooh tracking: one ooh per browser per auction
export const OOHS_KEY    = "artdrop_oohs";
export const getOohedSet = () => { try { const r = localStorage.getItem(OOHS_KEY); return new Set(r ? JSON.parse(r) : []); } catch { return new Set(); } };
export const hasOohed    = (id) => getOohedSet().has(id);
export const saveOoh     = (id) => { const s = getOohedSet(); s.add(id); try { localStorage.setItem(OOHS_KEY, JSON.stringify([...s])); } catch {} };
export const getOohCount = (store, id) => (store.oohs?.[id]) || 0;
