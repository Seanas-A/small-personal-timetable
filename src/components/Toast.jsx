export function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className={`toast ${toast.type === "err" ? "toast--err" : "toast--ok"}`}>
      {toast.text}
    </div>
  );
}
