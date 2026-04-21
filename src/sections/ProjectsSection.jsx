import { useEffect, useMemo, useState } from "react";
import { useI18n } from "../i18n/I18nProvider.jsx";
import SectionFrame from "../components/SectionFrame.jsx";
import Magnetic from "../visuals/Magnetic.jsx";
import "./ProjectsSection.css";

// GitHub-style language colors (subset; fallback to gray)
const LANGUAGE_COLORS = {
  Java: "#b07219",
  Python: "#3572a5",
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  C: "#555555",
  "C++": "#f34b7d",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Go: "#00add8",
  Rust: "#dea584",
  Shell: "#89e051",
};

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

  const counts = useMemo(() => {
    const c = { all: 0, backend: 0, security: 0, automation: 0, systems: 0 };
    projects.forEach((p) => {
      if (p.featured === false) return;
      c.all += 1;
      (p.categories || []).forEach((k) => {
        if (c[k] !== undefined) c[k] += 1;
      });
    });
    return c;
  }, [projects]);

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
          const count = counts[key] ?? 0;
          return (
            <button
              key={key}
              type="button"
              className={`projects-filter ${filter === key ? "is-active" : ""}`}
              onClick={() => setFilter(key)}
              aria-pressed={filter === key}
            >
              <span className="projects-filter-label">{label}</span>
              <span className="projects-filter-count">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="projects-grid">
        {!loaded && <p className="projects-empty">...</p>}
        {loaded && filtered.length === 0 && (
          <p className="projects-empty">No hay proyectos para este filtro.</p>
        )}
        {filtered.map((p) => {
          const langColor = LANGUAGE_COLORS[p.language] || "#8b8b9a";
          return (
            <Magnetic key={p.id} strength={0.08}>
              <article className="project-card">
                <div className="project-card-glow" aria-hidden="true" />
                <div className="project-card-shine" aria-hidden="true" />

                <header className="project-card-head">
                  <div className="project-card-head-left">
                    <span className="project-card-repo" title={p.repoName}>
                      <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" fill="currentColor">
                        <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z" />
                      </svg>
                      {p.repoName}
                    </span>
                    <span className="project-card-status">{p.status}</span>
                  </div>
                  <span className="project-card-year">{p.year}</span>
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
                  {p.language && (
                    <span className="project-card-lang" title={p.language}>
                      <span
                        className="project-card-lang-dot"
                        style={{ background: langColor }}
                        aria-hidden="true"
                      />
                      {p.language}
                    </span>
                  )}

                  <div className="project-card-links">
                    {p.githubUrl && (
                      <a
                        href={p.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="project-card-link"
                        aria-label={`${t.projects.viewCode}: ${p.name}`}
                      >
                        <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="currentColor">
                          <path d="M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 0 0 7.86 10.92c.57.1.78-.25.78-.55 0-.27-.01-1.15-.02-2.08-3.2.7-3.88-1.37-3.88-1.37-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.76 2.68 1.25 3.33.95.1-.74.4-1.25.72-1.54-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.18-3.08-.12-.3-.51-1.47.1-3.06 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.62 1.59.23 2.76.11 3.06.74.8 1.18 1.82 1.18 3.08 0 4.41-2.69 5.38-5.25 5.67.41.35.78 1.06.78 2.13 0 1.54-.01 2.78-.01 3.16 0 .3.21.66.79.55A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
                        </svg>
                        <span>{t.projects.viewCode}</span>
                      </a>
                    )}
                    {p.demoUrl && (
                      <a
                        href={p.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="project-card-link project-card-link-demo"
                        aria-label={`${t.projects.viewDemo}: ${p.name}`}
                      >
                        <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                          <path d="M5 12h12m0 0l-4-4m4 4l-4 4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span>{t.projects.viewDemo}</span>
                      </a>
                    )}
                  </div>
                </footer>
              </article>
            </Magnetic>
          );
        })}
      </div>

      <div className="projects-footer-note">
        <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="currentColor">
          <path d="M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 0 0 7.86 10.92c.57.1.78-.25.78-.55 0-.27-.01-1.15-.02-2.08-3.2.7-3.88-1.37-3.88-1.37-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.76 2.68 1.25 3.33.95.1-.74.4-1.25.72-1.54-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.18-3.08-.12-.3-.51-1.47.1-3.06 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.62 1.59.23 2.76.11 3.06.74.8 1.18 1.82 1.18 3.08 0 4.41-2.69 5.38-5.25 5.67.41.35.78 1.06.78 2.13 0 1.54-.01 2.78-.01 3.16 0 .3.21.66.79.55A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
        </svg>
        <a href="https://github.com/ikerperez12" target="_blank" rel="noopener noreferrer">
          github.com/ikerperez12
        </a>
        <span className="projects-footer-sep">·</span>
        <span>{filtered.length} / {counts.all}</span>
      </div>
    </SectionFrame>
  );
}
