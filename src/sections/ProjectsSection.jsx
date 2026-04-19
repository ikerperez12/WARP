import { useEffect, useMemo, useState } from "react";
import { useI18n } from "../i18n/I18nProvider.jsx";
import SectionFrame from "../components/SectionFrame.jsx";
import Magnetic from "../visuals/Magnetic.jsx";
import "./ProjectsSection.css";

export default function ProjectsSection() {
  const { t } = useI18n();
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/projects.json")
      .then((r) => r.json())
      .then((data) => {
        if (!active) return;
        setProjects(Array.isArray(data) ? data : []);
        setLoaded(true);
      })
      .catch(() => {
        if (!active) return;
        setProjects([]);
        setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    if (filter === "all") return projects.filter((p) => p.featured !== false);
    return projects.filter((p) => Array.isArray(p.categories) && p.categories.includes(filter));
  }, [projects, filter]);

  return (
    <SectionFrame
      id="projects"
      kicker={t.sections.projectsTitle}
      title={t.sections.projectsTitle}
      subtitle={t.sections.projectsSubtitle}
      className="projects-section"
    >
      <div className="projects-filters" role="group" aria-label={t.projects.filterAria}>
        {t.projects.filters.map((label, i) => {
          const key = t.projects.filterKeys[i];
          return (
            <button
              key={key}
              type="button"
              className={`projects-filter ${filter === key ? "is-active" : ""}`}
              onClick={() => setFilter(key)}
              aria-pressed={filter === key}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="projects-grid">
        {!loaded && (
          <p className="projects-empty">...</p>
        )}
        {loaded && filtered.length === 0 && (
          <p className="projects-empty">No hay proyectos para este filtro.</p>
        )}
        {filtered.map((p) => (
          <Magnetic key={p.id} strength={0.1}>
            <article className="project-card">
              <div className="project-card-glow" aria-hidden="true" />
              <header className="project-card-head">
                <span className="project-card-year">{p.year}</span>
                <span className="project-card-status">{p.status}</span>
              </header>
              <h3 className="project-card-title">{p.name}</h3>
              <p className="project-card-role">{p.role}</p>
              <p className="project-card-summary">{p.summary}</p>
              {Array.isArray(p.highlights) && p.highlights.length > 0 && (
                <ul className="project-card-highlights">
                  {p.highlights.slice(0, 3).map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              )}
              {Array.isArray(p.stack) && (
                <div className="project-card-stack">
                  {p.stack.map((tech) => (
                    <span key={tech} className="project-card-tech">{tech}</span>
                  ))}
                </div>
              )}
              <footer className="project-card-footer">
                {p.githubUrl && (
                  <a
                    href={p.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="project-card-link"
                  >
                    {t.projects.viewCode}
                    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                      <path d="M7 17L17 7M7 7h10v10" stroke="currentColor" strokeWidth="2" fill="none" />
                    </svg>
                  </a>
                )}
                {p.demoUrl && (
                  <a
                    href={p.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="project-card-link project-card-link-demo"
                  >
                    {t.projects.viewDemo}
                  </a>
                )}
              </footer>
            </article>
          </Magnetic>
        ))}
      </div>
    </SectionFrame>
  );
}
