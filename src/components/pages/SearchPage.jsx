import { useState } from "react";
import { supabase } from "../../supabase.js";
import { getStatus, fmt$, timeAgo } from "../../utils/helpers.js";
import { CardTimer } from "../ui/Countdown.jsx";
import OohButton from "../ui/OohButton.jsx";
import WatchButton from "../ui/WatchButton.jsx";
import AvatarImg from "../ui/AvatarImg.jsx";

// ─────────────────────────────────────────────────────────────────────────────
// Auction card (live or sold)
// ─────────────────────────────────────────────────────────────────────────────
const SearchAuctionCard = ({ auction, store, updateStore, onNavigate, me, meCollector }) => {
  const summary = store.bidSummaries[auction.id] || { count: 0, topAmount: 0 };
  const topBidAmt = summary.topAmount || auction.startingPrice;
  const bidCount = summary.count;
  const commentCount = store.commentCounts?.[auction.id] || 0;
  const sold = getStatus(auction) === "ended";

  return (
    <div className="feed-card" style={{ position: "relative" }} onClick={() => onNavigate("auction", auction.id)}>
      {sold && <div className="sold-badge">Sold</div>}
      <div
        className="feed-card-header feed-card-header-link"
        onClick={(e) => { e.stopPropagation(); onNavigate("artist", auction.artistId); }}
      >
        <div className="feed-avatar"><AvatarImg avatar={auction.artistAvatar || "🎨"} alt={auction.artistName} /></div>
        <div>
          <div className="feed-artist-name">{auction.artistName}</div>
          <div className="feed-time">{timeAgo(auction.createdAt)}</div>
        </div>
      </div>
      <div className="card-image">
        {auction.imageUrl
          ? <img src={auction.imageUrl} alt={auction.title} />
          : <span>{auction.emoji || "🎨"}</span>}
        {!sold && <div className="badge badge-live"><div className="pulse" style={{ background: "white" }} /> Live</div>}
      </div>
      <div className="card-body">
        <div className="card-title">{auction.title}</div>
        {auction.description && <div className="feed-desc">{auction.description}</div>}
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: (bidCount > 0 || commentCount > 0) ? "0.6rem" : 0 }}>
          {bidCount > 0 && <div className="feed-bid-count"><i className="fa-solid fa-fire"></i> {bidCount} bid{bidCount !== 1 ? "s" : ""}</div>}
          {commentCount > 0 && <div className="feed-comment-count"><i className="fa-regular fa-comment"></i> {commentCount} comment{commentCount !== 1 ? "s" : ""}</div>}
        </div>
        <div className="card-meta">
          <div>
            <div className="card-price-label">{sold ? "Final Bid" : (bidCount ? "Current Bid" : "Starting at")}</div>
            <div className="card-price">{fmt$(topBidAmt)}</div>
          </div>
          {!sold && (
            <div>
              <div className="card-timer-label">Closes</div>
              <div className="card-timer-val"><CardTimer endDate={auction.endDate} /></div>
            </div>
          )}
        </div>
        {!sold && (
          <div className="card-ooh-row feed-ooh">
            <OohButton auctionId={auction.id} store={store} updateStore={updateStore} />
            <WatchButton auctionId={auction.id} store={store} updateStore={updateStore} meUser={me || meCollector} onNavigate={onNavigate} />
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Artist card (reuses artist-browse styles)
// ─────────────────────────────────────────────────────────────────────────────
const SearchArtistCard = ({ artist, followerCount, liveDrops, avgRating, isFollowing, onFollow, onNavigate, meCollector, me }) => (
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
        {liveDrops > 0 && <span style={{ color: "var(--rouge)" }}><i className="fa-solid fa-circle-dot"></i> {liveDrops} live</span>}
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

// ─────────────────────────────────────────────────────────────────────────────
// Main SearchPage
// ─────────────────────────────────────────────────────────────────────────────
const SearchPage = ({ onNavigate, store, updateStore, me, meCollector }) => {
  const PAGE_SIZE = 12;
  const [query, setQuery]       = useState("");
  const [medium, setMedium]     = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort]         = useState("newest");
  const [openChip, setOpenChip] = useState(null); // "medium" | "price" | "sort" | null
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // ── Data ──────────────────────────────────────────────────────────────────
  const allAuctions = store.auctions.filter(a => a.published && !a.removed);
  const liveAuctions = allAuctions.filter(a => getStatus(a) === "live");
  const mediums = [...new Set(liveAuctions.filter(a => a.medium).map(a => a.medium))].sort();

  const allArtists = Object.values(store.artists).filter(artist =>
    allAuctions.some(a => a.artistId === artist.id)
  );

  const enrichedArtists = allArtists.map(artist => {
    const followerCount = Object.values(store.collectors || {})
      .filter(c => (c.following || []).includes(artist.id)).length;
    const liveDrops = allAuctions.filter(
      a => a.artistId === artist.id && getStatus(a) === "live"
    ).length;
    const ratings = (store.ratings?.byRatee?.[artist.id] || []).filter(r => r.raterType === "collector");
    const avgRating = ratings.length
      ? ratings.reduce((s, r) => s + r.score, 0) / ratings.length
      : null;
    return { artist, followerCount, liveDrops, avgRating };
  });

  const myFollowing = new Set(store.collectors?.[meCollector?.id]?.following || []);

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

  // ── Filters ───────────────────────────────────────────────────────────────
  const hasFilters = query.trim() !== "" || medium !== "" || minPrice !== "" || maxPrice !== "";

  const filteredAuctions = hasFilters
    ? allAuctions.filter(a => {
        const q = query.trim().toLowerCase();
        if (q && !a.title.toLowerCase().includes(q) && !a.artistName.toLowerCase().includes(q)) return false;
        const price = store.bidSummaries[a.id]?.topAmount || a.startingPrice;
        if (minPrice !== "" && price < parseFloat(minPrice)) return false;
        if (maxPrice !== "" && price > parseFloat(maxPrice)) return false;
        if (medium && a.medium !== medium) return false;
        return true;
      })
    : allAuctions;

  const sortTabs = [
    ["newest", "Newest"], ["ending", "Ending Soon"], ["oohs", "Most Loved"],
    ["bids", "Most Bids"], ["price-asc", "Price ↑"], ["price-desc", "Price ↓"],
  ];

  const sorted = [...filteredAuctions].sort((a, b) => {
    if (sort === "ending")     return new Date(a.endDate) - new Date(b.endDate);
    if (sort === "oohs")       return (store.oohs[b.id] || 0) - (store.oohs[a.id] || 0);
    if (sort === "bids")       return (store.bidSummaries[b.id]?.count || 0) - (store.bidSummaries[a.id]?.count || 0);
    if (sort === "price-asc")  return (store.bidSummaries[a.id]?.topAmount || a.startingPrice) - (store.bidSummaries[b.id]?.topAmount || b.startingPrice);
    if (sort === "price-desc") return (store.bidSummaries[b.id]?.topAmount || b.startingPrice) - (store.bidSummaries[a.id]?.topAmount || a.startingPrice);
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const matchingArtists = query.trim()
    ? enrichedArtists.filter(({ artist }) => {
        const q = query.trim().toLowerCase();
        return artist.name?.toLowerCase().includes(q) || (artist.bio || "").toLowerCase().includes(q);
      })
    : [];

  const visibleAuctions = sorted.slice(0, visibleCount);
  const hasMore = sorted.length > visibleCount;

  // ── Idle state curated data ───────────────────────────────────────────────
  const endingSoonAuctions = [...liveAuctions]
    .sort((a, b) => new Date(a.endDate) - new Date(b.endDate))
    .slice(0, 8);

  const trendingArtists = [...enrichedArtists]
    .sort((a, b) => b.followerCount - a.followerCount || b.liveDrops - a.liveDrops)
    .slice(0, 6);

  const newDrops = [...allAuctions]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, PAGE_SIZE);

  // ── Chip toggle helper ────────────────────────────────────────────────────
  const toggleChip = (name) => setOpenChip(o => o === name ? null : name);

  const sortLabel = sortTabs.find(([k]) => k === sort)?.[1] || "Sort";
  const priceLabel = (minPrice || maxPrice)
    ? `$${minPrice || "0"} – $${maxPrice || "∞"}`
    : "Price";

  return (
    <div className="search-page">
      {/* ── Sticky header: search bar + filter chips ──────────────────────── */}
      <div className="search-header">
        <div className="feed-search-bar" style={{ marginBottom: "0.75rem" }}>
          <div className="feed-search-input-wrap">
            <span className="feed-search-icon"><i className="fa-solid fa-magnifying-glass"></i></span>
            <input
              className="feed-search-input"
              type="text"
              placeholder="Search drops, artists…"
              value={query}
              onChange={e => { setQuery(e.target.value); setVisibleCount(PAGE_SIZE); }}
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                style={{ position: "absolute", right: "0.85rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--mist)", fontSize: "0.85rem" }}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            )}
          </div>
        </div>

        <div className="search-filter-chips">
          {/* Medium chip */}
          <button
            className={`search-chip${medium ? " active" : ""}`}
            onClick={() => toggleChip("medium")}
          >
            <i className="fa-solid fa-palette"></i>
            {medium || "Medium"}
            <i className={`fa-solid fa-chevron-${openChip === "medium" ? "up" : "down"}`} style={{ fontSize: "0.6rem" }}></i>
          </button>

          {/* Price chip */}
          <button
            className={`search-chip${(minPrice || maxPrice) ? " active" : ""}`}
            onClick={() => toggleChip("price")}
          >
            <i className="fa-solid fa-tag"></i>
            {priceLabel}
            <i className={`fa-solid fa-chevron-${openChip === "price" ? "up" : "down"}`} style={{ fontSize: "0.6rem" }}></i>
          </button>

          {/* Sort chip */}
          <button
            className={`search-chip${sort !== "newest" ? " active" : ""}`}
            onClick={() => toggleChip("sort")}
          >
            <i className="fa-solid fa-arrow-up-wide-short"></i>
            {sortLabel}
            <i className={`fa-solid fa-chevron-${openChip === "sort" ? "up" : "down"}`} style={{ fontSize: "0.6rem" }}></i>
          </button>

          {/* Clear all */}
          {(medium || minPrice || maxPrice || sort !== "newest") && (
            <button
              className="search-chip"
              onClick={() => { setMedium(""); setMinPrice(""); setMaxPrice(""); setSort("newest"); setOpenChip(null); }}
              style={{ color: "var(--rouge)" }}
            >
              <i className="fa-solid fa-xmark"></i> Clear
            </button>
          )}
        </div>

        {/* Medium panel */}
        {openChip === "medium" && (
          <div className="search-chip-panel">
            <button className={`sort-tab${medium === "" ? " active" : ""}`} onClick={() => { setMedium(""); setOpenChip(null); }}>All</button>
            {mediums.map(m => (
              <button key={m} className={`sort-tab${medium === m ? " active" : ""}`} onClick={() => { setMedium(m); setOpenChip(null); }}>{m}</button>
            ))}
            {mediums.length === 0 && <span style={{ fontSize: "0.8rem", color: "var(--mist)" }}>No mediums available</span>}
          </div>
        )}

        {/* Price panel */}
        {openChip === "price" && (
          <div className="search-chip-panel">
            <span className="feed-filter-label">Min $</span>
            <input className="feed-filter-input" type="number" min="0" placeholder="0" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
            <span className="feed-filter-label">Max $</span>
            <input className="feed-filter-input" type="number" min="0" placeholder="Any" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
            <button className="search-chip" onClick={() => setOpenChip(null)}>Done</button>
          </div>
        )}

        {/* Sort panel */}
        {openChip === "sort" && (
          <div className="search-chip-panel">
            {sortTabs.map(([key, label]) => (
              <button key={key} className={`sort-tab${sort === key ? " active" : ""}`} onClick={() => { setSort(key); setOpenChip(null); }}>{label}</button>
            ))}
          </div>
        )}
      </div>

      {/* ── IDLE STATE — curated sections ─────────────────────────────────── */}
      {!hasFilters && (
        <>
          {/* Ending Soon strip */}
          {endingSoonAuctions.length > 0 && (
            <div className="search-section">
              <div className="search-section-header">
                <span className="search-section-title"><i className="fa-solid fa-fire"></i> Ending Soon</span>
              </div>
              <div className="for-you-scroll">
                {endingSoonAuctions.map(auction => {
                  const price = store.bidSummaries[auction.id]?.topAmount || auction.startingPrice;
                  return (
                    <div key={auction.id} className="for-you-card" onClick={() => onNavigate("auction", auction.id)}>
                      <div className="for-you-img">
                        {auction.imageUrl
                          ? <img src={auction.imageUrl} alt={auction.title} />
                          : <span style={{ fontSize: "2rem" }}>{auction.emoji || "🎨"}</span>}
                      </div>
                      <div className="for-you-body">
                        <div className="for-you-artist">{auction.artistName}</div>
                        <div className="for-you-title">{auction.title}</div>
                        <div className="for-you-price">{fmt$(price)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Trending Artists */}
          {trendingArtists.length > 0 && (
            <div className="search-section">
              <div className="search-section-header">
                <span className="search-section-title"><i className="fa-solid fa-star"></i> Trending Artists</span>
              </div>
              <div className="artist-browse-grid">
                {trendingArtists.map(({ artist, followerCount, liveDrops, avgRating }) => (
                  <SearchArtistCard
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
            </div>
          )}

          {/* New Drops */}
          {newDrops.length > 0 && (
            <div className="search-section">
              <div className="search-section-header">
                <span className="search-section-title"><i className="fa-solid fa-bolt"></i> New Drops</span>
              </div>
              <div className="feed-grid">
                {newDrops.map(auction => (
                  <SearchAuctionCard
                    key={auction.id}
                    auction={auction}
                    store={store}
                    updateStore={updateStore}
                    onNavigate={onNavigate}
                    me={me}
                    meCollector={meCollector}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── ACTIVE STATE — search results ─────────────────────────────────── */}
      {hasFilters && (
        <>
          {/* Artist results */}
          {matchingArtists.length > 0 && (
            <div className="search-section">
              <div className="search-section-header">
                <span className="search-section-title"><i className="fa-solid fa-users"></i> Artists</span>
                <span className="search-section-count">{matchingArtists.length} result{matchingArtists.length !== 1 ? "s" : ""}</span>
              </div>
              <div className="artist-browse-grid">
                {matchingArtists.map(({ artist, followerCount, liveDrops, avgRating }) => (
                  <SearchArtistCard
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
            </div>
          )}

          {/* Auction results */}
          <div className="search-section">
            <div className="search-section-header">
              <span className="search-section-title"><i className="fa-solid fa-paintbrush"></i> Drops</span>
              <span className="search-section-count">{sorted.length} result{sorted.length !== 1 ? "s" : ""}</span>
            </div>
            {sorted.length === 0 ? (
              <div className="empty-state">
                <h3>No results{query.trim() ? ` for "${query.trim()}"` : ""}</h3>
                <p style={{ marginBottom: "1.5rem" }}>Try adjusting your filters or search term.</p>
                <button className="btn btn-ghost" onClick={() => { setQuery(""); setMedium(""); setMinPrice(""); setMaxPrice(""); setSort("newest"); }}>
                  <i className="fa-solid fa-xmark"></i> Clear all
                </button>
              </div>
            ) : (
              <>
                <div className="feed-grid">
                  {visibleAuctions.map(auction => (
                    <SearchAuctionCard
                      key={auction.id}
                      auction={auction}
                      store={store}
                      updateStore={updateStore}
                      onNavigate={onNavigate}
                      me={me}
                      meCollector={meCollector}
                    />
                  ))}
                </div>
                {hasMore && (
                  <div style={{ textAlign: "center", padding: "2rem 0" }}>
                    <button className="btn btn-ghost" onClick={() => setVisibleCount(c => c + PAGE_SIZE)}>
                      Load more
                      <span style={{ color: "var(--mist)", marginLeft: "0.4rem" }}>({sorted.length - visibleCount} remaining)</span>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}

      {/* Empty app state */}
      {!hasFilters && allAuctions.length === 0 && (
        <div className="empty-state">
          <h3>No drops yet</h3>
          <p>Check back soon — artists are getting ready to drop.</p>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
