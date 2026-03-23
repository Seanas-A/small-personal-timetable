export function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div style={{
      position: "fixed", top: 12, left: "50%", transform: "translateX(-50%)", zIndex: 99,
      background: toast.type === "err" ? "#fef2f2" : "#f0fdf4",
      border: `1px solid ${toast.type === "err" ? "#fca5a5" : "#86efac"}`,
      color: toast.type === "err" ? "#991b1b" : "#166534",
      padding: "7px 16px", borderRadius: 9, fontSize: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    }}>
      {toast.text}
    </div>
  );
}
