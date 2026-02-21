import { useState, useEffect, useRef } from "react";
import { supabase } from "./src/supabase.js";
import STYLES from "./src/styles.js";
import { getStatus } from "./src/utils/helpers.js";
import { getBidderIdentity } from "./src/utils/storage.js";
import useSupabaseStore from "./src/hooks/useSupabaseStore.js";
import AvatarImg from "./src/components/ui/AvatarImg.jsx";
import AuthPage from "./src/components/pages/AuthPage.jsx";
import HomePage from "./src/components/pages/HomePage.jsx";
import FeedPage from "./src/components/pages/FeedPage.jsx";
import ArtistPage from "./src/components/pages/ArtistPage.jsx";
import CollectorDashboardPage from "./src/components/pages/CollectorDashboardPage.jsx";
import InvitePage from "./src/components/pages/InvitePage.jsx";
import EditProfilePage from "./src/components/pages/EditProfilePage.jsx";
import DashboardPage from "./src/components/pages/DashboardPage.jsx";
import AddArtworkPage from "./src/components/pages/AddArtworkPage.jsx";
import CreatePage from "./src/components/pages/CreatePage.jsx";
import AuctionPage from "./src/components/pages/AuctionPage.jsx";
import PaymentPage from "./src/components/pages/PaymentPage.jsx";
import EditPage from "./src/components/pages/EditPage.jsx";

