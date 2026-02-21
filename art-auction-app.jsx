import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "./src/supabase.js";

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --ink: #1a1a2e;
    --parchment: #f0f4f8;
    --cream: #f7f9fc;
    --gold: #e8526a;
    --gold-light: #fce4e8;
    --gold-dark: #c73652;
    --rouge: #e8526a;
    --slate: #4a5568;
    --mist: #a0aec0;
    --border: #e8edf3;
    --success: #38a169;
    --amber: #ed8936;
    --accent2: #667eea;
    --accent2-light: #ebedfd;
    --font-display: 'Inter', system-ui, sans-serif;
    --font-body: 'Inter', system-ui, sans-serif;
    --font-mono: 'Inter', system-ui, sans-serif;
    --shadow-sm: 0 2px 12px rgba(26,26,46,0.06);
    --shadow-md: 0 8px 30px rgba(26,26,46,0.10);
    --shadow-lg: 0 20px 60px rgba(26,26,46,0.14);
    --shadow-card: 0 4px 24px rgba(26,26,46,0.08);
    --radius: 14px;
    --radius-lg: 20px;
    --radius-xl: 28px;
    --grad-accent: linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
    --grad-primary: linear-gradient(135deg, #e8526a 0%, #cc2366 100%);
    --grad-cool: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  html { scroll-behavior: smooth; }
  body { font-family: var(--font-body); background: var(--cream); color: var(--ink); font-size: 16px; line-height: 1.6; min-height: 100vh; }

  /* Nav */
  .nav { position: sticky; top: 0; z-index: 200; background: rgba(247,249,252,0.85); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border-bottom: 1px solid var(--border); padding: 0 2rem; display: flex; align-items: center; justify-content: space-between; height: 68px; }
  .nav-logo { font-family: var(--font-display); font-size: 1.4rem; font-weight: 700; color: var(--ink); cursor: pointer; letter-spacing: -0.02em; }
  .nav-logo span { color: var(--mist); font-style: normal; font-weight: 400; font-size: 0.78rem; letter-spacing: 0.04em; display: block; line-height: 1; margin-top: 1px; }
  .nav-actions { display: flex; gap: 0.5rem; align-items: center; }
  .nav-link { color: var(--slate); font-size: 0.88rem; font-weight: 500; cursor: pointer; transition: color 0.2s; background: none; border: none; font-family: var(--font-body); padding: 0.5rem 0.75rem; border-radius: 10px; }
  .nav-link:hover { color: var(--ink); background: var(--parchment); }
  .live-pip { font-family: var(--font-mono); font-size: 0.72rem; color: var(--rouge); display: flex; align-items: center; gap: 0.35rem; background: var(--gold-light); padding: 0.3rem 0.7rem; border-radius: 100px; }
  .pulse { width: 6px; height: 6px; border-radius: 50%; background: var(--rouge); animation: pulse 1.4s infinite; flex-shrink: 0; }
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.7)} }

  /* Artist avatar dropdown */
  .artist-menu { position: relative; }
  .artist-avatar-btn { width: 44px; height: 44px; border-radius: 50%; background: var(--grad-primary); border: none; cursor: pointer; font-size: 1.1rem; display: flex; align-items: center; justify-content: center; color: white; transition: transform 0.15s; box-shadow: 0 2px 10px rgba(232,82,106,0.35); }
  .artist-avatar-btn:hover { transform: scale(1.08); }
  .artist-dropdown { position: absolute; top: calc(100% + 10px); right: 0; min-width: 220px; background: white; border: 1px solid var(--border); border-radius: var(--radius-lg); box-shadow: var(--shadow-lg); overflow: hidden; animation: dropIn 0.18s ease; z-index: 300; }
  @keyframes dropIn { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
  .artist-dropdown-header { padding: 1rem 1.25rem; background: var(--cream); border-bottom: 1px solid var(--border); }
  .artist-dropdown-name { font-weight: 600; font-size: 0.95rem; color: var(--ink); }
  .artist-dropdown-email { font-size: 0.75rem; color: var(--mist); margin-top: 0.15rem; }
  .dropdown-item { display: flex; align-items: center; gap: 0.6rem; padding: 0.75rem 1.25rem; font-size: 0.88rem; cursor: pointer; color: var(--slate); transition: background 0.15s; border: none; background: none; width: 100%; text-align: left; font-family: var(--font-body); font-weight: 500; }
  .dropdown-item:hover { background: var(--cream); color: var(--ink); }
  .dropdown-item.danger { color: var(--rouge); }
  .dropdown-item.danger:hover { background: var(--gold-light); }
  .dropdown-divider { height: 1px; background: var(--border); }

  /* Buttons */
  .btn { font-family: var(--font-body); font-size: 0.88rem; font-weight: 600; letter-spacing: -0.01em; padding: 0.75rem 1.5rem; border-radius: 100px; cursor: pointer; transition: all 0.2s; border: none; display: inline-flex; align-items: center; gap: 0.45rem; }
  .btn-primary { background: var(--grad-primary); color: white; box-shadow: 0 4px 16px rgba(232,82,106,0.35); }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(232,82,106,0.45); }
  .btn-outline { background: transparent; color: var(--gold); border: 2px solid var(--gold); }
  .btn-outline:hover { background: var(--gold-light); }
  .btn-dark { background: var(--ink); color: white; }
  .btn-dark:hover { background: var(--slate); transform: translateY(-1px); }
  .btn-ghost { background: white; color: var(--slate); border: 1.5px solid var(--border); box-shadow: var(--shadow-sm); }
  .btn-ghost:hover { border-color: var(--gold); color: var(--gold-dark); background: var(--gold-light); }
  .btn-danger { background: linear-gradient(135deg, #fc5c7d, #e8526a); color: white; box-shadow: 0 4px 14px rgba(232,82,106,0.3); }
  .btn-danger:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(232,82,106,0.4); }
  .btn-warning { background: linear-gradient(135deg, #f6d365, #ed8936); color: white; box-shadow: 0 4px 14px rgba(237,137,54,0.3); }
  .btn-warning:hover { transform: translateY(-1px); }
  .btn-success { background: linear-gradient(135deg, #56ab2f, #38a169); color: white; box-shadow: 0 4px 14px rgba(56,161,105,0.3); }
  .btn-success:hover { transform: translateY(-1px); }
  .btn-sm { padding: 0.45rem 1rem; font-size: 0.78rem; min-height: 44px; }
  .btn-lg { padding: 0.95rem 2.25rem; font-size: 0.95rem; }
  .btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none !important; box-shadow: none !important; }

  /* Auth */
  .auth-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 2rem; background: var(--cream); position: relative; overflow: hidden; }
  .auth-bg { position: absolute; inset: 0; background: radial-gradient(ellipse at 20% 50%, rgba(232,82,106,0.07) 0%, transparent 55%), radial-gradient(ellipse at 80% 20%, rgba(102,126,234,0.06) 0%, transparent 50%); }
  .auth-grid { position: absolute; top: -80px; right: -80px; width: 360px; height: 360px; border-radius: 50%; background: var(--grad-accent); opacity: 0.07; filter: blur(60px); }
  .auth-card { background: white; border-radius: var(--radius-xl); padding: 2.5rem; width: 100%; max-width: 440px; box-shadow: var(--shadow-lg); position: relative; z-index: 1; animation: slideUp 0.3s ease; border: 1px solid var(--border); }
  .auth-logo { font-size: 1.6rem; font-weight: 700; color: var(--ink); text-align: center; margin-bottom: 0.2rem; letter-spacing: -0.03em; }
  .auth-logo-sub { font-size: 0.78rem; color: var(--mist); font-weight: 400; text-align: center; margin-bottom: 2rem; }
  .auth-title { font-size: 1.5rem; font-weight: 700; margin-bottom: 0.3rem; color: var(--ink); letter-spacing: -0.02em; }
  .auth-sub { font-size: 0.88rem; color: var(--mist); margin-bottom: 1.75rem; }
  .auth-switch { text-align: center; font-size: 0.85rem; color: var(--mist); margin-top: 1.5rem; }
  .auth-switch button { background: none; border: none; color: var(--gold-dark); cursor: pointer; font-weight: 600; font-size: 0.85rem; }
  .auth-switch button:hover { text-decoration: underline; }
  .avatar-picker { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.5rem; }
  .avatar-opt { width: 44px; height: 44px; border-radius: 50%; border: 2px solid var(--border); display: flex; align-items: center; justify-content: center; font-size: 1.2rem; cursor: pointer; transition: all 0.15s; background: var(--cream); }
  .avatar-opt:hover { border-color: var(--gold); transform: scale(1.1); }
  .avatar-opt.selected { border-color: var(--gold); background: var(--gold-light); box-shadow: 0 0 0 3px rgba(232,82,106,0.15); }

  /* Hero */
  .hero { background: var(--cream); min-height: 86vh; display: flex; align-items: center; position: relative; overflow: hidden; padding: 4rem 2rem; }
  .hero-bg { position: absolute; inset: 0; background: radial-gradient(ellipse at 70% 30%, rgba(232,82,106,0.08) 0%, transparent 50%), radial-gradient(ellipse at 20% 80%, rgba(102,126,234,0.07) 0%, transparent 50%); }
  .hero-grid { position: absolute; top: -100px; right: -100px; width: 500px; height: 500px; border-radius: 50%; background: var(--grad-accent); opacity: 0.06; filter: blur(80px); pointer-events: none; }
  .hero-inner { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center; position: relative; z-index: 1; width: 100%; }
  .hero-eyebrow { font-size: 0.75rem; font-weight: 600; color: var(--gold-dark); letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 1.25rem; display: inline-flex; align-items: center; gap: 0.5rem; background: var(--gold-light); padding: 0.35rem 0.85rem; border-radius: 100px; }
  .hero-eyebrow::before { display: none; }
  .hero-title { font-size: clamp(2rem, 5vw, 4rem); color: var(--ink); line-height: 1.1; margin-bottom: 1.25rem; font-weight: 700; letter-spacing: -0.03em; }
  .hero-title em { background: var(--grad-primary); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-style: normal; }
  .hero-subtitle { color: var(--slate); font-size: 1.05rem; line-height: 1.75; margin-bottom: 2.5rem; font-weight: 400; }
  .hero-actions { display: flex; gap: 1rem; flex-wrap: wrap; }
  .hero-art-preview { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .preview-card { background: white; border: 1px solid var(--border); border-radius: var(--radius-xl); overflow: hidden; aspect-ratio: 3/4; display: flex; flex-direction: column; transition: transform 0.3s; box-shadow: var(--shadow-card); cursor: pointer; }
  .preview-card:hover { transform: translateY(-6px); box-shadow: var(--shadow-lg); }
  .preview-card:first-child { grid-row: span 2; aspect-ratio: unset; }
  .preview-card-emoji { font-size: 3rem; flex: 1; display: flex; align-items: center; justify-content: center; background: var(--parchment); }
  .preview-card-content { padding: 0.85rem 1rem; background: white; border-top: 1px solid var(--border); }
  .preview-card-art { font-size: 0.84rem; font-weight: 600; color: var(--ink); }
  .preview-card-bid { font-size: 0.75rem; color: var(--gold-dark); font-weight: 600; margin-top: 0.15rem; }

  /* Features */
  .features-strip { background: white; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
  .features-inner { max-width: 1200px; margin: 0 auto; padding: 2rem; display: grid; grid-template-columns: repeat(4, 1fr); gap: 2rem; }
  .feature-item { text-align: center; padding: 1.5rem 1rem; }
  .feature-icon { font-size: 1.8rem; margin-bottom: 0.75rem; width: 56px; height: 56px; border-radius: 16px; display: flex; align-items: center; justify-content: center; margin: 0 auto 0.9rem; background: var(--parchment); }
  .feature-label { font-size: 0.95rem; color: var(--ink); margin-bottom: 0.35rem; font-weight: 600; }
  .feature-desc { font-size: 0.82rem; color: var(--mist); line-height: 1.5; }

  /* Browse */
  .section { max-width: 1200px; margin: 0 auto; padding: 4rem 2rem; }
  .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
  .section-title { font-size: 1.75rem; color: var(--ink); font-weight: 700; letter-spacing: -0.02em; }
  .section-title em { font-style: normal; background: var(--grad-primary); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .auction-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(300px, 100%), 1fr)); gap: 1.5rem; }
  .auction-card { background: white; border: 1px solid var(--border); border-radius: var(--radius-xl); overflow: hidden; cursor: pointer; transition: all 0.3s; box-shadow: var(--shadow-card); }
  .auction-card:hover { transform: translateY(-6px); box-shadow: var(--shadow-lg); }
  .auction-card.is-paused { opacity: 0.7; cursor: default; }
  .auction-card.is-paused:hover { transform: none; box-shadow: var(--shadow-card); }
  .card-image { aspect-ratio: 4/3; background: var(--parchment); display: flex; align-items: center; justify-content: center; font-size: 4rem; overflow: hidden; position: relative; }
  .card-image img { width: 100%; height: 100%; object-fit: cover; }
  .badge { position: absolute; top: 12px; left: 12px; font-size: 0.7rem; font-weight: 600; padding: 0.3rem 0.75rem; border-radius: 100px; display: flex; align-items: center; gap: 0.4rem; backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); }
  .badge-live { background: rgba(232,82,106,0.9); color: white; }
  .badge-paused { background: rgba(237,137,54,0.9); color: white; }
  .badge-ended { background: rgba(74,85,104,0.85); color: white; }
  .card-body { padding: 1.1rem 1.25rem 1.4rem; }
  .card-artist { font-size: 0.72rem; color: var(--mist); font-weight: 500; margin-bottom: 0.3rem; }
  .card-title { font-size: 1.05rem; font-weight: 700; color: var(--ink); margin-bottom: 0.75rem; letter-spacing: -0.01em; line-height: 1.3; }
  .card-meta { display: flex; justify-content: space-between; align-items: flex-end; }
  .card-price-label { font-size: 0.68rem; color: var(--mist); font-weight: 500; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 0.15rem; }
  .card-price { font-size: 1.35rem; font-weight: 700; color: var(--gold-dark); letter-spacing: -0.02em; }
  .card-timer-label { font-size: 0.68rem; color: var(--mist); font-weight: 500; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 0.15rem; text-align: right; }
  .card-timer-val { font-size: 0.82rem; color: var(--ink); text-align: right; font-weight: 600; }
  .empty-state { text-align: center; padding: 5rem 2rem; color: var(--mist); }
  .empty-state h3 { font-size: 1.6rem; margin-bottom: 0.75rem; color: var(--ink); font-weight: 700; letter-spacing: -0.02em; }

  /* Dashboard */
  .dashboard { max-width: 1000px; margin: 0 auto; padding: 3rem 2rem 5rem; }
  .dash-greeting { font-size: 2rem; font-weight: 700; margin-bottom: 0.3rem; letter-spacing: -0.03em; }
  .dash-greeting em { font-style: normal; background: var(--grad-primary); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .dash-subtitle { color: var(--mist); font-size: 0.88rem; margin-bottom: 2.5rem; }
  .dash-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 2.5rem; }
  .stat-card { background: white; border: 1px solid var(--border); border-radius: var(--radius-xl); padding: 1.4rem; box-shadow: var(--shadow-sm); }
  .stat-value { font-size: 2rem; font-weight: 700; line-height: 1; letter-spacing: -0.03em; }
  .stat-value.c-gold { color: var(--gold-dark); }
  .stat-value.c-rouge { color: var(--rouge); }
  .stat-label { font-size: 0.72rem; color: var(--mist); font-weight: 500; text-transform: uppercase; letter-spacing: 0.06em; margin-top: 0.45rem; }
  .dash-section-title { font-size: 1.2rem; font-weight: 700; margin-bottom: 1.25rem; display: flex; align-items: center; justify-content: space-between; letter-spacing: -0.01em; }
  .auction-mgmt-list { display: flex; flex-direction: column; gap: 0.75rem; }
  .mgmt-card { background: white; border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 1rem 1.25rem; display: flex; align-items: center; gap: 1rem; transition: all 0.2s; box-shadow: var(--shadow-sm); }
  .mgmt-card:hover { box-shadow: var(--shadow-md); transform: translateY(-1px); }
  .mgmt-card.st-paused { border-left: 3px solid var(--amber); }
  .mgmt-card.st-ended { border-left: 3px solid var(--border); opacity: 0.8; }
  .mgmt-thumb { width: 56px; height: 56px; border-radius: 14px; overflow: hidden; flex-shrink: 0; background: var(--parchment); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; }
  .mgmt-thumb img { width: 100%; height: 100%; object-fit: cover; }
  .mgmt-info { flex: 1; min-width: 0; }
  .mgmt-title { font-weight: 600; font-size: 0.95rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; letter-spacing: -0.01em; }
  .mgmt-meta { font-size: 0.75rem; color: var(--mist); margin-top: 0.2rem; }
  .mgmt-actions { display: flex; gap: 0.4rem; flex-wrap: wrap; flex-shrink: 0; }
  .status-pill { display: inline-flex; align-items: center; gap: 0.3rem; font-size: 0.72rem; font-weight: 600; padding: 0.22rem 0.65rem; border-radius: 100px; letter-spacing: 0.02em; }
  .sp-live { background: var(--gold-light); color: var(--gold-dark); }
  .sp-paused { background: rgba(237,137,54,0.12); color: var(--amber); }
  .sp-ended { background: var(--parchment); color: var(--mist); }

  /* Create / Forms */
  .page-container { max-width: 760px; margin: 0 auto; padding: 3rem 2rem 5rem; }
  .page-title { font-size: 2.1rem; color: var(--ink); margin-bottom: 0.4rem; font-weight: 700; letter-spacing: -0.03em; }
  .page-title em { font-style: normal; background: var(--grad-primary); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .page-subtitle { color: var(--mist); font-size: 0.9rem; margin-bottom: 3rem; }
  .form-group { margin-bottom: 1.5rem; }
  .form-label { display: block; font-size: 0.78rem; font-weight: 600; color: var(--slate); letter-spacing: 0.03em; margin-bottom: 0.5rem; }
  .form-input, .form-textarea, .form-select { width: 100%; padding: 0.85rem 1.1rem; background: white; border: 1.5px solid var(--border); border-radius: var(--radius); font-family: var(--font-body); font-size: 0.95rem; color: var(--ink); transition: border-color 0.2s, box-shadow 0.2s; appearance: none; }
  .form-input:focus, .form-textarea:focus, .form-select:focus { outline: none; border-color: var(--gold); box-shadow: 0 0 0 4px rgba(232,82,106,0.1); }
  .form-textarea { resize: vertical; min-height: 90px; line-height: 1.6; }
  .form-hint { font-size: 0.76rem; color: var(--mist); margin-top: 0.35rem; }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
  .input-prefix { display: flex; }
  .input-prefix-sym { background: var(--parchment); border: 1.5px solid var(--border); border-right: none; border-radius: var(--radius) 0 0 var(--radius); padding: 0.85rem 0.875rem; color: var(--mist); font-size: 0.9rem; flex-shrink: 0; font-weight: 500; }
  .input-prefix .form-input { border-radius: 0 var(--radius) var(--radius) 0; }
  .upload-zone { border: 2px dashed var(--border); border-radius: var(--radius-lg); padding: 2.5rem 2rem; text-align: center; cursor: pointer; transition: all 0.2s; background: white; }
  .upload-zone:hover, .upload-zone.drag-over { border-color: var(--gold); background: var(--gold-light); }
  .upload-icon { font-size: 2.2rem; margin-bottom: 0.75rem; }
  .upload-label { font-size: 1rem; font-weight: 600; color: var(--ink); margin-bottom: 0.35rem; }
  .upload-sub { font-size: 0.8rem; color: var(--mist); }
  .upload-preview { width: 100%; max-height: 360px; object-fit: contain; border-radius: var(--radius); margin-bottom: 0.65rem; }
  .step-indicator { display: flex; align-items: center; margin-bottom: 3rem; overflow-x: auto; padding-bottom: 0.25rem; }
  .step-num { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.78rem; font-weight: 600; border: 1.5px solid var(--border); background: white; color: var(--mist); transition: all 0.2s; flex-shrink: 0; }
  .step-num.active { background: var(--grad-primary); border-color: transparent; color: white; box-shadow: 0 4px 12px rgba(232,82,106,0.35); }
  .step-num.done { background: var(--ink); border-color: var(--ink); color: white; }
  .step-label { font-size: 0.72rem; font-weight: 500; color: var(--mist); margin-left: 0.45rem; white-space: nowrap; }
  .step-label.active { color: var(--ink); font-weight: 600; }
  .step-line { flex: 1; height: 2px; background: var(--border); margin: 0 0.5rem; min-width: 12px; border-radius: 2px; }
  .form-actions { display: flex; gap: 0.75rem; margin-top: 2.5rem; justify-content: flex-end; align-items: center; }

  /* Auction detail */
  .auction-detail { max-width: 1100px; margin: 0 auto; padding: 2.5rem 2rem 5rem; }
  .auction-layout { display: grid; grid-template-columns: 1.2fr 1fr; gap: 3rem; align-items: start; margin-top: 1.5rem; }
  .auction-layout > div { min-width: 0; }
  .auction-art-frame { border-radius: var(--radius-xl); box-shadow: var(--shadow-lg); position: sticky; top: 84px; background: var(--parchment); overflow: hidden; }
  .auction-art-frame img { width: 100%; max-width: 100%; height: auto; display: block; }
  .auction-art-placeholder { aspect-ratio: 4/5; display: flex; align-items: center; justify-content: center; font-size: 6rem; background: var(--parchment); }
  .auction-eyebrow { font-size: 0.72rem; font-weight: 600; color: var(--mist); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 0.5rem; }
  .auction-title { font-size: 1.9rem; color: var(--ink); font-weight: 700; line-height: 1.15; margin-bottom: 0.25rem; letter-spacing: -0.03em; }
  .auction-artist-name { font-size: 1rem; color: var(--gold-dark); font-weight: 500; margin-bottom: 1.25rem; }
  .auction-desc { color: var(--slate); line-height: 1.8; font-size: 0.92rem; margin-bottom: 1.75rem; }
  .countdown-block { background: var(--ink); border-radius: var(--radius-lg); padding: 1.4rem 1.6rem; margin-bottom: 1.25rem; }
  .countdown-label { font-size: 0.68rem; font-weight: 600; color: rgba(255,255,255,0.4); letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 0.85rem; }
  .countdown-digits { display: flex; gap: 0.6rem; align-items: center; }
  .countdown-unit { text-align: center; }
  .countdown-num { font-size: clamp(1.4rem, 5vw, 2rem); font-weight: 700; color: white; line-height: 1; }
  .countdown-unit-label { font-size: 0.65rem; color: rgba(255,255,255,0.4); letter-spacing: 0.08em; text-transform: uppercase; margin-top: 0.25rem; font-weight: 500; }
  .countdown-sep { font-size: 1.6rem; color: rgba(255,255,255,0.3); padding-bottom: 0.35rem; }
  .countdown-ended { font-size: 1.1rem; font-weight: 500; color: rgba(255,255,255,0.5); }
  .paused-notice { background: rgba(237,137,54,0.08); border: 1.5px solid rgba(237,137,54,0.25); border-radius: var(--radius); padding: 0.85rem 1rem; font-size: 0.88rem; color: var(--amber); margin-bottom: 1.25rem; font-weight: 500; }
  .bid-block { background: white; border: 1.5px solid var(--border); border-radius: var(--radius-lg); padding: 1.4rem 1.6rem; margin-bottom: 1.25rem; box-shadow: var(--shadow-sm); }
  .bid-current-label { font-size: 0.7rem; font-weight: 600; color: var(--mist); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 0.2rem; }
  .bid-current-amount { font-size: 2.6rem; font-weight: 700; color: var(--ink); line-height: 1; margin-bottom: 0.2rem; letter-spacing: -0.04em; }
  .bid-count { font-size: 0.8rem; color: var(--mist); margin-bottom: 1.25rem; }
  .bid-input-row { display: flex; gap: 0.65rem; margin-bottom: 0.4rem; }
  .bid-min-hint { font-size: 0.76rem; color: var(--mist); }
  .bid-history { margin-top: 1.4rem; }
  .bid-history-title { font-size: 0.92rem; font-weight: 700; margin-bottom: 0.65rem; letter-spacing: -0.01em; }
  .bid-list { list-style: none; }
  .bid-item { display: flex; justify-content: space-between; align-items: center; padding: 0.6rem 0; border-bottom: 1px solid var(--border); font-size: 0.85rem; gap: 0.5rem; }
  .bid-item:last-child { border-bottom: none; }
  .bid-item.top-bid { background: var(--gold-light); margin: 0 -0.75rem; padding: 0.6rem 0.75rem; border-radius: var(--radius); border-bottom: none; }
  .bid-item-bidder { color: var(--slate); font-weight: 500; }
  .bid-item-amount { font-weight: 700; color: var(--gold-dark); }
  .bid-item-time { font-size: 0.72rem; color: var(--mist); flex-shrink: 0; }
  .artist-mgmt-bar { background: white; border: 1.5px solid var(--border); border-radius: var(--radius-lg); padding: 1rem 1.25rem; margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem; box-shadow: var(--shadow-sm); }
  .artist-mgmt-label { font-size: 0.72rem; font-weight: 600; color: var(--slate); letter-spacing: 0.04em; text-transform: uppercase; display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
  .artist-mgmt-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
  .share-block { background: var(--parchment); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 1.2rem 1.4rem; margin-bottom: 1.25rem; }
  .share-title { font-size: 0.78rem; font-weight: 600; color: var(--slate); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 0.7rem; }
  .share-url { display: flex; gap: 0.5rem; margin-bottom: 0.7rem; }
  .share-url-text { flex: 1; padding: 0.55rem 0.85rem; background: white; border: 1.5px solid var(--border); border-radius: 100px; font-size: 0.75rem; color: var(--mist); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .share-buttons { display: flex; flex-wrap: wrap; gap: 0.45rem; }
  .share-btn { font-size: 0.78rem; font-weight: 500; padding: 0.65rem 1rem; min-height: 44px; border-radius: 100px; border: 1.5px solid var(--border); background: white; cursor: pointer; transition: all 0.18s; font-family: var(--font-body); display: flex; align-items: center; gap: 0.35rem; color: var(--slate); }
  .share-btn:hover { border-color: var(--gold); color: var(--gold-dark); background: var(--gold-light); }
  .copied-toast { font-size: 0.76rem; color: var(--success); font-weight: 600; }

  /* Payment */
  .payment-page { max-width: 620px; margin: 0 auto; padding: 3rem 2rem 5rem; }
  .winner-banner { background: var(--grad-primary); border-radius: var(--radius-xl); padding: 2rem; margin-bottom: 2rem; text-align: center; box-shadow: 0 8px 32px rgba(232,82,106,0.35); }
  .winner-crown { font-size: 2.5rem; margin-bottom: 0.65rem; }
  .winner-title { font-size: 1.6rem; font-weight: 700; color: white; margin-bottom: 0.35rem; letter-spacing: -0.02em; }
  .winner-sub { font-size: 0.85rem; color: rgba(255,255,255,0.75); }
  .payment-options { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; margin-bottom: 1.5rem; }
  .payment-opt { border: 2px solid var(--border); border-radius: var(--radius-lg); padding: 1.15rem 1rem; cursor: pointer; transition: all 0.2s; text-align: center; background: white; box-shadow: var(--shadow-sm); }
  .payment-opt:hover { border-color: var(--gold); box-shadow: var(--shadow-md); }
  .payment-opt.selected { border-color: var(--gold); background: var(--gold-light); }
  .payment-opt-icon { font-size: 1.4rem; margin-bottom: 0.4rem; }
  .payment-opt-name { font-size: 0.82rem; font-weight: 600; }
  .payment-opt-handle { font-size: 0.7rem; color: var(--gold-dark); margin-top: 0.15rem; font-weight: 500; }
  .payment-instruction { background: var(--parchment); border: 1.5px solid var(--border); border-radius: var(--radius-lg); padding: 1.2rem 1.4rem; margin-bottom: 1.5rem; font-size: 0.88rem; color: var(--slate); line-height: 1.7; }
  .payment-amount { font-size: 1.5rem; font-weight: 700; color: var(--gold-dark); margin: 0.5rem 0; letter-spacing: -0.02em; }

  /* Modals */
  .modal-overlay { position: fixed; inset: 0; background: rgba(26,26,46,0.5); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); z-index: 300; display: flex; align-items: center; justify-content: center; padding: 1rem; animation: fadeIn 0.15s ease; }
  .modal { background: white; border-radius: var(--radius-xl); max-width: 460px; width: 100%; padding: 2rem; box-shadow: var(--shadow-lg); position: relative; animation: slideUp 0.22s ease; border: 1px solid var(--border); }
  .modal-title { font-size: 1.4rem; margin-bottom: 0.5rem; font-weight: 700; letter-spacing: -0.02em; }
  .modal-sub { font-size: 0.88rem; color: var(--mist); margin-bottom: 1.5rem; line-height: 1.6; }
  .modal-close { position: absolute; top: 0.75rem; right: 0.75rem; background: var(--parchment); border: none; font-size: 1rem; cursor: pointer; color: var(--slate); padding: 0.6rem; min-width: 44px; min-height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 50%; }
  .modal-close:hover { background: var(--border); color: var(--ink); }
  .modal-actions { display: flex; gap: 0.75rem; margin-top: 1.5rem; }

  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }

  /* Alerts */
  .alert { padding: 0.9rem 1.1rem; border-radius: var(--radius); font-size: 0.86rem; margin-bottom: 1rem; display: flex; align-items: flex-start; gap: 0.5rem; line-height: 1.5; font-weight: 500; }
  .alert-success { background: rgba(56,161,105,0.1); border: 1.5px solid rgba(56,161,105,0.25); color: var(--success); }
  .alert-error { background: var(--gold-light); border: 1.5px solid rgba(232,82,106,0.25); color: var(--gold-dark); }
  .alert-info { background: var(--accent2-light); border: 1.5px solid rgba(102,126,234,0.25); color: var(--accent2); }

  /* Invite Page */
  .invite-page { max-width: 560px; margin: 0 auto; padding: 3rem 2rem 5rem; }
  .invite-code-box { background: var(--ink); border-radius: var(--radius-lg); padding: 1.75rem 2rem; margin-bottom: 1.5rem; text-align: center; }
  .invite-code-label { font-size: 0.68rem; font-weight: 600; color: rgba(255,255,255,0.4); letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 0.65rem; }
  .invite-code-value { font-size: 2.4rem; font-weight: 700; color: white; letter-spacing: 0.12em; font-family: var(--font-mono); margin-bottom: 0.85rem; }
  .invite-slots { display: flex; gap: 0.5rem; justify-content: center; margin-bottom: 0.75rem; }
  .invite-slot { width: 36px; height: 10px; border-radius: 100px; }
  .invite-slot.available { background: #38a169; }
  .invite-slot.used { background: rgba(255,255,255,0.15); }
  .invite-slots-label { font-size: 0.8rem; color: rgba(255,255,255,0.55); }
  .invite-copy-btn { background: rgba(255,255,255,0.1); border: 1.5px solid rgba(255,255,255,0.18); color: white; border-radius: 100px; padding: 0.55rem 1.25rem; font-size: 0.82rem; font-weight: 600; cursor: pointer; transition: all 0.18s; margin-top: 0.75rem; font-family: var(--font-body); }
  .invite-copy-btn:hover { background: rgba(255,255,255,0.18); }
  .invite-send-section { background: white; border: 1.5px solid var(--border); border-radius: var(--radius-lg); padding: 1.5rem; box-shadow: var(--shadow-sm); }
  .invite-send-title { font-size: 1rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--ink); }
  .invite-send-sub { font-size: 0.82rem; color: var(--mist); margin-bottom: 1.25rem; }
  .invite-send-row { display: flex; gap: 0.65rem; }
  .invite-exhausted { background: var(--parchment); border: 1.5px dashed var(--border); border-radius: var(--radius-lg); padding: 1.5rem; text-align: center; color: var(--mist); font-size: 0.88rem; }

  /* Misc */
  .divider { height: 1px; background: var(--border); margin: 1.75rem 0; }
  .tag { display: inline-block; background: var(--parchment); border: 1.5px solid var(--border); border-radius: 100px; font-size: 0.72rem; font-weight: 500; padding: 0.22rem 0.7rem; color: var(--slate); }
  .publish-summary-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; }
  .winner-summary-row { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem; }

  @media (max-width: 768px) {
    .nav { padding: 0 1rem; }
    .nav-logo span { display: none; }
    .hero-inner { grid-template-columns: 1fr; gap: 2rem; }
    .hero-art-preview { display: none; }
    .hero { padding: 2.5rem 1.25rem; min-height: auto; }
    .hero-actions { flex-direction: column; align-items: stretch; }
    .hero-actions .btn { width: 100%; justify-content: center; }
    .features-inner { grid-template-columns: 1fr 1fr; padding: 1.5rem 1.25rem; gap: 1rem; }
    .section { padding: 2.5rem 1.25rem; }
    .auction-layout { grid-template-columns: 1fr; }
    .auction-art-frame { position: static; max-width: 100%; overflow: hidden; }
    .dash-stats { grid-template-columns: 1fr 1fr; }
    .dashboard { padding: 2rem 1.25rem 4rem; }
    .collector-dashboard { padding: 2rem 1.25rem 4rem; }
    .artist-page { padding: 2rem 1.25rem 4rem; }
    .form-row { grid-template-columns: 1fr; }
    .payment-options { grid-template-columns: 1fr; }
    .mgmt-card { flex-wrap: wrap; }
    .page-container { padding: 2rem 1.25rem 4rem; }
    .auction-detail { padding: 1.5rem 1.25rem 4rem; overflow-x: hidden; }
    .payment-page { padding: 2rem 1.25rem 4rem; }
    .auth-card { padding: 1.75rem 1.5rem; }
    .artist-mgmt-actions { gap: 0.35rem; }
    .artist-mgmt-bar { flex-direction: column; align-items: flex-start; gap: 0.6rem; }
    .mgmt-actions { width: 100%; }
    .bid-input-row { flex-direction: column; }
    .bid-input-row .btn { width: 100%; justify-content: center; }
    .modal-actions { flex-direction: column; }
    .modal-actions .btn { width: 100%; justify-content: center; }
    .share-buttons { gap: 0.4rem; }
    .form-actions { justify-content: stretch; flex-direction: column-reverse; }
    .form-actions .btn { width: 100%; justify-content: center; }
    .countdown-block { padding: 1rem 1.1rem; }
  }

  @media (max-width: 550px) {
    .publish-summary-grid { grid-template-columns: 1fr 1fr; }
    .nav-actions .nav-link:not(:last-of-type) { display: none; }
    .features-inner { grid-template-columns: 1fr; }
    .dash-stats { grid-template-columns: 1fr 1fr; }
    .stat-value { font-size: 1.6rem; }
    .mgmt-actions { flex-wrap: wrap; gap: 0.35rem; }
    .artist-mgmt-bar { padding: 0.75rem 1rem; }
    .modal { padding: 1.5rem 1.25rem; }
    .countdown-sep { font-size: 1.2rem; }
    .section-title { font-size: 1.6rem; }
    .page-title { font-size: 1.9rem; }
    .dash-greeting { font-size: 1.75rem; }
    .auth-card { padding: 1.5rem 1.25rem; }
    .winner-banner { padding: 1.5rem 1.25rem; }
    .bid-current-amount { font-size: 2rem; }
    .feed-filter-input { width: 72px; }
    .artist-dropdown { min-width: 180px; }
    .countdown-num { font-size: clamp(1.1rem, 4vw, 1.6rem); }
    .auction-grid { grid-template-columns: 1fr; }
    .feed-grid { grid-template-columns: 1fr; }
  }

  /* ── Ooh reaction ────────────────────────────────────────────────────────── */
  .ooh-btn { display:inline-flex; align-items:center; gap:0.35rem; background:none; border:none; cursor:pointer; font-family:var(--font-body); font-size:0.82rem; font-weight:600; color:var(--mist); padding:0.4rem 0.6rem; border-radius:100px; transition:color 0.15s,background 0.15s; user-select:none; -webkit-user-select:none; }
  .ooh-btn:hover { color:var(--rouge); background:var(--gold-light); }
  .ooh-btn.oohed { color:var(--rouge); }
  .ooh-icon { font-size:1rem; display:inline-block; transform-origin:center; }
  .ooh-btn.just-oohed .ooh-icon { animation:ooh-burst 0.45s cubic-bezier(0.36,0.07,0.19,0.97) forwards; }
  @keyframes ooh-burst {
    0%   { transform:scale(1);    }
    30%  { transform:scale(1.7);  }
    60%  { transform:scale(0.85); }
    80%  { transform:scale(1.15); }
    100% { transform:scale(1);    }
  }
  .card-ooh-row { display:flex; align-items:center; justify-content:flex-end; margin-top:0.5rem; padding-top:0.5rem; border-top:1px solid var(--border); }
  .ooh-detail-wrap { display:flex; align-items:center; gap:0.75rem; margin-bottom:1.25rem; }
  .ooh-count-label { font-size:0.78rem; color:var(--mist); }

  /* ── Image picker ────────────────────────────────────────────────────────── */
  .img-picker-tabs { display:flex; gap:0.5rem; margin-bottom:0.75rem; }
  .img-picker-url-row { display:flex; gap:0.5rem; }
  .img-picker-url-row .form-input { flex:1; }

  /* ── Auth type toggle ────────────────────────────────────────────────────── */
  .auth-type-toggle { display:flex; gap:0.4rem; margin-bottom:1.75rem; background:var(--parchment); border-radius:100px; padding:0.3rem; }
  .auth-type-tab { flex:1; padding:0.45rem 0.75rem; border-radius:100px; border:none; background:none; font-family:var(--font-body); font-size:0.82rem; font-weight:600; color:var(--slate); cursor:pointer; transition:all 0.15s; }
  .auth-type-tab.active { background:white; color:var(--ink); box-shadow:var(--shadow-sm); }

  /* ── Feed page ───────────────────────────────────────────────────────────── */
  .feed-page { max-width:1200px; margin:0 auto; padding:2rem; }
  .feed-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:1.5rem; flex-wrap:wrap; gap:1rem; }
  .feed-title { font-size:1.5rem; font-weight:700; color:var(--ink); letter-spacing:-0.02em; }
  .sort-tabs { display:flex; gap:0.4rem; }
  .sort-tab { font-size:0.78rem; font-weight:600; padding:0.4rem 0.9rem; border-radius:100px; border:1.5px solid var(--border); background:white; color:var(--slate); cursor:pointer; transition:all 0.15s; font-family:var(--font-body); }
  .sort-tab.active { background:var(--grad-primary); color:white; border-color:transparent; box-shadow:0 2px 10px rgba(232,82,106,0.25); }
  .feed-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(min(300px,100%), 1fr)); gap:1.5rem; }

  /* ── Feed card ───────────────────────────────────────────────────────────── */
  .feed-card { background:white; border:1px solid var(--border); border-radius:var(--radius-xl); overflow:hidden; cursor:pointer; transition:all 0.3s; box-shadow:var(--shadow-card); }
  .feed-card:hover { transform:translateY(-4px); box-shadow:var(--shadow-lg); }
  .feed-card-header { display:flex; align-items:center; gap:0.65rem; padding:0.85rem 1rem 0; }
  .feed-avatar { width:34px; height:34px; border-radius:50%; background:var(--grad-accent); display:flex; align-items:center; justify-content:center; font-size:1rem; flex-shrink:0; }
  .feed-artist-name { font-size:0.82rem; font-weight:600; color:var(--ink); }
  .feed-time { font-size:0.7rem; color:var(--mist); }
  .feed-card .card-image { aspect-ratio:1/1; }
  .feed-desc { font-size:0.78rem; color:var(--slate); line-height:1.5; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; margin-bottom:0.5rem; }
  .feed-bid-count { display:inline-flex; align-items:center; gap:0.3rem; font-size:0.72rem; font-weight:600; color:var(--accent2); background:var(--accent2-light); padding:0.2rem 0.55rem; border-radius:100px; }
  .feed-comment-count { display:inline-flex; align-items:center; gap:0.3rem; font-size:0.72rem; font-weight:600; color:var(--slate); background:var(--parchment); padding:0.2rem 0.55rem; border-radius:100px; }
  .card-ooh-row.feed-ooh { justify-content:flex-start; }

  /* ── Compact hero ────────────────────────────────────────────────────────── */
  .hero-compact { min-height:50vh !important; padding:3.5rem 2rem !important; }
  .hero-compact .hero-inner { grid-template-columns:1fr !important; max-width:700px; margin:0 auto; text-align:center; }
  .hero-compact .hero-actions { justify-content:center; }
  .hero-compact .hero-art-preview { display:none !important; }

  /* ── Top Oohs section ────────────────────────────────────────────────────── */
  .top-oohs-section { background:white; border-top:1px solid var(--border); }

  /* ── Collector nav avatar ────────────────────────────────────────────────── */
  .collector-avatar-btn { background:var(--grad-cool) !important; box-shadow:0 2px 10px rgba(102,126,234,0.35) !important; }

  @media (max-width: 768px) {
    .feed-page { padding:1.25rem; }
    .feed-header { flex-direction:column; align-items:flex-start; }
  }

  /* ── Artist page ─────────────────────────────────────────────────────────── */
  .artist-page { max-width:900px; margin:0 auto; padding:3rem 2rem 5rem; }
  .artist-profile-card { background:white; border:1px solid var(--border); border-radius:var(--radius-xl); padding:2rem; margin-bottom:2rem; display:flex; align-items:flex-start; gap:1.5rem; box-shadow:var(--shadow-sm); flex-wrap:wrap; }
  .artist-profile-avatar { width:80px; height:80px; border-radius:50%; background:var(--grad-accent); display:flex; align-items:center; justify-content:center; font-size:2.2rem; flex-shrink:0; }
  .artist-profile-info { flex:1; min-width:200px; }
  .artist-profile-name { font-size:1.8rem; font-weight:700; color:var(--ink); letter-spacing:-0.03em; margin-bottom:0.15rem; }
  .artist-profile-since { font-size:0.78rem; color:var(--mist); margin-bottom:0.75rem; }
  .artist-profile-bio { font-size:0.9rem; color:var(--slate); line-height:1.7; }
  .artist-follow-wrap { display:flex; align-items:flex-start; padding-top:0.25rem; }
  .btn-follow-hint { font-size:0.78rem; color:var(--mist); cursor:pointer; background:none; border:none; font-family:var(--font-body); text-decoration:underline; }
  .btn-follow-hint:hover { color:var(--gold-dark); }

  /* ── Collector dashboard ─────────────────────────────────────────────────── */
  .collector-dashboard { max-width:1000px; margin:0 auto; padding:3rem 2rem 5rem; }
  .cdash-section { margin-bottom:3rem; }
  .cdash-section-title { font-size:1.1rem; font-weight:700; color:var(--ink); letter-spacing:-0.01em; margin-bottom:1.1rem; padding-bottom:0.6rem; border-bottom:1.5px solid var(--border); display:flex; align-items:center; gap:0.5rem; }
  .cdash-bid-list { display:flex; flex-direction:column; gap:0.75rem; }
  .cdash-bid-card { background:white; border:1px solid var(--border); border-radius:var(--radius-lg); padding:1rem 1.25rem; display:flex; align-items:center; gap:1rem; box-shadow:var(--shadow-sm); cursor:pointer; transition:all 0.2s; }
  .cdash-bid-card:hover { box-shadow:var(--shadow-md); transform:translateY(-1px); }
  .cdash-bid-thumb { width:52px; height:52px; border-radius:12px; background:var(--parchment); display:flex; align-items:center; justify-content:center; font-size:1.4rem; overflow:hidden; flex-shrink:0; }
  .cdash-bid-thumb img { width:100%; height:100%; object-fit:cover; }
  .cdash-bid-info { flex:1; min-width:0; }
  .cdash-bid-title { font-weight:600; font-size:0.92rem; color:var(--ink); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .cdash-bid-meta { font-size:0.75rem; color:var(--mist); margin-top:0.2rem; }
  .cdash-bid-status { flex-shrink:0; display:flex; flex-direction:column; align-items:flex-end; gap:0.3rem; }
  .bid-badge { font-size:0.72rem; font-weight:700; padding:0.22rem 0.65rem; border-radius:100px; letter-spacing:0.02em; }
  .bid-badge-winning { background:rgba(56,161,105,0.12); color:var(--success); }
  .bid-badge-outbid  { background:rgba(237,137,54,0.12);  color:var(--amber); }
  .bid-badge-won     { background:rgba(56,161,105,0.15);  color:var(--success); border:1.5px solid rgba(56,161,105,0.3); }
  .bid-badge-lost    { background:var(--parchment);        color:var(--mist); }
  .cdash-ooh-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(min(220px,100%),1fr)); gap:1rem; }
  .cdash-ooh-card { background:white; border:1px solid var(--border); border-radius:var(--radius-lg); overflow:hidden; cursor:pointer; transition:all 0.2s; box-shadow:var(--shadow-sm); }
  .cdash-ooh-card:hover { transform:translateY(-3px); box-shadow:var(--shadow-md); }
  .cdash-ooh-thumb { aspect-ratio:4/3; background:var(--parchment); display:flex; align-items:center; justify-content:center; font-size:2.5rem; overflow:hidden; }
  .cdash-ooh-thumb img { width:100%; height:100%; object-fit:cover; }
  .cdash-ooh-body { padding:0.75rem 0.9rem; }
  .cdash-ooh-title { font-size:0.88rem; font-weight:600; color:var(--ink); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .cdash-ooh-count { font-size:0.72rem; color:var(--mist); margin-top:0.2rem; }
  .cdash-following-list { display:flex; flex-direction:column; gap:0.75rem; }
  .cdash-artist-row { background:white; border:1px solid var(--border); border-radius:var(--radius-lg); padding:1rem 1.25rem; display:flex; align-items:center; gap:1rem; box-shadow:var(--shadow-sm); cursor:pointer; transition:all 0.2s; }
  .cdash-artist-row:hover { box-shadow:var(--shadow-md); transform:translateY(-1px); }
  .cdash-artist-avatar { width:44px; height:44px; border-radius:50%; background:var(--grad-accent); display:flex; align-items:center; justify-content:center; font-size:1.2rem; flex-shrink:0; }
  .cdash-artist-info { flex:1; min-width:0; }
  .cdash-artist-name { font-weight:600; font-size:0.95rem; color:var(--ink); }
  .cdash-artist-meta { font-size:0.75rem; color:var(--mist); margin-top:0.15rem; }
  .cdash-artist-auctions { font-size:0.78rem; color:var(--slate); margin-top:0.35rem; }

  /* ── Feed search/filter bar ──────────────────────────────────────────────── */
  .feed-search-bar { margin-bottom:1.25rem; display:flex; flex-direction:column; gap:0.65rem; }
  .feed-search-input-wrap { position:relative; }
  .feed-search-icon { position:absolute; left:0.9rem; top:50%; transform:translateY(-50%); font-size:0.9rem; pointer-events:none; color:var(--mist); }
  .feed-search-input { width:100%; padding:0.7rem 1rem 0.7rem 2.4rem; border:1.5px solid var(--border); border-radius:100px; font-family:var(--font-body); font-size:0.88rem; color:var(--ink); background:white; transition:border-color 0.2s,box-shadow 0.2s; }
  .feed-search-input:focus { outline:none; border-color:var(--gold); box-shadow:0 0 0 4px rgba(232,82,106,0.1); }
  .feed-filter-row { display:flex; align-items:center; gap:0.75rem; flex-wrap:wrap; }
  .feed-filter-label { font-size:0.75rem; font-weight:600; color:var(--slate); }
  .feed-filter-input { width:90px; padding:0.5rem 0.75rem; border:1.5px solid var(--border); border-radius:var(--radius); font-family:var(--font-body); font-size:0.85rem; color:var(--ink); background:white; transition:border-color 0.2s; }
  .feed-filter-input:focus { outline:none; border-color:var(--gold); }
  .feed-clear-btn { font-size:0.78rem; font-weight:600; padding:0.45rem 1rem; border-radius:100px; border:1.5px solid var(--border); background:white; color:var(--mist); cursor:pointer; font-family:var(--font-body); transition:all 0.15s; }
  .feed-clear-btn:hover { border-color:var(--gold); color:var(--gold-dark); background:var(--gold-light); }

  /* ── Clickable artist header in feed card ────────────────────────────────── */
  .feed-card-header-link { cursor:pointer; border-radius:var(--radius); padding:0.2rem 0.4rem; margin:-0.2rem -0.4rem; transition:background 0.15s; }
  .feed-card-header-link:hover { background:var(--parchment); }

  /* ── Clickable artist name on auction page ───────────────────────────────── */
  .auction-artist-name-link { cursor:pointer; }
  .auction-artist-name-link:hover { text-decoration:underline; }

  @media (max-width:768px) {
    .artist-profile-card { flex-direction:column; }
    .cdash-bid-card { flex-wrap:wrap; }
    .cdash-bid-status { flex-direction:row; align-items:center; }
    .sticky-bid-bar { display:flex; }
    .auction-detail { padding-bottom: 6rem; }
  }

  /* ── Sticky bid bar (mobile only) ───────────────────────────────────────── */
  .sticky-bid-bar { display:none; position:fixed; bottom:0; left:0; right:0; z-index:150; background:white; border-top:1.5px solid var(--border); padding:0.9rem 1.25rem; align-items:center; justify-content:space-between; gap:0.75rem; box-shadow:0 -4px 20px rgba(26,26,46,0.10); }
  .sticky-bid-bar-price { display:flex; flex-direction:column; }
  .sticky-bid-bar-label { font-size:0.68rem; font-weight:600; color:var(--mist); text-transform:uppercase; letter-spacing:0.05em; }
  .sticky-bid-bar-amount { font-size:1.4rem; font-weight:700; color:var(--ink); letter-spacing:-0.02em; line-height:1.1; }
  .sticky-bid-bar .btn { flex-shrink:0; }

  /* ── Outbid notification ─────────────────────────────────────────────────── */
  .notif-badge { position:absolute; top:-3px; right:-3px; background:var(--rouge); color:white; border-radius:50%; width:18px; height:18px; font-size:0.62rem; font-weight:700; display:flex; align-items:center; justify-content:center; pointer-events:none; border:2px solid var(--cream); line-height:1; }
  .outbid-banner { background:rgba(237,137,54,0.10); border-bottom:1.5px solid rgba(237,137,54,0.28); padding:0.6rem 2rem; display:flex; align-items:center; gap:0.75rem; font-size:0.83rem; font-weight:500; color:var(--amber); }
  .outbid-banner-link { font-weight:700; color:var(--amber); cursor:pointer; text-decoration:underline; background:none; border:none; font-family:var(--font-body); font-size:inherit; padding:0; }
  .outbid-banner-dismiss { margin-left:auto; font-size:0.78rem; color:var(--mist); cursor:pointer; background:none; border:none; font-family:var(--font-body); padding:0.2rem 0.4rem; border-radius:6px; }
  .outbid-banner-dismiss:hover { color:var(--ink); background:rgba(237,137,54,0.08); }

  /* ── Comments ─────────────────────────────────────────────────────────────── */
  .comments-block { background:white; border:1.5px solid var(--border); border-radius:var(--radius-lg); padding:1.4rem 1.6rem; margin-bottom:1.25rem; box-shadow:var(--shadow-sm); }
  .comment-input-row { display:flex; gap:0.6rem; align-items:center; margin-bottom:0.75rem; }
  .comment-input { flex:1; padding:0.7rem 1rem; background:white; border:1.5px solid var(--border); border-radius:var(--radius); font-family:var(--font-body); font-size:0.88rem; color:var(--ink); transition:border-color 0.2s,box-shadow 0.2s; }
  .comment-input:focus { outline:none; border-color:var(--gold); box-shadow:0 0 0 4px rgba(232,82,106,0.1); }
  .comment-list { list-style:none; margin-top:0.75rem; }
  .comment-item { padding:0.9rem 0; border-bottom:1px solid var(--border); }
  .comment-item:last-child { border-bottom:none; padding-bottom:0; }
  .comment-avatar { width:30px; height:30px; border-radius:50%; background:var(--parchment); border:1px solid var(--border); display:inline-flex; align-items:center; justify-content:center; font-size:1rem; flex-shrink:0; }
  .comment-author-row { display:flex; align-items:center; gap:0.6rem; margin-bottom:0.35rem; }
  .comment-body { font-size:0.88rem; color:var(--ink); line-height:1.55; padding-left:calc(30px + 0.6rem); word-break:break-word; }
  .comment-reactions-row { display:flex; gap:0.35rem; margin-top:0.5rem; flex-wrap:wrap; padding-left:calc(30px + 0.6rem); }
  .reaction-btn { display:inline-flex; align-items:center; font-size:0.82rem; font-family:var(--font-body); padding:0.22rem 0.6rem; border-radius:100px; border:1.5px solid var(--border); background:white; color:var(--slate); cursor:pointer; transition:all 0.15s; line-height:1.4; font-weight:500; }
  .reaction-btn:hover { border-color:var(--gold); background:var(--gold-light); }
  .reaction-btn-active { border-color:var(--gold); background:var(--gold-light); color:var(--gold-dark); font-weight:600; }
  .comment-delete-btn { background:none; border:none; cursor:pointer; font-size:0.85rem; color:var(--mist); padding:0.25rem 0.4rem; border-radius:6px; transition:color 0.15s,background 0.15s; flex-shrink:0; min-width:30px; min-height:30px; display:flex; align-items:center; justify-content:center; }
  .comment-delete-btn:hover { color:var(--rouge); background:var(--gold-light); }
  .comment-delete-btn:disabled { opacity:0.5; cursor:not-allowed; }
  @media (max-width:768px) { .comments-block { padding:1rem 1.1rem; } .comment-body,.comment-reactions-row { padding-left:0; margin-top:0.35rem; } }

  /* ── Pending payments ──────────────────────────────────────────────────────── */
  .pending-payment-card { background:white; border:1.5px solid var(--border); border-radius:var(--radius-lg); padding:1.25rem 1.5rem; margin-bottom:1rem; box-shadow:var(--shadow-sm); }
  .pending-payment-header { display:flex; align-items:center; gap:1rem; margin-bottom:1rem; flex-wrap:wrap; }
  .pending-payment-thumb { width:56px; height:56px; border-radius:var(--radius); background:var(--parchment); display:flex; align-items:center; justify-content:center; font-size:1.5rem; flex-shrink:0; overflow:hidden; }
  .pending-payment-thumb img { width:100%; height:100%; object-fit:cover; }
  .pending-payment-title { font-weight:700; font-size:0.95rem; color:var(--ink); margin-bottom:0.15rem; }
  .pending-payment-winner { font-size:0.82rem; color:var(--slate); }
  .pending-payment-amount { font-size:1.3rem; font-weight:700; color:var(--gold-dark); margin-left:auto; white-space:nowrap; }
  .pending-payment-details { background:var(--parchment); border-radius:var(--radius); padding:0.85rem 1rem; font-size:0.82rem; color:var(--slate); line-height:1.7; margin-bottom:1rem; }
  .pending-payment-actions { display:flex; gap:0.6rem; align-items:center; flex-wrap:wrap; }
  .tracking-input { padding:0.5rem 0.8rem; border:1.5px solid var(--border); border-radius:var(--radius); font-family:var(--font-body); font-size:0.82rem; color:var(--ink); width:180px; }
  .tracking-input:focus { outline:none; border-color:var(--gold); }
  .status-badge-paid { display:inline-flex; align-items:center; gap:0.3rem; font-size:0.72rem; font-weight:600; color:var(--success); background:rgba(56,161,105,0.1); padding:0.2rem 0.6rem; border-radius:100px; }
  .status-badge-shipped { display:inline-flex; align-items:center; gap:0.3rem; font-size:0.72rem; font-weight:600; color:var(--accent2); background:var(--accent2-light); padding:0.2rem 0.6rem; border-radius:100px; }

  /* ── Mobile bottom nav ─────────────────────────────────────────────────── */
  .mobile-bottom-nav { display:none; position:fixed; bottom:0; left:0; right:0; z-index:200; background:white; border-top:1.5px solid var(--border); box-shadow:0 -4px 20px rgba(26,26,46,0.08); padding:0 0 env(safe-area-inset-bottom,0); }
  .mobile-bottom-nav-inner { display:flex; align-items:stretch; justify-content:space-around; height:56px; }
  .mobile-nav-tab { display:flex; flex-direction:column; align-items:center; justify-content:center; flex:1; gap:2px; background:none; border:none; cursor:pointer; padding:0; color:var(--mist); font-size:0.65rem; font-weight:600; letter-spacing:0.03em; text-transform:uppercase; transition:color 0.15s; -webkit-tap-highlight-color:transparent; }
  .mobile-nav-tab:active { opacity:0.7; }
  .mobile-nav-tab.active { color:var(--accent); }
  .mobile-nav-tab-icon { font-size:1.15rem; line-height:1; }
  .mobile-nav-tab-new { position:relative; top:-12px; flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px; background:none; border:none; cursor:pointer; padding:0; -webkit-tap-highlight-color:transparent; }
  .mobile-nav-tab-new-circle { width:48px; height:48px; border-radius:50%; background:var(--accent); display:flex; align-items:center; justify-content:center; color:white; font-size:1.25rem; box-shadow:0 4px 14px rgba(232,82,106,0.45); transition:transform 0.15s,box-shadow 0.15s; }
  .mobile-nav-tab-new:active .mobile-nav-tab-new-circle { transform:scale(0.93); box-shadow:0 2px 8px rgba(232,82,106,0.35); }
  .mobile-nav-tab-new-label { color:var(--accent); font-size:0.65rem; font-weight:700; letter-spacing:0.03em; text-transform:uppercase; margin-top:2px; }
  @media (max-width:768px) {
    .mobile-bottom-nav { display:block; }
    .nav-new-btn { display:none; }
    .page-shell, .feed-shell, .dashboard-shell, .collector-dash-shell, .create-shell, .auth-shell { padding-bottom:calc(56px + env(safe-area-inset-bottom,0px) + 1rem); }
    .auction-detail { padding-bottom:calc(6rem + 56px); }
  }
`;


// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const fmt$ = (n) => "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
const fmtDate = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
const timeLeft = (endDate) => {
  const diff = new Date(endDate) - new Date();
  if (diff <= 0) return null;
  return { d: Math.floor(diff / 86400000), h: Math.floor((diff % 86400000) / 3600000), m: Math.floor((diff % 3600000) / 60000), s: Math.floor((diff % 60000) / 1000) };
};
const shortName = (n) => { const p = n.trim().split(" "); return p[0] + (p[1] ? " " + p[1][0] + "." : ""); };
const generateId = () => Math.random().toString(36).slice(2, 10);
const timeAgo = (iso) => {
  const diff = Date.now() - new Date(iso);
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};
const AVATARS = ["🎨", "🖌️", "🌊", "🌿", "🦋", "🌙", "🏔️", "🌺", "🦚", "✨"];

const MAX_IMG_DIM = 1200;
const compressImage = (file) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, MAX_IMG_DIM / Math.max(img.naturalWidth, img.naturalHeight));
      const canvas = document.createElement("canvas");
      canvas.width  = Math.round(img.naturalWidth  * scale);
      canvas.height = Math.round(img.naturalHeight * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = reject;
    img.src = url;
  });

const getStatus = (a) => {
  if (a.removed) return "removed";
  if (a.paused) return "paused";
  if (new Date(a.endDate) <= new Date()) return "ended";
  return "live";
};

// ─────────────────────────────────────────────────────────────────────────────
// STORAGE / DATA
// ─────────────────────────────────────────────────────────────────────────────

// Bidder identity is still stored locally (anonymous bidders don't have accounts)
const BIDDER_KEY = "atelier_bidder";
const getBidderIdentity = () => { try { const r = localStorage.getItem(BIDDER_KEY); return r ? JSON.parse(r) : { name: "", email: "" }; } catch { return { name: "", email: "" }; } };
const saveBidderIdentity = (name, email) => { try { localStorage.setItem(BIDDER_KEY, JSON.stringify({ name, email })); } catch {} };

// Ooh tracking: one ooh per browser per auction
const OOHS_KEY    = "artdrop_oohs";
const getOohedSet = () => { try { const r = localStorage.getItem(OOHS_KEY); return new Set(r ? JSON.parse(r) : []); } catch { return new Set(); } };
const hasOohed    = (id) => getOohedSet().has(id);
const saveOoh     = (id) => { const s = getOohedSet(); s.add(id); try { localStorage.setItem(OOHS_KEY, JSON.stringify([...s])); } catch {} };
const getOohCount = (store, id) => (store.oohs?.[id]) || 0;

// ── Supabase data hook ────────────────────────────────────────────────────────
// Returns [store, loadAll] where loadAll() re-fetches all data from Supabase.
// The store shape is kept compatible with the old localStorage shape so that
// all components (AuctionPage, DashboardPage, etc.) need minimal changes.
const useSupabaseStore = () => {
  const [store, setStoreState] = useState({
    artists: {}, collectors: {}, auctions: [], bids: {}, payments: {}, oohs: {}, myInvite: null,
    comments: {}, commentReactions: {}, myReactions: {},
    bidSummaries: {}, commentCounts: {},
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
      ] = await Promise.all([
        supabase.from("auctions").select("*").order("created_at", { ascending: false }),
        supabase.from("oohs").select("*"),
        supabase.from("payments").select("*"),                          // small table, keep full
        supabase.from("profiles").select("*"),
        supabase.from("bids").select("auction_id, amount"),             // summaries only
        supabase.from("comments").select("id, auction_id"),             // counts only
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
        if (p.type === "artist") artistsMap[p.id] = user;
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

      // Use spread so per-auction bids/comments/reactions loaded by loadAuctionDetail survive refreshes
      setStoreState(prev => ({
        ...prev,
        artists: artistsMap, collectors: collectorsMap, auctions: auctionList,
        oohs: oohsMap, payments: paymentsMap, myInvite,
        bidSummaries: bidSummariesMap, commentCounts: commentCountsMap,
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

// ─────────────────────────────────────────────────────────────────────────────
// SHARED COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

// ── ImagePicker ──────────────────────────────────────────────────────────────
const EMOJI_OPTIONS = ["🎨","🌊","🌺","🦋","🌙","🏔️","🌿","🦚","✨","🌸"];
const ImagePicker = ({ imageUrl, emoji, onImageUrl, onEmoji }) => {
  const [tab, setTab]         = useState(imageUrl ? "upload" : "upload");
  const [urlInput, setUrlInput] = useState(imageUrl && !imageUrl.startsWith("data:") ? imageUrl : "");
  const [urlErr, setUrlErr]   = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();

  // Local preview: if imageUrl is already set (e.g. edit mode), show it immediately
  const preview = imageUrl || null;

  const handleFile = async (file) => {
    if (!file?.type.startsWith("image/")) return;
    try {
      const compressed = await compressImage(file);
      // Try to upload to Supabase Storage; fall back to base64 data URI if unavailable
      try {
        const res = await fetch(compressed);
        const blob = await res.blob();
        const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
        const { error: uploadErr } = await supabase.storage.from("artworks").upload(path, blob, { contentType: "image/jpeg", upsert: true });
        if (!uploadErr) {
          const { data: { publicUrl } } = supabase.storage.from("artworks").getPublicUrl(path);
          onImageUrl(publicUrl);
          return;
        }
      } catch {}
      // Fallback: store as base64 data URI
      onImageUrl(compressed);
    } catch {
      const r = new FileReader();
      r.onload = (e) => onImageUrl(e.target.result);
      r.readAsDataURL(file);
    }
  };

  const handleUseUrl = () => {
    const url = urlInput.trim();
    if (!url) return;
    setUrlErr("");
    onImageUrl(url);
  };

  return (
    <div>
      <div className="img-picker-tabs">
        <button className={`btn btn-sm ${tab === "upload" ? "btn-primary" : "btn-ghost"}`} onClick={() => setTab("upload")}>Upload File</button>
        <button className={`btn btn-sm ${tab === "url"    ? "btn-primary" : "btn-ghost"}`} onClick={() => setTab("url")}>Paste URL</button>
      </div>

      {tab === "upload" && (
        <div
          className={`upload-zone ${dragOver ? "drag-over" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
          onClick={() => fileRef.current?.click()}
        >
          <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={(e) => handleFile(e.target.files[0])} />
          {preview
            ? <><img src={preview} alt="preview" className="upload-preview" /><p className="upload-sub">Click or drag to replace</p></>
            : <><div className="upload-icon">🖼️</div><div className="upload-label">Drag & drop your artwork photo</div><div className="upload-sub">JPG, PNG, WEBP · Compressed automatically · or click to browse</div></>
          }
        </div>
      )}

      {tab === "url" && (
        <div>
          <div className="img-picker-url-row">
            <input
              className="form-input"
              placeholder="https://example.com/artwork.jpg"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleUseUrl()}
            />
            <button className="btn btn-primary btn-sm" onClick={handleUseUrl}>Use</button>
          </div>
          {urlErr && <div className="alert alert-error" style={{ marginTop:"0.5rem" }}>{urlErr}</div>}
          {preview && tab === "url" && (
            <img src={preview} alt="preview" className="upload-preview" style={{ marginTop:"0.75rem" }}
              onError={() => { onImageUrl(""); setUrlErr("Couldn't load that URL — try a direct image link (.jpg, .png, .webp)."); }} />
          )}
          <p className="form-hint" style={{ marginTop:"0.5rem" }}>Paste any public image URL. Works best with direct image links (.jpg, .png, .webp).</p>
        </div>
      )}

      {!preview && (
        <div style={{ marginTop:"1rem" }}>
          <label className="form-label">Or pick an emoji placeholder</label>
          <div className="avatar-picker" style={{ marginTop:"0.4rem" }}>
            {EMOJI_OPTIONS.map((em) => (
              <div key={em} className={`avatar-opt ${emoji === em ? "selected" : ""}`} onClick={() => onEmoji(em)}>{em}</div>
            ))}
          </div>
        </div>
      )}

      {preview && (
        <button className="btn btn-ghost btn-sm" style={{ marginTop:"0.5rem" }} onClick={() => { onImageUrl(""); setUrlInput(""); }}>
          Remove Image
        </button>
      )}
    </div>
  );
};

