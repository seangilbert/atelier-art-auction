import { useState, useEffect, useRef } from "react";
import { supabase } from "../../supabase.js";
import { generateId } from "../../utils/helpers.js";

const MessageThread = ({ auctionId, senderType, senderName, senderId }) => {
  const [messages, setMessages] = useState([]);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [attachmentFile, setAttachmentFile] = useState(null);
  const fileRef = useRef(null);
  const bottomRef = useRef(null);

  const load = async () => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("auction_id", auctionId)
      .order("created_at");
    setMessages(data || []);
    // Mark messages from the other party as read
    const unread = (data || []).filter(m => m.sender_type !== senderType && !m.read_at);
    if (unread.length) {
      await supabase.from("messages")
        .update({ read_at: new Date().toISOString() })
        .in("id", unread.map(m => m.id));
    }
  };

  useEffect(() => { load(); }, [auctionId]);

  useEffect(() => {
    const ch = supabase
      .channel(`messages-${auctionId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `auction_id=eq.${auctionId}` }, load)
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [auctionId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!body.trim() && !attachmentFile) return;
    setSending(true);
    let attachmentUrl = null, attachmentName = null;
    if (attachmentFile) {
      const ext = attachmentFile.name.split(".").pop();
      const path = `messages/${auctionId}/${generateId()}.${ext}`;
      const { data: uploaded } = await supabase.storage.from("artworks").upload(path, attachmentFile, { upsert: true });
      if (uploaded) {
        attachmentUrl = supabase.storage.from("artworks").getPublicUrl(path).data.publicUrl;
        attachmentName = attachmentFile.name;
      }
      setAttachmentFile(null);
    }
    await supabase.from("messages").insert({
      id: generateId(),
      auction_id: auctionId,
      sender_id: senderId || null,
      sender_type: senderType,
      sender_name: senderName,
      body: body.trim() || null,
      attachment_url: attachmentUrl,
      attachment_name: attachmentName,
    });
    setBody("");
    setSending(false);
    load();
  };

  const otherLabel = senderType === "artist" ? "Collector" : "Artist";

  return (
    <div className="message-thread">
      <div className="message-thread-header">
        <i className="fa-solid fa-comments"></i> Messages with {otherLabel}
      </div>
      <div className="message-thread-list">
        {messages.length === 0 && (
          <div className="message-thread-empty">No messages yet — start the conversation!</div>
        )}
        {messages.map(m => {
          const isMine = m.sender_type === senderType;
          return (
            <div key={m.id} className={`message-bubble ${isMine ? "mine" : "theirs"}`}>
              <div className="message-sender-name">{m.sender_name}</div>
              {m.body && <div className="message-body">{m.body}</div>}
              {m.attachment_url && (
                <a href={m.attachment_url} target="_blank" rel="noreferrer" className="message-attachment">
                  <i className="fa-solid fa-paperclip"></i> {m.attachment_name || "Attachment"}
                </a>
              )}
              <div className="message-meta">
                {new Date(m.created_at).toLocaleString([], { month:"short", day:"numeric", hour:"2-digit", minute:"2-digit" })}
                {isMine && m.read_at && <span className="message-read"> · Read</span>}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <div className="message-input-row">
        <input
          className="message-input"
          type="text"
          placeholder="Type a message…"
          value={body}
          onChange={e => setBody(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
        />
        <input type="file" ref={fileRef} style={{ display:"none" }} onChange={e => setAttachmentFile(e.target.files[0])} />
        <button className="btn btn-ghost btn-sm" onClick={() => fileRef.current?.click()} title="Attach file">
          <i className={`fa-solid fa-paperclip${attachmentFile ? " active" : ""}`}></i>
        </button>
        <button className="btn btn-primary btn-sm" onClick={send} disabled={sending || (!body.trim() && !attachmentFile)}>
          {sending ? "…" : "Send"}
        </button>
      </div>
      {attachmentFile && (
        <div style={{ fontSize:"0.76rem", color:"var(--mist)", marginTop:"0.3rem", display:"flex", alignItems:"center", gap:"0.4rem" }}>
          <i className="fa-solid fa-paperclip"></i> {attachmentFile.name}
          <button onClick={() => setAttachmentFile(null)} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--rouge)", padding:0 }}>✕</button>
        </div>
      )}
    </div>
  );
};

export default MessageThread;
