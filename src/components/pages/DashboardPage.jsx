import { useState } from "react";
import { supabase } from "../../supabase.js";
import { getStatus, fmt$, fmtDate } from "../../utils/helpers.js";
import AvatarImg from "../ui/AvatarImg.jsx";
import StatusPill from "../ui/StatusPill.jsx";
import ConfirmModal from "../ui/ConfirmModal.jsx";
import { RatingModal } from "../ui/StarPicker.jsx";

const DashboardPage = ({ artist, onNavigate, store, updateStore }) => {
  const my = store.auctions.filter((a) => a.artistId === artist.id && !a.removed);
  const [confirm, setConfirm] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [markingPaid, setMarkingPaid] = useState(null);
  const [markingShipped, setMarkingShipped] = useState(null);
  const [trackingInput, setTrackingInput] = useState({});
  const [ratingModal, setRatingModal]          = useState(null); // { auctionId, buyerName, rateeId }
  const [submittingRating, setSubmittingRating] = useState(false);

  const markPaid = async (auctionId) => {
    setMarkingPaid(auctionId);
    await supabase.from("payments").update({ paid_at: new Date().toISOString() }).eq("auction_id", auctionId);
    updateStore();
    setMarkingPaid(null);
  };

  const markShipped = async (auctionId) => {
    setMarkingShipped(auctionId);
    await supabase.from("payments")
      .update({ shipped_at: new Date().toISOString(), tracking: trackingInput[auctionId] || "" })
      .eq("auction_id", auctionId);
    updateStore();
    setMarkingShipped(null);
  };

  const submitArtistRating = async (score, comment) => {
    if (!ratingModal) return;
    setSubmittingRating(true);
    await supabase.from("ratings").insert({
      auction_id: ratingModal.auctionId,
      rater_id:   artist.id,
      ratee_id:   ratingModal.rateeId || null,
      rater_type: "artist",
      score,
      comment: comment || null,
    });
    setRatingModal(null);
    setSubmittingRating(false);
    updateStore();
  };

  const pendingPayments = my
    .filter((a) => {
      if (getStatus(a) !== "ended") return false;
      const payment = store.payments?.[a.id];
      return payment?.submitted && !payment?.shippedAt;
    })
    .map((a) => {
      const summary = store.bidSummaries[a.id] || { count: 0, topAmount: 0 };
      const topBid = summary.topAmount ? { amount: summary.topAmount } : null;
      const payment = store.payments[a.id];
      return { auction: a, topBid, payment };
    });

  const stats = {
    total: my.length,
    live: my.filter((a) => getStatus(a) === "live").length,
    ended: my.filter((a) => getStatus(a) === "ended").length,
    revenue: my.filter((a) => getStatus(a) === "ended").reduce((sum, a) => {
      return sum + (store.bidSummaries[a.id]?.topAmount || 0);
    }, 0),
  };

  const followerCount  = Object.values(store.collectors || {}).filter(c => (c.following || []).includes(artist.id)).length;
  const followingCount = (artist.following || []).length;
  const dropsCount     = my.filter(a => a.published).length;
  const myRatings      = (store.ratings?.byRatee?.[artist.id] || []).filter(r => r.raterType === 'collector');
  const avgRating      = myRatings.length ? (myRatings.reduce((s, r) => s + r.score, 0) / myRatings.length).toFixed(1) : null;

  const act = async (type, id) => {
    const auction = store.auctions.find((a) => a.id === id);
    if (!auction) { setConfirm(null); return; }
    if (type === "pause") {
      const remainingMs = Math.max(0, new Date(auction.endDate) - Date.now());
      await supabase.from("auctions").update({ paused: true, remaining_ms: remainingMs }).eq("id", id);
    } else if (type === "resume") {
      const endDate = new Date(Date.now() + (auction.remainingMs || 86400000)).toISOString();
      await supabase.from("auctions").update({ paused: false, end_date: endDate, remaining_ms: null }).eq("id", id);
    } else if (type === "end") {
      await supabase.from("auctions").update({ end_date: new Date(Date.now() - 1000).toISOString(), paused: false }).eq("id", id);
    } else if (type === "remove") {
      await supabase.from("auctions").update({ removed: true }).eq("id", id);
    }
    setConfirm(null);
    updateStore(); // refresh
  };

  const confirmCfg = {
    pause:  { title: "Pause Drop",     message: "Bidding is suspended until you resume.",                    confirmLabel: "Pause",      confirmClass: "btn-warning" },
    resume: { title: "Resume Drop",    message: "The drop will go live again with the remaining time restored.", confirmLabel: "Resume",     confirmClass: "btn-success" },
    end:    { title: "End Drop Early", message: "The highest bidder wins now. This cannot be undone.",       confirmLabel: "End Now",    confirmClass: "btn-danger" },
    remove: { title: "Remove Listing", message: "This hides the listing permanently.",                       confirmLabel: "Remove",     confirmClass: "btn-danger" },
  };

  return (
    <div className="dashboard">
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "2.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div className="dash-greeting"><span className="dash-greeting-avatar"><AvatarImg avatar={artist.avatar} alt={artist.name} /></span> <em>{artist.name}</em>'s Studio</div>
          <div className="dash-subtitle">{artist.email} · Member since {new Date(artist.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</div>
          <div className="artist-profile-stats" style={{ marginTop:"0.75rem" }}>
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
        <button className="btn btn-primary" onClick={() => onNavigate("create")}>+ New Drop</button>
      </div>

      <div className="dash-stats">
        {[
          { v: stats.total,   label: "Total Drops" },
          { v: stats.live,    label: "Live Now",       cls: "c-rouge" },
          { v: stats.ended,   label: "Completed" },
          { v: stats.revenue ? fmt$(stats.revenue) : "—", label: "Total Revenue", cls: "c-gold" },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <div className={`stat-value ${s.cls || ""}`}>{s.v}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {pendingPayments.length > 0 && (
        <div style={{ marginBottom: "2.5rem" }}>
          <div className="dash-section-title">📦 Pending Payments</div>
          {pendingPayments.map(({ auction, topBid, payment }) => (
            <div key={auction.id} className="pending-payment-card">
              <div className="pending-payment-header">
                <div className="pending-payment-thumb">
                  {auction.imageUrl ? <img src={auction.imageUrl} alt="" /> : (auction.emoji || "🎨")}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="pending-payment-title">{auction.title}</div>
                  <div className="pending-payment-winner">
                    Winner: <strong>{payment.sh?.name}</strong>
                    {payment.sh?.email && <> · <a href={`mailto:${payment.sh.email}`} style={{ color: "var(--gold-dark)" }}>{payment.sh.email}</a></>}
                  </div>
                  <div className="pending-payment-winner" style={{ marginTop: "0.15rem" }}>
                    Payment: <strong>{payment.selPay}</strong>
                    {" · "}Submitted {new Date(payment.submittedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </div>
                </div>
                <div className="pending-payment-amount">{topBid ? fmt$(topBid.amount) : "—"}</div>
              </div>

              <div className="pending-payment-details">
                <strong>Ship to:</strong><br />
                {payment.sh?.name}<br />
                {payment.sh?.address}<br />
                {payment.sh?.city}{payment.sh?.state ? `, ${payment.sh.state}` : ""} {payment.sh?.zip}<br />
                {payment.sh?.country}
                {payment.sh?.notes && <><br /><em>Note: {payment.sh.notes}</em></>}
              </div>

              <div className="pending-payment-actions">
                {payment.paidAt ? (
                  <span className="status-badge-paid"><i className="fa-solid fa-check"></i> Paid {new Date(payment.paidAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                ) : (
                  <button
                    className="btn btn-success btn-sm"
                    disabled={markingPaid === auction.id}
                    onClick={() => markPaid(auction.id)}
                  >
                    {markingPaid === auction.id ? "Marking…" : <><i className="fa-solid fa-check"></i> Mark Paid</>}
                  </button>
                )}
                <input
                  className="tracking-input"
                  placeholder="Tracking number (optional)"
                  value={trackingInput[auction.id] ?? payment.tracking ?? ""}
                  onChange={(e) => setTrackingInput((prev) => ({ ...prev, [auction.id]: e.target.value }))}
                />
                <button
                  className="btn btn-primary btn-sm"
                  disabled={markingShipped === auction.id}
                  onClick={() => markShipped(auction.id)}
                >
                  {markingShipped === auction.id ? "Marking…" : <><i className="fa-solid fa-box"></i> Mark Shipped</>}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Gallery ─────────────────────────────────────────────────────── */}
      {(() => {
        const myGallery = Object.values(store.gallery || {})
          .filter(g => g.artistId === artist.id)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        const dropsForItem = (itemId) => store.auctions
          .filter(a => a.galleryItemId === itemId && !a.removed)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        const toggleGalleryPublic = async () => {
          const newVal = !artist.galleryPublic;
          await supabase.from("profiles").update({ gallery_public: newVal }).eq("id", artist.id);
          updateStore();
        };

        return (
          <div style={{ marginBottom:"2.5rem" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1rem", flexWrap:"wrap", gap:"0.75rem" }}>
              <div className="dash-section-title" style={{ marginBottom:0 }}>
                <i className="fa-solid fa-images"></i> Gallery
              </div>
              <div style={{ display:"flex", gap:"0.5rem", alignItems:"center", flexWrap:"wrap" }}>
                <span style={{ fontSize:"0.8rem", color:"var(--mist)" }}>
                  {artist.galleryPublic ? "Public" : "Private"}
                </span>
                <button className="btn btn-ghost btn-sm" onClick={toggleGalleryPublic}>
                  <i className={`fa-solid ${artist.galleryPublic ? "fa-eye-slash" : "fa-eye"}`}></i>
                  {artist.galleryPublic ? " Make Private" : " Make Public"}
                </button>
                <button className="btn btn-primary btn-sm" onClick={() => onNavigate("add-artwork")}>
                  <i className="fa-solid fa-plus"></i> Add Artwork
                </button>
              </div>
            </div>

            {myGallery.length === 0 ? (
              <div className="empty-state" style={{ padding:"2rem" }}>
                <p>Add artworks to your gallery to prepare drops and keep track of your pieces.</p>
                <button className="btn btn-primary" style={{ marginTop:"1rem" }} onClick={() => onNavigate("add-artwork")}>
                  <i className="fa-solid fa-plus"></i> Add Artwork
                </button>
              </div>
            ) : (
              <div className="gallery-grid">
                {myGallery.map(item => {
                  const drops = dropsForItem(item.id);
                  const liveDrops = drops.filter(a => getStatus(a) === "live" || getStatus(a) === "paused");
                  const isLive = liveDrops.length > 0;
                  return (
                    <div key={item.id} className="gallery-card">
                      <div className="gallery-card-image" onClick={() => onNavigate("edit-artwork", item.id)}>
                        {item.imageUrl ? <img src={item.imageUrl} alt={item.title} /> : <span>{item.emoji}</span>}
                        {isLive && <div className="badge badge-live"><div className="pulse" style={{ background:"white" }} /> Live</div>}
                      </div>
                      <div className="gallery-card-body">
                        <div className="gallery-card-title">{item.title}</div>
                        {item.medium && <div className="gallery-card-meta">{item.medium}</div>}
                        {drops.length > 0 && (
                          <div className="gallery-drop-history">
                            {drops.slice(0, 2).map(a => {
                              const st = getStatus(a);
                              const summary = store.bidSummaries[a.id] || {};
                              return (
                                <div key={a.id} className="gallery-drop-row" onClick={() => onNavigate("auction", a.id)}>
                                  <StatusPill status={st} />
                                  <span style={{ fontSize:"0.78rem", color:"var(--slate)" }}>
                                    {summary.topAmount ? fmt$(summary.topAmount) : "No bids"}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        <div className="gallery-card-actions">
                          {isLive ? (
                            <button className="btn btn-ghost btn-sm" onClick={() => onNavigate("auction", liveDrops[0].id)}>
                              View Drop <i className="fa-solid fa-arrow-right"></i>
                            </button>
                          ) : (
                            <button className="btn btn-primary btn-sm" onClick={() => onNavigate("create", item.id)}>
                              <i className="fa-solid fa-rocket"></i> Launch Drop
                            </button>
                          )}
                          <button className="btn btn-ghost btn-sm" onClick={() => onNavigate("edit-artwork", item.id)}>
                            Edit
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}

      <div className="dash-section-title">My Drops</div>

      {my.length === 0 ? (
        <div className="empty-state">
          <h3>No drops yet</h3>
          <p style={{ marginBottom: "1.5rem" }}>Create your first listing to start selling your art.</p>
          <button className="btn btn-primary" onClick={() => onNavigate("create")}>Create Drop</button>
        </div>
      ) : (
        <div className="auction-mgmt-list">
          {my.map((auction) => {
            const status = getStatus(auction);
            const summary = store.bidSummaries[auction.id] || { count: 0, topAmount: 0 };
            const topBid = summary.topAmount || null;
            return (
              <div key={auction.id} className={`mgmt-card st-${status}`}>
                <div className="mgmt-thumb">{auction.imageUrl ? <img src={auction.imageUrl} alt="" /> : (auction.emoji || "🎨")}</div>
                <div className="mgmt-info">
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap", marginBottom: "0.2rem" }}>
                    <div className="mgmt-title">{auction.title}</div>
                    <StatusPill status={status} />
                  </div>
                  <div className="mgmt-meta">
                    {topBid ? `Top bid: ${fmt$(topBid)}` : `Starting: ${fmt$(auction.startingPrice)}`}
                    {" · "}{summary.count} bid{summary.count !== 1 ? "s" : ""}
                    {status === "live" && <> · Ends {fmtDate(auction.endDate)}</>}
                    {status === "ended" && <> · Ended {fmtDate(auction.endDate)}</>}
                    {status === "paused" && <> · Paused</>}
                  </div>
                </div>
                <div className="mgmt-actions">
                  <button className="btn btn-ghost btn-sm" onClick={() => {
                    const url = `${window.location.origin}${window.location.pathname}#auction-${auction.id}`;
                    navigator.clipboard.writeText(url).then(() => { setCopiedId(auction.id); setTimeout(() => setCopiedId(null), 2500); });
                  }}>{copiedId === auction.id ? <><i className="fa-solid fa-check"></i> Copied!</> : <><i className="fa-solid fa-link"></i> Copy Link</>}</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => onNavigate("auction", auction.id)}>View</button>
                  {(status === "live" || status === "paused") && (
                    <button className="btn btn-ghost btn-sm" onClick={() => onNavigate("edit", auction.id)}>Edit</button>
                  )}
                  {status === "live" && (
                    <><button className="btn btn-warning btn-sm" onClick={() => setConfirm({ type: "pause", id: auction.id })}><i className="fa-solid fa-pause"></i> Pause</button><button className="btn btn-danger btn-sm" onClick={() => setConfirm({ type: "end", id: auction.id })}>End</button></>
                  )}
                  {status === "paused" && (
                    <><button className="btn btn-success btn-sm" onClick={() => setConfirm({ type: "resume", id: auction.id })}><i className="fa-solid fa-play"></i> Resume</button><button className="btn btn-danger btn-sm" onClick={() => setConfirm({ type: "end", id: auction.id })}>End</button></>
                  )}
                  {status === "ended" && store.payments[auction.id]?.submitted
                    && !store.ratings?.byAuction?.[auction.id]?.artistRated && (() => {
                    const payment = store.payments[auction.id];
                    const winner  = Object.values(store.collectors).find(c => c.email === payment?.sh?.email);
                    return (
                      <button className="btn btn-ghost btn-sm rate-btn"
                        style={{ color:"var(--gold-dark)", borderColor:"rgba(212,175,55,0.4)" }}
                        onClick={e => { e.stopPropagation(); setRatingModal({
                          auctionId: auction.id,
                          buyerName: payment.sh?.name || "the buyer",
                          rateeId:   winner?.id || null,
                        }); }}>
                        ★ Rate Buyer
                      </button>
                    );
                  })()}
                  <button className="btn btn-ghost btn-sm" style={{ color: "var(--rouge)", borderColor: "rgba(139,46,46,0.25)" }} onClick={() => setConfirm({ type: "remove", id: auction.id })}>Remove</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {confirm && <ConfirmModal {...confirmCfg[confirm.type]} onConfirm={() => act(confirm.type, confirm.id)} onCancel={() => setConfirm(null)} />}
      {ratingModal && <RatingModal title="Rate this Buyer" subtitle={ratingModal.buyerName}
        onSubmit={submitArtistRating} onClose={() => setRatingModal(null)} busy={submittingRating} />}

      {/* My Bids — auctions the artist has bid on as a bidder */}
      {(() => {
        const myBidAuctions = store.auctions
          .filter((a) => {
            if (a.removed) return false;
            const bids = store.bids[a.id] || [];
            return bids.some((b) => b.email === artist.email);
          })
          .map((a) => {
            const bids = store.bids[a.id] || [];
            const myBids = bids.filter((b) => b.email === artist.email);
            const myTop = Math.max(...myBids.map((b) => b.amount));
            const allSorted = [...bids].sort((x, y) => y.amount - x.amount);
            const topBid = allSorted[0] || null;
            const status = getStatus(a);
            let badgeLabel = "", badgeCls = "";
            if (status === "live" || status === "paused") {
              if (topBid && topBid.email === artist.email) { badgeLabel = "Winning"; badgeCls = "bid-badge-winning"; }
              else { badgeLabel = "Outbid"; badgeCls = "bid-badge-outbid"; }
            } else if (status === "ended") {
              if (topBid && topBid.email === artist.email) { badgeLabel = "Won"; badgeCls = "bid-badge-won"; }
              else { badgeLabel = "Lost"; badgeCls = "bid-badge-lost"; }
            }
            return { auction: a, myTop, topBid, status, badgeLabel, badgeCls };
          })
          .sort((a, b) => {
            const order = { live:0, paused:1, ended:2, removed:3 };
            return (order[a.status] ?? 3) - (order[b.status] ?? 3);
          });

        if (myBidAuctions.length === 0) return null;

        return (
          <div style={{ marginTop: "3rem" }}>
            <div className="dash-section-title">🏷️ My Bids</div>
            <div className="cdash-bid-list">
              {myBidAuctions.map(({ auction, myTop, topBid, badgeLabel, badgeCls }) => {
                const bidSummary = store.bidSummaries[auction.id] || { count: 0, topAmount: 0 };
                const currentTop = topBid ? topBid.amount : auction.startingPrice;
                return (
                  <div key={auction.id} className="cdash-bid-card" onClick={() => onNavigate("auction", auction.id)}>
                    <div className="cdash-bid-thumb">
                      {auction.imageUrl ? <img src={auction.imageUrl} alt="" /> : (auction.emoji || "🎨")}
                    </div>
                    <div className="cdash-bid-info">
                      <div className="cdash-bid-title">{auction.title}</div>
                      <div className="cdash-bid-meta">by {auction.artistName} · {bidSummary.count} bid{bidSummary.count !== 1 ? "s" : ""} · Top: {fmt$(currentTop)}</div>
                    </div>
                    <div className="cdash-bid-status">
                      {badgeLabel && <span className={`bid-badge ${badgeCls}`}>{badgeLabel}</span>}
                      <span style={{ fontSize:"0.75rem", color:"var(--mist)" }}>Your bid: {fmt$(myTop)}</span>
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

export default DashboardPage;
