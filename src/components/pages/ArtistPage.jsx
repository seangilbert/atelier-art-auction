import { useState } from "react";
import { supabase } from "../../supabase.js";
import { getStatus, fmt$ } from "../../utils/helpers.js";
import AvatarImg from "../ui/AvatarImg.jsx";
import { CardTimer } from "../ui/Countdown.jsx";

const StarDisplay = ({ score }) => {
  const s = Math.round(score);
  return (
    <span style={{ color: "#e8526a", letterSpacing: "0.05em", fontSize: "1rem" }}>
      {"★".repeat(s)}{"☆".repeat(5 - s)}
    </span>
  );
};

const ArtistPage = ({ artistId, onNavigate, store, updateStore, me, meCollector }) => {
  const [tab, setTab] = useState("drops");

  const artist = store.artists[artistId];
  if (!artist) return (
    <div className="page-container" style={{ textAlign:"center", paddingTop:"6rem" }}>
      <div style={{ fontSize:"3rem", marginBottom:"1rem" }}>🔍</div>
      <h2 style={{ marginBottom:"0.75rem" }}>Artist Not Found</h2>
      <button className="btn btn-primary" onClick={() => onNavigate("home")}>Back to Home</button>
    </div>
  );

  const isOwnProfile = me?.id === artistId;
  const following = meCollector ? (store.collectors?.[meCollector.id]?.following || []) : [];
  const isFollowing = following.includes(artistId);

  const toggleFollow = async () => {
    if (!meCollector) { onNavigate("collector-signup"); return; }
    const currentFollowing = store.collectors?.[meCollector.id]?.following || [];
    const idx = currentFollowing.indexOf(artistId);
    const newFollowing = idx === -1
      ? [...currentFollowing, artistId]
      : currentFollowing.filter((_, i) => i !== idx);
    await supabase.from("profiles").update({ following: newFollowing }).eq("id", meCollector.id);
    updateStore();
  };

  const auctions = store.auctions.filter(
    (a) => a.artistId === artistId && !a.removed && a.published
  );
  const live  = auctions.filter((a) => getStatus(a) === "live");
  const ended = auctions.filter((a) => getStatus(a) === "ended");
  const sorted = [...live, ...ended];

  const soldAuctions = ended
    .filter((a) => (store.bidSummaries[a.id]?.topAmount || 0) > 0)
    .sort((a, b) => new Date(b.endDate) - new Date(a.endDate));

  const followerCount  = Object.values(store.collectors || {}).filter(c => (c.following || []).includes(artistId)).length;
  const followingCount = (artist.following || []).length;
  const dropsCount     = auctions.length;
  const artistRatings  = (store.ratings?.byRatee?.[artistId] || []).filter(r => r.raterType === "collector");
  const avgRating      = artistRatings.length
    ? (artistRatings.reduce((s, r) => s + r.score, 0) / artistRatings.length).toFixed(1)
    : null;
  const totalRevenue   = soldAuctions.reduce((sum, a) => sum + (store.bidSummaries[a.id]?.topAmount || 0), 0);

  const galleryItems = Object.values(store.gallery || {}).filter(g => g.artistId === artistId);

  const tabs = [
    { key: "drops",   label: "Drops",      count: sorted.length },
    { key: "sold",    label: "Sold Works",  count: soldAuctions.length },
    ...(artistRatings.length > 0 ? [{ key: "reviews", label: "Reviews", count: artistRatings.length }] : []),
    ...(galleryItems.length > 0  ? [{ key: "gallery", label: "Gallery", count: galleryItems.length  }] : []),
  ];

  return (
    <div className="artist-page">
      <button className="btn btn-ghost btn-sm" style={{ marginBottom:"1.5rem" }} onClick={() => onNavigate("home")}>
        <i className="fa-solid fa-arrow-left"></i> Back
      </button>

      <div className="artist-profile-card">
        <div className="artist-profile-avatar"><AvatarImg avatar={artist.avatar} alt={artist.name} /></div>
        <div className="artist-profile-info">
          <div className="artist-profile-name">{artist.name}</div>
          <div className="artist-profile-since">Member since {new Date(artist.createdAt).toLocaleDateString("en-US", { month:"long", year:"numeric" })}</div>
          {artist.bio && <div className="artist-profile-bio">{artist.bio}</div>}
          <div className="artist-profile-stats">
            <div className="artist-profile-stat">
              <span className="artist-profile-stat-num">{followerCount}</span>
              <span className="artist-profile-stat-label">Followers</span>
            </div>
            <div className="artist-profile-stat">
              <span className="artist-profile-stat-num">{followingCount}</span>
              <span className="artist-profile-stat-label">Following</span>
            </div>
            <div className="artist-profile-stat">
              <span className="artist-profile-stat-num">{dropsCount}</span>
              <span className="artist-profile-stat-label">{dropsCount === 1 ? "Drop" : "Drops"}</span>
            </div>
            <div className="artist-profile-stat">
              <span className="artist-profile-stat-num">{soldAuctions.length}</span>
              <span className="artist-profile-stat-label">Sold</span>
            </div>
            <div className="artist-profile-stat">
              <span className="artist-profile-stat-num">{avgRating ? `★ ${avgRating}` : "—"}</span>
              <span className="artist-profile-stat-label">Rating</span>
            </div>
          </div>
        </div>
        <div className="artist-follow-wrap">
          {isOwnProfile && totalRevenue > 0 && (
            <div style={{ textAlign:"center", marginBottom:"0.75rem" }}>
              <div style={{ fontSize:"0.7rem", color:"var(--mist)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:"0.2rem" }}>Total Revenue</div>
              <div style={{ fontSize:"1.4rem", fontWeight:700, color:"var(--rose)" }}>{fmt$(totalRevenue)}</div>
            </div>
          )}
          {!isOwnProfile && !meCollector && !me && (
            <button className="btn-follow-hint" onClick={toggleFollow}>Sign in to follow</button>
          )}
          {!isOwnProfile && meCollector && !isFollowing && (
            <button className="btn btn-primary btn-sm" onClick={toggleFollow}>✦ Follow</button>
          )}
          {!isOwnProfile && meCollector && isFollowing && (
            <button className="btn btn-outline btn-sm" onClick={toggleFollow}><i className="fa-solid fa-check"></i> Following</button>
          )}
        </div>
      </div>

      {/* Tab navigation */}
      <div className="img-picker-tabs" style={{ marginBottom:"1.5rem" }}>
        {tabs.map(t => (
          <button
            key={t.key}
            className={`btn btn-sm ${tab === t.key ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
            {t.count > 0 && <span style={{ opacity:0.6, marginLeft:"0.25em" }}>({t.count})</span>}
          </button>
        ))}
      </div>

      {/* ── Drops tab ─────────────────────────────────────────────────────────── */}
      {tab === "drops" && (
        sorted.length === 0 ? (
          <div className="empty-state"><h3>No drops yet</h3><p>This artist hasn't listed any artwork yet.</p></div>
        ) : (
          <div className="auction-grid">
            {sorted.map((auction) => {
              const summary = store.bidSummaries[auction.id] || { count: 0, topAmount: 0 };
              const topBidAmt = summary.topAmount || auction.startingPrice;
              const status = getStatus(auction);
              return (
                <div key={auction.id} className={`auction-card${status === "paused" ? " is-paused" : ""}`} onClick={() => onNavigate("auction", auction.id)}>
                  <div className="card-image">
                    {auction.imageUrl ? <img src={auction.imageUrl} alt={auction.title} /> : <span>{auction.emoji || "🎨"}</span>}
                    {status === "live"   && <div className="badge badge-live"><div className="pulse" style={{ background:"white" }} /> Live</div>}
                    {status === "paused" && <div className="badge badge-paused"><i className="fa-solid fa-pause"></i> Paused</div>}
                    {status === "ended"  && <div className="badge badge-ended">Ended</div>}
                  </div>
                  <div className="card-body">
                    <div className="card-title">{auction.title}</div>
                    <div className="card-meta">
                      <div>
                        <div className="card-price-label">{summary.count ? "Current Bid" : "Starting at"}</div>
                        <div className="card-price">{fmt$(topBidAmt)}</div>
                      </div>
                      {status === "live" && <div><div className="card-timer-label">Closes</div><div className="card-timer-val"><CardTimer endDate={auction.endDate} /></div></div>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* ── Sold Works tab ────────────────────────────────────────────────────── */}
      {tab === "sold" && (
        soldAuctions.length === 0 ? (
          <div className="empty-state"><h3>No sold works yet</h3><p>Completed sales will appear here.</p></div>
        ) : (
          <div className="auction-grid">
            {soldAuctions.map((auction) => {
              const summary = store.bidSummaries[auction.id] || { count: 0, topAmount: 0 };
              return (
                <div key={auction.id} className="auction-card" onClick={() => onNavigate("auction", auction.id)}>
                  <div className="card-image">
                    {auction.imageUrl ? <img src={auction.imageUrl} alt={auction.title} /> : <span>{auction.emoji || "🎨"}</span>}
                    <div className="badge badge-ended">Sold</div>
                  </div>
                  <div className="card-body">
                    <div className="card-title">{auction.title}</div>
                    <div className="card-meta">
                      <div>
                        <div className="card-price-label">Winning Bid</div>
                        <div className="card-price">{fmt$(summary.topAmount)}</div>
                      </div>
                      <div style={{ textAlign:"right" }}>
                        <div className="card-price-label">Sold</div>
                        <div style={{ fontSize:"0.8rem", color:"var(--mist)" }}>
                          {new Date(auction.endDate).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* ── Reviews tab ───────────────────────────────────────────────────────── */}
      {tab === "reviews" && (
        artistRatings.length === 0 ? (
          <div className="empty-state"><h3>No reviews yet</h3><p>Reviews from buyers will appear here.</p></div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
            {[...artistRatings].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((r) => {
              const relatedAuction = store.auctions.find(a => a.id === r.auctionId);
              return (
                <div key={r.id} style={{ background:"var(--surface, #fff)", border:"1px solid var(--border, #e2e8f0)", borderRadius:"14px", padding:"1.25rem 1.5rem" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"0.4rem" }}>
                    <StarDisplay score={r.score} />
                    <span style={{ fontSize:"0.78rem", color:"var(--mist)" }}>
                      {new Date(r.createdAt).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" })}
                    </span>
                  </div>
                  {r.comment && (
                    <p style={{ margin:"0.4rem 0 0", fontSize:"0.92rem", color:"var(--text-secondary, #4a5568)", lineHeight:1.55 }}>
                      {r.comment}
                    </p>
                  )}
                  {relatedAuction && (
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ marginTop:"0.75rem", fontSize:"0.78rem", padding:"0.25rem 0.6rem" }}
                      onClick={() => onNavigate("auction", relatedAuction.id)}
                    >
                      <i className="fa-solid fa-arrow-right"></i> {relatedAuction.title}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )
      )}

      {/* ── Gallery tab ───────────────────────────────────────────────────────── */}
      {tab === "gallery" && (
        galleryItems.length === 0 ? (
          <div className="empty-state"><h3>No gallery items yet</h3></div>
        ) : (
          <div className="gallery-grid">
            {galleryItems.map(item => {
              const linkedDrops = store.auctions.filter(a => a.galleryItemId === item.id && !a.removed);
              const liveDrops = linkedDrops.filter(a => getStatus(a) === "live");
              return (
                <div key={item.id} className="gallery-card">
                  <div className="gallery-card-image">
                    {item.imageUrl ? <img src={item.imageUrl} alt={item.title} /> : <span>{item.emoji}</span>}
                    {liveDrops.length > 0 && <div className="badge badge-live"><div className="pulse" style={{ background:"white" }} /> Live</div>}
                  </div>
                  <div className="gallery-card-body">
                    <div className="gallery-card-title">{item.title}</div>
                    {item.medium && <div className="gallery-card-meta">{item.medium}</div>}
                    {liveDrops.length > 0 && (
                      <div className="gallery-card-actions">
                        <button className="btn btn-primary btn-sm" onClick={() => onNavigate("auction", liveDrops[0].id)}>
                          View Live Drop <i className="fa-solid fa-arrow-right"></i>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
};

export default ArtistPage;
