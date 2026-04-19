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
import DatamoshTransition from "./visuals/DatamoshTransition.jsx";
import TerminalManifest from "./visuals/TerminalManifest.jsx";
import InViewMonitor from "./visuals/InViewMonitor.jsx";
import { useI18n } from "./i18n/I18nProvider.jsx";
import "./Shell.css";

const PhysicsScene = lazy(() => import("./visuals/PhysicsScene.jsx"));
const AboutSection = lazy(() => import("./sections/AboutSection.jsx"));
const ServicesSection = lazy(() => import("./sections/ServicesSection.jsx"));
const StackSection = lazy(() => import("./sections/StackSection.jsx"));
const ProjectsSection = lazy(() => import("./sections/ProjectsSection.jsx"));
const ExperienceSection = lazy(() => import("./sections/ExperienceSection.jsx"));
const ContactSection = lazy(() => import("./sections/ContactSection.jsx"));
const FooterSection = lazy(() => import("./sections/FooterSection.jsx"));
const LiquidMetalTransition = lazy(() => import("./visuals/LiquidMetalTransition.jsx"));
const MorphParticlesTransition = lazy(() => import("./visuals/MorphParticlesTransition.jsx"));
const FrutigerAeroStage = lazy(() => import("./visuals/FrutigerAeroStage.jsx"));
const BlueprintStage = lazy(() => import("./visuals/BlueprintStage.jsx"));
const ParticleGalaxyStage = lazy(() => import("./visuals/ParticleGalaxyStage.jsx"));
const HorizontalShowcase = lazy(() => import("./visuals/HorizontalShowcase.jsx"));

