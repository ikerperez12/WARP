const SIZES = {
  xs: "2vh",
  sm: "30vh",
  md: "45vh",
  lg: "60vh",
};

export default function SectionGutter({ size = "sm" }) {
  return (
    <div
      aria-hidden="true"
      style={{
        width: "100%",
        height: SIZES[size] || SIZES.sm,
        pointerEvents: "none",
      }}
    />
  );
}
