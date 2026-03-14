import { useState } from "react";
import { supabase } from "../../supabase.js";
import { getStatus } from "../../utils/helpers.js";
import AvatarImg from "../ui/AvatarImg.jsx";

const ArtistCard = ({ artist, followerCount, liveDrops, avgRating, isFollowing, onFollow, onNavigate, meCollector, me }) => (
  <div className="artist-browse-card" onClick={() => onNavigate("artist", artist.id)}>
    <div className="artist-browse-avatar">
      <AvatarImg avatar={artist.avatar} alt={artist.name} />
      {liveDrops > 0 && (
        <div className="artist-browse-live-badge">
          <div className="pulse" style={{ background: "white" }} /> {liveDrops} Live
        </div>
      )}
    </div>
    <div className="artist-browse-info">
      <div className="artist-browse-name">{artist.name}</div>
      {artist.bio && <div className="artist-browse-bio">{artist.bio}</div>}
      <div className="artist-browse-stats">
        <span><i className="fa-solid fa-users"></i> {followerCount}</span>
        {avgRating !== null && <span><i className="fa-solid fa-star"></i> {avgRating.toFixed(1)}</span>}
        {liveDrops > 0 && (
          <span style={{ color: "var(--rouge)" }}>
            <i className="fa-solid fa-circle-dot"></i> {liveDrops} live
          </span>
        )}
      </div>
    </div>
    {(meCollector || me) && (
      <div className="artist-browse-follow" onClick={e => { e.stopPropagation(); onFollow(artist.id); }}>
        {isFollowing
          ? <button className="btn btn-outline btn-sm"><i className="fa-solid fa-check"></i> Following</button>
          : <button className="btn btn-primary btn-sm"><i className="fa-solid fa-star"></i> Follow</button>}
      </div>
    )}
  </div>
);

const ArtistBrowsePage = ({ onNavigate, store, updateStore, me, meCollector }) => {
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("live");

  const toggleFollow = async (artistId) => {
    if (!meCollector) { onNavigate("collector-signup"); return; }
    const currentFollowing = store.collectors?.[meCollector.id]?.following || [];
    const idx = currentFollowing.indexOf(artistId);
    const newFollowing = idx === -1
      ? [...currentFollowing, artistId]
      : currentFollowing.filter((_, i) => i !== idx);
    await supabase.from("profiles").update({ following: newFollowing }).eq("id", meCollector.id);
    updateStore();
  };

  const myFollowing = new Set(store.collectors?.[meCollector?.id]?.following || []);

  const artists = Object.values(store.artists).filter(artist =>
    store.auctions.some(a => a.artistId === artist.id && a.published && !a.removed)
  );

  const enriched = artists.map(artist => {
    const followerCount = Object.values(store.collectors || {})
      .filter(c => (c.following || []).includes(artist.id)).length;
    const liveDrops = store.auctions.filter(
      a => a.artistId === artist.id && !a.removed && a.published && getStatus(a) === "live"
    ).length;
    const ratings = (store.ratings?.byRatee?.[artist.id] || []).filter(r => r.raterType === "collector");
    const avgRating = ratings.length
      ? ratings.reduce((s, r) => s + r.score, 0) / ratings.length
      : null;
    return { artist, followerCount, liveDrops, avgRating };
  });

  const q = query.trim().toLowerCase();
  const filtered = q
    ? enriched.filter(e =>
        e.artist.name.toLowerCase().includes(q) ||
        (e.artist.bio || "").toLowerCase().includes(q))
    : enriched;

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "live")      return b.liveDrops - a.liveDrops;
    if (sortBy === "rating")    return (b.avgRating ?? -1) - (a.avgRating ?? -1);
    if (sortBy === "followers") return b.followerCount - a.followerCount;
    return 0;
  });

  const sortTabs = [
    ["live", "Live Now"],
    ["followers", "Most Followed"],
    ["rating", "Top Rated"],
  ];

  return (
    <div className="artist-browse-page">
      <div className="artist-browse-header">
        <div className="artist-browse-title">Discover Artists</div>
        <div className="sort-tabs">
          {sortTabs.map(([key, label]) => (
            <button key={key} className={`sort-tab ${sortBy === key ? "active" : ""}`} onClick={() => setSortBy(key)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="feed-search-bar" style={{ marginBottom: "1.5rem" }}>
        <div className="feed-search-input-wrap">
          <span className="feed-search-icon"><i className="fa-solid fa-magnifying-glass"></i></span>
          <input
            className="feed-search-input"
            type="text"
            placeholder="Search artists by name or bio…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}><i className="fa-solid fa-magnifying-glass"></i></div>
          <h3>No artists found{q ? ` for "${q}"` : ""}</h3>
          <p style={{ marginBottom: "1.5rem" }}>
            {q ? "Try a different search." : "No artists have published drops yet."}
          </p>
          {q && <button className="btn btn-ghost" onClick={() => setQuery("")}><i className="fa-solid fa-xmark"></i> Clear search</button>}
        </div>
      ) : (
        <div className="artist-browse-grid">
          {sorted.map(({ artist, followerCount, liveDrops, avgRating }) => (
            <ArtistCard
              key={artist.id}
              artist={artist}
              followerCount={followerCount}
              liveDrops={liveDrops}
              avgRating={avgRating}
              isFollowing={myFollowing.has(artist.id)}
              onFollow={toggleFollow}
              onNavigate={onNavigate}
              meCollector={meCollector}
              me={me}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ArtistBrowsePage;
