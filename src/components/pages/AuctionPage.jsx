import { useState, useEffect, useRef } from "react";
import { supabase } from "../../supabase.js";
import { getStatus, fmt$, fmtDate, timeAgo, shortName, generateId, REACTION_EMOJIS } from "../../utils/helpers.js";
import { saveBidderIdentity, getOohCount } from "../../utils/storage.js";
import AvatarImg from "../ui/AvatarImg.jsx";
import { Countdown } from "../ui/Countdown.jsx";
import OohButton from "../ui/OohButton.jsx";
import ConfirmModal from "../ui/ConfirmModal.jsx";
import StatusPill from "../ui/StatusPill.jsx";

const AuctionPage = ({ auctionId, onNavigate, store, updateStore, loadAuctionDetail, artist, meCollector, bidderName, setBidderName, bidderEmail, setBidderEmail }) => {
  const auction = store.auctions.find((a) => a.id === auctionId);
  const bids = store.bids[auctionId] || [];
  const currentUserId = artist?.id || meCollector?.id || null;

  // Load full bids + comments + reactions for this auction on mount
  useEffect(() => {
    loadAuctionDetail(auctionId, currentUserId);
  }, [auctionId]);
  const [bidAmt, setBidAmt] = useState("");
  const [localName, setLocalName] = useState(meCollector?.name || bidderName || "");
  const [bidEmail, setBidEmail] = useState(meCollector?.email || bidderEmail || "");
  const [bidMsg, setBidMsg] = useState(null);

  // Keep bid name/email in sync with collector account (in case store loads after mount)
  useEffect(() => {
    if (meCollector?.email) setBidEmail(meCollector.email);
    if (meCollector?.name)  setLocalName(meCollector.name);
  }, [meCollector?.email, meCollector?.name]);
  const [copied, setCopied] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const endedEmailSent = useRef(false);

  // ── Comments state ────────────────────────────────────────────────────────
  const [commentText, setCommentText] = useState("");
  const [commentMsg, setCommentMsg]   = useState(null);
  const [deletingId, setDeletingId]   = useState(null);
  const [reportingId, setReportingId] = useState(null);
  const [reportedIds, setReportedIds] = useState(new Set());
  const [localMyReactions, setLocalMyReactions] = useState({});
  // currentUserId declared above (before mount effect)
  const currentUserName   = artist?.name || meCollector?.name || "";
  const currentUserAvatar = artist?.avatar || meCollector?.avatar || "";
  const comments = store.comments?.[auctionId] || [];
  const getMyReactionsForComment = (commentId) => {
    const serverSet = store.myReactions?.[commentId] || new Set();
    const localSet  = localMyReactions[commentId]    || new Set();
    return new Set([...serverSet, ...localSet]);
  };

  // Realtime: refresh per-auction data when bids/comments change; oohs use global refresh
  useEffect(() => {
    const channel = supabase
      .channel(`auction-${auctionId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "bids",     filter: `auction_id=eq.${auctionId}` }, () => loadAuctionDetail(auctionId, currentUserId))
      .on("postgres_changes", { event: "*",      schema: "public", table: "oohs",     filter: `auction_id=eq.${auctionId}` }, () => updateStore())
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "comments", filter: `auction_id=eq.${auctionId}` }, () => loadAuctionDetail(auctionId, currentUserId))
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "comments", filter: `auction_id=eq.${auctionId}` }, () => loadAuctionDetail(auctionId, currentUserId))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [auctionId, updateStore, loadAuctionDetail, currentUserId]);

  // Auction-ended email: fire once when the owner is watching and the auction ends
  const status = getStatus(auction || { endDate: new Date(0).toISOString(), paused: false });
  const sortedBids = [...bids].sort((a, b) => b.amount - a.amount);
  const topBid = sortedBids[0] || null;
  const isOwner = artist?.id === auction?.artistId;
  useEffect(() => {
    if (!auction) return;
    if (status === "ended" && !endedEmailSent.current && topBid && isOwner) {
      endedEmailSent.current = true;
      const artistProfile = store.artists[auction.artistId];
      if (artistProfile?.email) {
        supabase.functions.invoke("send-auction-ended", {
          body: {
            auctionId: auction.id,
            auctionTitle: auction.title,
            winnerName: topBid.bidder,
            winnerEmail: topBid.email,
            winningAmount: topBid.amount,
            artistEmail: artistProfile.email,
            artistName: auction.artistName,
          }
        }).catch(() => {});
      }
    }
  }, [status, topBid, isOwner]);

  // Load which comments the current user has already reported (must be before early return)
  useEffect(() => {
    if (!currentUserId || !auctionId) return;
    supabase
      .from("comment_reports")
      .select("comment_id")
      .eq("reporter_id", currentUserId)
      .then(({ data }) => {
        if (data) setReportedIds(new Set(data.map((r) => r.comment_id)));
      });
  }, [currentUserId, auctionId]);

  if (!auction) return <div className="page-container" style={{ textAlign:"center", paddingTop:"6rem" }}><div style={{ fontSize:"3rem", marginBottom:"1rem" }}>🔍</div><h2 style={{ fontFamily:"var(--font-display)", marginBottom:"0.75rem" }}>Drop Not Found</h2><button className="btn btn-primary" onClick={() => onNavigate("home")}>Back to Home</button></div>;

  const isLive = status === "live";
  const currentTop = topBid ? topBid.amount : auction.startingPrice;
  const minBid = topBid ? currentTop + (auction.minIncrement || 25) : currentTop;
  const shareUrl = `${window.location.origin}${window.location.pathname}#auction-${auctionId}`;
  const isWinner = !isLive && topBid && (topBid.bidder === bidderName || (bidderEmail && topBid.email === bidderEmail));

  const copyLink = () => { navigator.clipboard.writeText(shareUrl).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500); }); };
  const shareVia = (m) => {
    const text = `🖼️ Bid on "${auction.title}" by ${auction.artistName} — ${shareUrl}`;
    if (m === "email") window.open(`mailto:?subject=Art Drop: ${auction.title}&body=${encodeURIComponent(text)}`);
    if (m === "sms") window.open(`sms:?body=${encodeURIComponent(text)}`);
    if (m === "twitter") window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`);
    if (m === "facebook") window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`);
  };

  const placeBid = async () => {
    if (!localName.trim() || !bidEmail.trim()) { setBidMsg({ type:"error", text:"Enter your name and email." }); return; }
    const amt = parseFloat(bidAmt);
    if (!amt || amt < minBid) { setBidMsg({ type:"error", text:`Bid must be at least ${fmt$(minBid)}.` }); return; }
    const trimmedName = localName.trim();
    const trimmedEmail = bidEmail.trim();
    const { error: bidErr } = await supabase.from("bids").insert({
      id: generateId(), auction_id: auctionId, bidder: trimmedName, email: trimmedEmail, amount: amt
    });
    if (bidErr) { setBidMsg({ type:"error", text:"Failed to place bid. Please try again." }); return; }
    setBidderName(trimmedName);
    setBidderEmail(trimmedEmail);
    saveBidderIdentity(trimmedName, trimmedEmail);
    setBidAmt("");
    setBidMsg({ type:"success", text:`Bid of ${fmt$(amt)} placed!` });
    setShowModal(false);
    loadAuctionDetail(auctionId, currentUserId); // refresh bids for this auction
    setTimeout(() => setBidMsg(null), 4000);
    // Fire-and-forget bid notification email to the artist
    const artistProfile = store.artists[auction.artistId];
    if (artistProfile?.email) {
      supabase.functions.invoke("send-bid-notification", {
        body: {
          auctionId,
          auctionTitle: auction.title,
          bidderName: trimmedName,
          bidAmount: amt,
          artistEmail: artistProfile.email,
          artistName: auction.artistName,
        }
      }).catch(() => {});
    }
  };

  const doManage = async (type) => {
    if (type === "pause") {
      const remainingMs = Math.max(0, new Date(auction.endDate) - Date.now());
      await supabase.from("auctions").update({ paused: true, remaining_ms: remainingMs }).eq("id", auctionId);
    } else if (type === "resume") {
      const endDate = new Date(Date.now() + (auction.remainingMs || 86400000)).toISOString();
      await supabase.from("auctions").update({ paused: false, end_date: endDate, remaining_ms: null }).eq("id", auctionId);
    } else if (type === "end") {
      await supabase.from("auctions").update({ end_date: new Date(Date.now() - 1000).toISOString(), paused: false }).eq("id", auctionId);
    } else if (type === "remove") {
      await supabase.from("auctions").update({ removed: true }).eq("id", auctionId);
    }
    setConfirm(null);
    updateStore();
    if (type === "remove") onNavigate("dashboard");
  };

  const mgmtCfg = {
    pause:  { title:"Pause Drop",     message:"Bidding is suspended until you resume.",               confirmLabel:"Pause",    confirmClass:"btn-warning" },
    resume: { title:"Resume Drop",    message:"Drop goes live again with the remaining time restored.", confirmLabel:"Resume",   confirmClass:"btn-success" },
    end:    { title:"End Drop Early", message:"Highest bidder wins now. Cannot be undone.",           confirmLabel:"End Now",  confirmClass:"btn-danger" },
    remove: { title:"Remove Drop",    message:"Listing will be hidden permanently.",                  confirmLabel:"Remove",   confirmClass:"btn-danger" },
  };

  // ── Comment actions ───────────────────────────────────────────────────────
  const postComment = async () => {
    const body = commentText.trim();
    if (!body || !currentUserId) return;
    const { error } = await supabase.from("comments").insert({
      auction_id: auctionId, author_id: currentUserId,
      author_name: currentUserName, author_avatar: currentUserAvatar, body,
    });
    if (error) { setCommentMsg({ type:"error", text:"Failed to post. Try again." }); return; }
    setCommentText("");
    setCommentMsg({ type:"success", text:"Comment posted!" });
    setTimeout(() => setCommentMsg(null), 3000);
    loadAuctionDetail(auctionId, currentUserId);
  };

  const deleteComment = async (commentId) => {
    setDeletingId(commentId);
    const { error } = await supabase.from("comments").delete().eq("id", commentId);
    if (!error) loadAuctionDetail(auctionId, currentUserId);
    setDeletingId(null);
  };

  const reportComment = async (commentId) => {
    if (!currentUserId || reportedIds.has(commentId)) return;
    setReportingId(commentId);
    await supabase.from("comment_reports").insert({
      comment_id: commentId,
      reporter_id: currentUserId,
    });
    setReportedIds((prev) => new Set([...prev, commentId]));
    setReportingId(null);
  };

  const toggleReaction = async (commentId, emoji) => {
    if (!currentUserId) return;
    const already = getMyReactionsForComment(commentId).has(emoji);
    setLocalMyReactions(prev => {
      const s = new Set(prev[commentId] || []);
      if (already) s.delete(emoji); else s.add(emoji);
      return { ...prev, [commentId]: s };
    });
    if (already) {
      await supabase.from("comment_reactions").delete()
        .eq("comment_id", commentId).eq("user_id", currentUserId).eq("emoji", emoji);
    } else {
      await supabase.from("comment_reactions")
        .upsert({ comment_id: commentId, user_id: currentUserId, emoji }, { onConflict: "comment_id,user_id,emoji" });
    }
    loadAuctionDetail(auctionId, currentUserId);
  };

  return (
    <div className="auction-detail">
      <button className="btn btn-ghost btn-sm" style={{ marginBottom:"1.5rem" }} onClick={() => onNavigate("home")}><i className="fa-solid fa-arrow-left"></i> Back</button>

      {isOwner && (
        <div className="artist-mgmt-bar">
          <div className="artist-mgmt-label"><i className="fa-solid fa-palette"></i> Your Listing &nbsp;·&nbsp; <StatusPill status={status} /></div>
          <div className="artist-mgmt-actions">
            {(status === "live" || status === "paused") && <button className="btn btn-ghost btn-sm" onClick={() => onNavigate("edit", auctionId)}>Edit</button>}
            {status === "live" && <><button className="btn btn-warning btn-sm" onClick={() => setConfirm("pause")}><i className="fa-solid fa-pause"></i> Pause</button><button className="btn btn-danger btn-sm" onClick={() => setConfirm("end")}>End Early</button></>}
            {status === "paused" && <><button className="btn btn-success btn-sm" onClick={() => setConfirm("resume")}><i className="fa-solid fa-play"></i> Resume</button><button className="btn btn-danger btn-sm" onClick={() => setConfirm("end")}>End</button></>}
            {(status === "live" || status === "paused" || status === "ended") && <button className="btn btn-ghost btn-sm" style={{ color:"var(--rouge)" }} onClick={() => setConfirm("remove")}>Remove</button>}
            <button className="btn btn-ghost btn-sm" onClick={copyLink}>{copied ? <><i className="fa-solid fa-check"></i> Copied!</> : <><i className="fa-solid fa-link"></i> Copy Link</>}</button>
            <button className="btn btn-dark btn-sm" onClick={() => onNavigate("dashboard")}>Dashboard</button>
          </div>
        </div>
      )}

      {isWinner && <div className="alert alert-success" style={{ marginBottom:"1.5rem" }}><i className="fa-solid fa-trophy"></i> You won! <button className="btn btn-primary btn-sm" style={{ marginLeft:"1rem" }} onClick={() => onNavigate("payment", auctionId)}>Proceed to Payment <i className="fa-solid fa-arrow-right"></i></button></div>}
      {!isLive && topBid && !isWinner && <div className="alert" style={{ background:"var(--parchment)", border:"1px solid var(--border)", color:"var(--slate)", marginBottom:"1.5rem" }}>Drop ended. Winner: <strong>{shortName(topBid.bidder)}</strong> · {fmt$(topBid.amount)}</div>}
      {bidMsg && <div className={`alert alert-${bidMsg.type}`} style={{ marginBottom:"1rem" }}>{bidMsg.text}</div>}

      <div className="auction-layout">
        <div>
          <div className="auction-art-frame">
            {auction.imageUrl ? <img src={auction.imageUrl} alt={auction.title} /> : <div className="auction-art-placeholder">{auction.emoji||"🎨"}</div>}
          </div>
          <div style={{ padding:"0.75rem 0.25rem", display:"flex", gap:"0.5rem", flexWrap:"wrap" }}>
            {auction.medium && <span className="tag">🖌️ {auction.medium}</span>}
            {auction.dimensions && <span className="tag">📐 {auction.dimensions}</span>}
          </div>
        </div>

        <div>
          <div className="auction-eyebrow">Original Artwork</div>
          <h1 className="auction-title">{auction.title}</h1>
          <div
            className="auction-artist-name auction-artist-name-link"
            onClick={() => onNavigate("artist", auction.artistId)}
            title={`View ${auction.artistName}'s profile`}
          >by {auction.artistName}</div>
          {auction.description && <p className="auction-desc">{auction.description}</p>}

          <div className="ooh-detail-wrap">
            <OohButton auctionId={auctionId} store={store} updateStore={updateStore} />
            <span className="ooh-count-label">
              {getOohCount(store, auctionId) === 0
                ? "Be the first to Ooh this piece"
                : `${getOohCount(store, auctionId)} collector${getOohCount(store, auctionId) !== 1 ? "s" : ""} went Ooh`}
            </span>
          </div>

          {status === "paused" && <div className="paused-notice"><i className="fa-solid fa-pause"></i> This drop is currently paused. Bidding is suspended.</div>}

          <div className="countdown-block">
            <div className="countdown-label"><i className="fa-regular fa-clock"></i> Time Remaining</div>
            {status === "paused" ? <div className="countdown-ended" style={{ color:"var(--amber)" }}>Paused</div> : <Countdown endDate={auction.endDate} />}
            <div style={{ marginTop:"0.65rem", fontSize:"0.72rem", color:"var(--mist)" }}>{isLive ? `Ends ${fmtDate(auction.endDate)}` : `Ended ${fmtDate(auction.endDate)}`}</div>
          </div>

          <div className="bid-block">
            <div className="bid-current-label">{topBid ? "Current Bid" : "Starting Price"}</div>
            <div className="bid-current-amount">{fmt$(currentTop)}</div>
            <div className="bid-count">{bids.length} bid{bids.length!==1?"s":""} placed</div>
            {isLive && !isOwner && (
              <><div className="bid-input-row"><div className="input-prefix" style={{ flex:1 }}><span className="input-prefix-sym">$</span><input className="form-input" style={{ borderRadius:"0 var(--radius) var(--radius) 0" }} type="number" placeholder={minBid} value={bidAmt} onChange={(e) => setBidAmt(e.target.value)} /></div><button className="btn btn-primary" onClick={() => setShowModal(true)} disabled={!bidAmt || parseFloat(bidAmt) < minBid}>Place Bid</button></div><div className="bid-min-hint">Minimum bid: {fmt$(minBid)}</div></>
            )}
            {isOwner && isLive && <div className="alert alert-info" style={{ marginTop:"0.5rem", marginBottom:0 }}>You can't bid on your own drop.</div>}
            {!currentUserId && isLive && <div className="alert alert-info" style={{ marginTop:"0.5rem", marginBottom:0, fontSize:"0.84rem" }}><button className="btn-follow-hint" onClick={() => onNavigate("login")}>Sign in</button> to place a bid and track your collection.</div>}
            {sortedBids.length > 0 && (
              <div className="bid-history">
                <div className="bid-history-title">Bid History</div>
                <ul className="bid-list">
                  {sortedBids.map((b, i) => (
                    <li key={b.id} className={`bid-item ${i===0?"top-bid":""}`}>
                      <span className="bid-item-bidder">{shortName(b.bidder)}{i===0 && <> <i className="fa-solid fa-trophy" style={{color:"var(--gold-dark)",fontSize:"0.8em"}}></i></>}</span>
                      <span className="bid-item-amount">{fmt$(b.amount)}</span>
                      <span className="bid-item-time">{new Date(b.placedAt).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* ── Comments ──────────────────────────────────────────────── */}
          <div className="comments-block">
            <div style={{ fontWeight:700, fontSize:"0.95rem", marginBottom:"1rem", letterSpacing:"-0.01em" }}>
              <i className="fa-regular fa-comment"></i> Comments {comments.length > 0 && <span style={{ color:"var(--mist)", fontWeight:400, fontSize:"0.82rem" }}>({comments.length})</span>}
            </div>
            {currentUserId ? (
              <>
                {commentMsg && <div className={`alert alert-${commentMsg.type}`} style={{ marginBottom:"0.75rem" }}>{commentMsg.text}</div>}
                <div className="comment-input-row">
                  <span style={{ width:"1.8rem", height:"1.8rem", borderRadius:"50%", overflow:"hidden", background:"var(--grad-accent)", display:"inline-flex", alignItems:"center", justifyContent:"center", fontSize:"1rem", flexShrink:0 }}><AvatarImg avatar={currentUserAvatar} alt="" /></span>
                  <input className="comment-input" type="text" placeholder="Leave a comment…"
                    value={commentText} onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); postComment(); } }}
                    maxLength={1000} />
                  <button className="btn btn-primary btn-sm" onClick={postComment}
                    disabled={!commentText.trim()} style={{ flexShrink:0 }}>Post</button>
                </div>
              </>
            ) : (
              <div className="alert alert-info" style={{ fontSize:"0.84rem" }}>
                <button className="btn-follow-hint" onClick={() => onNavigate("login")}>Sign in</button> to leave a comment.
              </div>
            )}
            {comments.length === 0 && (
              <p style={{ fontSize:"0.84rem", color:"var(--mist)", marginTop:"0.5rem" }}>No comments yet. Be the first!</p>
            )}
            {comments.length > 0 && (
              <ul className="comment-list">
                {comments.map((c) => {
                  const mySet = getMyReactionsForComment(c.id);
                  const reactions = store.commentReactions?.[c.id] || {};
                  return (
                    <li key={c.id} className="comment-item">
                      <div className="comment-author-row">
                        <span className="comment-avatar"><AvatarImg avatar={c.authorAvatar} alt={c.authorName} /></span>
                        <div style={{ flex:1, minWidth:0 }}>
                          <span style={{ fontWeight:600, fontSize:"0.85rem", color:"var(--ink)" }}>{c.authorName}</span>
                          <span style={{ fontSize:"0.72rem", color:"var(--mist)", marginLeft:"0.5rem" }}>{timeAgo(c.createdAt)}</span>
                        </div>
                        {(isOwner || c.authorId === currentUserId) && (
                          <button className="comment-delete-btn" onClick={() => deleteComment(c.id)}
                            disabled={deletingId === c.id} title="Delete comment">
                            {deletingId === c.id ? "…" : <i className="fa-solid fa-trash"></i>}
                          </button>
                        )}
                        {currentUserId && c.authorId !== currentUserId && (
                          <button
                            onClick={() => reportComment(c.id)}
                            disabled={reportedIds.has(c.id) || reportingId === c.id}
                            title={reportedIds.has(c.id) ? "Reported" : "Report comment"}
                            style={{ background:"none", border:"none", cursor: reportedIds.has(c.id) ? "default" : "pointer", opacity: reportedIds.has(c.id) ? 0.35 : 0.45, fontSize:"0.8rem", padding:"2px 4px", lineHeight:1 }}>
                            {reportingId === c.id ? "…" : <i className="fa-solid fa-flag" />}
                          </button>
                        )}
                      </div>
                      <div className="comment-body">{c.body}</div>
                      <div className="comment-reactions-row">
                        {REACTION_EMOJIS.map((emoji) => {
                          const count = reactions[emoji] || 0;
                          const active = mySet.has(emoji);
                          return (
                            <button key={emoji}
                              className={`reaction-btn${active ? " reaction-btn-active" : ""}`}
                              onClick={() => currentUserId ? toggleReaction(c.id, emoji) : onNavigate("login")}
                              title={active ? `Remove ${emoji}` : `React with ${emoji}`}>
                              {emoji}{count > 0 && <span style={{ marginLeft:"0.25rem" }}>{count}</span>}
                            </button>
                          );
                        })}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="share-block">
            <div className="share-title"><i className="fa-solid fa-share-nodes"></i> Share This Drop</div>
            <div className="share-url"><div className="share-url-text">{shareUrl}</div><button className="btn btn-sm btn-dark" onClick={copyLink}>{copied ? <><i className="fa-solid fa-check"></i> Copied!</> : "Copy"}</button></div>
            {copied && <div className="copied-toast"><i className="fa-solid fa-check"></i> Link copied to clipboard</div>}
            <div className="share-buttons">
              {[
                [<i className="fa-solid fa-envelope"></i>,"Email","email"],
                [<i className="fa-solid fa-comment-sms"></i>,"Text","sms"],
                [<i className="fa-brands fa-x-twitter"></i>,"Twitter","twitter"],
                [<i className="fa-brands fa-facebook"></i>,"Facebook","facebook"],
              ].map(([icon,label,method]) => (
                <button key={method} className="share-btn" onClick={() => shareVia(method)}>{icon} {label}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}><i className="fa-solid fa-xmark"></i></button>
            <div className="modal-title">Confirm Your Bid</div>
            <div className="modal-sub">Bidding <strong style={{ color:"var(--gold-dark)", fontFamily:"var(--font-display)", fontSize:"1.1rem" }}>{fmt$(bidAmt)}</strong> on <em>{auction.title}</em></div>
            {meCollector && (
              <div className="alert alert-info" style={{ fontSize:"0.81rem", marginBottom:"0.5rem" }}>
                Bidding as <strong>{meCollector.name}</strong> · {meCollector.email}
              </div>
            )}
            <div className="form-group"><label className="form-label">Your Name *</label><input className="form-input" placeholder="Full name" value={localName} onChange={(e) => { if (!meCollector) setLocalName(e.target.value); }} readOnly={!!meCollector} style={meCollector ? { opacity: 0.7, cursor: "default" } : {}} /></div>
            <div className="form-group"><label className="form-label">Email *</label><input className="form-input" type="email" placeholder="your@email.com" value={bidEmail} onChange={(e) => { if (!meCollector) setBidEmail(e.target.value); }} readOnly={!!meCollector} style={meCollector ? { opacity: 0.7, cursor: "default" } : {}} /><p className="form-hint">{meCollector ? "Bids are linked to your collector account." : "Only used to notify you if you win."}</p></div>
            {bidMsg && <div className={`alert alert-${bidMsg.type}`}>{bidMsg.text}</div>}
            <div className="alert alert-info" style={{ fontSize:"0.81rem" }}>By bidding, you agree to pay if you win. Payment required within 48 hours.</div>
            <div className="modal-actions"><button className="btn btn-ghost" style={{ flex:1 }} onClick={() => setShowModal(false)}>Cancel</button><button className="btn btn-primary" style={{ flex:2 }} onClick={placeBid}><i className="fa-solid fa-check"></i> Confirm {fmt$(bidAmt)}</button></div>
          </div>
        </div>
      )}

      {confirm && <ConfirmModal {...mgmtCfg[confirm]} onConfirm={() => doManage(confirm)} onCancel={() => setConfirm(null)} />}

      {isLive && !isOwner && (
        <div className="sticky-bid-bar">
          <div className="sticky-bid-bar-price">
            <span className="sticky-bid-bar-label">{topBid ? "Current Bid" : "Starting at"}</span>
            <span className="sticky-bid-bar-amount">{fmt$(currentTop)}</span>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            Place Bid →
          </button>
        </div>
      )}
    </div>
  );
};

export default AuctionPage;
