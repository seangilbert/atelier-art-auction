import { useState, useEffect } from "react";
import { supabase } from "../../supabase.js";
import { getStatus, fmt$ } from "../../utils/helpers.js";
import AvatarImg from "../ui/AvatarImg.jsx";

const CollectorProfilePage = ({ collectorId, meCollector, store, onNavigate }) => {
  const [wonAuctions, setWonAuctions] = useState(null); // null = loading
  const [tab, setTab] = useState("won");

  const collector = store.collectors?.[collectorId];
  const isOwnProfile = meCollector?.id === collectorId;

  useEffect(() => {
    if (!collector) return;
    const email = isOwnProfile ? meCollector?.email : null;
    if (!email) { setWonAuctions([]); return; }

    // Fetch all bids by this collector's email to find wins
    supabase.from("bids").select("auction_id, amount").eq("email", email)
      .then(({ data: myBids }) => {
        if (!myBids?.length) { setWonAuctions([]); return; }
        // Build map of auction_id → max bid amount by this collector
        const myMaxByAuction = {};
        myBids.forEach(b => {
          if (!myMaxByAuction[b.auction_id] || b.amount > myMaxByAuction[b.auction_id]) {
            myMaxByAuction[b.auction_id] = b.amount;
          }
        });
        // Find ended auctions in store where this collector's max === the top bid
        const wins = store.auctions.filter(a => {
          if (!myMaxByAuction[a.id] || getStatus(a) !== "ended") return false;
          const summary = store.bidSummaries[a.id];
          // If summary topAmount matches our max bid, we likely won
          if (summary?.topAmount && summary.topAmount === myMaxByAuction[a.id]) return true;
          // Fall back to loaded bids if available
          const bids = store.bids[a.id] || [];
          if (bids.length > 0) {
            const top = [...bids].sort((x, y) => y.amount - x.amount)[0];
            return top.email === email;
          }
          return false;
        });
        setWonAuctions(wins);
      });
  }, [collectorId, collector?.id, meCollector?.email]);

  if (!collector) return (
    <div className="page-container" style={{ textAlign:"center", paddingTop:"6rem" }}>
      <div style={{ fontSize:"3rem", marginBottom:"1rem" }}><i className="fa-solid fa-magnifying-glass"></i></div>
      <h2 style={{ marginBottom:"0.75rem" }}>Collector Not Found</h2>
      <button className="btn btn-primary" onClick={() => onNavigate("home")}>Back to Home</button>
    </div>
  );

  const following = collector.following || [];
  const followedArtists = following.map(id => store.artists[id]).filter(Boolean);
  const memberSince = new Date(collector.createdAt || Date.now()).toLocaleDateString("en-US", { month:"long", year:"numeric" });

  const tabs = [
    { key:"won",       label:"Won Pieces",      count: wonAuctions?.length ?? null },
    { key:"following", label:"Artists Following", count: followedArtists.length },
  ];

  return (
    <div className="artist-page">
      <button className="btn btn-ghost btn-sm" style={{ marginBottom:"1.5rem" }} onClick={() => onNavigate("home")}>
        <i className="fa-solid fa-arrow-left"></i> Back
      </button>

      {/* Profile card */}
      <div className="artist-profile-card">
        <div className="artist-profile-avatar">
          <AvatarImg avatar={collector.avatar} alt={collector.name} />
        </div>
        <div className="artist-profile-info">
          <div className="artist-profile-name">{collector.name}</div>
          <div className="artist-profile-since">Collector since {memberSince}</div>
          <div className="artist-profile-stats">
            <div className="artist-profile-stat">
              <span className="artist-profile-stat-num">{wonAuctions?.length ?? "—"}</span>
              <span className="artist-profile-stat-label">Won</span>
            </div>
            <div className="artist-profile-stat">
              <span className="artist-profile-stat-num">{followedArtists.length}</span>
              <span className="artist-profile-stat-label">Following</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="img-picker-tabs" style={{ marginBottom:"1.5rem" }}>
        {tabs.map(t => (
          <button key={t.key} className={`btn btn-sm ${tab === t.key ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setTab(t.key)}>
            {t.label}
            {t.count !== null && t.count > 0 && <span style={{ opacity:0.6, marginLeft:"0.25em" }}>({t.count})</span>}
          </button>
        ))}
      </div>

      {/* Won Pieces */}
      {tab === "won" && (
        wonAuctions === null ? (
          <div className="empty-state"><p style={{ color:"var(--mist)" }}>Loading…</p></div>
        ) : !isOwnProfile ? (
          <div className="empty-state">
            <h3>Won pieces are private</h3>
            <p>Only the collector can see their own won pieces.</p>
          </div>
        ) : wonAuctions.length === 0 ? (
          <div className="empty-state">
            <h3>No won pieces yet</h3>
            <p style={{ marginBottom:"1.5rem" }}>Win a drop to see your collection here.</p>
            <button className="btn btn-primary" onClick={() => onNavigate("home")}>Browse drops</button>
          </div>
        ) : (
          <div className="auction-grid">
            {wonAuctions.map(auction => {
              const summary = store.bidSummaries[auction.id] || {};
              return (
                <div key={auction.id} className="auction-card" onClick={() => onNavigate("auction", auction.id)}>
                  <div className="card-image">
                    {auction.imageUrl ? <img src={auction.imageUrl} alt={auction.title} /> : <span>{auction.emoji || "🎨"}</span>}
                    <div className="badge badge-ended" style={{ background:"var(--gold)", color:"var(--ink)" }}><i className="fa-solid fa-trophy"></i> Won</div>
                  </div>
                  <div className="card-body">
                    <div className="card-artist">by {auction.artistName}</div>
                    <div className="card-title">{auction.title}</div>
                    <div className="card-meta">
                      <div><div className="card-price-label">Winning Bid</div><div className="card-price">{fmt$(summary.topAmount || 0)}</div></div>
                      <div style={{ textAlign:"right" }}>
                        <div className="card-price-label">Sold</div>
                        <div style={{ fontSize:"0.8rem", color:"var(--mist)" }}>{new Date(auction.endDate).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" })}</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Following */}
      {tab === "following" && (
        followedArtists.length === 0 ? (
          <div className="empty-state">
            <h3>Not following any artists yet</h3>
            <p style={{ marginBottom:"1.5rem" }}>Browse artist profiles and click Follow.</p>
            <button className="btn btn-primary" onClick={() => onNavigate("home")}>Discover artists</button>
          </div>
        ) : (
          <div className="cdash-following-list">
            {followedArtists.map(artist => {
              const liveDrops = store.auctions.filter(a => a.artistId === artist.id && !a.removed && a.published && getStatus(a) === "live");
              return (
                <div key={artist.id} className="cdash-artist-row" onClick={() => onNavigate("artist", artist.id)}>
                  <div className="cdash-artist-avatar"><AvatarImg avatar={artist.avatar} alt={artist.name} /></div>
                  <div className="cdash-artist-info">
                    <div className="cdash-artist-name">{artist.name}</div>
                    <div className="cdash-artist-meta">{liveDrops.length > 0 ? `${liveDrops.length} live drop${liveDrops.length !== 1 ? "s" : ""}` : "No live drops right now"}</div>
                  </div>
                  <div style={{ fontSize:"0.8rem", color:"var(--mist)" }}><i className="fa-solid fa-arrow-right"></i></div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
};

export default CollectorProfilePage;
