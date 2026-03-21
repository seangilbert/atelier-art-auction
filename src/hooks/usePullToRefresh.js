import { useEffect, useRef, useState } from "react";

const THRESHOLD = 60;   // px drag needed to trigger refresh
const SETTLE = 48;      // px where spinner sits while refreshing
const MAX_PULL = 110;   // max visual drag distance

// Rubber-band: starts easy, gets harder — like pulling a rubber band
function rubberBand(delta) {
  const d = Math.max(0, delta);
  // logarithmic resistance: fast at first, increasingly stiff
  return MAX_PULL * (1 - Math.exp(-d / 180));
}

export default function usePullToRefresh(onRefresh) {
  const startY = useRef(null);
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const refreshingRef = useRef(false);
  const pullRef = useRef(0);
  const animRef = useRef(null);

  // Keep pullRef in sync so touchend closure sees current value
  useEffect(() => { pullRef.current = pull; }, [pull]);

  // Spring animation: animate pull from current value to target
  const springTo = (target, onDone) => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    const start = pullRef.current;
    const dist = target - start;
    const duration = Math.min(400, Math.max(200, Math.abs(dist) * 3));
    const t0 = performance.now();

    const tick = (now) => {
      const elapsed = now - t0;
      const p = Math.min(1, elapsed / duration);
      // Overdamped spring: ease-out with slight overshoot
      const ease = 1 - Math.pow(1 - p, 3);
      const val = start + dist * ease;
      setPull(Math.max(0, val));
      if (p < 1) {
        animRef.current = requestAnimationFrame(tick);
      } else {
        setPull(target);
        animRef.current = null;
        if (onDone) onDone();
      }
    };
    animRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    const onTouchStart = (e) => {
      if (window.scrollY === 0 && !refreshingRef.current) {
        // Cancel any running snap-back animation
        if (animRef.current) { cancelAnimationFrame(animRef.current); animRef.current = null; }
        startY.current = e.touches[0].clientY;
      }
    };

    const onTouchMove = (e) => {
      if (startY.current === null) return;
      const delta = e.touches[0].clientY - startY.current;
      if (delta <= 0) { startY.current = null; return; }
      e.preventDefault(); // block native iOS overscroll bounce
      setPull(rubberBand(delta));
    };

    const onTouchEnd = async () => {
      if (startY.current === null) return;
      startY.current = null;
      if (pullRef.current >= THRESHOLD && !refreshingRef.current) {
        refreshingRef.current = true;
        setRefreshing(true);
        // Spring to settled refresh position
        springTo(SETTLE, async () => {
          await onRefresh();
          refreshingRef.current = false;
          setRefreshing(false);
          // Spring back to zero after refresh completes
          springTo(0);
        });
      } else {
        // Elastic snap-back
        springTo(0);
      }
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [onRefresh]);

  return { pull, refreshing, dragging: pull > 0 && !refreshing };
}
