import { lazy, Suspense } from "react";
import TopNav from "./components/TopNav.jsx";
import ScrollProgress from "./components/ScrollProgress.jsx";
import BackToTop from "./components/BackToTop.jsx";
import SectionDots from "./components/SectionDots.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import SectionSkeleton from "./components/SectionSkeleton.jsx";
import HeroSection from "./sections/HeroSection.jsx";
import AmbientCursorTrails from "./visuals/AmbientCursorTrails.jsx";
import GlobalNoise from "./visuals/GlobalNoise.jsx";
import VideoCurtain from "./visuals/VideoCurtain.jsx";
import ScannerBanner from "./visuals/ScannerBanner.jsx";
import SectionGutter from "./components/SectionGutter.jsx";
import KeyboardShortcuts from "./components/KeyboardShortcuts.jsx";
import { useScrollReveal } from "./lib/useScrollReveal.js";
import { useI18n } from "./i18n/I18nProvider.jsx";
import VisualsGatewaySection from "./sections/VisualsGatewaySection.jsx";
import "./Shell.css";

const PhysicsScene = lazy(() => import("./visuals/PhysicsScene.jsx"));
const AboutSection = lazy(() => import("./sections/AboutSection.jsx"));
const MetricsDashboard = lazy(() => import("./sections/MetricsDashboard.jsx"));
const ServicesSection = lazy(() => import("./sections/ServicesSection.jsx"));
const StackSection = lazy(() => import("./sections/StackSection.jsx"));
const TechRadar = lazy(() => import("./sections/TechRadar.jsx"));
const ProcessPipeline = lazy(() => import("./sections/ProcessPipeline.jsx"));
const CodeSpotlight = lazy(() => import("./sections/CodeSpotlight.jsx"));
const PrinciplesSection = lazy(() => import("./sections/PrinciplesSection.jsx"));
const NowSection = lazy(() => import("./sections/NowSection.jsx"));
const CaseStudy = lazy(() => import("./sections/CaseStudy.jsx"));
const AchievementsSection = lazy(() => import("./sections/AchievementsSection.jsx"));
const FAQSection = lazy(() => import("./sections/FAQSection.jsx"));
const ResumeCTA = lazy(() => import("./sections/ResumeCTA.jsx"));
const ProjectsSection = lazy(() => import("./sections/ProjectsSection.jsx"));
const ExperienceSection = lazy(() => import("./sections/ExperienceSection.jsx"));
const ContactSection = lazy(() => import("./sections/ContactSection.jsx"));
const FooterSection = lazy(() => import("./sections/FooterSection.jsx"));
const BlueprintStage = lazy(() => import("./visuals/BlueprintStage.jsx"));
const HorizontalShowcase = lazy(() => import("./visuals/HorizontalShowcase.jsx"));

