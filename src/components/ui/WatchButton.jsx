import { useState } from "react";
import { supabase } from "../../supabase.js";

const WatchButton = ({ auctionId, store, updateStore, meUser, onNavigate }) => {
  const [loading, setLoading] = useState(false);
  const isWatching = !!store.watchlist?.[auctionId];

  const toggle = async (e) => {
    e.stopPropagation();
    if (!meUser) { onNavigate("login"); return; }
    setLoading(true);
    try {
      if (isWatching) {
        await supabase.from("watchlist")
          .delete()
          .eq("user_id", meUser.id)
          .eq("auction_id", auctionId);
      } else {
        await supabase.from("watchlist")
          .insert({ user_id: meUser.id, auction_id: auctionId });
      }
      updateStore(meUser.id);
    } finally {
      setLoading(false);
    }
  };

  if (!meUser) {
    return (
      <button
        className="ooh-btn"
        onClick={toggle}
        title="Sign in to watch this drop"
      >
        <span className="ooh-icon">👀</span>
        <span>Watch</span>
      </button>
    );
  }

  return (
    <button
      className={`ooh-btn${isWatching ? " oohed" : ""}`}
      onClick={toggle}
      disabled={loading}
      title={isWatching ? "Watching — click to unwatch" : "Watch this drop for a 1hr reminder"}
    >
      <span className="ooh-icon">{isWatching ? "👁️" : "👀"}</span>
      <span>{loading ? "…" : isWatching ? "Watching" : "Watch"}</span>
    </button>
  );
};

export default WatchButton;
