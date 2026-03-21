import { useEffect, useRef, useState } from "react";

const THRESHOLD = 72;  // px drag to trigger refresh
const MAX_PULL = 90;   // max visual drag distance
const RESIST = 0.45;   // rubber-band resistance factor

export default function usePullToRefresh(onRefresh) {
  const startY = useRef(null);
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const refreshingRef = useRef(false);
  const pullRef = useRef(0);

  // Keep pullRef in sync so touchend closure sees current value
  useEffect(() => { pullRef.current = pull; }, [pull]);

  useEffect(() => {
    const onTouchStart = (e) => {
      if (window.scrollY === 0 && !refreshingRef.current)
        startY.current = e.touches[0].clientY;
    };

    const onTouchMove = (e) => {
      if (startY.current === null) return;
      const delta = e.touches[0].clientY - startY.current;
      if (delta <= 0) { startY.current = null; return; }
      e.preventDefault(); // block native iOS overscroll bounce
      setPull(Math.min(delta * RESIST, MAX_PULL));
    };

    const onTouchEnd = async () => {
      if (startY.current === null) return;
      startY.current = null;
      if (pullRef.current >= THRESHOLD && !refreshingRef.current) {
        refreshingRef.current = true;
        setRefreshing(true);
        setPull(MAX_PULL);
        await onRefresh();
        refreshingRef.current = false;
        setRefreshing(false);
      }
      setPull(0);
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [onRefresh]);

  return { pull, refreshing };
}
