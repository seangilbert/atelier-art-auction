import { useState, memo } from "react";
import { supabase } from "../../supabase.js";

const WatchButton = memo(({ auctionId, store, patchStore, meUser, onNavigate }) => {
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
        // Optimistic patch — remove from watchlist slice
        if (patchStore) {
          patchStore('watchlist', prev => {
            const next = { ...prev };
            delete next[auctionId];
            return next;
          });
        }
      } else {
        await supabase.from("watchlist")
          .insert({ user_id: meUser.id, auction_id: auctionId });
        // Optimistic patch — add to watchlist slice
        if (patchStore) {
          patchStore('watchlist', prev => ({
            ...prev,
            [auctionId]: { reminderSent: false },
          }));
        }
      }
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
        <span className="ooh-icon"><i className="fa-regular fa-eye"></i></span>
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
      <span className="ooh-icon"><i className={`fa-${isWatching ? "solid" : "regular"} fa-eye`}></i></span>
      <span>{loading ? "…" : isWatching ? "Watching" : "Watch"}</span>
    </button>
  );
});

export default WatchButton;