export default function Shell() {
  const { lang } = useI18n();
  const c = COPY[lang];
  useScrollReveal();

  return (
    <>
      <ErrorBoundary label="physics-bg">
        <Suspense fallback={null}>
          <PhysicsScene />
        </Suspense>
      </ErrorBoundary>

      <GlobalNoise />
      <AmbientCursorTrails />
      <ScrollProgress />
      <TopNav />
      <SectionDots />
      <KeyboardShortcuts />

      <main id="main" className="main-shell">
        <ErrorBoundary label="hero">
          <div className="interactive">
            <HeroSection />
          </div>
        </ErrorBoundary>

        <ErrorBoundary label="vt-1">
          <div className="interactive">
            <VideoCurtain
              id="vt-creative"
              src="/assets/videos/creative-vision-1080p.mp4"
              kicker={c.vt1.kicker}
              title={c.vt1.title}
              subtitle={c.vt1.subtitle}
              lines={c.vt1.lines}
              pinLength="+=300%"
            />
          </div>
        </ErrorBoundary>

        <SectionGutter size="md" />

        <ErrorBoundary label="about">
          <div className="interactive cv-lazy">
            <Suspense fallback={<SectionSkeleton />}>
              <AboutSection />
            </Suspense>
          </div>
        </ErrorBoundary>

        <SectionGutter size="sm" />

        <ErrorBoundary label="metrics">
          <div className="interactive cv-lazy">
            <Suspense fallback={<SectionSkeleton />}>
              <MetricsDashboard />
            </Suspense>
          </div>
        </ErrorBoundary>

        <SectionGutter size="sm" />

        <ErrorBoundary label="services">
          <div id="services" className="interactive cv-lazy">
            <Suspense fallback={<SectionSkeleton />}>
              <ServicesSection />
            </Suspense>
          </div>
        </ErrorBoundary>

        <ScannerBanner
          items={
            lang === "en"
              ? ["BACKEND", "SYSTEMS", "SECURITY", "AUTOMATION", "TOOLING", "LINUX", "DOCKER", "APIs"]
              : ["BACKEND", "SISTEMAS", "SEGURIDAD", "AUTOMATIZACION", "TOOLING", "LINUX", "DOCKER", "APIs"]
          }
        />

        <SectionGutter size="sm" />

        <ErrorBoundary label="stack">
          <div className="interactive cv-lazy">
            <Suspense fallback={<SectionSkeleton />}>
              <StackSection />
            </Suspense>
          </div>
        </ErrorBoundary>

        <SectionGutter size="md" />

        <ErrorBoundary label="tech-radar">
          <div className="interactive cv-lazy">
            <Suspense fallback={<SectionSkeleton />}>
              <TechRadar />
            </Suspense>
          </div>
        </ErrorBoundary>

        <SectionGutter size="md" />

        <ErrorBoundary label="horizontal-showcase">
          <div className="interactive">
            <Suspense fallback={<SectionSkeleton />}>
              <HorizontalShowcase />
            </Suspense>
          </div>
        </ErrorBoundary>

        <SectionGutter size="md" />

        <ErrorBoundary label="process">
          <div className="interactive cv-lazy">
            <Suspense fallback={<SectionSkeleton />}>
              <ProcessPipeline />
            </Suspense>
          </div>
        </ErrorBoundary>

        <SectionGutter size="sm" />

        <ErrorBoundary label="principles">
          <div className="interactive cv-lazy">
            <Suspense fallback={<SectionSkeleton />}>
              <PrinciplesSection />
            </Suspense>
          </div>
        </ErrorBoundary>

        <SectionGutter size="sm" />

        <ErrorBoundary label="now">
          <div className="interactive cv-lazy">
            <Suspense fallback={<SectionSkeleton />}>
              <NowSection />
            </Suspense>
          </div>
        </ErrorBoundary>

        <SectionGutter size="md" />

        <ErrorBoundary label="blueprint">
          <Suspense fallback={<SectionSkeleton />}>
            <BlueprintStage
              title={c.blueprint.title}
              subtitle={c.blueprint.subtitle}
              lines={c.blueprint.lines}
            />
          </Suspense>
        </ErrorBoundary>

        <SectionGutter size="sm" />

        <ErrorBoundary label="code">
          <div className="interactive cv-lazy">
            <Suspense fallback={<SectionSkeleton />}>
              <CodeSpotlight />
            </Suspense>
          </div>
        </ErrorBoundary>

        <SectionGutter size="md" />

        <ErrorBoundary label="visuals-bridge">
          <div className="interactive cv-lazy">
            <VisualsGatewaySection />
          </div>
        </ErrorBoundary>

        <SectionGutter size="md" />

        <ErrorBoundary label="projects">
          <div className="interactive cv-lazy">
            <Suspense fallback={<SectionSkeleton />}>
              <ProjectsSection />
            </Suspense>
          </div>
        </ErrorBoundary>

        <ErrorBoundary label="case-study">
          <div className="interactive cv-lazy">
            <Suspense fallback={<SectionSkeleton />}>
              <CaseStudy />
            </Suspense>
          </div>
        </ErrorBoundary>

        <SectionGutter size="md" />

        <ErrorBoundary label="vt-2">
          <div className="interactive">
            <VideoCurtain
              id="vt-mastery"
              src="/assets/videos/digital-mastery-1080p.mp4"
              kicker={c.vt2.kicker}
              title={c.vt2.title}
              subtitle={c.vt2.subtitle}
              lines={c.vt2.lines}
              pinLength="+=320%"
            />
          </div>
        </ErrorBoundary>

        <SectionGutter size="md" />

        <ErrorBoundary label="experience">
          <div className="interactive cv-lazy">
            <Suspense fallback={<SectionSkeleton />}>
              <ExperienceSection />
            </Suspense>
          </div>
        </ErrorBoundary>

        <ErrorBoundary label="achievements">
          <div className="interactive cv-lazy">
            <Suspense fallback={<SectionSkeleton />}>
              <AchievementsSection />
            </Suspense>
          </div>
        </ErrorBoundary>

        <ErrorBoundary label="faq">
          <div className="interactive cv-lazy">
            <Suspense fallback={<SectionSkeleton />}>
              <FAQSection />
            </Suspense>
          </div>
        </ErrorBoundary>

        <ErrorBoundary label="resume-cta">
          <div className="interactive cv-lazy">
            <Suspense fallback={<SectionSkeleton />}>
              <ResumeCTA />
            </Suspense>
          </div>
        </ErrorBoundary>

        <ErrorBoundary label="contact">
          <div className="interactive cv-lazy">
            <Suspense fallback={<SectionSkeleton />}>
              <ContactSection />
            </Suspense>
          </div>
        </ErrorBoundary>
      </main>

      <ErrorBoundary label="footer">
        <div className="interactive">
          <Suspense fallback={null}>
            <FooterSection />
          </Suspense>
        </div>
      </ErrorBoundary>

      <BackToTop />
    </>
  );
}

