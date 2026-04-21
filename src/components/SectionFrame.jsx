import "./SectionFrame.css";

export default function SectionFrame({ id, kicker, title, subtitle, children, className = "" }) {
  return (
    <section id={id} className={`section-frame ${className}`}>
      <div className="section-frame-inner">
        <header className="section-frame-header reveal">
          {kicker && <p className="section-frame-kicker">{kicker}</p>}
          <h2 className="section-frame-title">{title}</h2>
          {subtitle && <p className="section-frame-subtitle">{subtitle}</p>}
        </header>
        <div className="section-frame-body reveal reveal-delay-1">{children}</div>
      </div>
    </section>
  );
}