export default function Shell() {
  const { lang } = useI18n();
  const vtCopy = VT_COPY[lang];

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
              kicker={vtCopy.creative.kicker}
              title={vtCopy.creative.title}
              subtitle={vtCopy.creative.subtitle}
              lines={vtCopy.creative.lines}
              align="center"
            />
          </div>
        </ErrorBoundary>

        <ErrorBoundary label="about">
          <div className="interactive">
            <Suspense fallback={<SectionSkeleton />}>
              <AboutSection />
            </Suspense>
          </div>
        </ErrorBoundary>

        <ErrorBoundary label="services">
          <div id="services" className="interactive">
            <Suspense fallback={<SectionSkeleton />}>
              <ServicesSection />
            </Suspense>
          </div>
        </ErrorBoundary>

        <ScannerBanner
          label="SCAN"
          items={
            lang === "en"
              ? ["BACKEND", "SYSTEMS", "SECURITY", "AUTOMATION", "TOOLING", "LINUX", "DOCKER", "APIs"]
              : ["BACKEND", "SISTEMAS", "SEGURIDAD", "AUTOMATIZACION", "TOOLING", "LINUX", "DOCKER", "APIs"]
          }
        />

        <ErrorBoundary label="stack">
          <div className="interactive">
            <Suspense fallback={<SectionSkeleton />}>
              <StackSection />
            </Suspense>
          </div>
        </ErrorBoundary>

        <ErrorBoundary label="horizontal-showcase">
          <div className="interactive">
            <Suspense fallback={<SectionSkeleton />}>
              <HorizontalShowcase />
            </Suspense>
          </div>
        </ErrorBoundary>

        <ErrorBoundary label="blueprint">
          <InViewMonitor rootMargin="25% 0px 25% 0px">
            <Suspense fallback={<SectionSkeleton />}>
              <BlueprintStage
                title={lang === "en" ? "System blueprint — ready to ship" : "Blueprint de sistema — listo para enviar"}
                subtitle={
                  lang === "en"
                    ? "Academic foundation (UDC + SICUE-UPM) translated into software that others can maintain. Each discipline treated as a module, wired by clean interfaces."
                    : "Base académica (UDC + SICUE-UPM) traducida en software que otros pueden mantener. Cada disciplina tratada como un módulo, conectado por interfaces limpias."
                }
                lines={
                  lang === "en"
                    ? [
                        { label: "Degree", value: "Computer Engineering · UDC" },
                        { label: "Exchange", value: "SICUE at ETSISI-UPM" },
                        { label: "Focus", value: "Backend · Systems · Security" },
                        { label: "Lang", value: "ES / GL native · EN B2" },
                        { label: "Location", value: "A Coruña / Galicia" },
                        { label: "Looking", value: "Internship / Junior role" },
                      ]
                    : [
                        { label: "Grado", value: "Ing. Informática · UDC" },
                        { label: "Intercambio", value: "SICUE en ETSISI-UPM" },
                        { label: "Foco", value: "Backend · Sistemas · Seguridad" },
                        { label: "Idiomas", value: "ES / GL nativo · EN B2" },
                        { label: "Ubicación", value: "A Coruña / Galicia" },
                        { label: "Busco", value: "Prácticas / Puesto junior" },
                      ]
                }
              />
            </Suspense>
          </InViewMonitor>
        </ErrorBoundary>

        <ErrorBoundary label="terminal">
          <div id="terminal" className="interactive">
            <TerminalManifest />
          </div>
        </ErrorBoundary>

        <ErrorBoundary label="liquid-metal">
          <InViewMonitor rootMargin="25% 0px 25% 0px">
            <Suspense fallback={<SectionSkeleton />}>
              <LiquidMetalTransition
                title={vtCopy.alloy.title}
                subtitle={vtCopy.alloy.subtitle}
              />
            </Suspense>
          </InViewMonitor>
        </ErrorBoundary>

        <ErrorBoundary label="projects">
          <div className="interactive">
            <Suspense fallback={<SectionSkeleton />}>
              <ProjectsSection />
            </Suspense>
          </div>
        </ErrorBoundary>

        <ErrorBoundary label="vt-2">
          <div className="interactive">
            <VideoCurtain
              id="vt-mastery"
              src="/assets/videos/digital-mastery-1080p.mp4"
              kicker={vtCopy.mastery.kicker}
              title={vtCopy.mastery.title}
              subtitle={vtCopy.mastery.subtitle}
              lines={vtCopy.mastery.lines}
              align="center"
            />
          </div>
        </ErrorBoundary>

        <DatamoshTransition title={vtCopy.mosh.title} subtitle={vtCopy.mosh.subtitle} />

        <ErrorBoundary label="experience">
          <div className="interactive">
            <Suspense fallback={<SectionSkeleton />}>
              <ExperienceSection />
            </Suspense>
          </div>
        </ErrorBoundary>

        <ErrorBoundary label="galaxy">
          <InViewMonitor rootMargin="20% 0px 20% 0px">
            <Suspense fallback={<SectionSkeleton />}>
              <ParticleGalaxyStage
                kicker={lang === "en" ? "From fundamentals to production" : "De los fundamentos a producción"}
                title={lang === "en" ? "Every node is a tool." : "Cada nodo es una herramienta."}
                subtitle={
                  lang === "en"
                    ? "Distributed systems, databases, cryptography, networks, compilers — each one a branch of the same galaxy."
                    : "Sistemas distribuidos, bases de datos, criptografía, redes, compiladores — cada uno una rama de la misma galaxia."
                }
              />
            </Suspense>
          </InViewMonitor>
        </ErrorBoundary>

        <ErrorBoundary label="morph">
          <InViewMonitor rootMargin="25% 0px 25% 0px">
            <div id="morph" className="interactive">
              <Suspense fallback={<SectionSkeleton />}>
                <MorphParticlesTransition
                  title={vtCopy.morph.title}
                  subtitle={vtCopy.morph.subtitle}
                  lines={vtCopy.morph.lines}
                />
              </Suspense>
            </div>
          </InViewMonitor>
        </ErrorBoundary>

        <ErrorBoundary label="frutiger">
          <InViewMonitor rootMargin="25% 0px 25% 0px">
            <Suspense fallback={<SectionSkeleton />}>
              <FrutigerAeroStage
                kicker={lang === "en" ? "Clean surfaces" : "Superficies limpias"}
                title={lang === "en" ? "Engineering with craft." : "Ingeniería con oficio."}
                subtitle={
                  lang === "en"
                    ? "I write code like I would build something physical — deliberate, clean, with room to grow. Less noise, more signal."
                    : "Escribo código como construiría algo físico — deliberado, limpio, con sitio para crecer. Menos ruido, más señal."
                }
              />
            </Suspense>
          </InViewMonitor>
        </ErrorBoundary>

        <ErrorBoundary label="contact">
          <div className="interactive">
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

const VT_COPY = {
  es: {
    creative: {
      kicker: "Creative Vision",
      title: "Código con criterio visual.",
      subtitle:
        "Backend sólido, operación limpia y tooling propio — hecho para durar, no para impresionar por diez minutos.",
      lines: [
        "APIs mantenibles, contratos estables",
        "Linux, Docker, despliegues reproducibles",
        "Seguridad aplicada, lectura técnica del riesgo",
      ],
    },
    alloy: {
      title: "LIQUID ALLOY",
      subtitle: "Cromado fluido · Backend reflejado en material vivo",
    },
    mastery: {
      kicker: "Digital Mastery",
      title: "Rigor técnico. Estética moderna.",
      subtitle:
        "Cada proyecto es una iteración sobre el anterior — arquitectura, seguridad, automatización y tooling aplicado.",
      lines: [
        "Servicios desacoplados y testables",
        "Automatización de flujos de trabajo",
        "Validación y hardening como parte del diseño",
      ],
    },
    mosh: {
      title: "DATAMOSH",
      subtitle: "Transición temporal · ruido controlado · entropía",
    },
    morph: {
      title: "METAMORFO",
      subtitle: "Adaptabilidad técnica",
      lines: [
        "Backend que se reescribe cuando toca",
        "Sistemas que muerden el hardware",
        "Interfaces que cambian de forma sin romperse",
      ],
    },
  },
  en: {
    creative: {
      kicker: "Creative Vision",
      title: "Engineering with visual judgement.",
      subtitle:
        "Solid backend, clean operations and internal tooling — built to last, not just to impress for ten minutes.",
      lines: [
        "Maintainable APIs, stable contracts",
        "Linux, Docker, reproducible deployments",
        "Applied security, technical risk reading",
      ],
    },
    alloy: {
      title: "LIQUID ALLOY",
      subtitle: "Fluid chrome · Backend reflected in living material",
    },
    mastery: {
      kicker: "Digital Mastery",
      title: "Technical rigor. Modern aesthetics.",
      subtitle:
        "Every project iterates on the last — architecture, security, automation and applied tooling.",
      lines: [
        "Decoupled, testable services",
        "Workflow automation",
        "Validation and hardening as part of the design",
      ],
    },
    mosh: {
      title: "DATAMOSH",
      subtitle: "Temporal transition · controlled noise · entropy",
    },
    morph: {
      title: "METAMORPH",
      subtitle: "Technical adaptability",
      lines: [
        "Backend that rewrites itself when it should",
        "Systems that bite into hardware",
        "Interfaces that shape-shift without breaking",
      ],
    },
  },
};
