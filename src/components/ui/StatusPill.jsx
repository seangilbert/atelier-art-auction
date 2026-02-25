const StatusPill = ({ status }) => {
  const cfg = {
    live:      ["sp-live",       <><i className="fa-solid fa-circle" style={{fontSize:"0.55em",verticalAlign:"middle"}}></i> Live</>],
    paused:    ["sp-paused",     <><i className="fa-solid fa-pause"></i> Paused</>],
    ended:     ["sp-ended",      "Ended"],
    removed:   ["sp-ended",      "Removed"],
    draft:     ["sp-draft",      <><i className="fa-solid fa-pencil" style={{fontSize:"0.75em"}}></i> Draft</>],
    scheduled: ["sp-scheduled",  <><i className="fa-solid fa-clock" style={{fontSize:"0.75em"}}></i> Scheduled</>],
  };
  const [cls, label] = cfg[status] || cfg.ended;
  return <span className={`status-pill ${cls}`}>{label}</span>;
};

export default StatusPill;