// ── OohButton ────────────────────────────────────────────────────────────────
const OohButton = ({ auctionId, store, updateStore }) => {
  const [oohed, setOohed]         = useState(() => hasOohed(auctionId));
  const [justOohed, setJustOohed] = useState(false);
  const count = getOohCount(store, auctionId);

  const handleOoh = async (e) => {
    e.stopPropagation();
    if (oohed) return;
    saveOoh(auctionId);
    setOohed(true);
    setJustOohed(true);
    setTimeout(() => setJustOohed(false), 500);
    const newCount = (store.oohs?.[auctionId] || 0) + 1;
    try {
      await supabase.from("oohs").upsert({ auction_id: auctionId, count: newCount }, { onConflict: "auction_id" });
      updateStore(); // refresh store from Supabase
    } catch {
      // Optimistic update fallback already shown via local state
    }
  };

  return (
    <button
      className={`ooh-btn${oohed ? " oohed" : ""}${justOohed ? " just-oohed" : ""}`}
      onClick={handleOoh}
      title={oohed ? "You oohed this" : "Ooh this artwork"}
    >
      <span className="ooh-icon">{oohed ? "✨" : "✦"}</span>
      <span>{count > 0 ? `Ooh · ${count}` : "Ooh"}</span>
    </button>
  );
};

