import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const EXIT_MS = 300;

/**
 * Portal staff modal ra body + animation mở/đóng.
 * Dùng `open` — giữ mount trong lúc thoát để không bị “pop”.
 */
export default function StaffModalPortal({
  open,
  children,
  onClose,
  className = "",
  stopBackdropClose = false,
}) {
  const [mounted, setMounted] = useState(!!open);
  const [visible, setVisible] = useState(false);
  const cachedChildren = useRef(children);

  if (open) cachedChildren.current = children;

  useEffect(() => {
    if (open) {
      setMounted(true);
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
      return () => cancelAnimationFrame(id);
    }

    setVisible(false);
    const t = setTimeout(() => setMounted(false), EXIT_MS);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!mounted) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mounted]);

  useEffect(() => {
    if (!mounted || !visible) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mounted, visible, onClose]);

  if (typeof document === "undefined" || !mounted) return null;

  return createPortal(
    <div
      className={`staff-modal-backdrop ${visible ? "is-open" : "is-closing"} ${className}`.trim()}
      onClick={stopBackdropClose ? undefined : onClose}
      role="presentation"
    >
      {cachedChildren.current}
    </div>,
    document.body
  );
}
