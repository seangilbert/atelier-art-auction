import { useState, useEffect } from "react";
import { timeLeft } from "../../utils/helpers.js";

export const Countdown = ({ endDate }) => {
  const [left, setLeft] = useState(() => timeLeft(endDate));
  useEffect(() => { const id = setInterval(() => setLeft(timeLeft(endDate)), 1000); return () => clearInterval(id); }, [endDate]);
  if (!left) return <div className="countdown-ended">Drop has ended</div>;
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

export const CardTimer = ({ endDate }) => {
  const [left, setLeft] = useState(() => timeLeft(endDate));
  useEffect(() => { const id = setInterval(() => setLeft(timeLeft(endDate)), 10000); return () => clearInterval(id); }, [endDate]);
  if (!left) return <span style={{ color: "var(--mist)" }}>Ended</span>;
  if (left.d > 0) return <span>{left.d}d {left.h}h left</span>;
  return <span style={{ color: "var(--rouge)" }}>{left.h}h {left.m}m left</span>;
};
