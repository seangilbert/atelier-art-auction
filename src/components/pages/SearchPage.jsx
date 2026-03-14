import { useState } from "react";
import { getStatus, fmt$ } from "../../utils/helpers.js";

const SearchPage = ({ onNavigate, store, updateStore, me, meCollector }) => {
  const PAGE_SIZE = 30;
  const [query, setQuery]       = useState("");
  const [medium, setMedium]     = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort]         = useState("newest");
  const [openChip, setOpenChip] = useState(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const allAuctions = store.auctions.filter(a => a.published && !a.removed);
  const mediums = [...new Set(allAuctions.filter(a => a.medium).map(a => a.medium))].sort();

  const hasFilters = query.trim() !== "" || medium !== "" || minPrice !== "" || maxPrice !== "";

  const filtered = allAuctions.filter(a => {
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      if (!a.title.toLowerCase().includes(q) && !a.artistName.toLowerCase().includes(q)) return false;
    }
    const price = store.bidSummaries[a.id]?.topAmount || a.startingPrice;
    if (minPrice !== "" && price < parseFloat(minPrice)) return false;
    if (maxPrice !== "" && price > parseFloat(maxPrice)) return false;
    if (medium && a.medium !== medium) return false;
    return true;
  });

  const sortTabs = [
    ["newest", "Newest"], ["ending", "Ending Soon"], ["oohs", "Most Loved"],
    ["bids", "Most Bids"], ["price-asc", "Price ↑"], ["price-desc", "Price ↓"],
  ];

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "ending")     return new Date(a.endDate) - new Date(b.endDate);
    if (sort === "oohs")       return (store.oohs[b.id] || 0) - (store.oohs[a.id] || 0);
    if (sort === "bids")       return (store.bidSummaries[b.id]?.count || 0) - (store.bidSummaries[a.id]?.count || 0);
    if (sort === "price-asc")  return (store.bidSummaries[a.id]?.topAmount || a.startingPrice) - (store.bidSummaries[b.id]?.topAmount || b.startingPrice);
    if (sort === "price-desc") return (store.bidSummaries[b.id]?.topAmount || b.startingPrice) - (store.bidSummaries[a.id]?.topAmount || a.startingPrice);
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const visible = sorted.slice(0, visibleCount);
  const hasMore = sorted.length > visibleCount;

  const toggleChip = (name) => setOpenChip(o => o === name ? null : name);
  const sortLabel  = sortTabs.find(([k]) => k === sort)?.[1] || "Sort";
  const priceLabel = (minPrice || maxPrice) ? `$${minPrice || "0"} – $${maxPrice || "∞"}` : "Price";

  return (
    <div className="search-page">
      {/* ── Sticky header ──────────────────────────────────────────────────── */}
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
                style={{ position:"absolute", right:"0.85rem", top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"var(--mist)", fontSize:"0.85rem" }}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            )}
          </div>
        </div>

        <div className="search-filter-chips">
          <button className={`search-chip${medium ? " active" : ""}`} onClick={() => toggleChip("medium")}>
            <i className="fa-solid fa-palette"></i>
            {medium || "Medium"}
            <i className={`fa-solid fa-chevron-${openChip === "medium" ? "up" : "down"}`} style={{ fontSize:"0.6rem" }}></i>
          </button>
          <button className={`search-chip${(minPrice || maxPrice) ? " active" : ""}`} onClick={() => toggleChip("price")}>
            <i className="fa-solid fa-tag"></i>
            {priceLabel}
            <i className={`fa-solid fa-chevron-${openChip === "price" ? "up" : "down"}`} style={{ fontSize:"0.6rem" }}></i>
          </button>
          <button className={`search-chip${sort !== "newest" ? " active" : ""}`} onClick={() => toggleChip("sort")}>
            <i className="fa-solid fa-arrow-up-wide-short"></i>
            {sortLabel}
            <i className={`fa-solid fa-chevron-${openChip === "sort" ? "up" : "down"}`} style={{ fontSize:"0.6rem" }}></i>
          </button>
          {(medium || minPrice || maxPrice || sort !== "newest") && (
            <button className="search-chip" onClick={() => { setMedium(""); setMinPrice(""); setMaxPrice(""); setSort("newest"); setOpenChip(null); }} style={{ color:"var(--rouge)" }}>
              <i className="fa-solid fa-xmark"></i> Clear
            </button>
          )}
        </div>

        {openChip === "medium" && (
          <div className="search-chip-panel">
            <button className={`sort-tab${medium === "" ? " active" : ""}`} onClick={() => { setMedium(""); setOpenChip(null); }}>All</button>
            {mediums.map(m => (
              <button key={m} className={`sort-tab${medium === m ? " active" : ""}`} onClick={() => { setMedium(m); setOpenChip(null); }}>{m}</button>
            ))}
            {mediums.length === 0 && <span style={{ fontSize:"0.8rem", color:"var(--mist)" }}>No mediums available</span>}
          </div>
        )}
        {openChip === "price" && (
          <div className="search-chip-panel">
            <span className="feed-filter-label">Min $</span>
            <input className="feed-filter-input" type="number" min="0" placeholder="0" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
            <span className="feed-filter-label">Max $</span>
            <input className="feed-filter-input" type="number" min="0" placeholder="Any" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
            <button className="search-chip" onClick={() => setOpenChip(null)}>Done</button>
          </div>
        )}
        {openChip === "sort" && (
          <div className="search-chip-panel">
            {sortTabs.map(([key, label]) => (
              <button key={key} className={`sort-tab${sort === key ? " active" : ""}`} onClick={() => { setSort(key); setOpenChip(null); }}>{label}</button>
            ))}
          </div>
        )}
      </div>

      {/* ── Image grid ─────────────────────────────────────────────────────── */}
      {sorted.length === 0 ? (
        <div className="empty-state">
          <h3>No results{query.trim() ? ` for "${query.trim()}"` : ""}</h3>
          <p style={{ marginBottom:"1.5rem" }}>
            {hasFilters ? "Try adjusting your filters or search term." : "No drops yet — check back soon."}
          </p>
          {hasFilters && (
            <button className="btn btn-ghost" onClick={() => { setQuery(""); setMedium(""); setMinPrice(""); setMaxPrice(""); setSort("newest"); }}>
              <i className="fa-solid fa-xmark"></i> Clear all
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="search-image-grid">
            {visible.map(auction => {
              const status = getStatus(auction);
              return (
                <div key={auction.id} className="search-image-cell" onClick={() => onNavigate("auction", auction.id)}>
                  {auction.imageUrl
                    ? <img src={auction.imageUrl} alt={auction.title} />
                    : <div className="search-image-placeholder"><i className="fa-solid fa-palette"></i></div>}
                  {status === "live"   && <div className="search-cell-live"><div className="pulse" style={{ background:"white", width:"6px", height:"6px", minWidth:"6px" }} /></div>}
                  {status === "ended" && <div className="search-cell-sold">Sold</div>}
                </div>
              );
            })}
          </div>
          {hasMore && (
            <div style={{ textAlign:"center", padding:"2rem 0" }}>
              <button className="btn btn-ghost" onClick={() => setVisibleCount(c => c + PAGE_SIZE)}>
                Load more
                <span style={{ color:"var(--mist)", marginLeft:"0.4rem" }}>({sorted.length - visibleCount} remaining)</span>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SearchPage;
