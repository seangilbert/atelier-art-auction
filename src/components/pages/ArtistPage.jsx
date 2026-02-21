import { supabase } from "../../supabase.js";
import { getStatus, fmt$ } from "../../utils/helpers.js";
import AvatarImg from "../ui/AvatarImg.jsx";
import { CardTimer } from "../ui/Countdown.jsx";

const ArtistPage = ({ artistId, onNavigate, store, updateStore, me, meCollector }) => {
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
    updateStore(); // refresh
  };

  const auctions = store.auctions.filter(
    (a) => a.artistId === artistId && !a.removed && a.published
  );
  const live  = auctions.filter((a) => getStatus(a) === "live");
  const ended = auctions.filter((a) => getStatus(a) === "ended");
  const sorted = [...live, ...ended];

  const followerCount  = Object.values(store.collectors || {}).filter(c => (c.following || []).includes(artistId)).length;
  const followingCount = (artist.following || []).length;
  const dropsCount     = auctions.length;
  const artistRatings  = (store.ratings?.byRatee?.[artistId] || []).filter(r => r.raterType === 'collector');
  const avgRating      = artistRatings.length ? (artistRatings.reduce((s, r) => s + r.score, 0) / artistRatings.length).toFixed(1) : null;

  return (
    <div className="artist-page">
      <button className="btn btn-ghost btn-sm" style={{ marginBottom:"1.5rem" }} onClick={() => onNavigate("home")}><i className="fa-solid fa-arrow-left"></i> Back</button>
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
              <span className="artist-profile-stat-num">{avgRating ? `★ ${avgRating}` : "—"}</span>
              <span className="artist-profile-stat-label">Rating</span>
            </div>
          </div>
        </div>
        <div className="artist-follow-wrap">
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
      <div className="dash-section-title" style={{ marginBottom:"1.25rem" }}>
        {live.length > 0 ? `${live.length} Live Drop${live.length !== 1 ? "s" : ""}` : "Drops"}
      </div>
      {sorted.length === 0 ? (
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
                    <div><div className="card-price-label">{summary.count ? "Current Bid" : "Starting at"}</div><div className="card-price">{fmt$(topBidAmt)}</div></div>
                    {status === "live" && <div><div className="card-timer-label">Closes</div><div className="card-timer-val"><CardTimer endDate={auction.endDate} /></div></div>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Public gallery — shown when artist has enabled it */}
      {(() => {
        if (!artist.galleryPublic) return null;
        const galleryItems = Object.values(store.gallery || {}).filter(g => g.artistId === artistId);
        if (galleryItems.length === 0) return null;
        return (
          <div style={{ marginTop:"3rem" }}>
            <div className="dash-section-title" style={{ marginBottom:"1.25rem" }}>
              <i className="fa-solid fa-images"></i> Gallery
            </div>
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
          </div>
        );
      })()}
    </div>
  );
};

export default ArtistPage;
