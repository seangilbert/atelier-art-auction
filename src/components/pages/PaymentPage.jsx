import { useState, useEffect } from "react";
import { supabase } from "../../supabase.js";
import { fmt$ } from "../../utils/helpers.js";

const PaymentPage = ({ auctionId, onNavigate, store, updateStore, loadAuctionDetail, bidderName, bidderEmail, meCollector }) => {
  const auction = store.auctions.find((a) => a.id === auctionId);
  const bids = store.bids[auctionId] || [];

  // Safety guard: load bids if user deep-links to payment page without visiting AuctionPage
  useEffect(() => {
    if (!store.bids[auctionId]?.length) {
      loadAuctionDetail(auctionId);
    }
  }, [auctionId]);
  const [selPay, setSelPay] = useState(null);
  const [sh, setSh] = useState({ name: meCollector?.name || bidderName || "", email: meCollector?.email || bidderEmail || "", address:"", city:"", state:"", zip:"", country:"US", notes:"" });
  const [submitted, setSubmitted] = useState(store.payments?.[auctionId]?.submitted||false);
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setSh((p) => ({ ...p, [k]: v }));

  if (!auction) return null;
  const topBid = bids.length ? bids.reduce((a,b) => a.amount>b.amount?a:b) : null;

  const pmInfo = {
    venmo:   { name:"Venmo",          icon:"💙", instruction:`Send ${fmt$(topBid?.amount)} to ${auction.venmoHandle||"@artist"} on Venmo. Note: "${auction.title} — Art Auction"` },
    paypal:  { name:"PayPal",         icon:"🅿️", instruction:`Send ${fmt$(topBid?.amount)} to ${auction.paypalEmail||"artist@email.com"} on PayPal.` },
    cashapp: { name:"Cash App",       icon:"💚", instruction:`Send ${fmt$(topBid?.amount)} to ${auction.cashappHandle||"$artist"} on Cash App.` },
    zelle:   { name:"Zelle",          icon:"💜", instruction:"Contact the artist for their Zelle details." },
    check:   { name:"Check",          icon:"📝", instruction:"Make check payable to the artist. Contact them for mailing address." },
    contact: { name:"Contact Artist", icon:"📧", instruction:"The artist will reach out to arrange payment directly." },
  };

  const submit = async () => {
    if (!selPay || !sh.name || !sh.address || !sh.city || !sh.zip) return;
    setBusy(true);
    const { error: payErr } = await supabase.from("payments").upsert({
      auction_id: auctionId, sel_pay: selPay,
      name: sh.name, email: sh.email, address: sh.address,
      city: sh.city, state: sh.state, zip: sh.zip,
      country: sh.country, notes: sh.notes,
    }, { onConflict: "auction_id" });
    if (payErr) { console.error("payment error:", payErr); setBusy(false); return; }
    updateStore();
    setSubmitted(true);
    setBusy(false);
    // Fire confirmation emails to winner + artist (fire-and-forget)
    const artistProfile = store.artists[auction.artistId];
    supabase.functions.invoke("send-payment-confirmation", {
      body: {
        auctionId,
        auctionTitle: auction.title,
        artistName: auction.artistName,
        artistEmail: artistProfile?.email || "",
        winnerName: sh.name,
        winnerEmail: sh.email,
        winningAmount: topBid?.amount,
        paymentMethod: pmInfo[selPay]?.name || selPay,
        paymentInstruction: pmInfo[selPay]?.instruction || "",
        shippingName: sh.name,
        shippingAddress: sh.address,
        shippingCity: sh.city,
        shippingState: sh.state,
        shippingZip: sh.zip,
        shippingCountry: sh.country,
        shippingNotes: sh.notes,
      }
    }).catch(() => {});
  };

  if (submitted) return (
    <div className="payment-page" style={{ textAlign:"center", paddingTop:"4rem" }}>
      <div style={{ fontSize:"4rem", marginBottom:"1rem" }}>🎉</div>
      <h2 style={{ fontFamily:"var(--font-display)", fontSize:"2rem", marginBottom:"0.75rem" }}>Order Confirmed!</h2>
      <p style={{ color:"var(--mist)", marginBottom:"2rem" }}>The artist has been notified. Your artwork is on its way!</p>
      <div style={{ background:"var(--parchment)", border:"1px solid var(--border)", borderRadius:"var(--radius-lg)", padding:"1.5rem", marginBottom:"2rem", textAlign:"left" }}>
        <div style={{ fontFamily:"var(--font-display)", fontWeight:600, marginBottom:"0.75rem" }}>Shipping to:</div>
        <div style={{ fontSize:"0.9rem", lineHeight:2, color:"var(--slate)" }}><div>{sh.name}</div><div>{sh.address}</div><div>{sh.city}, {sh.state} {sh.zip}</div><div>{sh.country}</div></div>
      </div>
      <button className="btn btn-primary" onClick={() => onNavigate("home")}>Back to Gallery</button>
    </div>
  );

  return (
    <div className="payment-page">
      <button className="btn btn-ghost btn-sm" style={{ marginBottom:"2rem" }} onClick={() => onNavigate("auction", auctionId)}><i className="fa-solid fa-arrow-left"></i> Back</button>
      <div className="winner-banner"><div className="winner-crown"><i className="fa-solid fa-trophy"></i></div><div className="winner-title">You won!</div><div className="winner-sub">"{auction.title}" by {auction.artistName}</div></div>
      <div style={{ background:"white", border:"1px solid var(--border)", borderRadius:"var(--radius-lg)", padding:"1.25rem 1.5rem", marginBottom:"1.75rem" }}>
        <div className="winner-summary-row">
          <div><div style={{ fontSize:"0.7rem", color:"var(--mist)", textTransform:"uppercase", letterSpacing:"0.06em" }}>Winning Bid</div><div style={{ fontFamily:"var(--font-display)", fontSize:"2rem", fontWeight:700, color:"var(--gold-dark)" }}>{fmt$(topBid?.amount)}</div></div>
          <div style={{ textAlign:"right" }}><div style={{ fontSize:"0.7rem", color:"var(--mist)", textTransform:"uppercase", letterSpacing:"0.06em" }}>Pay Within</div><div style={{ fontWeight:600, color:"var(--rouge)" }}>48 hours</div></div>
        </div>
      </div>
      <h3 style={{ fontFamily:"var(--font-display)", fontSize:"1.25rem", marginBottom:"0.9rem" }}>Step 1 — Choose Payment</h3>
      <div className="payment-options">
        {auction.paymentMethods.map((key) => { const pm = pmInfo[key]; if (!pm) return null;
          return <div key={key} className={`payment-opt ${selPay===key?"selected":""}`} onClick={() => setSelPay(key)}><div className="payment-opt-icon">{pm.icon}</div><div className="payment-opt-name">{pm.name}</div>{key==="venmo"&&auction.venmoHandle&&<div className="payment-opt-handle">{auction.venmoHandle}</div>}{key==="paypal"&&auction.paypalEmail&&<div className="payment-opt-handle">{auction.paypalEmail}</div>}{key==="cashapp"&&auction.cashappHandle&&<div className="payment-opt-handle">{auction.cashappHandle}</div>}</div>;
        })}
      </div>
      {selPay && <div className="payment-instruction"><p>{pmInfo[selPay]?.instruction}</p><div className="payment-amount">{fmt$(topBid?.amount)}</div></div>}
      <div className="divider" />
      <h3 style={{ fontFamily:"var(--font-display)", fontSize:"1.25rem", marginBottom:"0.9rem" }}>Step 2 — Shipping Details</h3>
      <div className="form-group"><label className="form-label">Full Name *</label><input className="form-input" value={sh.name} onChange={(e) => set("name", e.target.value)} placeholder="Your full name" /></div>
      <div className="form-group"><label className="form-label">Email *</label><input className="form-input" type="email" value={sh.email} onChange={(e) => set("email", e.target.value)} placeholder="your@email.com" /></div>
      <div className="form-group"><label className="form-label">Street Address *</label><input className="form-input" value={sh.address} onChange={(e) => set("address", e.target.value)} placeholder="123 Main St" /></div>
      <div className="form-row">
        <div className="form-group"><label className="form-label">City *</label><input className="form-input" value={sh.city} onChange={(e) => set("city", e.target.value)} placeholder="Boston" /></div>
        <div className="form-group"><label className="form-label">State</label><input className="form-input" value={sh.state} onChange={(e) => set("state", e.target.value)} placeholder="MA" /></div>
      </div>
      <div className="form-row">
        <div className="form-group"><label className="form-label">ZIP *</label><input className="form-input" value={sh.zip} onChange={(e) => set("zip", e.target.value)} placeholder="02134" /></div>
        <div className="form-group"><label className="form-label">Country</label><select className="form-select" value={sh.country} onChange={(e) => set("country", e.target.value)}><option value="US">United States</option><option value="CA">Canada</option><option value="GB">United Kingdom</option><option value="AU">Australia</option><option value="other">Other</option></select></div>
      </div>
      <div className="form-group"><label className="form-label">Delivery Notes</label><textarea className="form-textarea" rows={2} value={sh.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Any special instructions…" /></div>
      <button className="btn btn-primary btn-lg" style={{ width:"100%", justifyContent:"center" }} disabled={!selPay||!sh.name||!sh.address||!sh.city||!sh.zip||busy} onClick={submit}>{busy ? "Submitting…" : <><i className="fa-solid fa-check"></i> Confirm Payment &amp; Submit Shipping</>}</button>
      <p style={{ textAlign:"center", color:"var(--mist)", fontSize:"0.76rem", marginTop:"0.65rem" }}>Your shipping details will be sent to the artist securely.</p>
    </div>
  );
};

export default PaymentPage;