const Countdown = ({ endDate }) => {
  const [left, setLeft] = useState(() => timeLeft(endDate));
  useEffect(() => { const id = setInterval(() => setLeft(timeLeft(endDate)), 1000); return () => clearInterval(id); }, [endDate]);
  if (!left) return <div className="countdown-ended">Auction has ended</div>;
  return (
    <div className="countdown-digits">
      {[["d","days"],["h","hrs"],["m","min"],["s","sec"]].map(([k, lbl], i) => (
        <div key={k} style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          {i > 0 && <span className="countdown-sep">:</span>}
          <div className="countdown-unit">
            <div className="countdown-num">{String(left[k]).padStart(2,"0")}</div>
            <div className="countdown-unit-label">{lbl}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

const CardTimer = ({ endDate }) => {
  const [left, setLeft] = useState(() => timeLeft(endDate));
  useEffect(() => { const id = setInterval(() => setLeft(timeLeft(endDate)), 10000); return () => clearInterval(id); }, [endDate]);
  if (!left) return <span style={{ color: "var(--mist)" }}>Ended</span>;
  if (left.d > 0) return <span>{left.d}d {left.h}h left</span>;
  return <span style={{ color: "var(--rouge)" }}>{left.h}h {left.m}m left</span>;
};

const StatusPill = ({ status }) => {
  const cfg = { live: ["sp-live", <><i className="fa-solid fa-circle" style={{fontSize:"0.55em",verticalAlign:"middle"}}></i> Live</>], paused: ["sp-paused", <><i className="fa-solid fa-pause"></i> Paused</>], ended: ["sp-ended", "Ended"], removed: ["sp-ended", "Removed"] };
  const [cls, label] = cfg[status] || cfg.ended;
  return <span className={`status-pill ${cls}`}>{label}</span>;
};

const ConfirmModal = ({ title, message, confirmLabel, confirmClass = "btn-danger", onConfirm, onCancel }) => (
  <div className="modal-overlay" onClick={onCancel}>
    <div className="modal" onClick={(e) => e.stopPropagation()}>
      <button className="modal-close" onClick={onCancel}><i className="fa-solid fa-xmark"></i></button>
      <div className="modal-title">{title}</div>
      <div className="modal-sub">{message}</div>
      <div className="modal-actions">
        <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onCancel}>Cancel</button>
        <button className={`btn ${confirmClass}`} style={{ flex: 1 }} onClick={onConfirm}>{confirmLabel}</button>
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// AUTH PAGE
// ─────────────────────────────────────────────────────────────────────────────
const AuthPage = ({ store, updateStore, onLogin, onCollectorLogin, initialMode, initialInviteCode = "" }) => {
  const [mode, setMode] = useState(initialMode || "login");
  const [loginType, setLoginType] = useState("artist"); // "artist" | "collector"
  const [f, setF] = useState({ name: "", email: "", password: "", avatar: "🎨", bio: "", inviteCode: initialInviteCode });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  const login = async () => {
    setError("");
    if (!f.email || !f.password) { setError("Enter your email and password."); return; }
    setBusy(true);
    const { data, error: authErr } = await supabase.auth.signInWithPassword({
      email: f.email.toLowerCase(), password: f.password
    });
    if (authErr) { setError("Incorrect email or password."); setBusy(false); return; }
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single();
    if (!profile) { setError("Account not found. Please sign up."); setBusy(false); return; }
    const user = { id: data.user.id, name: profile.name, email: data.user.email, avatar: profile.avatar, bio: profile.bio, createdAt: profile.created_at };
    if (profile.type === "artist") onLogin(user);
    else onCollectorLogin(user);
    setBusy(false);
  };

  const validateInviteCode = async () => {
    const code = f.inviteCode.trim().toUpperCase();
    if (!code) { setError("Enter an invite code to sign up."); return null; }
    const { data: inviteRow } = await supabase
      .from("invites")
      .select("id, uses_count, max_uses")
      .eq("code", code)
      .maybeSingle();
    if (!inviteRow || inviteRow.uses_count >= inviteRow.max_uses) {
      setError("Invalid or expired invite code."); return null;
    }
    return code;
  };

  const signup = async () => {
    setError("");
    if (!f.name.trim()) { setError("Enter your artist name."); return; }
    if (!f.email.includes("@")) { setError("Enter a valid email address."); return; }
    if (f.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setBusy(true);
    const code = await validateInviteCode();
    if (!code) { setBusy(false); return; }
    const { data, error: authErr } = await supabase.auth.signUp({
      email: f.email.toLowerCase(), password: f.password,
      options: { data: { name: f.name.trim(), avatar: f.avatar, bio: f.bio, type: "artist" } }
    });
    if (authErr) { setError(authErr.message); setBusy(false); return; }
    if (!data.user) { setError("An account with this email already exists. Try signing in instead."); setBusy(false); return; }
    // Redeem the invite code (increment uses_count)
    await supabase.rpc("redeem_invite_code", { p_code: code });
    // Profile row is created automatically by the handle_new_user trigger
    const artist = { id: data.user.id, name: f.name.trim(), email: f.email.toLowerCase(), avatar: f.avatar, bio: f.bio, createdAt: new Date().toISOString() };
    updateStore(data.user.id);
    onLogin(artist);
    setBusy(false);
  };

  const signupCollector = async () => {
    setError("");
    if (!f.name.trim()) { setError("Enter your display name."); return; }
    if (!f.email.includes("@")) { setError("Enter a valid email address."); return; }
    if (f.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setBusy(true);
    const code = await validateInviteCode();
    if (!code) { setBusy(false); return; }
    const { data, error: authErr } = await supabase.auth.signUp({
      email: f.email.toLowerCase(), password: f.password,
      options: { data: { name: f.name.trim(), avatar: f.avatar, bio: f.bio, type: "collector" } }
    });
    if (authErr) { setError(authErr.message); setBusy(false); return; }
    if (!data.user) { setError("An account with this email already exists. Try signing in instead."); setBusy(false); return; }
    // Redeem the invite code (increment uses_count)
    await supabase.rpc("redeem_invite_code", { p_code: code });
    // Profile row is created automatically by the handle_new_user trigger
    const collector = { id: data.user.id, name: f.name.trim(), email: f.email.toLowerCase(), avatar: f.avatar, bio: f.bio, createdAt: new Date().toISOString(), type: "collector" };
    updateStore(data.user.id);
    onCollectorLogin(collector);
    setBusy(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-bg" /><div className="auth-grid" />
      <div className="auth-card">
        <div className="auth-logo">ArtDrop</div>
        <div className="auth-logo-sub">Art Auction House</div>

        {mode === "login" && (
          <>
            <div className="auth-type-toggle">
              <button className={`auth-type-tab ${loginType === "artist" ? "active" : ""}`} onClick={() => { setLoginType("artist"); setError(""); }}>Artist</button>
              <button className={`auth-type-tab ${loginType === "collector" ? "active" : ""}`} onClick={() => { setLoginType("collector"); setError(""); }}>Collector</button>
            </div>
            <div className="auth-title">Welcome back</div>
            <div className="auth-sub">{loginType === "artist" ? "Sign in to manage your auctions." : "Sign in to follow artists and bid on art."}</div>
            {error && <div className="alert alert-error">{error}</div>}
            <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" placeholder="your@email.com" value={f.email} onChange={(e) => set("email", e.target.value)} onKeyDown={(e) => e.key === "Enter" && login()} /></div>
            <div className="form-group"><label className="form-label">Password</label><input className="form-input" type="password" placeholder="••••••••" value={f.password} onChange={(e) => set("password", e.target.value)} onKeyDown={(e) => e.key === "Enter" && login()} /></div>
            <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={login} disabled={busy}>{busy ? "Signing in…" : "Sign In"}</button>
            <div className="auth-switch">
              {loginType === "artist"
                ? <><span>No account? </span><button onClick={() => { setMode("signup"); setError(""); }}>Join as Artist <i className="fa-solid fa-arrow-right"></i></button></>
                : <><span>No account? </span><button onClick={() => { setMode("collector-signup"); setError(""); }}>Join as Collector <i className="fa-solid fa-arrow-right"></i></button></>
              }
            </div>
          </>
        )}

        {mode === "signup" && (
          <>
            <div className="auth-title">Create your account</div>
            <div className="auth-sub">Join ArtDrop to list and auction your original artwork.</div>
            {error && <div className="alert alert-error">{error}</div>}
            <div className="form-group"><label className="form-label">Artist Name *</label><input className="form-input" placeholder="e.g. Maria Chen" value={f.name} onChange={(e) => set("name", e.target.value)} /></div>
            <div className="form-group">
              <label className="form-label">Avatar</label>
              <div className="avatar-picker">{AVATARS.map((av) => <div key={av} className={`avatar-opt ${f.avatar === av ? "selected" : ""}`} onClick={() => set("avatar", av)}>{av}</div>)}</div>
            </div>
            <div className="form-group"><label className="form-label">Email *</label><input className="form-input" type="email" placeholder="your@email.com" value={f.email} onChange={(e) => set("email", e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Password *</label><input className="form-input" type="password" placeholder="At least 6 characters" value={f.password} onChange={(e) => set("password", e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Short Bio (optional)</label><textarea className="form-textarea" rows={2} placeholder="Tell collectors about yourself and your art…" value={f.bio} onChange={(e) => set("bio", e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Invite Code *</label><input className="form-input" type="text" placeholder="Enter invite code" value={f.inviteCode} onChange={(e) => set("inviteCode", e.target.value)} autoComplete="off" /></div>
            <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={signup} disabled={busy}>{busy ? "Creating account…" : "Create Artist Account"}</button>
            <div className="auth-switch">Already have an account? <button onClick={() => { setMode("login"); setError(""); }}>Sign in <i className="fa-solid fa-arrow-right"></i></button></div>
            <div className="auth-switch" style={{ marginTop:"0.5rem" }}>Want to collect? <button onClick={() => { setMode("collector-signup"); setError(""); }}>Join as Collector <i className="fa-solid fa-arrow-right"></i></button></div>
          </>
        )}

        {mode === "collector-signup" && (
          <>
            <div className="auth-title">Join as a Collector</div>
            <div className="auth-sub">Follow artists, Ooh artworks, and bid on pieces you love.</div>
            {error && <div className="alert alert-error">{error}</div>}
            <div className="form-group"><label className="form-label">Display Name *</label><input className="form-input" placeholder="e.g. Alex Rivera" value={f.name} onChange={(e) => set("name", e.target.value)} /></div>
            <div className="form-group">
              <label className="form-label">Avatar</label>
              <div className="avatar-picker">{AVATARS.map((av) => <div key={av} className={`avatar-opt ${f.avatar === av ? "selected" : ""}`} onClick={() => set("avatar", av)}>{av}</div>)}</div>
            </div>
            <div className="form-group"><label className="form-label">Email *</label><input className="form-input" type="email" placeholder="your@email.com" value={f.email} onChange={(e) => set("email", e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Password *</label><input className="form-input" type="password" placeholder="At least 6 characters" value={f.password} onChange={(e) => set("password", e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Short Bio (optional)</label><textarea className="form-textarea" rows={2} placeholder="Tell us what kind of art you love…" value={f.bio} onChange={(e) => set("bio", e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Invite Code *</label><input className="form-input" type="text" placeholder="Enter invite code" value={f.inviteCode} onChange={(e) => set("inviteCode", e.target.value)} autoComplete="off" /></div>
            <button className="btn" style={{ width: "100%", justifyContent: "center", background:"var(--grad-cool)", color:"white", boxShadow:"0 4px 16px rgba(102,126,234,0.35)" }} onClick={signupCollector} disabled={busy}>{busy ? "Creating account…" : "Create Collector Account"}</button>
            <div className="auth-switch">Already have an account? <button onClick={() => { setMode("login"); setLoginType("collector"); setError(""); }}>Sign in <i className="fa-solid fa-arrow-right"></i></button></div>
            <div className="auth-switch" style={{ marginTop:"0.5rem" }}>Are you an artist? <button onClick={() => { setMode("signup"); setError(""); }}>Join as Artist <i className="fa-solid fa-arrow-right"></i></button></div>
          </>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// HOME PAGE  (unauthenticated landing)
// ─────────────────────────────────────────────────────────────────────────────
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
            <div className="hero-eyebrow">The Art Auction House</div>
            <h1 className="hero-title">Where Unique Art<br />Finds <em>Its Voice</em></h1>
            <p className="hero-subtitle">Run live auctions for your original artwork. Set your price, share your link, and watch collectors compete for your creations.</p>
            <div className="hero-actions">
              <button className="btn btn-primary btn-lg" onClick={() => onNavigate("signup")}>Start Selling Art</button>
              <button className="btn btn-outline btn-lg" onClick={() => onNavigate("collector-signup")}>Follow as Collector</button>
            </div>
          </div>
        </div>
      </section>

      <div className="features-strip">
        <div className="features-inner">
          {[["🖼️","List Your Art","Upload photos, set your price, publish in minutes"],["⏱️","Live Countdown","Real-time auctions with transparent bidding"],["🔗","Share Anywhere","Links for email, social media, and text"],["💸","Flexible Payment","Venmo, PayPal, Cash App & more"]].map(([icon, label, desc]) => (
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
              <h3>No live auctions yet</h3>
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

// ─────────────────────────────────────────────────────────────────────────────
// FEED PAGE  (authenticated landing)
// ─────────────────────────────────────────────────────────────────────────────
const FeedPage = ({ onNavigate, store, updateStore, me, meCollector }) => {
  const PAGE_SIZE = 12;
  const [sort, setSort] = useState("oohs");
  const [query, setQuery] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Reset pagination when sort/filter changes
  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [sort, query, minPrice, maxPrice]);

  const live = store.auctions.filter((a) => !a.removed && a.published && getStatus(a) === "live");
  const sorted = [...live].sort((a, b) => {
    if (sort === "oohs")   return (store.oohs[b.id] || 0) - (store.oohs[a.id] || 0);
    if (sort === "ending") return new Date(a.endDate) - new Date(b.endDate);
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const hasFilters = query.trim() !== "" || minPrice !== "" || maxPrice !== "";
  const clearFilters = () => { setQuery(""); setMinPrice(""); setMaxPrice(""); };

  const filtered = sorted.filter((auction) => {
    const summary = store.bidSummaries[auction.id] || { count: 0, topAmount: 0 };
    const currentPrice = summary.topAmount || auction.startingPrice;
    const q = query.trim().toLowerCase();
    if (q && !auction.title.toLowerCase().includes(q) && !auction.artistName.toLowerCase().includes(q)) return false;
    if (minPrice !== "" && currentPrice < parseFloat(minPrice)) return false;
    if (maxPrice !== "" && currentPrice > parseFloat(maxPrice)) return false;
    return true;
  });

  const visibleAuctions = filtered.slice(0, visibleCount);
  const hasMore = filtered.length > visibleCount;

  const activeUser = me || meCollector;
  return (
    <div className="feed-page">
      <div className="feed-header">
        <div className="feed-title">{activeUser?.name ? `Hi ${activeUser.name.split(" ")[0]} ✦` : "Discover"}</div>
        <div className="sort-tabs">
          {[["oohs","Most Loved"],["ending","Ending Soon"],["newest","Newest"]].map(([key,label]) => (
            <button key={key} className={`sort-tab ${sort === key ? "active" : ""}`} onClick={() => setSort(key)}>{label}</button>
          ))}
        </div>
      </div>

      {live.length > 0 && (
        <div className="feed-search-bar">
          <div className="feed-search-input-wrap">
            <span className="feed-search-icon">🔍</span>
            <input className="feed-search-input" type="text" placeholder="Search by title or artist…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <div className="feed-filter-row">
            <span className="feed-filter-label">Min $</span>
            <input className="feed-filter-input" type="number" min="0" placeholder="0" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
            <span className="feed-filter-label">Max $</span>
            <input className="feed-filter-input" type="number" min="0" placeholder="Any" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
            {hasFilters && <button className="feed-clear-btn" onClick={clearFilters}>✕ Clear</button>}
          </div>
        </div>
      )}

      {filtered.length === 0 && live.length === 0 ? (
        <div className="empty-state">
          <h3>No live auctions right now</h3>
          <p style={{ marginBottom:"1.5rem" }}>Check back soon — new artworks are added regularly.</p>
          {me && <button className="btn btn-primary" onClick={() => onNavigate("create")}>+ Create Auction</button>}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <h3>No results{query.trim() ? ` for "${query.trim()}"` : ""}</h3>
          <p style={{ marginBottom:"1.5rem" }}>Try a different search or adjust the price range.</p>
          <button className="btn btn-ghost" onClick={clearFilters}>✕ Clear Filters</button>
        </div>
      ) : (
        <>
        <div className="feed-grid">
          {visibleAuctions.map((auction) => {
            const summary = store.bidSummaries[auction.id] || { count: 0, topAmount: 0 };
            const topBidAmt = summary.topAmount || auction.startingPrice;
            const bidCount = summary.count;
            const commentCount = store.commentCounts?.[auction.id] || 0;
            return (
              <div key={auction.id} className="feed-card" onClick={() => onNavigate("auction", auction.id)}>
                <div
                  className="feed-card-header feed-card-header-link"
                  onClick={(e) => { e.stopPropagation(); onNavigate("artist", auction.artistId); }}
                >
                  <div className="feed-avatar">{auction.artistAvatar || "🎨"}</div>
                  <div>
                    <div className="feed-artist-name">{auction.artistName}</div>
                    <div className="feed-time">{timeAgo(auction.createdAt)}</div>
                  </div>
                </div>
                <div className="card-image">
                  {auction.imageUrl ? <img src={auction.imageUrl} alt={auction.title} /> : <span>{auction.emoji || "🎨"}</span>}
                  <div className="badge badge-live"><div className="pulse" style={{ background:"white" }} /> Live</div>
                </div>
                <div className="card-body">
                  <div className="card-title">{auction.title}</div>
                  {auction.description && <div className="feed-desc">{auction.description}</div>}
                  <div style={{ display:"flex", gap:"0.4rem", flexWrap:"wrap", marginBottom: (bidCount > 0 || commentCount > 0) ? "0.6rem" : 0 }}>
                    {bidCount > 0 && <div className="feed-bid-count"><i className="fa-solid fa-fire"></i> {bidCount} bid{bidCount !== 1 ? "s" : ""}</div>}
                    {commentCount > 0 && <div className="feed-comment-count"><i className="fa-regular fa-comment"></i> {commentCount} comment{commentCount !== 1 ? "s" : ""}</div>}
                  </div>
                  <div className="card-meta">
                    <div><div className="card-price-label">{bidCount ? "Current Bid" : "Starting at"}</div><div className="card-price">{fmt$(topBidAmt)}</div></div>
                    <div><div className="card-timer-label">Closes</div><div className="card-timer-val"><CardTimer endDate={auction.endDate} /></div></div>
                  </div>
                  <div className="card-ooh-row feed-ooh">
                    <OohButton auctionId={auction.id} store={store} updateStore={updateStore} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {hasMore && (
          <div style={{ textAlign:"center", padding:"2rem 0" }}>
            <button className="btn btn-ghost" onClick={() => setVisibleCount(c => c + PAGE_SIZE)}>
              Load {Math.min(PAGE_SIZE, filtered.length - visibleCount)} more
              <span style={{ color:"var(--mist)", marginLeft:"0.4rem" }}>({filtered.length - visibleCount} remaining)</span>
            </button>
          </div>
        )}
        </>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ARTIST PAGE  (public profile)
// ─────────────────────────────────────────────────────────────────────────────
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

  return (
    <div className="artist-page">
      <button className="btn btn-ghost btn-sm" style={{ marginBottom:"1.5rem" }} onClick={() => onNavigate("home")}><i className="fa-solid fa-arrow-left"></i> Back</button>
      <div className="artist-profile-card">
        <div className="artist-profile-avatar">{artist.avatar}</div>
        <div className="artist-profile-info">
          <div className="artist-profile-name">{artist.name}</div>
          <div className="artist-profile-since">Member since {new Date(artist.createdAt).toLocaleDateString("en-US", { month:"long", year:"numeric" })}</div>
          {artist.bio && <div className="artist-profile-bio">{artist.bio}</div>}
        </div>
        <div className="artist-follow-wrap">
          {!isOwnProfile && !meCollector && (
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
        {live.length > 0 ? `${live.length} Live Auction${live.length !== 1 ? "s" : ""}` : "Auctions"}
      </div>
      {sorted.length === 0 ? (
        <div className="empty-state"><h3>No auctions yet</h3><p>This artist hasn't listed any artwork yet.</p></div>
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
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// COLLECTOR DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
const CollectorDashboardPage = ({ meCollector, onNavigate, store, updateStore }) => {
  if (!meCollector) return null;

  // Section 1: My Bids — scan all auctions for bids by this collector's email
  const myBidAuctions = store.auctions
    .filter((a) => {
      if (a.removed) return false;
      const bids = store.bids[a.id] || [];
      return bids.some((b) => b.email === meCollector.email);
    })
    .map((a) => {
      const bids = store.bids[a.id] || [];
      const myBids = bids.filter((b) => b.email === meCollector.email);
      const myTop = Math.max(...myBids.map((b) => b.amount));
      const allSorted = [...bids].sort((x, y) => y.amount - x.amount);
      const topBid = allSorted[0] || null;
      const status = getStatus(a);
      let badgeLabel = "", badgeCls = "";
      if (status === "live" || status === "paused") {
        if (topBid && topBid.email === meCollector.email) { badgeLabel = "Winning"; badgeCls = "bid-badge-winning"; }
        else { badgeLabel = "Outbid"; badgeCls = "bid-badge-outbid"; }
      } else if (status === "ended") {
        if (topBid && topBid.email === meCollector.email) { badgeLabel = "Won"; badgeCls = "bid-badge-won"; }
        else { badgeLabel = "Lost"; badgeCls = "bid-badge-lost"; }
      }
      return { auction: a, myTop, topBid, status, badgeLabel, badgeCls };
    })
    .sort((a, b) => {
      const order = { live:0, paused:1, ended:2, removed:3 };
      return (order[a.status] ?? 3) - (order[b.status] ?? 3);
    });

  // Section 2: Artworks I've Ooh'd (from localStorage Set, cross-referenced against store)
  const oohedSet = getOohedSet();
  const oohedAuctions = store.auctions
    .filter((a) => !a.removed && a.published && oohedSet.has(a.id))
    .sort((a, b) => {
      const sa = getStatus(a) === "live" ? 0 : 1;
      const sb = getStatus(b) === "live" ? 0 : 1;
      if (sa !== sb) return sa - sb;
      return (store.oohs[b.id] || 0) - (store.oohs[a.id] || 0);
    });

  // Section 3: Artists I Follow
  const following = store.collectors?.[meCollector.id]?.following || [];
  const followedArtists = following
    .map((id) => store.artists[id])
    .filter(Boolean)
    .map((artist) => ({
      artist,
      liveAuctions: store.auctions.filter(
        (a) => a.artistId === artist.id && !a.removed && a.published && getStatus(a) === "live"
      ),
    }));

  return (
    <div className="collector-dashboard">
      <div style={{ marginBottom:"2.5rem" }}>
        <div className="dash-greeting">{meCollector.avatar} <em style={{ fontStyle:"normal", background:"var(--grad-cool)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>{meCollector.name}</em>'s Collection</div>
        <div className="dash-subtitle">{meCollector.email} · Collector</div>
      </div>

      {/* My Bids */}
      <div className="cdash-section">
        <div className="cdash-section-title">🏷️ My Bids</div>
        {myBidAuctions.length === 0 ? (
          <p style={{ color:"var(--mist)", fontSize:"0.88rem" }}>You haven't placed any bids yet. <button className="btn-follow-hint" onClick={() => onNavigate("home")}>Browse live auctions <i className="fa-solid fa-arrow-right"></i></button></p>
        ) : (
          <div className="cdash-bid-list">
            {myBidAuctions.map(({ auction, myTop, topBid, badgeLabel, badgeCls }) => {
              const summary = store.bidSummaries[auction.id] || { count: 0, topAmount: 0 };
              const currentTop = topBid ? topBid.amount : auction.startingPrice;
              return (
                <div key={auction.id} className="cdash-bid-card" onClick={() => onNavigate("auction", auction.id)}>
                  <div className="cdash-bid-thumb">
                    {auction.imageUrl ? <img src={auction.imageUrl} alt="" /> : (auction.emoji || "🎨")}
                  </div>
                  <div className="cdash-bid-info">
                    <div className="cdash-bid-title">{auction.title}</div>
                    <div className="cdash-bid-meta">by {auction.artistName} · {summary.count} bid{summary.count !== 1 ? "s" : ""} · Top: {fmt$(currentTop)}</div>
                  </div>
                  <div className="cdash-bid-status">
                    {badgeLabel && <span className={`bid-badge ${badgeCls}`}>{badgeLabel}</span>}
                    <span style={{ fontSize:"0.75rem", color:"var(--mist)" }}>Your bid: {fmt$(myTop)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Artworks I've Ooh'd */}
      <div className="cdash-section">
        <div className="cdash-section-title">✨ Artworks I've Ooh'd</div>
        {oohedAuctions.length === 0 ? (
          <p style={{ color:"var(--mist)", fontSize:"0.88rem" }}>Tap ✦ Ooh on any artwork to save it here.</p>
        ) : (
          <div className="cdash-ooh-grid">
            {oohedAuctions.map((auction) => (
              <div key={auction.id} className="cdash-ooh-card" onClick={() => onNavigate("auction", auction.id)}>
                <div className="cdash-ooh-thumb">
                  {auction.imageUrl ? <img src={auction.imageUrl} alt={auction.title} /> : (auction.emoji || "🎨")}
                </div>
                <div className="cdash-ooh-body">
                  <div className="cdash-ooh-title">{auction.title}</div>
                  <div className="cdash-ooh-count">✨ {store.oohs?.[auction.id] || 0} Ooh{(store.oohs?.[auction.id] || 0) !== 1 ? "s" : ""}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Artists I Follow */}
      <div className="cdash-section">
        <div className="cdash-section-title">✦ Artists I Follow</div>
        {followedArtists.length === 0 ? (
          <p style={{ color:"var(--mist)", fontSize:"0.88rem" }}>Visit an artist's profile and click Follow to see them here.</p>
        ) : (
          <div className="cdash-following-list">
            {followedArtists.map(({ artist, liveAuctions }) => (
              <div key={artist.id} className="cdash-artist-row" onClick={() => onNavigate("artist", artist.id)}>
                <div className="cdash-artist-avatar">{artist.avatar}</div>
                <div className="cdash-artist-info">
                  <div className="cdash-artist-name">{artist.name}</div>
                  <div className="cdash-artist-meta">{liveAuctions.length > 0 ? `${liveAuctions.length} live auction${liveAuctions.length !== 1 ? "s" : ""}` : "No live auctions right now"}</div>
                  {liveAuctions.length > 0 && <div className="cdash-artist-auctions">{liveAuctions.map((a) => a.title).join(" · ")}</div>}
                </div>
                <div style={{ fontSize:"0.8rem", color:"var(--mist)" }}><i className="fa-solid fa-arrow-right"></i></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// INVITE PAGE
// ─────────────────────────────────────────────────────────────────────────────
const InvitePage = ({ user, store, updateStore, onNavigate }) => {
  const invite = store.myInvite;
  const [recipientEmail, setRecipientEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sendMsg, setSendMsg] = useState(null);
  const [copied, setCopied] = useState(false);

  const appUrl = window.location.origin + window.location.pathname;
  const inviteLink = invite ? `${appUrl}?invite=${invite.code}` : "";

  const copyLink = () => {
    navigator.clipboard.writeText(inviteLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const sendInviteEmail = async () => {
    if (!recipientEmail.includes("@")) { setSendMsg({ type:"error", text:"Enter a valid email address." }); return; }
    setSending(true);
    setSendMsg(null);
    try {
      const { error } = await supabase.functions.invoke("send-invite-email", {
        body: { recipientEmail: recipientEmail.trim(), senderName: user.name, inviteCode: invite.code }
      });
      if (error) throw error;
      setSendMsg({ type:"success", text:`Invite sent to ${recipientEmail.trim()}!` });
      setRecipientEmail("");
      updateStore(user.id);
    } catch (e) {
      setSendMsg({ type:"error", text:"Failed to send invite. Try again." });
    }
    setSending(false);
  };

  return (
    <div className="invite-page">
      <button className="btn btn-ghost btn-sm" style={{ marginBottom:"1.5rem" }} onClick={() => onNavigate("home")}><i className="fa-solid fa-arrow-left"></i> Back</button>
      <div className="page-title"><i className="fa-solid fa-envelope"></i> Your <em>Invites</em></div>
      <div className="page-subtitle">Share ArtDrop with people you trust. Each code allows up to 5 new members.</div>

      {!invite ? (
        <div className="alert alert-info">Your personal invite code is being generated. Try refreshing in a moment.</div>
      ) : (
        <>
          <div className="invite-code-box">
            <div className="invite-code-label">Your Invite Code</div>
            <div className="invite-code-value">{invite.code}</div>
            <div className="invite-slots">
              {Array.from({ length: invite.maxUses }).map((_, i) => (
                <div key={i} className={`invite-slot ${i < invite.remaining ? "available" : "used"}`} />
              ))}
            </div>
            <div className="invite-slots-label">
              {invite.remaining > 0
                ? `${invite.remaining} of ${invite.maxUses} invites remaining`
                : "All invites used"}
            </div>
            <button className="invite-copy-btn" onClick={copyLink}>
              {copied ? <><i className="fa-solid fa-check"></i> Copied!</> : <><i className="fa-solid fa-copy"></i> Copy invite link</>}
            </button>
          </div>

          {invite.remaining > 0 ? (
            <div className="invite-send-section">
              <div className="invite-send-title">Send an email invite</div>
              <div className="invite-send-sub">Enter a friend's email and we'll send them a personalised invite from you.</div>
              {sendMsg && <div className={`alert alert-${sendMsg.type}`}>{sendMsg.text}</div>}
              <div className="invite-send-row">
                <input
                  className="form-input"
                  type="email"
                  placeholder="friend@example.com"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendInviteEmail()}
                />
                <button className="btn btn-primary" onClick={sendInviteEmail} disabled={sending}>
                  {sending ? "Sending…" : <>Send <i className="fa-solid fa-paper-plane"></i></>}
                </button>
              </div>
            </div>
          ) : (
            <div className="invite-exhausted">
              🎉 All 5 invites have been used. Your friends are on ArtDrop!
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
const DashboardPage = ({ artist, onNavigate, store, updateStore }) => {
  const my = store.auctions.filter((a) => a.artistId === artist.id && !a.removed);
  const [confirm, setConfirm] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [markingPaid, setMarkingPaid] = useState(null);
  const [markingShipped, setMarkingShipped] = useState(null);
  const [trackingInput, setTrackingInput] = useState({});

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
    pause:  { title: "Pause Auction",     message: "Bidding is suspended until you resume.",                    confirmLabel: "Pause",      confirmClass: "btn-warning" },
    resume: { title: "Resume Auction",    message: "The auction will go live again with the remaining time restored.", confirmLabel: "Resume",     confirmClass: "btn-success" },
    end:    { title: "End Auction Early", message: "The highest bidder wins now. This cannot be undone.",       confirmLabel: "End Now",    confirmClass: "btn-danger" },
    remove: { title: "Remove Listing",    message: "This hides the listing from the gallery permanently.",      confirmLabel: "Remove",     confirmClass: "btn-danger" },
  };

  return (
    <div className="dashboard">
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "2.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div className="dash-greeting">{artist.avatar} <em>{artist.name}</em>'s Studio</div>
          <div className="dash-subtitle">{artist.email} · Member since {new Date(artist.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</div>
        </div>
        <button className="btn btn-primary" onClick={() => onNavigate("create")}>+ New Auction</button>
      </div>

      <div className="dash-stats">
        {[
          { v: stats.total,   label: "Total Auctions" },
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

      <div className="dash-section-title">My Auctions</div>

      {my.length === 0 ? (
        <div className="empty-state">
          <h3>No auctions yet</h3>
          <p style={{ marginBottom: "1.5rem" }}>Create your first listing to start selling your art.</p>
          <button className="btn btn-primary" onClick={() => onNavigate("create")}>Create Auction</button>
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
                  <button className="btn btn-ghost btn-sm" style={{ color: "var(--rouge)", borderColor: "rgba(139,46,46,0.25)" }} onClick={() => setConfirm({ type: "remove", id: auction.id })}>Remove</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {confirm && <ConfirmModal {...confirmCfg[confirm.type]} onConfirm={() => act(confirm.type, confirm.id)} onCancel={() => setConfirm(null)} />}

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

// ─────────────────────────────────────────────────────────────────────────────
// CREATE PAGE
// ─────────────────────────────────────────────────────────────────────────────
const CreatePage = ({ artist, onNavigate, store, updateStore }) => {
  const [step, setStep] = useState(0);
  const [f, setF] = useState({ title: "", description: "", medium: "", dimensions: "", startingPrice: "", minIncrement: "25", durationDays: "7", paymentMethods: ["venmo","paypal"], venmoHandle: "", paypalEmail: "", cashappHandle: "", imageUrl: "", emoji: "🎨" });
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  const togglePay = (m) => set("paymentMethods", f.paymentMethods.includes(m) ? f.paymentMethods.filter((x) => x !== m) : [...f.paymentMethods, m]);

  const publish = async () => {
    setBusy(true);
    const id = generateId();
    const endDate = new Date(Date.now() + parseInt(f.durationDays) * 86400000).toISOString();
    const auctionRow = {
      id, artist_id: artist.id, artist_name: artist.name, artist_avatar: artist.avatar,
      title: f.title, description: f.description, medium: f.medium, dimensions: f.dimensions,
      starting_price: parseFloat(f.startingPrice) || 50, min_increment: parseFloat(f.minIncrement) || 25,
      end_date: endDate, duration_days: parseInt(f.durationDays),
      payment_methods: f.paymentMethods, venmo_handle: f.venmoHandle,
      paypal_email: f.paypalEmail, cashapp_handle: f.cashappHandle,
      image_url: f.imageUrl, emoji: f.emoji, paused: false, removed: false,
    };
    const { error: insertErr } = await supabase.from("auctions").insert(auctionRow);
    if (insertErr) { console.error("publish error:", insertErr); setBusy(false); return; }
    await updateStore(); // refresh store so new auction is visible
    setBusy(false);
    onNavigate("auction", id);
  };

  const STEPS = ["Artwork", "Details", "Pricing", "Payment", "Publish"];

  return (
    <div className="page-container">
      <h1 className="page-title">New <em>Auction</em></h1>
      <p className="page-subtitle">Listing as <strong>{artist.avatar} {artist.name}</strong></p>

      <div className="step-indicator">
        {STEPS.map((s, i) => (
          <div key={s} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? 1 : 0 }}>
            <div className={`step-num ${i === step ? "active" : i < step ? "done" : ""}`}>{i < step ? <i className="fa-solid fa-check"></i> : i + 1}</div>
            <span className={`step-label ${i === step ? "active" : ""}`}>{s}</span>
            {i < STEPS.length - 1 && <div className="step-line" />}
          </div>
        ))}
      </div>

      {step === 0 && (
        <div>
          <div className="form-group">
            <label className="form-label">Artwork Photo</label>
            <ImagePicker
              imageUrl={f.imageUrl}
              emoji={f.emoji}
              onImageUrl={(url) => set("imageUrl", url)}
              onEmoji={(em) => set("emoji", em)}
            />
          </div>
          <div className="form-group"><label className="form-label">Artwork Title *</label><input className="form-input" placeholder="e.g. Ocean at Dawn, Series III" value={f.title} onChange={(e) => set("title", e.target.value)} /></div>
          <div className="form-actions"><button className="btn btn-ghost" onClick={() => onNavigate("dashboard")}>Cancel</button><button className="btn btn-primary" onClick={() => setStep(1)} disabled={!f.title.trim()}>Continue <i className="fa-solid fa-arrow-right"></i></button></div>
        </div>
      )}

      {step === 1 && (
        <div>
          <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" rows={4} placeholder="Tell collectors about the piece — story, technique, inspiration…" value={f.description} onChange={(e) => set("description", e.target.value)} /></div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Medium</label><input className="form-input" placeholder="e.g. Oil on canvas" value={f.medium} onChange={(e) => set("medium", e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Dimensions</label><input className="form-input" placeholder='e.g. 24" × 36"' value={f.dimensions} onChange={(e) => set("dimensions", e.target.value)} /></div>
          </div>
          <div className="form-actions"><button className="btn btn-ghost" onClick={() => setStep(0)}><i className="fa-solid fa-arrow-left"></i> Back</button><button className="btn btn-primary" onClick={() => setStep(2)}>Continue <i className="fa-solid fa-arrow-right"></i></button></div>
        </div>
      )}

      {step === 2 && (
        <div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Starting Bid *</label><div className="input-prefix"><span className="input-prefix-sym">$</span><input className="form-input" type="number" min="1" placeholder="100" value={f.startingPrice} onChange={(e) => set("startingPrice", e.target.value)} /></div></div>
            <div className="form-group"><label className="form-label">Minimum Increment</label><div className="input-prefix"><span className="input-prefix-sym">$</span><input className="form-input" type="number" min="1" placeholder="25" value={f.minIncrement} onChange={(e) => set("minIncrement", e.target.value)} /></div><p className="form-hint">Each new bid must raise by at least this amount</p></div>
          </div>
          <div className="form-group"><label className="form-label">Auction Duration</label><select className="form-select" value={f.durationDays} onChange={(e) => set("durationDays", e.target.value)}>{[["1","1 day"],["3","3 days"],["5","5 days"],["7","7 days (recommended)"],["14","14 days"],["30","30 days"]].map(([v,l]) => <option key={v} value={v}>{l}</option>)}</select></div>
          <div className="form-actions"><button className="btn btn-ghost" onClick={() => setStep(1)}><i className="fa-solid fa-arrow-left"></i> Back</button><button className="btn btn-primary" onClick={() => setStep(3)} disabled={!f.startingPrice}>Continue <i className="fa-solid fa-arrow-right"></i></button></div>
        </div>
      )}

      {step === 3 && (
        <div>
          <p style={{ color: "var(--mist)", fontSize: "0.88rem", marginBottom: "1.5rem" }}>Choose which payment methods you'll accept from the winning bidder.</p>
          {[
            { key: "venmo",   label: "Venmo",          icon: "💙", field: "venmoHandle",   ph: "@your-venmo" },
            { key: "paypal",  label: "PayPal",          icon: "🅿️", field: "paypalEmail",   ph: "your@email.com" },
            { key: "cashapp", label: "Cash App",        icon: "💚", field: "cashappHandle", ph: "$yourcashtag" },
            { key: "zelle",   label: "Zelle",           icon: "💜", field: null },
            { key: "check",   label: "Personal Check",  icon: "📝", field: null },
            { key: "contact", label: "Contact Artist",  icon: "📧", field: null },
          ].map(({ key, label, icon, field, ph }) => (
            <div key={key} style={{ marginBottom: "0.6rem" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"0.75rem", padding:"0.85rem 1rem", border:`1px solid ${f.paymentMethods.includes(key)?"var(--gold)":"var(--border)"}`, borderRadius:"var(--radius)", background:f.paymentMethods.includes(key)?"rgba(201,168,76,0.05)":"white", cursor:"pointer", transition:"all 0.15s" }} onClick={() => togglePay(key)}>
                <span style={{ fontSize:"1.15rem" }}>{icon}</span>
                <span style={{ flex:1, fontWeight:500, fontSize:"0.92rem" }}>{label}</span>
                <span style={{ color:f.paymentMethods.includes(key)?"var(--gold-dark)":"var(--border)" }}>{f.paymentMethods.includes(key) ? <i className="fa-solid fa-check"></i> : <i className="fa-solid fa-plus"></i>}</span>
              </div>
              {f.paymentMethods.includes(key) && field && <input className="form-input" style={{ marginTop:"0.4rem", borderRadius:`0 0 var(--radius) var(--radius)`, borderTop:"none" }} placeholder={ph} value={f[field]} onChange={(e) => set(field, e.target.value)} />}
            </div>
          ))}
          <div className="form-actions"><button className="btn btn-ghost" onClick={() => setStep(2)}><i className="fa-solid fa-arrow-left"></i> Back</button><button className="btn btn-primary" onClick={() => setStep(4)} disabled={f.paymentMethods.length === 0}>Continue <i className="fa-solid fa-arrow-right"></i></button></div>
        </div>
      )}

      {step === 4 && (
        <div>
          <div style={{ background:"white", border:"1px solid var(--border)", borderRadius:"var(--radius-lg)", padding:"1.5rem", marginBottom:"1.5rem" }}>
            <div style={{ display:"flex", gap:"1.25rem", alignItems:"flex-start" }}>
              <div style={{ width:72, height:72, background:"var(--parchment)", borderRadius:"var(--radius)", overflow:"hidden", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"2rem" }}>
                {f.imageUrl ? <img src={f.imageUrl} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} /> : f.emoji}
              </div>
              <div>
                <div style={{ fontFamily:"var(--font-display)", fontSize:"1.2rem", fontWeight:700 }}>{f.title}</div>
                <div style={{ color:"var(--mist)", fontSize:"0.82rem", marginBottom:"0.4rem" }}>by {artist.name}</div>
                <div style={{ display:"flex", gap:"0.5rem", flexWrap:"wrap" }}>{f.medium && <span className="tag">{f.medium}</span>}{f.dimensions && <span className="tag">{f.dimensions}</span>}</div>
              </div>
            </div>
            <div className="divider" />
            <div className="publish-summary-grid">
              {[["Starting Bid", fmt$(f.startingPrice||0)], ["Duration", `${f.durationDays} days`], ["Payments", `${f.paymentMethods.length} method${f.paymentMethods.length!==1?"s":""}`]].map(([l,v]) => (
                <div key={l}><div style={{ color:"var(--mist)", fontSize:"0.7rem", textTransform:"uppercase", letterSpacing:"0.06em" }}>{l}</div><div style={{ fontWeight:600, marginTop:"0.15rem" }}>{v}</div></div>
              ))}
            </div>
          </div>
          <div className="alert alert-info"><i className="fa-solid fa-circle-info"></i> Once published, your auction goes live immediately. You'll get a shareable link to send to collectors.</div>
          <div className="form-actions"><button className="btn btn-ghost" onClick={() => setStep(3)}><i className="fa-solid fa-arrow-left"></i> Back</button><button className="btn btn-primary btn-lg" onClick={publish} disabled={busy}>{busy ? "Publishing…" : <><i className="fa-solid fa-rocket"></i> Publish Auction</>}</button></div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// AUCTION DETAIL
// ─────────────────────────────────────────────────────────────────────────────
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
  const [localMyReactions, setLocalMyReactions] = useState({});
  const REACTION_EMOJIS = ["❤️", "👏", "🔥"];
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

  if (!auction) return <div className="page-container" style={{ textAlign:"center", paddingTop:"6rem" }}><div style={{ fontSize:"3rem", marginBottom:"1rem" }}>🔍</div><h2 style={{ fontFamily:"var(--font-display)", marginBottom:"0.75rem" }}>Auction Not Found</h2><button className="btn btn-primary" onClick={() => onNavigate("home")}>Back to Home</button></div>;

  const isLive = status === "live";
  const currentTop = topBid ? topBid.amount : auction.startingPrice;
  const minBid = topBid ? currentTop + (auction.minIncrement || 25) : currentTop;
  const shareUrl = `${window.location.origin}${window.location.pathname}#auction-${auctionId}`;
  const isWinner = !isLive && topBid && (topBid.bidder === bidderName || (bidderEmail && topBid.email === bidderEmail));

  const copyLink = () => { navigator.clipboard.writeText(shareUrl).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500); }); };
  const shareVia = (m) => {
    const text = `🖼️ Bid on "${auction.title}" by ${auction.artistName} — ${shareUrl}`;
    if (m === "email") window.open(`mailto:?subject=Art Auction: ${auction.title}&body=${encodeURIComponent(text)}`);
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
    pause:  { title:"Pause Auction",     message:"Bidding is suspended until you resume.",             confirmLabel:"Pause",    confirmClass:"btn-warning" },
    resume: { title:"Resume Auction",    message:"Auction goes live again with the remaining time restored.",       confirmLabel:"Resume",   confirmClass:"btn-success" },
    end:    { title:"End Auction Early", message:"Highest bidder wins now. Cannot be undone.",         confirmLabel:"End Now",  confirmClass:"btn-danger" },
    remove: { title:"Remove Auction",    message:"Listing will be hidden from gallery permanently.",   confirmLabel:"Remove",   confirmClass:"btn-danger" },
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
      {!isLive && topBid && !isWinner && <div className="alert" style={{ background:"var(--parchment)", border:"1px solid var(--border)", color:"var(--slate)", marginBottom:"1.5rem" }}>Auction ended. Winner: <strong>{shortName(topBid.bidder)}</strong> · {fmt$(topBid.amount)}</div>}
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

          {status === "paused" && <div className="paused-notice"><i className="fa-solid fa-pause"></i> This auction is currently paused. Bidding is suspended.</div>}

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
            {isOwner && isLive && <div className="alert alert-info" style={{ marginTop:"0.5rem", marginBottom:0 }}>You can't bid on your own auction.</div>}
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
                  <span style={{ fontSize:"1.1rem", flexShrink:0 }}>{currentUserAvatar}</span>
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
                        <span className="comment-avatar">{c.authorAvatar}</span>
                        <div style={{ flex:1, minWidth:0 }}>
                          <span style={{ fontWeight:600, fontSize:"0.85rem", color:"var(--ink)" }}>{c.authorName}</span>
                          <span style={{ fontSize:"0.72rem", color:"var(--mist)", marginLeft:"0.5rem" }}>{timeAgo(c.createdAt)}</span>
                        </div>
                        {isOwner && (
                          <button className="comment-delete-btn" onClick={() => deleteComment(c.id)}
                            disabled={deletingId === c.id} title="Delete comment">
                            {deletingId === c.id ? "…" : <i className="fa-solid fa-trash"></i>}
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
            <div className="share-title"><i className="fa-solid fa-share-nodes"></i> Share This Auction</div>
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

// ─────────────────────────────────────────────────────────────────────────────
// PAYMENT PAGE
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// EDIT PAGE
// ─────────────────────────────────────────────────────────────────────────────
const EditPage = ({ auctionId, artist, onNavigate, store, updateStore }) => {
  const auction = store.auctions.find((a) => a.id === auctionId);
  if (!auction || auction.artistId !== artist?.id) {
    return <div className="page-container" style={{ textAlign: "center", paddingTop: "6rem" }}><h2>Auction not found.</h2><button className="btn btn-primary" style={{ marginTop: "1.5rem" }} onClick={() => onNavigate("dashboard")}>Back to Dashboard</button></div>;
  }

  const [f, setF] = useState({
    title: auction.title,
    description: auction.description || "",
    medium: auction.medium || "",
    dimensions: auction.dimensions || "",
    paymentMethods: auction.paymentMethods || [],
    venmoHandle: auction.venmoHandle || "",
    paypalEmail: auction.paypalEmail || "",
    cashappHandle: auction.cashappHandle || "",
    imageUrl: auction.imageUrl || "",
    emoji: auction.emoji || "🎨",
  });
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const togglePay = (m) => set("paymentMethods", f.paymentMethods.includes(m) ? f.paymentMethods.filter((x) => x !== m) : [...f.paymentMethods, m]);

  const save = async () => {
    if (!f.title.trim()) return;
    setBusy(true);
    const { error: saveErr } = await supabase.from("auctions").update({
      title: f.title.trim(), description: f.description, medium: f.medium, dimensions: f.dimensions,
      payment_methods: f.paymentMethods, venmo_handle: f.venmoHandle,
      paypal_email: f.paypalEmail, cashapp_handle: f.cashappHandle,
      image_url: f.imageUrl, emoji: f.emoji,
    }).eq("id", auctionId);
    if (saveErr) { console.error("save error:", saveErr); setBusy(false); return; }
    await updateStore();
    setBusy(false);
    setSaved(true);
    setTimeout(() => { setSaved(false); onNavigate("auction", auctionId); }, 1200);
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Edit <em>Auction</em></h1>
      <p className="page-subtitle">Changes apply immediately. Bids and timer are unaffected.</p>

      {saved && <div className="alert alert-success" style={{ marginBottom: "1.5rem" }}><i className="fa-solid fa-check"></i> Saved! Redirecting…</div>}

      <div className="form-group">
        <label className="form-label">Artwork Photo</label>
        <ImagePicker
          imageUrl={f.imageUrl}
          emoji={f.emoji}
          onImageUrl={(url) => set("imageUrl", url)}
          onEmoji={(em) => set("emoji", em)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Artwork Title *</label>
        <input className="form-input" value={f.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Ocean at Dawn, Series III" />
      </div>

      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea className="form-textarea" rows={4} value={f.description} onChange={(e) => set("description", e.target.value)} placeholder="Tell collectors about the piece…" />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Medium</label>
          <input className="form-input" value={f.medium} onChange={(e) => set("medium", e.target.value)} placeholder="e.g. Oil on canvas" />
        </div>
        <div className="form-group">
          <label className="form-label">Dimensions</label>
          <input className="form-input" value={f.dimensions} onChange={(e) => set("dimensions", e.target.value)} placeholder='e.g. 24" × 36"' />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" style={{ marginBottom: "0.75rem" }}>Payment Methods</label>
        {[
          { key: "venmo",   label: "Venmo",         icon: "💙", field: "venmoHandle",   ph: "@your-venmo" },
          { key: "paypal",  label: "PayPal",         icon: "🅿️", field: "paypalEmail",   ph: "your@email.com" },
          { key: "cashapp", label: "Cash App",       icon: "💚", field: "cashappHandle", ph: "$yourcashtag" },
          { key: "zelle",   label: "Zelle",          icon: "💜", field: null },
          { key: "check",   label: "Personal Check", icon: "📝", field: null },
          { key: "contact", label: "Contact Artist", icon: "📧", field: null },
        ].map(({ key, label, icon, field, ph }) => (
          <div key={key} style={{ marginBottom: "0.6rem" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"0.75rem", padding:"0.85rem 1rem", border:`1px solid ${f.paymentMethods.includes(key)?"var(--gold)":"var(--border)"}`, borderRadius:"var(--radius)", background:f.paymentMethods.includes(key)?"rgba(201,168,76,0.05)":"white", cursor:"pointer", transition:"all 0.15s" }} onClick={() => togglePay(key)}>
              <span style={{ fontSize:"1.15rem" }}>{icon}</span>
              <span style={{ flex:1, fontWeight:500, fontSize:"0.92rem" }}>{label}</span>
              <span style={{ color:f.paymentMethods.includes(key)?"var(--gold-dark)":"var(--border)" }}>{f.paymentMethods.includes(key) ? <i className="fa-solid fa-check"></i> : <i className="fa-solid fa-plus"></i>}</span>
            </div>
            {f.paymentMethods.includes(key) && field && <input className="form-input" style={{ marginTop:"0.4rem", borderRadius:`0 0 var(--radius) var(--radius)`, borderTop:"none" }} placeholder={ph} value={f[field]} onChange={(e) => set(field, e.target.value)} />}
          </div>
        ))}
      </div>

      <div className="form-actions">
        <button className="btn btn-ghost" onClick={() => onNavigate("auction", auctionId)}>Cancel</button>
        <button className="btn btn-primary" onClick={save} disabled={busy || !f.title.trim()}>{busy ? "Saving…" : "Save Changes"}</button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MOBILE BOTTOM NAV
// ─────────────────────────────────────────────────────────────────────────────
function MobileBottomNav({ page, isArtist, isCollector, onNavigate }) {
  if (!isArtist && !isCollector) return null;

  const artistTabs = [
    { id: "home",      icon: <i className="fa-solid fa-house"></i>,            label: "Feed"      },
    { id: "create",    icon: null,                                              label: "New"       },
    { id: "dashboard", icon: <i className="fa-solid fa-chart-simple"></i>,     label: "Dashboard" },
    { id: "home",      icon: <i className="fa-solid fa-magnifying-glass"></i>, label: "Search", searchFocus: true },
  ];

  const collectorTabs = [
    { id: "home",                icon: <i className="fa-solid fa-house"></i>,           label: "Feed" },
    { id: "collector-dashboard", icon: <i className="fa-solid fa-folder-open"></i>,     label: "Bids" },
    { id: "home",                icon: <i className="fa-solid fa-magnifying-glass"></i>, label: "Search", searchFocus: true },
  ];

  const tabs = isArtist ? artistTabs : collectorTabs;

  const handleTab = (tab) => {
    onNavigate(tab.id);
    if (tab.searchFocus) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => {
        const el = document.querySelector(".feed-search-input");
        if (el) el.focus();
      }, 150);
    }
  };

  return (
    <div className="mobile-bottom-nav">
      <div className="mobile-bottom-nav-inner">
        {tabs.map((tab, i) => {
          if (isArtist && tab.id === "create") {
            return (
              <button key={i} className="mobile-nav-tab-new" onClick={() => handleTab(tab)}>
                <div className="mobile-nav-tab-new-circle">
                  <i className="fa-solid fa-plus"></i>
                </div>
                <span className="mobile-nav-tab-new-label">New</span>
              </button>
            );
          }
          return (
            <button
              key={i}
              className={`mobile-nav-tab${!tab.searchFocus && tab.id === page ? " active" : ""}`}
              onClick={() => handleTab(tab)}
            >
              <span className="mobile-nav-tab-icon">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// APP SHELL
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  const [store, updateStore, loadAuctionDetail] = useSupabaseStore();
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
      if (!session) return;
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
      if (!profile) return;
      const user = { id: session.user.id, name: profile.name, email: session.user.email, avatar: profile.avatar, bio: profile.bio, createdAt: profile.created_at };
      if (profile.type === "artist") setArtist(user);
      else setCollector(user);
      updateStore(session.user.id);
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
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (page === "auction" && id) window.history.pushState(null, "", `${window.location.pathname}#auction-${id}`);
    else window.history.pushState(null, "", window.location.pathname);
  };

  const onLogin = (a) => { setArtist(a); updateStore(a.id); setView(returnToAuction ? { page: "auction", id: returnToAuction } : { page: "dashboard", id: null }); setReturnToAuction(null); };
  const onLogout = async () => { await supabase.auth.signOut(); setArtist(null); setDropOpen(false); setView({ page: "home", id: null }); };
  const onCollectorLogin = (c) => { setCollector(c); updateStore(c.id); setView(returnToAuction ? { page: "auction", id: returnToAuction } : { page: "home", id: null }); setReturnToAuction(null); };
  const onCollectorLogout = async () => { await supabase.auth.signOut(); setCollector(null); setCollectorDropOpen(false); setView({ page: "home", id: null }); };

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

  return (
    <>
      <style>{STYLES}</style>

      <nav className="nav">
        <div className="nav-logo" onClick={() => go("home")}>ArtDrop<span>Art Auction House</span></div>
        <div className="nav-actions">
          {liveCount > 0 && <span className="live-pip"><span className="pulse" style={{ background:"var(--rouge)" }} />{liveCount} live</span>}
          <button className="nav-link" onClick={() => go("home")}>{isLoggedIn ? "Feed" : "Browse"}</button>

          {/* Artist logged in */}
          {me && (
            <>
              <button className="nav-link nav-new-btn" onClick={() => go("create")}>+ New</button>
              <div className="artist-menu" ref={dropRef}>
                <button className="artist-avatar-btn" onClick={() => setDropOpen((o) => !o)} title={me.name}>{me.avatar}</button>
                {dropOpen && (
                  <div className="artist-dropdown">
                    <div className="artist-dropdown-header"><div className="artist-dropdown-name">{me.name}</div><div className="artist-dropdown-email">{me.email}</div></div>
                    <button className="dropdown-item" onClick={() => go("dashboard")}><i className="fa-solid fa-chart-simple"></i> My Dashboard</button>
                    <button className="dropdown-item" onClick={() => go("create")}><i className="fa-solid fa-plus"></i> New Auction</button>
                    <button className="dropdown-item" onClick={() => go("invites")}><i className="fa-solid fa-envelope"></i> Invites</button>
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
              <button className="artist-avatar-btn collector-avatar-btn" onClick={() => setCollectorDropOpen((o) => !o)} title={meCollector.name}>{meCollector.avatar}</button>
              {outbidCount > 0 && <span className="notif-badge">{outbidCount}</span>}
              {collectorDropOpen && (
                <div className="artist-dropdown">
                  <div className="artist-dropdown-header"><div className="artist-dropdown-name">{meCollector.name}</div><div className="artist-dropdown-email">{meCollector.email} · Collector</div></div>
                  <button className="dropdown-item" onClick={() => go("collector-dashboard")}><i className="fa-solid fa-folder-open"></i> My Collection</button>
                  <button className="dropdown-item" onClick={() => go("invites")}><i className="fa-solid fa-envelope"></i> Invites</button>
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
          <span>You've been outbid on <strong>{outbidCount} live auction{outbidCount !== 1 ? "s" : ""}</strong>.</span>
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
      {view.page === "create"              && me          && <CreatePage    artist={me} onNavigate={go} store={store} updateStore={updateStore} />}
      {view.page === "auction"             && <AuctionPage auctionId={view.id} onNavigate={go} store={store} updateStore={updateStore} loadAuctionDetail={loadAuctionDetail} artist={me} meCollector={meCollector} bidderName={bidderName} setBidderName={setBidderName} bidderEmail={bidderEmail} setBidderEmail={setBidderEmail} />}
      {view.page === "payment"             && (isLoggedIn ? <PaymentPage auctionId={view.id} onNavigate={go} store={store} updateStore={updateStore} loadAuctionDetail={loadAuctionDetail} bidderName={bidderName} bidderEmail={bidderEmail} meCollector={meCollector} /> : <AuthPage store={store} updateStore={updateStore} onLogin={onLogin} onCollectorLogin={onCollectorLogin} initialMode="login" initialInviteCode={pendingInviteCode} />)}
      {view.page === "edit"                && me          && <EditPage auctionId={view.id} artist={me} onNavigate={go} store={store} updateStore={updateStore} />}
      {view.page === "artist"              && (isLoggedIn ? <ArtistPage artistId={view.id} onNavigate={go} store={store} updateStore={updateStore} me={me} meCollector={meCollector} /> : <AuthPage store={store} updateStore={updateStore} onLogin={onLogin} onCollectorLogin={onCollectorLogin} initialMode="login" initialInviteCode={pendingInviteCode} />)}
      {view.page === "collector-dashboard" && meCollector && <CollectorDashboardPage meCollector={meCollector} onNavigate={go} store={store} updateStore={updateStore} />}
      {view.page === "invites"             && isLoggedIn  && <InvitePage user={me || meCollector} store={store} updateStore={updateStore} onNavigate={go} />}
    </>
  );
}
