import { useState } from "react";
import { supabase } from "../../supabase.js";
import { getStatus, fmt$ } from "../../utils/helpers.js";
import { getOohedSet } from "../../utils/storage.js";
import AvatarImg from "../ui/AvatarImg.jsx";
import { RatingModal } from "../ui/StarPicker.jsx";

const CollectorDashboardPage = ({ meCollector, onNavigate, store, updateStore }) => {
  if (!meCollector) return null;

  const [ratingModal, setRatingModal]          = useState(null); // { auctionId, artistName, rateeId }
  const [submittingRating, setSubmittingRating] = useState(false);

  const submitCollectorRating = async (score, comment) => {
    if (!ratingModal) return;
    setSubmittingRating(true);
    await supabase.from("ratings").insert({
      auction_id: ratingModal.auctionId,
      rater_id:   meCollector.id,
      ratee_id:   ratingModal.rateeId,
      rater_type: "collector",
      score,
      comment: comment || null,
    });
    setRatingModal(null);
    setSubmittingRating(false);
    updateStore();
  };

  // Section 1: My Bids — scan all auctions for bids by this collector's email
  const myBidAuctions = store.auctions
    .filter((a) => {
      if (a.removed) return false;
      const bids = store.bids[a.id] || [];
      return bids.some((b) => b.email === meCollector.email);
    })
    .map((a) => {
      const bids = store.bids[a.id] || [];
      const myBids = bids.filter((b) => b.email === meCollector.email);
      const myTop = Math.max(...myBids.map((b) => b.amount));
      const allSorted = [...bids].sort((x, y) => y.amount - x.amount);
      const topBid = allSorted[0] || null;
      const status = getStatus(a);
      let badgeLabel = "", badgeCls = "";
      if (status === "live" || status === "paused") {
        if (topBid && topBid.email === meCollector.email) { badgeLabel = "Winning"; badgeCls = "bid-badge-winning"; }
        else { badgeLabel = "Outbid"; badgeCls = "bid-badge-outbid"; }
      } else if (status === "ended") {
        if (topBid && topBid.email === meCollector.email) { badgeLabel = "Won"; badgeCls = "bid-badge-won"; }
        else { badgeLabel = "Lost"; badgeCls = "bid-badge-lost"; }
      }
      return { auction: a, myTop, topBid, status, badgeLabel, badgeCls };
    })
    .sort((a, b) => {
      const order = { live:0, paused:1, ended:2, removed:3 };
      return (order[a.status] ?? 3) - (order[b.status] ?? 3);
    });

  // Section 2: Artworks I've Ooh'd (from localStorage Set, cross-referenced against store)
  const oohedSet = getOohedSet();
  const oohedAuctions = store.auctions
    .filter((a) => !a.removed && a.published && oohedSet.has(a.id))
    .sort((a, b) => {
      const sa = getStatus(a) === "live" ? 0 : 1;
      const sb = getStatus(b) === "live" ? 0 : 1;
      if (sa !== sb) return sa - sb;
      return (store.oohs[b.id] || 0) - (store.oohs[a.id] || 0);
    });

  // Section 3: Artists I Follow
  const following = store.collectors?.[meCollector.id]?.following || [];
  const followedArtists = following
    .map((id) => store.artists[id])
    .filter(Boolean)
    .map((artist) => ({
      artist,
      liveAuctions: store.auctions.filter(
        (a) => a.artistId === artist.id && !a.removed && a.published && getStatus(a) === "live"
      ),
    }));

  return (
    <div className="collector-dashboard">
      <div style={{ marginBottom:"2.5rem" }}>
        <div className="dash-greeting"><span className="dash-greeting-avatar"><AvatarImg avatar={meCollector.avatar} alt={meCollector.name} /></span> <em style={{ fontStyle:"normal", background:"var(--grad-cool)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>{meCollector.name}</em>'s Collection</div>
        <div className="dash-subtitle">{meCollector.email} · Collector</div>
      </div>

      {/* My Bids */}
      <div className="cdash-section">
        <div className="cdash-section-title">🏷️ My Bids</div>
        {myBidAuctions.length === 0 ? (
          <p style={{ color:"var(--mist)", fontSize:"0.88rem" }}>You haven't placed any bids yet. <button className="btn-follow-hint" onClick={() => onNavigate("home")}>Browse live drops <i className="fa-solid fa-arrow-right"></i></button></p>
        ) : (
          <div className="cdash-bid-list">
            {myBidAuctions.map(({ auction, myTop, topBid, badgeLabel, badgeCls }) => {
              const summary = store.bidSummaries[auction.id] || { count: 0, topAmount: 0 };
              const currentTop = topBid ? topBid.amount : auction.startingPrice;
              return (
                <div key={auction.id} className="cdash-bid-card" onClick={() => onNavigate("auction", auction.id)}>
                  <div className="cdash-bid-thumb">
                    {auction.imageUrl ? <img src={auction.imageUrl} alt="" /> : (auction.emoji || "🎨")}
                  </div>
                  <div className="cdash-bid-info">
                    <div className="cdash-bid-title">{auction.title}</div>
                    <div className="cdash-bid-meta">by {auction.artistName} · {summary.count} bid{summary.count !== 1 ? "s" : ""} · Top: {fmt$(currentTop)}</div>
                  </div>
                  <div className="cdash-bid-status">
                    {badgeLabel && <span className={`bid-badge ${badgeCls}`}>{badgeLabel}</span>}
                    <span style={{ fontSize:"0.75rem", color:"var(--mist)" }}>Your bid: {fmt$(myTop)}</span>
                    {badgeLabel === "Won" && !store.ratings?.byAuction?.[auction.id]?.collectorRated && (
                      <button className="btn btn-ghost btn-sm rate-btn"
                        style={{ color:"var(--gold-dark)", borderColor:"rgba(212,175,55,0.4)" }}
                        onClick={e => { e.stopPropagation(); setRatingModal({
                          auctionId: auction.id,
                          artistName: auction.artistName,
                          rateeId:    auction.artistId,
                        }); }}>
                        ★ Rate Artist
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Artworks I've Ooh'd */}
      <div className="cdash-section">
        <div className="cdash-section-title">✨ Artworks I've Ooh'd</div>
        {oohedAuctions.length === 0 ? (
          <p style={{ color:"var(--mist)", fontSize:"0.88rem" }}>Tap ✦ Ooh on any artwork to save it here.</p>
        ) : (
          <div className="cdash-ooh-grid">
            {oohedAuctions.map((auction) => (
              <div key={auction.id} className="cdash-ooh-card" onClick={() => onNavigate("auction", auction.id)}>
                <div className="cdash-ooh-thumb">
                  {auction.imageUrl ? <img src={auction.imageUrl} alt={auction.title} /> : (auction.emoji || "🎨")}
                </div>
                <div className="cdash-ooh-body">
                  <div className="cdash-ooh-title">{auction.title}</div>
                  <div className="cdash-ooh-count">✨ {store.oohs?.[auction.id] || 0} Ooh{(store.oohs?.[auction.id] || 0) !== 1 ? "s" : ""}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Artists I Follow */}
      <div className="cdash-section">
        <div className="cdash-section-title">✦ Artists I Follow</div>
        {followedArtists.length === 0 ? (
          <p style={{ color:"var(--mist)", fontSize:"0.88rem" }}>Visit an artist's profile and click Follow to see them here.</p>
        ) : (
          <div className="cdash-following-list">
            {followedArtists.map(({ artist, liveAuctions }) => (
              <div key={artist.id} className="cdash-artist-row" onClick={() => onNavigate("artist", artist.id)}>
                <div className="cdash-artist-avatar"><AvatarImg avatar={artist.avatar} alt={artist.name} /></div>
                <div className="cdash-artist-info">
                  <div className="cdash-artist-name">{artist.name}</div>
                  <div className="cdash-artist-meta">{liveAuctions.length > 0 ? `${liveAuctions.length} live drop${liveAuctions.length !== 1 ? "s" : ""}` : "No live drops right now"}</div>
                  {liveAuctions.length > 0 && <div className="cdash-artist-auctions">{liveAuctions.map((a) => a.title).join(" · ")}</div>}
                </div>
                <div style={{ fontSize:"0.8rem", color:"var(--mist)" }}><i className="fa-solid fa-arrow-right"></i></div>
              </div>
            ))}
          </div>
        )}
      </div>
      {ratingModal && <RatingModal title="Rate this Artist" subtitle={ratingModal.artistName}
        onSubmit={submitCollectorRating} onClose={() => setRatingModal(null)} busy={submittingRating} />}
    </div>
  );
};

export default CollectorDashboardPage;
