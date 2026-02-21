import { getStatus, fmt$ } from "../../utils/helpers.js";
import { CardTimer } from "../ui/Countdown.jsx";
import OohButton from "../ui/OohButton.jsx";

const HomePage = ({ onNavigate, store, updateStore }) => {
  const liveAuctions = store.auctions.filter((a) => !a.removed && a.published && getStatus(a) === "live");
  const topOohs = [...liveAuctions]
    .sort((a, b) => (store.oohs[b.id] || 0) - (store.oohs[a.id] || 0))
    .slice(0, 6);

  return (
    <>
      <section className="hero hero-compact">
        <div className="hero-bg" /><div className="hero-grid" />
        <div className="hero-inner">
          <div>
            <div className="hero-eyebrow">The Art Drop House</div>
            <h1 className="hero-title">Where Unique Art<br />Finds <em>Its Voice</em></h1>
            <p className="hero-subtitle">Run live drops for your original artwork. Set your price, share your link, and watch collectors compete for your creations.</p>
            <div className="hero-actions">
              <button className="btn btn-primary btn-lg" onClick={() => onNavigate("signup")}>Start Selling Art</button>
              <button className="btn btn-outline btn-lg" onClick={() => onNavigate("collector-signup")}>Follow as Collector</button>
            </div>
          </div>
        </div>
      </section>

      <div className="features-strip">
        <div className="features-inner">
          {[["🖼️","List Your Art","Upload photos, set your price, publish in minutes"],["⏱️","Live Countdown","Real-time drops with transparent bidding"],["🔗","Share Anywhere","Links for email, social media, and text"],["💸","Flexible Payment","Venmo, PayPal, Cash App & more"]].map(([icon, label, desc]) => (
            <div key={label} className="feature-item"><div className="feature-icon">{icon}</div><div className="feature-label">{label}</div><div className="feature-desc">{desc}</div></div>
          ))}
        </div>
      </div>

      <div className="top-oohs-section browse-section">
        <div className="section">
          <div className="section-header">
            <h2 className="section-title"><em>Most Admired</em> Right Now</h2>
          </div>
          {topOohs.length === 0 ? (
            <div className="empty-state">
              <h3>No live drops yet</h3>
              <p style={{ marginBottom: "1.5rem" }}>Be the first to list your artwork.</p>
              <button className="btn btn-primary" onClick={() => onNavigate("signup")}>Become an Artist</button>
            </div>
          ) : (
            <div className="auction-grid">
              {topOohs.map((auction) => {
                const summary = store.bidSummaries[auction.id] || { count: 0, topAmount: 0 };
                const topBidAmt = summary.topAmount || auction.startingPrice;
                return (
                  <div key={auction.id} className="auction-card" onClick={() => onNavigate("auction", auction.id)}>
                    <div className="card-image">
                      {auction.imageUrl ? <img src={auction.imageUrl} alt={auction.title} /> : <span>{auction.emoji || "🎨"}</span>}
                      <div className="badge badge-live"><div className="pulse" style={{ background: "white" }} /> Live</div>
                    </div>
                    <div className="card-body">
                      <div className="card-artist">by {auction.artistName}</div>
                      <div className="card-title">{auction.title}</div>
                      <div className="card-meta">
                        <div><div className="card-price-label">{summary.count ? "Current Bid" : "Starting at"}</div><div className="card-price">{fmt$(topBidAmt)}</div></div>
                        <div><div className="card-timer-label">Closes</div><div className="card-timer-val"><CardTimer endDate={auction.endDate} /></div></div>
                      </div>
                      <div className="card-ooh-row">
                        <OohButton auctionId={auction.id} store={store} updateStore={updateStore} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default HomePage;
