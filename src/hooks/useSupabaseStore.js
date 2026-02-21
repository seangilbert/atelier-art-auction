import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabase.js";

// ── Supabase data hook ────────────────────────────────────────────────────────
// Returns [store, loadAll, loadAuctionDetail] where loadAll() re-fetches all
// data from Supabase. The store shape is kept compatible with the old
// localStorage shape so that all components need minimal changes.
const useSupabaseStore = () => {
  const [store, setStoreState] = useState({
    artists: {}, collectors: {}, auctions: [], bids: {}, payments: {}, oohs: {}, myInvite: null,
    comments: {}, commentReactions: {}, myReactions: {},
    bidSummaries: {}, commentCounts: {}, gallery: {},
    ratings: { byRatee: {}, byAuction: {} },
  });

  const loadAll = useCallback(async (userId = null) => {
    try {
      // Tier-1 fetch: lightweight queries only — full bids/comments/reactions loaded per-auction
      const [
        { data: auctions },
        { data: oohs },
        { data: payments },
        { data: profiles },
        { data: bidRows },
        { data: commentRows },
        { data: galleryRows },
        { data: ratingRows },
      ] = await Promise.all([
        supabase.from("auctions").select("*").order("created_at", { ascending: false }),
        supabase.from("oohs").select("*"),
        supabase.from("payments").select("*"),                          // small table, keep full
        supabase.from("profiles").select("*"),
        supabase.from("bids").select("auction_id, amount"),             // summaries only
        supabase.from("comments").select("id, auction_id"),             // counts only
        supabase.from("gallery").select("*").order("created_at", { ascending: false }),
        supabase.from("ratings").select("id, auction_id, rater_id, ratee_id, rater_type, score, comment, created_at"),
      ]);

      // Build bid summaries map { auctionId: { count, topAmount } }
      const bidSummariesMap = {};
      (bidRows || []).forEach(b => {
        const s = bidSummariesMap[b.auction_id] || { count: 0, topAmount: 0 };
        s.count++;
        if (b.amount > s.topAmount) s.topAmount = b.amount;
        bidSummariesMap[b.auction_id] = s;
      });

      // Build comment counts map { auctionId: number }
      const commentCountsMap = {};
      (commentRows || []).forEach(c => {
        commentCountsMap[c.auction_id] = (commentCountsMap[c.auction_id] || 0) + 1;
      });

      // Build oohs map { auctionId: count }
      const oohsMap = {};
      (oohs || []).forEach(o => { oohsMap[o.auction_id] = Number(o.count); });

      // Build payments map { auctionId: paymentObj }
      const paymentsMap = {};
      (payments || []).forEach(p => {
        paymentsMap[p.auction_id] = {
          selPay: p.sel_pay, submitted: true, submittedAt: p.submitted_at,
          paidAt: p.paid_at || null, shippedAt: p.shipped_at || null, tracking: p.tracking || "",
          sh: { name: p.name, email: p.email, address: p.address, city: p.city, state: p.state, zip: p.zip, country: p.country, notes: p.notes }
        };
      });

      // Build artists + collectors maps from profiles (with email)
      const artistsMap = {};
      const collectorsMap = {};
      (profiles || []).forEach(p => {
        const user = { id: p.id, name: p.name, avatar: p.avatar, bio: p.bio, email: p.email, createdAt: p.created_at, following: p.following || [] };
        if (p.type === "artist") artistsMap[p.id] = { ...user, galleryPublic: p.gallery_public || false };
        else collectorsMap[p.id] = user;
      });

      // Normalize auction rows to camelCase shape
      const auctionList = (auctions || []).filter(a => !a.removed).map(a => ({
        id: a.id, published: true, paused: a.paused, removed: a.removed,
        artistId: a.artist_id, artistName: a.artist_name, artistAvatar: a.artist_avatar,
        title: a.title, description: a.description, medium: a.medium, dimensions: a.dimensions,
        startingPrice: Number(a.starting_price), minIncrement: Number(a.min_increment),
        endDate: a.end_date, durationDays: a.duration_days,
        paymentMethods: a.payment_methods || [],
        venmoHandle: a.venmo_handle, paypalEmail: a.paypal_email, cashappHandle: a.cashapp_handle,
        imageUrl: a.image_url, emoji: a.emoji, createdAt: a.created_at,
        remainingMs: a.remaining_ms ? Number(a.remaining_ms) : undefined,
        galleryItemId: a.gallery_item_id || null,
      }));

      // Fetch this user's personal invite row (if logged in)
      let myInvite = null;
      if (userId) {
        const { data: inviteRow } = await supabase
          .from("invites")
          .select("code, uses_count, max_uses")
          .eq("owner_id", userId)
          .neq("code", "ARTDROP2026")
          .maybeSingle();
        if (inviteRow) {
          myInvite = {
            code: inviteRow.code,
            usesCount: inviteRow.uses_count,
            maxUses: inviteRow.max_uses,
            remaining: inviteRow.max_uses - inviteRow.uses_count,
          };
        }
      }

      // Normalize gallery rows
      const galleryMap = {};
      (galleryRows || []).forEach(g => {
        galleryMap[g.id] = {
          id: g.id, artistId: g.artist_id, title: g.title,
          description: g.description, medium: g.medium, dimensions: g.dimensions,
          imageUrl: g.image_url, emoji: g.emoji || "🎨", createdAt: g.created_at,
        };
      });

      // Build ratings maps
      const ratingsByRatee   = {};
      const ratingsByAuction = {};
      (ratingRows || []).forEach(r => {
        if (r.ratee_id) {
          if (!ratingsByRatee[r.ratee_id]) ratingsByRatee[r.ratee_id] = [];
          ratingsByRatee[r.ratee_id].push({
            id: r.id, auctionId: r.auction_id, raterType: r.rater_type,
            score: r.score, comment: r.comment, createdAt: r.created_at,
          });
        }
        if (!ratingsByAuction[r.auction_id]) ratingsByAuction[r.auction_id] = { collectorRated: false, artistRated: false };
        if (r.rater_type === 'collector') ratingsByAuction[r.auction_id].collectorRated = true;
        if (r.rater_type === 'artist')    ratingsByAuction[r.auction_id].artistRated    = true;
      });

      // Use spread so per-auction bids/comments/reactions loaded by loadAuctionDetail survive refreshes
      setStoreState(prev => ({
        ...prev,
        artists: artistsMap, collectors: collectorsMap, auctions: auctionList,
        oohs: oohsMap, payments: paymentsMap, myInvite,
        bidSummaries: bidSummariesMap, commentCounts: commentCountsMap, gallery: galleryMap,
        ratings: { byRatee: ratingsByRatee, byAuction: ratingsByAuction },
      }));
    } catch (err) {
      console.error("loadAll error:", err);
    }
  }, []);

  // Per-auction detail loader: full bids + comments + reactions for one auction
  const loadAuctionDetail = useCallback(async (auctionId, userId = null) => {
    try {
      const [{ data: bids }, { data: commentsRaw }] = await Promise.all([
        supabase.from("bids").select("*").eq("auction_id", auctionId).order("placed_at", { ascending: true }),
        supabase.from("comments").select("*").eq("auction_id", auctionId).order("created_at", { ascending: true }),
      ]);
      // Reactions need comment IDs — fetch sequentially
      const commentIds = (commentsRaw || []).map(c => c.id);
      const { data: reactionsRaw } = commentIds.length
        ? await supabase.from("comment_reactions").select("*").in("comment_id", commentIds)
        : { data: [] };

      const bidsForAuction = (bids || []).map(b => ({
        id: b.id, bidder: b.bidder, email: b.email, amount: b.amount, placedAt: b.placed_at
      }));
      const commentsForAuction = (commentsRaw || []).map(c => ({
        id: c.id, auctionId: c.auction_id, authorId: c.author_id,
        authorName: c.author_name, authorAvatar: c.author_avatar,
        body: c.body, createdAt: c.created_at,
      }));
      const reactionsMap = {};
      (reactionsRaw || []).forEach(r => {
        if (!reactionsMap[r.comment_id]) reactionsMap[r.comment_id] = {};
        reactionsMap[r.comment_id][r.emoji] = (reactionsMap[r.comment_id][r.emoji] || 0) + 1;
      });
      const myReactionsMap = {};
      if (userId) {
        (reactionsRaw || []).filter(r => r.user_id === userId).forEach(r => {
          if (!myReactionsMap[r.comment_id]) myReactionsMap[r.comment_id] = new Set();
          myReactionsMap[r.comment_id].add(r.emoji);
        });
      }

      setStoreState(prev => ({
        ...prev,
        bids: { ...prev.bids, [auctionId]: bidsForAuction },
        comments: { ...prev.comments, [auctionId]: commentsForAuction },
        commentReactions: { ...prev.commentReactions, ...reactionsMap },
        myReactions: { ...prev.myReactions, ...myReactionsMap },
      }));
    } catch (err) {
      console.error("loadAuctionDetail error:", err);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  return [store, loadAll, loadAuctionDetail];
};

export default useSupabaseStore;
