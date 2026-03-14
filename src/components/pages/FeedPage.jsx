import { useState, useEffect } from "react";
import { getStatus, fmt$, timeAgo, timeLeft } from "../../utils/helpers.js";
import { CardTimer } from "../ui/Countdown.jsx";
import OohButton from "../ui/OohButton.jsx";
import WatchButton from "../ui/WatchButton.jsx";
import AvatarImg from "../ui/AvatarImg.jsx";

const FeedPage = ({ onNavigate, store, updateStore, me, meCollector }) => {
  const PAGE_SIZE = 12;
  const [sort, setSort] = useState("oohs");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Reset pagination when sort changes
  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [sort]);

  const live = store.auctions.filter((a) => !a.removed && a.published && getStatus(a) === "live");

  const followingIds = new Set(store.collectors?.[meCollector?.id]?.following || []);
  const hasFollowing = !!(meCollector && followingIds.size > 0);

  const sorted = [...live].sort((a, b) => {
    if (sort === "following")  return new Date(a.endDate) - new Date(b.endDate);
    if (sort === "oohs")       return (store.oohs[b.id] || 0) - (store.oohs[a.id] || 0);
    if (sort === "ending")     return new Date(a.endDate) - new Date(b.endDate);
    if (sort === "bids")       return (store.bidSummaries[b.id]?.count || 0) - (store.bidSummaries[a.id]?.count || 0);
    if (sort === "price-asc")  return (store.bidSummaries[a.id]?.topAmount || a.startingPrice) - (store.bidSummaries[b.id]?.topAmount || b.startingPrice);
    if (sort === "price-desc") return (store.bidSummaries[b.id]?.topAmount || b.startingPrice) - (store.bidSummaries[a.id]?.topAmount || a.startingPrice);
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const filtered = sorted.filter((auction) => {
    if (sort === "following" && !followingIds.has(auction.artistId)) return false;
    return true;
  });

  const visibleAuctions = filtered.slice(0, visibleCount);
  const hasMore = filtered.length > visibleCount;

  // "Because you follow" strip — live drops from followed artists, shown when not on Following tab
  const forYouDrops = sort !== "following" && hasFollowing
    ? live.filter(a => followingIds.has(a.artistId)).sort((a, b) => new Date(a.endDate) - new Date(b.endDate)).slice(0, 8)
    : [];

  const scheduled = store.auctions
    .filter(a => !a.removed && a.published && getStatus(a) === "scheduled")
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
    .slice(0, 10);

  const ScheduledTimer = ({ startDate }) => {
    const [left, setLeft] = useState(() => timeLeft(startDate));
    useEffect(() => {
      const id = setInterval(() => setLeft(timeLeft(startDate)), 10000);
      return () => clearInterval(id);
    }, [startDate]);
    if (!left) return <span>Starting soon</span>;
    if (left.d > 0) return <span>Starts in {left.d}d {left.h}h</span>;
    return <span style={{ color: "var(--rouge)" }}>Starts in {left.h}h {left.m}m</span>;
  };

  const sortTabs = [
    ["oohs","Most Loved"], ["ending","Ending Soon"], ["newest","Newest"],
    ["bids","Most Bids"], ["price-asc","Price ↑"], ["price-desc","Price ↓"],
    ...(hasFollowing ? [["following", <><i className="fa-solid fa-star"></i> Following</>]] : []),
  ];

  const activeUser = me || meCollector;

  const AuctionCard = ({ auction }) => {
    const summary = store.bidSummaries[auction.id] || { count: 0, topAmount: 0 };
    const topBidAmt = summary.topAmount || auction.startingPrice;
    const bidCount = summary.count;
    const commentCount = store.commentCounts?.[auction.id] || 0;
    return (
      <div className="feed-card" onClick={() => onNavigate("auction", auction.id)}>
        <div className="feed-card-header feed-card-header-link"
          onClick={(e) => { e.stopPropagation(); onNavigate("artist", auction.artistId); }}>
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
            <WatchButton auctionId={auction.id} store={store} updateStore={updateStore} meUser={me || meCollector} onNavigate={onNavigate} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="feed-page">
      <div className="feed-header">
        <div className="feed-title">{activeUser?.name ? `Hi ${activeUser.name.split(" ")[0]}` : "Discover"}</div>
        <div className="sort-tabs">
          {sortTabs.map(([key, label]) => (
            <button key={key} className={`sort-tab ${sort === key ? "active" : ""}`} onClick={() => setSort(key)}>{label}</button>
          ))}
        </div>
      </div>

      {/* ── "Because you follow" strip ───────────────────────────────────── */}
      {forYouDrops.length > 0 && (
        <div className="for-you-section">
          <div className="for-you-header">
            <span className="for-you-label"><i className="fa-solid fa-star"></i> From artists you follow</span>
            <button className="btn btn-ghost btn-sm" onClick={() => setSort("following")}>See all</button>
          </div>
          <div className="for-you-scroll">
            {forYouDrops.map(auction => {
              const price = store.bidSummaries[auction.id]?.topAmount || auction.startingPrice;
              return (
                <div key={auction.id} className="for-you-card" onClick={() => onNavigate("auction", auction.id)}>
                  <div className="for-you-img">
                    {auction.imageUrl ? <img src={auction.imageUrl} alt={auction.title} /> : <span style={{ fontSize:"2rem" }}>{auction.emoji || "🎨"}</span>}
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

      {/* ── Coming Soon strip ─────────────────────────────────────────────── */}
      {scheduled.length > 0 && (
        <div className="coming-soon-section">
          <div className="for-you-header">
            <span className="for-you-label"><i className="fa-regular fa-clock"></i> Coming Soon</span>
          </div>
          <div className="coming-soon-scroll">
            {scheduled.map(auction => (
              <div key={auction.id} className="coming-soon-card" onClick={() => onNavigate("auction", auction.id)}>
                <div className="coming-soon-img">
                  {auction.imageUrl
                    ? <img src={auction.imageUrl} alt={auction.title} />
                    : <i className="fa-solid fa-palette" style={{ fontSize: "2rem" }}></i>}
                  <div className="coming-soon-img-overlay" />
                </div>
                <div className="coming-soon-body">
                  <div className="for-you-artist">{auction.artistName}</div>
                  <div className="for-you-title">{auction.title}</div>
                  <div className="coming-soon-timer"><ScheduledTimer startDate={auction.startDate} /></div>
                  <div className="coming-soon-price">from {fmt$(auction.startingPrice)}</div>
                  <div onClick={e => e.stopPropagation()} style={{ marginTop: "0.5rem" }}>
                    <WatchButton auctionId={auction.id} store={store} updateStore={updateStore}
                      meUser={me || meCollector} onNavigate={onNavigate} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Main grid ─────────────────────────────────────────────────────── */}
      {filtered.length === 0 && live.length === 0 ? (
        <div className="empty-state">
          <h3>No live drops right now</h3>
          <p style={{ marginBottom:"1.5rem" }}>Check back soon — new artworks are added regularly.</p>
          {me && <button className="btn btn-primary" onClick={() => onNavigate("create")}>+ Create Drop</button>}
        </div>
      ) : filtered.length === 0 && sort === "following" ? (
        <div className="empty-state">
          <h3>No live drops from artists you follow</h3>
          <p style={{ marginBottom:"1.5rem" }}>Follow more artists on their profile pages, or browse all drops.</p>
          <button className="btn btn-ghost" onClick={() => setSort("oohs")}>Browse all drops</button>
        </div>
      ) : (
        <>
          <div className="feed-grid">
            {visibleAuctions.map(auction => <AuctionCard key={auction.id} auction={auction} />)}
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
