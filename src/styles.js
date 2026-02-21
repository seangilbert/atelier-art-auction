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

  html { scroll-behavior: auto; overflow-x: hidden; }
  body { font-family: var(--font-body); background: var(--cream); color: var(--ink); font-size: 16px; line-height: 1.6; min-height: 100vh; overflow-x: hidden; }
  #root { min-height: 100vh; }
  .app-loading-screen { min-height: 100vh; background: var(--cream); }

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
  .artist-avatar-btn { width: 44px; height: 44px; border-radius: 50%; background: var(--grad-primary); border: none; cursor: pointer; font-size: 1.1rem; display: flex; align-items: center; justify-content: center; color: white; transition: transform 0.15s; box-shadow: 0 2px 10px rgba(232,82,106,0.35); overflow: hidden; }
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
  .rolling-number { display:inline-flex; align-items:center; }
  .rolling-digit-wrap { display:inline-block; overflow:hidden; height:1.15em; line-height:1.15; vertical-align:middle; }
  .rolling-digit-char { display:inline-block; animation:digit-roll-up 0.4s cubic-bezier(0.34,1.56,0.64,1) both; }
  @keyframes digit-roll-up {
    from { transform:translateY(110%); opacity:0; }
    to   { transform:translateY(0);    opacity:1; }
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
  .feed-card-header { display:flex; align-items:center; gap:0.65rem; padding:1rem 1.5rem 0.85rem; }
  .feed-avatar { width:34px; height:34px; border-radius:50%; background:var(--grad-accent); display:flex; align-items:center; justify-content:center; font-size:1rem; flex-shrink:0; overflow:hidden; }
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
  .artist-profile-avatar { width:80px; height:80px; border-radius:50%; background:var(--grad-accent); display:flex; align-items:center; justify-content:center; font-size:2.2rem; flex-shrink:0; overflow:hidden; }
  .artist-profile-info { flex:1; min-width:200px; }
  .artist-profile-name { font-size:1.8rem; font-weight:700; color:var(--ink); letter-spacing:-0.03em; margin-bottom:0.15rem; }
  .artist-profile-since { font-size:0.78rem; color:var(--mist); margin-bottom:0.75rem; }
  .artist-profile-bio { font-size:0.9rem; color:var(--slate); line-height:1.7; }
  .artist-profile-stats { display:flex; gap:1.75rem; margin-top:1rem; }
  .artist-profile-stat { display:flex; flex-direction:column; align-items:flex-start; }
  .artist-profile-stat-num { font-size:1.05rem; font-weight:700; color:var(--ink); line-height:1.2; }
  .artist-profile-stat-label { font-size:0.7rem; color:var(--mist); text-transform:uppercase; letter-spacing:0.06em; margin-top:0.1rem; }
  .artist-follow-wrap { display:flex; align-items:flex-start; padding-top:0.25rem; }
  .btn-follow-hint { font-size:0.78rem; color:var(--mist); cursor:pointer; background:none; border:none; font-family:var(--font-body); text-decoration:underline; }
  .btn-follow-hint:hover { color:var(--gold-dark); }

  /* ── Ratings ─────────────────────────────────────────────────────────────── */
  .star-picker { display:flex; gap:0.25rem; margin:0.5rem 0 0; }
  .star-btn { background:none; border:none; cursor:pointer; font-size:2rem; line-height:1; padding:0.1rem 0.15rem; transition:transform 0.1s; color:var(--border); font-family:var(--font-body); }
  .star-btn.star-filled, .star-btn:hover { color:var(--gold); }
  .star-btn:hover { transform:scale(1.15); }
  .rate-btn { font-size:0.72rem !important; padding:0.3rem 0.75rem !important; min-height:36px !important; }

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
  .cdash-artist-avatar { width:44px; height:44px; border-radius:50%; background:var(--grad-accent); display:flex; align-items:center; justify-content:center; font-size:1.2rem; flex-shrink:0; overflow:hidden; }
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
  .comment-avatar { width:30px; height:30px; border-radius:50%; overflow:hidden; background:var(--parchment); border:1px solid var(--border); display:inline-flex; align-items:center; justify-content:center; font-size:1rem; flex-shrink:0; }
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
  @media (max-width:768px) {
    .mobile-bottom-nav { display:block; }
    .nav-new-btn { display:none; }
    .page-shell, .feed-shell, .dashboard-shell, .collector-dash-shell, .create-shell, .auth-shell { padding-bottom:calc(56px + env(safe-area-inset-bottom,0px) + 1rem); }
    .auction-detail { padding-bottom:calc(6rem + 56px); }
  }

  /* ── Gallery ───────────────────────────────────────────────────────────── */
  .gallery-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(200px, 1fr)); gap:1rem; }
  .gallery-card { background:white; border:1.5px solid var(--border); border-radius:var(--radius-lg); overflow:hidden; box-shadow:var(--shadow-sm); display:flex; flex-direction:column; }
  .gallery-card-image { position:relative; aspect-ratio:1; background:var(--parchment); display:flex; align-items:center; justify-content:center; font-size:3rem; cursor:pointer; overflow:hidden; flex-shrink:0; }
  .gallery-card-image img { width:100%; height:100%; object-fit:cover; }
  .gallery-card-body { padding:0.85rem 1rem; display:flex; flex-direction:column; flex:1; }
  .gallery-card-title { font-weight:700; font-size:0.92rem; color:var(--ink); margin-bottom:0.25rem; }
  .gallery-card-meta { font-size:0.75rem; color:var(--mist); margin-bottom:0.4rem; }
  .gallery-card-actions { display:flex; gap:0.4rem; flex-wrap:wrap; margin-top:auto; padding-top:0.75rem; }
  .gallery-drop-history { margin:0.4rem 0 0.5rem; display:flex; flex-direction:column; gap:0.25rem; }
  .gallery-drop-row { display:flex; align-items:center; gap:0.5rem; font-size:0.78rem; cursor:pointer; padding:0.2rem 0; }
  .gallery-drop-row:hover { opacity:0.75; }

  /* ── Dashboard greeting inline avatar ──────────────────────────────────────── */
  .dash-greeting-avatar { display:inline-flex; width:1.8rem; height:1.8rem; border-radius:50%; overflow:hidden; vertical-align:middle; margin-right:0.35rem; flex-shrink:0; background:var(--grad-accent); }

  /* ── Avatar upload zone (Edit Profile) ─────────────────────────────────────── */
  .avatar-upload-zone { border:2px dashed var(--border); border-radius:var(--radius-lg); padding:1.5rem 1.25rem; text-align:center; cursor:pointer; transition:all 0.2s; background:white; }
  .avatar-upload-zone:hover, .avatar-upload-zone.drag-over { border-color:var(--gold); background:var(--gold-light); }
  .avatar-upload-label { font-size:0.9rem; font-weight:600; color:var(--ink); margin-bottom:0.25rem; }
  .avatar-upload-sub { font-size:0.76rem; color:var(--mist); }
  .avatar-upload-preview-wrap { display:flex; flex-direction:column; align-items:center; gap:0.4rem; }
  .avatar-upload-preview { width:80px; height:80px; border-radius:50%; object-fit:cover; border:3px solid var(--gold); box-shadow:var(--shadow-sm); }
  .avatar-upload-empty { display:flex; flex-direction:column; align-items:center; }

  /* ── Edit profile layout ────────────────────────────────────────────────────── */
  .edit-profile-avatar-row { display:flex; gap:1.5rem; align-items:flex-start; }
  .edit-profile-avatar-preview { width:80px; height:80px; border-radius:50%; background:var(--grad-accent); display:flex; align-items:center; justify-content:center; font-size:2.2rem; flex-shrink:0; overflow:hidden; box-shadow:var(--shadow-sm); border:3px solid var(--border); }
  @media (max-width:550px) {
    .edit-profile-avatar-row { flex-direction:column; align-items:stretch; }
    .edit-profile-avatar-preview { align-self:center; }
  }
`;

export default STYLES;
