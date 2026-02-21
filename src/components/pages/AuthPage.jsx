import { useState } from "react";
import { supabase } from "../../supabase.js";
import { AVATARS } from "../../utils/helpers.js";

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
        <div className="auth-logo-sub">Art Drop House</div>

        {mode === "login" && (
          <>
            <div className="auth-type-toggle">
              <button className={`auth-type-tab ${loginType === "artist" ? "active" : ""}`} onClick={() => { setLoginType("artist"); setError(""); }}>Artist</button>
              <button className={`auth-type-tab ${loginType === "collector" ? "active" : ""}`} onClick={() => { setLoginType("collector"); setError(""); }}>Collector</button>
            </div>
            <div className="auth-title">Welcome back</div>
            <div className="auth-sub">{loginType === "artist" ? "Sign in to manage your drops." : "Sign in to follow artists and bid on art."}</div>
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
            <div className="auth-sub">Join ArtDrop to list and drop your original artwork.</div>
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

export default AuthPage;
