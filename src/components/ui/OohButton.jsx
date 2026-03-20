import { useState, memo } from "react";
import { supabase } from "../../supabase.js";
import { hasOohed, saveOoh, getOohCount } from "../../utils/storage.js";
import RollingNumber from "./RollingNumber.jsx";

const OohButton = memo(({ auctionId, store, patchStore }) => {
  const [oohed, setOohed]         = useState(() => hasOohed(auctionId));
  const [justOohed, setJustOohed] = useState(false);
  const count = getOohCount(store, auctionId);

  const handleOoh = async (e) => {
    e.stopPropagation();
    if (oohed) return;
    saveOoh(auctionId);
    setOohed(true);
    setJustOohed(true);
    setTimeout(() => setJustOohed(false), 500);
    const newCount = (store.oohs?.[auctionId] || 0) + 1;
    // Optimistic patch — only update oohs slice, no full refetch
    if (patchStore) {
      patchStore('oohs', prev => ({ ...prev, [auctionId]: newCount }));
    }
    try {
      await supabase.from("oohs").upsert({ auction_id: auctionId, count: newCount }, { onConflict: "auction_id" });
    } catch {
      // Optimistic update fallback already shown via local state
    }
  };

  return (
    <button
      className={`ooh-btn${oohed ? " oohed" : ""}${justOohed ? " just-oohed" : ""}`}
      onClick={handleOoh}
      title={oohed ? "You oohed this" : "Ooh this artwork"}
    >
      <span className="ooh-icon">{oohed ? "✨" : "✦"}</span>
      <span>Ooh{count > 0 && <> · <RollingNumber value={count} /></>}</span>
    </button>
  );
});

export default OohButton;
