import { isMockEnabled } from "../infrastructure/mock/installMockApi";

/** Thin ribbon so testers know mock mode is active. Easy to remove with the mock folder. */
export default function MockBanner() {
  if (!isMockEnabled()) return null;

  return (
    <div
      role="status"
      style={{
        position: "fixed",
        bottom: 12,
        left: 12,
        zIndex: 9999,
        padding: "8px 14px",
        borderRadius: 999,
        background: "#2c2723",
        color: "#f7f4ef",
        fontSize: 12,
        fontWeight: 600,
        boxShadow: "0 8px 24px rgba(44,39,35,0.25)",
        pointerEvents: "none",
      }}
    >
      MOCK API · tắt bằng VITE_USE_MOCK=false
    </div>
  );
}
