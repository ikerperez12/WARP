export default function SectionSkeleton() {
  return (
    <section
      aria-busy="true"
      style={{
        minHeight: "60vh",
        display: "grid",
        placeItems: "center",
        padding: "6rem 2rem",
        color: "var(--text-muted)",
        fontFamily: "var(--font-mono)",
        fontSize: "0.8rem",
        letterSpacing: "0.2em",
      }}
    >
      <span style={{ opacity: 0.4 }}>LOADING…</span>
    </section>
  );
}
