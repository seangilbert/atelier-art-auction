import { useState } from "react";

export const StarPicker = ({ value, onChange }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="star-picker" onMouseLeave={() => setHovered(0)}>
      {[1,2,3,4,5].map(n => (
        <button key={n} type="button"
          className={`star-btn ${n <= (hovered || value) ? "star-filled" : "star-empty"}`}
          onMouseEnter={() => setHovered(n)}
          onClick={() => onChange(n)}
          aria-label={`${n} star${n !== 1 ? "s" : ""}`}>★</button>
      ))}
    </div>
  );
};

export const RatingModal = ({ title, subtitle, onSubmit, onClose, busy }) => {
  const [score, setScore]     = useState(0);
  const [comment, setComment] = useState("");
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><i className="fa-solid fa-xmark"></i></button>
        <div className="modal-title">{title}</div>
        <div className="modal-sub">{subtitle}</div>
        <StarPicker value={score} onChange={setScore} />
        <textarea className="form-textarea"
          style={{ marginTop:"1rem", width:"100%", minHeight:"80px" }}
          placeholder="Leave a comment (optional)"
          value={comment} onChange={e => setComment(e.target.value)} maxLength={500} />
        <div className="modal-actions">
          <button className="btn btn-ghost" style={{ flex:1 }} onClick={onClose} disabled={busy}>Cancel</button>
          <button className="btn btn-primary" style={{ flex:1 }}
            onClick={() => score && onSubmit(score, comment.trim())}
            disabled={!score || busy}>
            {busy ? "Saving…" : "Submit Rating"}
          </button>
        </div>
      </div>
    </div>
  );
};