// ─────────────────────────────────────────────────────────────────────────────
// MOBILE BOTTOM NAV
// ─────────────────────────────────────────────────────────────────────────────
function MobileBottomNav({ page, isArtist, isCollector, onNavigate }) {
  if (!isArtist && !isCollector) return null;

  const artistTabs = [
    { id: "home",      icon: <i className="fa-solid fa-paintbrush"></i>,       label: "Drops"     },
    { id: "create",    icon: <i className="fa-solid fa-plus"></i>,             label: "New"       },
    { id: "dashboard", icon: <i className="fa-solid fa-chart-simple"></i>,     label: "Dashboard" },
    { id: "home",      icon: <i className="fa-solid fa-magnifying-glass"></i>, label: "Search", searchFocus: true },
  ];

  const collectorTabs = [
    { id: "home",                icon: <i className="fa-solid fa-paintbrush"></i>,      label: "Drops" },
    { id: "collector-dashboard", icon: <i className="fa-solid fa-folder-open"></i>,     label: "Bids" },
    { id: "home",                icon: <i className="fa-solid fa-magnifying-glass"></i>, label: "Search", searchFocus: true },
  ];

  const tabs = isArtist ? artistTabs : collectorTabs;

  const handleTab = (tab) => {
    onNavigate(tab.id);
    if (tab.searchFocus) {
      window.scrollTo({ top: 0, behavior: "instant" });
      setTimeout(() => {
        const el = document.querySelector(".feed-search-input");
        if (el) el.focus();
      }, 150);
    }
  };

  return (
    <div className="mobile-bottom-nav">
      <div className="mobile-bottom-nav-inner">
        {tabs.map((tab, i) => (
          <button
            key={i}
            className={`mobile-nav-tab${!tab.searchFocus && tab.id === page ? " active" : ""}`}
            onClick={() => handleTab(tab)}
          >
            <span className="mobile-nav-tab-icon">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// APP SHELL
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  const [store, updateStore, loadAuctionDetail] = useSupabaseStore();
  const [authReady, setAuthReady] = useState(false);
  const [artist, setArtist] = useState(null);
  const [collector, setCollector] = useState(null);
  const [view, setView] = useState({ page: "home", id: null });
  const [bidderName, setBidderName] = useState(() => getBidderIdentity().name);
  const [bidderEmail, setBidderEmail] = useState(() => getBidderIdentity().email);
  const [dropOpen, setDropOpen] = useState(false);
  const [collectorDropOpen, setCollectorDropOpen] = useState(false);
  const dropRef = useRef();
  const collectorDropRef = useRef();

  // Restore session from Supabase auth on mount
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
        if (profile) {
          const user = { id: session.user.id, name: profile.name, email: session.user.email, avatar: profile.avatar, bio: profile.bio, createdAt: profile.created_at };
          if (profile.type === "artist") setArtist(user);
          else setCollector(user);
          updateStore(session.user.id);
        }
      }
      setAuthReady(true); // always unblock render, logged-in or not
    });
  }, []);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith("#auction-")) setView({ page: "auction", id: hash.replace("#auction-", "") });
  }, []);

  useEffect(() => {
    const fn = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  useEffect(() => {
    const fn = (e) => { if (collectorDropRef.current && !collectorDropRef.current.contains(e.target)) setCollectorDropOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const [returnToAuction, setReturnToAuction] = useState(null);

  const go = (page, id = null) => {
    if ((page === "create" || page === "dashboard") && !artist) { setView({ page: "login", id: null }); return; }
    // When navigating to auth from an auction page, remember which auction to return to after login
    if ((page === "login" || page === "signup" || page === "collector-signup") && view.page === "auction" && view.id) {
      setReturnToAuction(view.id);
    } else if (page !== "login" && page !== "signup" && page !== "collector-signup") {
      setReturnToAuction(null);
    }
    setView({ page, id });
    setDropOpen(false);
    setCollectorDropOpen(false);
    window.scrollTo({ top: 0, behavior: "instant" });
    if (page === "auction" && id) window.history.pushState(null, "", `${window.location.pathname}#auction-${id}`);
    else window.history.pushState(null, "", window.location.pathname);
  };

  const onLogin = (a) => { setArtist(a); updateStore(a.id); setView(returnToAuction ? { page: "auction", id: returnToAuction } : { page: "dashboard", id: null }); setReturnToAuction(null); };
  const onLogout = async () => { await supabase.auth.signOut(); setArtist(null); setDropOpen(false); setView({ page: "home", id: null }); };
  const onCollectorLogin = (c) => { setCollector(c); updateStore(c.id); setView(returnToAuction ? { page: "auction", id: returnToAuction } : { page: "home", id: null }); setReturnToAuction(null); };
  const onCollectorLogout = async () => { await supabase.auth.signOut(); setCollector(null); setCollectorDropOpen(false); setView({ page: "home", id: null }); };
  const onArtistProfileSaved = (updated) => setArtist(updated);
  const onCollectorProfileSaved = (updated) => setCollector(updated);

  // Use fresh profile data from store if available, fall back to session state
  // Always merge session email in so bid matching works even if profiles.email was null
  const me = artist ? (store.artists[artist.id] || artist) : null;
  const meCollector = collector
    ? { ...(store.collectors?.[collector.id] || {}), ...collector }
    : null;
  const isLoggedIn = !!(me || meCollector);
  const liveCount = store.auctions.filter((a) => !a.removed && !a.paused && a.published && new Date(a.endDate) > new Date()).length;

  // Pre-fill invite code from ?invite= URL param
  const [pendingInviteCode, setPendingInviteCode] = useState("");
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("invite");
    if (code) {
      setPendingInviteCode(code.trim().toUpperCase());
      if (!artist && !collector) setView({ page: "signup", id: null });
      window.history.replaceState(null, "", window.location.pathname + window.location.hash);
    }
  }, []);

  const [bannerDismissed, setBannerDismissed] = useState(false);
  useEffect(() => { setBannerDismissed(false); }, [collector]);

  const outbidAuctions = meCollector ? store.auctions.filter((a) => {
    if (a.removed || !a.published) return false;
    if (getStatus(a) !== "live") return false;
    const bids = store.bids[a.id] || [];
    const myBids = bids.filter((b) => b.email === meCollector.email);
    if (!myBids.length) return false;
    const topBid = [...bids].sort((x, y) => y.amount - x.amount)[0];
    return topBid && topBid.email !== meCollector.email;
  }) : [];
  const outbidCount = outbidAuctions.length;

  if (!authReady) return (
    <>
      <style>{STYLES}</style>
      <div className="app-loading-screen" />
    </>
  );

  return (
    <>
      <style>{STYLES}</style>

      <nav className="nav">
        <div className="nav-logo" onClick={() => go("home")}>ArtDrop<span>Art Drop House</span></div>
        <div className="nav-actions">
          {liveCount > 0 && <span className="live-pip"><span className="pulse" style={{ background:"var(--rouge)" }} />{liveCount} live</span>}
          <button className="nav-link" onClick={() => go("home")}>{isLoggedIn ? "Drops" : "Browse"}</button>

          {/* Artist logged in */}
          {me && (
            <>
              <button className="nav-link nav-new-btn" onClick={() => go("create")}>+ New</button>
              <div className="artist-menu" ref={dropRef}>
                <button className="artist-avatar-btn" onClick={() => setDropOpen((o) => !o)} title={me.name}><AvatarImg avatar={me.avatar} alt={me.name} /></button>
                {dropOpen && (
                  <div className="artist-dropdown">
                    <div className="artist-dropdown-header"><div className="artist-dropdown-name">{me.name}</div><div className="artist-dropdown-email">{me.email}</div></div>
                    <button className="dropdown-item" onClick={() => go("dashboard")}><i className="fa-solid fa-chart-simple"></i> My Dashboard</button>
                    <button className="dropdown-item" onClick={() => go("create")}><i className="fa-solid fa-plus"></i> New Drop</button>
                    <button className="dropdown-item" onClick={() => go("invites")}><i className="fa-solid fa-envelope"></i> Invites</button>
                    <button className="dropdown-item" onClick={() => go("edit-profile")}><i className="fa-solid fa-user-pen"></i> Edit Profile</button>
                    <div className="dropdown-divider" />
                    <button className="dropdown-item danger" onClick={onLogout}>Sign Out</button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Collector logged in (not artist) */}
          {meCollector && !me && (
            <div className="artist-menu" ref={collectorDropRef}>
              <button className="artist-avatar-btn collector-avatar-btn" onClick={() => setCollectorDropOpen((o) => !o)} title={meCollector.name}><AvatarImg avatar={meCollector.avatar} alt={meCollector.name} /></button>
              {outbidCount > 0 && <span className="notif-badge">{outbidCount}</span>}
              {collectorDropOpen && (
                <div className="artist-dropdown">
                  <div className="artist-dropdown-header"><div className="artist-dropdown-name">{meCollector.name}</div><div className="artist-dropdown-email">{meCollector.email} · Collector</div></div>
                  <button className="dropdown-item" onClick={() => go("collector-dashboard")}><i className="fa-solid fa-folder-open"></i> My Collection</button>
                  <button className="dropdown-item" onClick={() => go("invites")}><i className="fa-solid fa-envelope"></i> Invites</button>
                  <button className="dropdown-item" onClick={() => go("edit-profile")}><i className="fa-solid fa-user-pen"></i> Edit Profile</button>
                  <div className="dropdown-divider" />
                  <button className="dropdown-item danger" onClick={onCollectorLogout}>Sign Out</button>
                </div>
              )}
            </div>
          )}

          {/* Logged out */}
          {!me && !meCollector && (
            <>
              <button className="nav-link" onClick={() => go("login")}>Sign In</button>
              <button className="nav-link" onClick={() => go("collector-signup")}>Collect Art</button>
              <button className="btn btn-primary btn-sm" onClick={() => go("signup")}>Join as Artist</button>
            </>
          )}
        </div>
      </nav>
      <MobileBottomNav
        page={view.page}
        isArtist={!!me}
        isCollector={!!meCollector}
        onNavigate={go}
      />
      {meCollector && outbidCount > 0 && !bannerDismissed && (
        <div className="outbid-banner">
          <i className="fa-solid fa-triangle-exclamation"></i>
          <span>You've been outbid on <strong>{outbidCount} live drop{outbidCount !== 1 ? "s" : ""}</strong>.</span>
          <button className="outbid-banner-link" onClick={() => go("collector-dashboard")}>View My Collection <i className="fa-solid fa-arrow-right"></i></button>
          <button className="outbid-banner-dismiss" onClick={() => setBannerDismissed(true)}><i className="fa-solid fa-xmark"></i></button>
        </div>
      )}

      {view.page === "home" && (
        isLoggedIn
          ? <FeedPage onNavigate={go} store={store} updateStore={updateStore} me={me} meCollector={meCollector} />
          : <AuthPage store={store} updateStore={updateStore} onLogin={onLogin} onCollectorLogin={onCollectorLogin} initialMode="login" initialInviteCode={pendingInviteCode} />
      )}
      {(view.page === "login" || view.page === "signup" || view.page === "collector-signup") && (
        isLoggedIn
          ? <FeedPage onNavigate={go} store={store} updateStore={updateStore} me={me} meCollector={meCollector} />
          : <AuthPage store={store} updateStore={updateStore} onLogin={onLogin} onCollectorLogin={onCollectorLogin}
              initialMode={view.page === "signup" ? "signup" : view.page === "collector-signup" ? "collector-signup" : "login"}
              initialInviteCode={pendingInviteCode} />
      )}
      {view.page === "dashboard"           && me          && <DashboardPage artist={me} onNavigate={go} store={store} updateStore={updateStore} />}
      {view.page === "create"              && me          && <CreatePage    artist={me} onNavigate={go} store={store} updateStore={updateStore} galleryItemId={view.id || null} />}
      {view.page === "add-artwork"         && me          && <AddArtworkPage artist={me} store={store} updateStore={updateStore} onNavigate={go} />}
      {view.page === "edit-artwork"        && me          && <AddArtworkPage artist={me} store={store} updateStore={updateStore} onNavigate={go} editItemId={view.id} />}
      {view.page === "edit-profile"        && me          && <EditProfilePage user={me} userType="artist" onNavigate={go} updateStore={updateStore} onProfileSaved={onArtistProfileSaved} />}
      {view.page === "edit-profile"        && meCollector && !me && <EditProfilePage user={meCollector} userType="collector" onNavigate={go} updateStore={updateStore} onProfileSaved={onCollectorProfileSaved} />}
      {view.page === "auction"             && <AuctionPage auctionId={view.id} onNavigate={go} store={store} updateStore={updateStore} loadAuctionDetail={loadAuctionDetail} artist={me} meCollector={meCollector} bidderName={bidderName} setBidderName={setBidderName} bidderEmail={bidderEmail} setBidderEmail={setBidderEmail} />}
      {view.page === "payment"             && (isLoggedIn ? <PaymentPage auctionId={view.id} onNavigate={go} store={store} updateStore={updateStore} loadAuctionDetail={loadAuctionDetail} bidderName={bidderName} bidderEmail={bidderEmail} meCollector={meCollector} /> : <AuthPage store={store} updateStore={updateStore} onLogin={onLogin} onCollectorLogin={onCollectorLogin} initialMode="login" initialInviteCode={pendingInviteCode} />)}
      {view.page === "edit"                && me          && <EditPage auctionId={view.id} artist={me} onNavigate={go} store={store} updateStore={updateStore} />}
      {view.page === "artist"              && (isLoggedIn ? <ArtistPage artistId={view.id} onNavigate={go} store={store} updateStore={updateStore} me={me} meCollector={meCollector} /> : <AuthPage store={store} updateStore={updateStore} onLogin={onLogin} onCollectorLogin={onCollectorLogin} initialMode="login" initialInviteCode={pendingInviteCode} />)}
      {view.page === "collector-dashboard" && meCollector && <CollectorDashboardPage meCollector={meCollector} onNavigate={go} store={store} updateStore={updateStore} />}
      {view.page === "invites"             && isLoggedIn  && <InvitePage user={me || meCollector} store={store} updateStore={updateStore} onNavigate={go} />}
    </>
  );
}
