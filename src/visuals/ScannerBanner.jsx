import "./ScannerBanner.css";

export default function ScannerBanner({ label = "STACK SCAN", items = [] }) {
  const loop = items.length ? items : ["BACKEND", "SYSTEMS", "SECURITY", "AUTOMATION", "TOOLING"];
  return (
    <section className="scanner-banner" aria-label={label}>
      <div className="scanner-banner-line" aria-hidden="true" />
      <div className="scanner-banner-stripe">
        <div className="scanner-banner-track">
          {[...loop, ...loop, ...loop].map((item, i) => (
            <span key={i} className="scanner-banner-item">
              <span className="scanner-banner-dot" aria-hidden="true" />
              {item}
            </span>
          ))}
        </div>
      </div>
      <div className="scanner-banner-line" aria-hidden="true" />
    </section>
  );
}
