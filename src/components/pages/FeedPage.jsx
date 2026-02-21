import { useState, useEffect } from "react";
import { getStatus, fmt$, timeAgo, shortName } from "../../utils/helpers.js";
import { CardTimer } from "../ui/Countdown.jsx";
import OohButton from "../ui/OohButton.jsx";
import AvatarImg from "../ui/AvatarImg.jsx";

const FeedPage = ({ onNavigate, store, updateStore, me, meCollector }) => {
  const PAGE_SIZE = 12;
  const [sort, setSort] = useState("oohs");
  const [query, setQuery] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Reset pagination when sort/filter changes
  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [sort, query, minPrice, maxPrice]);

  const live = store.auctions.filter((a) => !a.removed && a.published && getStatus(a) === "live");
  const sorted = [...live].sort((a, b) => {
    if (sort === "oohs")   return (store.oohs[b.id] || 0) - (store.oohs[a.id] || 0);
    if (sort === "ending") return new Date(a.endDate) - new Date(b.endDate);
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const hasFilters = query.trim() !== "" || minPrice !== "" || maxPrice !== "";
  const clearFilters = () => { setQuery(""); setMinPrice(""); setMaxPrice(""); };

  const filtered = sorted.filter((auction) => {
    const summary = store.bidSummaries[auction.id] || { count: 0, topAmount: 0 };
    const currentPrice = summary.topAmount || auction.startingPrice;
    const q = query.trim().toLowerCase();
    if (q && !auction.title.toLowerCase().includes(q) && !auction.artistName.toLowerCase().includes(q)) return false;
    if (minPrice !== "" && currentPrice < parseFloat(minPrice)) return false;
    if (maxPrice !== "" && currentPrice > parseFloat(maxPrice)) return false;
    return true;
  });

  const visibleAuctions = filtered.slice(0, visibleCount);
  const hasMore = filtered.length > visibleCount;

  const activeUser = me || meCollector;
  return (
    <div className="feed-page">
      <div className="feed-header">
        <div className="feed-title">{activeUser?.name ? `Hi ${activeUser.name.split(" ")[0]} ✦` : "Discover"}</div>
        <div className="sort-tabs">
          {[["oohs","Most Loved"],["ending","Ending Soon"],["newest","Newest"]].map(([key,label]) => (
            <button key={key} className={`sort-tab ${sort === key ? "active" : ""}`} onClick={() => setSort(key)}>{label}</button>
          ))}
        </div>
      </div>

      {live.length > 0 && (
        <div className="feed-search-bar">
          <div className="feed-search-input-wrap">
            <span className="feed-search-icon">🔍</span>
            <input className="feed-search-input" type="text" placeholder="Search by title or artist…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <div className="feed-filter-row">
            <span className="feed-filter-label">Min $</span>
            <input className="feed-filter-input" type="number" min="0" placeholder="0" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
            <span className="feed-filter-label">Max $</span>
            <input className="feed-filter-input" type="number" min="0" placeholder="Any" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
            {hasFilters && <button className="feed-clear-btn" onClick={clearFilters}>✕ Clear</button>}
          </div>
        </div>
      )}

      {filtered.length === 0 && live.length === 0 ? (
        <div className="empty-state">
          <h3>No live drops right now</h3>
          <p style={{ marginBottom:"1.5rem" }}>Check back soon — new artworks are added regularly.</p>
          {me && <button className="btn btn-primary" onClick={() => onNavigate("create")}>+ Create Drop</button>}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <h3>No results{query.trim() ? ` for "${query.trim()}"` : ""}</h3>
          <p style={{ marginBottom:"1.5rem" }}>Try a different search or adjust the price range.</p>
          <button className="btn btn-ghost" onClick={clearFilters}>✕ Clear Filters</button>
        </div>
      ) : (
        <>
        <div className="feed-grid">
          {visibleAuctions.map((auction) => {
            const summary = store.bidSummaries[auction.id] || { count: 0, topAmount: 0 };
            const topBidAmt = summary.topAmount || auction.startingPrice;
            const bidCount = summary.count;
            const commentCount = store.commentCounts?.[auction.id] || 0;
            return (
              <div key={auction.id} className="feed-card" onClick={() => onNavigate("auction", auction.id)}>
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
                  {auction.imageUrl ? <img src={auction.imageUrl} alt={auction.title} /> : <span>{auction.emoji || "🎨"}</span>}
                  <div className="badge badge-live"><div className="pulse" style={{ background:"white" }} /> Live</div>
                </div>
                <div className="card-body">
                  <div className="card-title">{auction.title}</div>
                  {auction.description && <div className="feed-desc">{auction.description}</div>}
                  <div style={{ display:"flex", gap:"0.4rem", flexWrap:"wrap", marginBottom: (bidCount > 0 || commentCount > 0) ? "0.6rem" : 0 }}>
                    {bidCount > 0 && <div className="feed-bid-count"><i className="fa-solid fa-fire"></i> {bidCount} bid{bidCount !== 1 ? "s" : ""}</div>}
                    {commentCount > 0 && <div className="feed-comment-count"><i className="fa-regular fa-comment"></i> {commentCount} comment{commentCount !== 1 ? "s" : ""}</div>}
                  </div>
                  <div className="card-meta">
                    <div><div className="card-price-label">{bidCount ? "Current Bid" : "Starting at"}</div><div className="card-price">{fmt$(topBidAmt)}</div></div>
                    <div><div className="card-timer-label">Closes</div><div className="card-timer-val"><CardTimer endDate={auction.endDate} /></div></div>
                  </div>
                  <div className="card-ooh-row feed-ooh">
                    <OohButton auctionId={auction.id} store={store} updateStore={updateStore} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {hasMore && (
          <div style={{ textAlign:"center", padding:"2rem 0" }}>
            <button className="btn btn-ghost" onClick={() => setVisibleCount(c => c + PAGE_SIZE)}>
              Load {Math.min(PAGE_SIZE, filtered.length - visibleCount)} more
              <span style={{ color:"var(--mist)", marginLeft:"0.4rem" }}>({filtered.length - visibleCount} remaining)</span>
            </button>
          </div>
        )}
        </>
      )}
    </div>
  );
};

export default FeedPage;
