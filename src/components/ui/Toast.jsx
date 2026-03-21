import { useEffect, useState, useCallback, useRef } from "react";

let toastId = 0;

export function showToast(type, text) {
  window.dispatchEvent(new CustomEvent("toast", { detail: { type, text } }));
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    setToasts((t) => t.map((x) => (x.id === id ? { ...x, leaving: true } : x)));
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 300);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      const { type, text } = e.detail;
      const id = ++toastId;
      setToasts((t) => [...t, { id, type, text, leaving: false }]);
      timers.current[id] = setTimeout(() => dismiss(id), 4000);
    };
    window.addEventListener("toast", handler);
    return () => {
      window.removeEventListener("toast", handler);
      Object.values(timers.current).forEach(clearTimeout);
    };
  }, [dismiss]);

  if (!toasts.length) return null;

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast toast-${t.type}${t.leaving ? " toast-leave" : ""}`}
          onClick={() => dismiss(t.id)}
        >
          {t.type === "success" && <i className="fa-solid fa-check" />}
          {t.type === "error" && <i className="fa-solid fa-circle-exclamation" />}
          {t.text}
        </div>
      ))}
    </div>
  );
}
