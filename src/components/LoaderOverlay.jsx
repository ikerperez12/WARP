import "./LoaderOverlay.css";

export default function LoaderOverlay({ progress }) {
  const pct = typeof progress === "number" ? Math.round(progress) : null;
  return (
    <div className="loader-overlay" role="status" aria-live="polite">
      <div className="loader-brand">
        <span className="loader-bracket">{"<"}</span>
        <span className="loader-initials">IP</span>
        <span className="loader-bracket">{"/>"}</span>
      </div>
      <div className="loader-bar">
        <div
          className="loader-bar-fill"
          style={pct !== null ? { width: `${pct}%` } : undefined}
        />
      </div>
      {pct !== null && <span className="loader-pct">{pct}%</span>}
    </div>
  );
}