const COPY = {
  es: {
    vt1: {
      kicker: "Perfil técnico",
      title: "Iker Pérez · Ingeniero junior.",
      subtitle:
        "Grado en Ingeniería Informática (UDC) con intercambio SICUE en ETSISI-UPM. Busco prácticas y primer puesto junior en backend, sistemas o seguridad aplicada. A Coruña · Remoto · Híbrido.",
      lines: [
        "Java · Python · PostgreSQL · Docker · Linux",
        "APIs REST mantenibles con contratos claros",
        "Seguridad aplicada · PQC · Análisis de tráfico",
      ],
    },
    alloy: {
      title: "DISPONIBLE",
      subtitle: "Prácticas · Junior · Backend / Sistemas / Seguridad · A Coruña / Remoto",
    },
    vt2: {
      kicker: "Cuatro repositorios · Cuatro disciplinas",
      title: "Proyectos propios con lectura técnica.",
      subtitle:
        "Selección corta de GitHub: servicios distribuidos con Docker, auditoría de criptografía postcuántica, CLI de automatización con LLMs y programación de sistemas sobre POSIX.",
      lines: [
        "ISD · Java + PostgreSQL + Docker (backend distribuido)",
        "Auditoría PQC · Python + Wireshark (seguridad aplicada)",
        "GPT CMD · CLI Python + LLM Ops (automatización)",
        "SO-SHELL · C + POSIX (programación de sistemas)",
      ],
    },
    blueprint: {
      title: "Formación sólida, aplicada.",
      subtitle:
        "Cuatro años dentro del Grado en Ingeniería Informática de la UDC cubriendo algoritmos, sistemas operativos, redes, bases de datos, inteligencia artificial y sistemas distribuidos. Un curso de intercambio SICUE en ETSISI-UPM ampliando visión de sistemas de información empresariales.",
      lines: [
        { label: "Grado", value: "Ing. Informática · UDC" },
        { label: "Intercambio", value: "SICUE · ETSISI-UPM" },
        { label: "Foco", value: "Backend · Sistemas · Seguridad" },
        { label: "Idiomas", value: "ES / GL nativo · EN B2" },
        { label: "Ubicación", value: "A Coruña / Galicia" },
        { label: "Disponibilidad", value: "Prácticas / Junior" },
      ],
    },
    frutiger: {
      kicker: "Listo para incorporarme",
      title: "Contactar.",
      subtitle:
        "Abierto a prácticas curriculares, extracurriculares y puesto junior. Respuesta por email o LinkedIn en menos de 24 h. iker.perez@udc.es · linkedin.com/in/ikerperez",
    },
  },
  en: {
    vt1: {
      kicker: "Technical profile",
      title: "Iker Pérez · Junior engineer.",
      subtitle:
        "Computer Engineering degree (UDC) with SICUE exchange at ETSISI-UPM. Looking for internships and first junior role in backend, systems or applied security. A Coruña · Remote · Hybrid.",
      lines: [
        "Java · Python · PostgreSQL · Docker · Linux",
        "Maintainable REST APIs with clear contracts",
        "Applied security · PQC · Traffic analysis",
      ],
    },
    alloy: {
      title: "AVAILABLE",
      subtitle: "Internship · Junior · Backend / Systems / Security · A Coruña / Remote",
    },
    vt2: {
      kicker: "Four repositories · Four disciplines",
      title: "Personal projects with technical reading.",
      subtitle:
        "Short GitHub selection: distributed services with Docker, post-quantum cryptography audit, automation CLI with LLMs, and systems programming on POSIX.",
      lines: [
        "ISD · Java + PostgreSQL + Docker (distributed backend)",
        "PQC Audit · Python + Wireshark (applied security)",
        "GPT CMD · Python CLI + LLM Ops (automation)",
        "SO-SHELL · C + POSIX (systems programming)",
      ],
    },
    blueprint: {
      title: "Solid foundation, applied.",
      subtitle:
        "Four years inside UDC's Computer Engineering degree covering algorithms, operating systems, networking, databases, AI and distributed systems. A SICUE exchange year at ETSISI-UPM broadening the view of enterprise information systems.",
      lines: [
        { label: "Degree", value: "Computer Engineering · UDC" },
        { label: "Exchange", value: "SICUE · ETSISI-UPM" },
        { label: "Focus", value: "Backend · Systems · Security" },
        { label: "Languages", value: "ES / GL native · EN B2" },
        { label: "Location", value: "A Coruña / Galicia" },
        { label: "Availability", value: "Internship / Junior" },
      ],
    },
    frutiger: {
      kicker: "Ready to join",
      title: "Get in touch.",
      subtitle:
        "Open to curricular and extracurricular internships and a first junior role. Reply within 24 h via email or LinkedIn. iker.perez@udc.es · linkedin.com/in/ikerperez",
    },
  },
};
