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

export default ConfirmModal;
