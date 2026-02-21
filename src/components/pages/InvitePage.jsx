import { useState } from "react";
import { supabase } from "../../supabase.js";

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

export default InvitePage;
