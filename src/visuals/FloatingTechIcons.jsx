import { useMemo, useEffect, useRef, useState } from "react";
import "./FloatingTechIcons.css";

/**
 * FloatingTechIcons — CSS-only parallax swarm of 3D-rendered tech icons.
 * Sits behind the bubble transmission material so the glass spheres pick up
 * the icons as background context and refract them slightly.
 *
 * Icons are loaded from /assets/images/tech/ (26 PNG files from the
 * Proyecto_Estrellas_NuevosModelos reference bank).
 */
const ICONS = [
  "Docker_(Ballena)___Figura_202604102120.png",
  "Java___Taza_de_202604102120.png",
  "Python___Dos_serpientes_202604102120.png",
  "React___Símbolo_de_202604102121.png",
  "JavaScript___Cubo_3D_202604102121.png",
  "Linux___Figura_3D_202604102121.png",
  "GitHub_(Octocat)___Figura_202604102120.png",
  "GitLab___Logotipo_del_202604102120.png",
  "Postman___Figura_3D_202604102120.png",
  "Android___Figura_3D_202604102121.png",
  "Robot_Tierno_de_202604102119.png",
  "Pato_de_Goma_202604102121.png",
  "2._Google_Gemini_202604102125.png",
  "3._Microsoft_Copilot_202604102125.png",
  "4._Hugging_Face_202604102123.png",
  "Discord___Icono_3D_202604102120.png",
];

function seeded(i) {
  // Deterministic pseudo-random so re-renders don't re-shuffle positions
  const x = Math.sin(i * 128.331) * 10000;
  return x - Math.floor(x);
}

export default function FloatingTechIcons({ count = 12, depth = 0.35 }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "25% 0px 25% 0px" }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  const items = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      const icon = ICONS[i % ICONS.length];
      const x = seeded(i) * 92 + 4; // 4 – 96 %
      const y = seeded(i + 100) * 80 + 10; // 10 – 90 %
      const size = 60 + Math.round(seeded(i + 200) * 70); // 60 – 130px
      const rot = Math.round((seeded(i + 300) - 0.5) * 40); // -20 … +20 deg
      const delay = seeded(i + 400) * 8; // animation offset
      const duration = 12 + seeded(i + 500) * 10; // 12 – 22s
      const drift = seeded(i + 600) > 0.5 ? "drift-a" : "drift-b";
      arr.push({ icon, x, y, size, rot, delay, duration, drift, id: i });
    }
    return arr;
  }, [count]);

  return (
    <div className="tech-icons" ref={ref} aria-hidden="true" style={{ opacity: depth }}>
      {items.map((it) => (
        <img
          key={it.id}
          className={`tech-icon tech-icon-${it.drift}`}
          src={`/assets/images/tech/${it.icon}`}
          alt=""
          loading="lazy"
          decoding="async"
          style={{
            left: `${it.x}%`,
            top: `${it.y}%`,
            width: `${it.size}px`,
            transform: `rotate(${it.rot}deg)`,
            animationDelay: `-${it.delay}s`,
            animationDuration: `${it.duration}s`,
            animationPlayState: inView ? "running" : "paused",
          }}
        />
      ))}
    </div>
  );
}
