import { useEffect, useRef, useState } from "react";

export default function InViewMonitor({ children, rootMargin = "40% 0px 40% 0px", once = false }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
        if (once && entry.isIntersecting) io.disconnect();
      },
      { rootMargin, threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin, once]);

  return (
    <div ref={ref} style={{ width: "100%" }}>
      {visible ? children : <div style={{ minHeight: "50vh" }} />}
    </div>
  );
}
