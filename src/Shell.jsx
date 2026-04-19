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
const StackSection = lazy(() => import("./sections/StackSection.jsx"));
const ProjectsSection = lazy(() => import("./sections/ProjectsSection.jsx"));
const ExperienceSection = lazy(() => import("./sections/ExperienceSection.jsx"));
const ContactSection = lazy(() => import("./sections/ContactSection.jsx"));
const FooterSection = lazy(() => import("./sections/FooterSection.jsx"));
const LiquidMetalTransition = lazy(() => import("./visuals/LiquidMetalTransition.jsx"));
const MorphParticlesTransition = lazy(() => import("./visuals/MorphParticlesTransition.jsx"));
const HolographicStage = lazy(() => import("./visuals/HolographicStage.jsx"));

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
              align="left"
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
              align="right"
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

        <ErrorBoundary label="vt-3">
          <div className="interactive">
            <VideoCurtain
              id="vt-contact"
              src="/assets/videos/creative-vision-1080p.mp4"
              kicker={vtCopy.uplink.kicker}
              title={vtCopy.uplink.title}
              subtitle={vtCopy.uplink.subtitle}
              align="center"
              overlayOpacity={0.72}
            />
          </div>
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
      title: "Codigo con criterio visual.",
      subtitle: "Backend solido, operacion limpia y tooling propio — hecho para durar, no para impresionar por diez minutos.",
      lines: [
        "APIs mantenibles, contratos estables",
        "Linux, Docker, despliegues reproducibles",
        "Seguridad aplicada, lectura tecnica del riesgo",
      ],
    },
    alloy: {
      title: "LIQUID ALLOY",
      subtitle: "Cromado fluido / Backend reflejado en material vivo",
    },
    mastery: {
      kicker: "Digital Mastery",
      title: "Rigor tecnico. Estetica moderna.",
      subtitle: "Cada proyecto es una iteracion sobre el anterior — arquitectura, seguridad, automatizacion y tooling aplicado.",
      lines: [
        "Servicios desacoplados y testables",
        "Automatizacion de flujos de trabajo",
        "Validacion y hardening como parte del diseno",
      ],
    },
    mosh: {
      title: "DATAMOSH",
      subtitle: "Transicion temporal / ruido controlado / entropia",
    },
    morph: {
      title: "METAMORFO",
      subtitle: "Adaptabilidad tecnica",
      lines: [
        "Backend que se reescribe cuando toca",
        "Sistemas que muerden el hardware",
        "Interfaces que cambian de forma sin romperse",
      ],
    },
    uplink: {
      kicker: "Establishing Uplink",
      title: "Conectemos.",
      subtitle: "Abierto a practicas, colaboracion tecnica y equipos que valoren hacer las cosas bien desde el principio.",
    },
  },
  en: {
    creative: {
      kicker: "Creative Vision",
      title: "Engineering with visual judgement.",
      subtitle: "Solid backend, clean operations and internal tooling — built to last, not just to impress for ten minutes.",
      lines: [
        "Maintainable APIs, stable contracts",
        "Linux, Docker, reproducible deployments",
        "Applied security, technical risk reading",
      ],
    },
    alloy: {
      title: "LIQUID ALLOY",
      subtitle: "Fluid chrome / Backend reflected in living material",
    },
    mastery: {
      kicker: "Digital Mastery",
      title: "Technical rigor. Modern aesthetics.",
      subtitle: "Every project iterates on the last — architecture, security, automation and applied tooling.",
      lines: [
        "Decoupled, testable services",
        "Workflow automation",
        "Validation and hardening as part of the design",
      ],
    },
    mosh: {
      title: "DATAMOSH",
      subtitle: "Temporal transition / controlled noise / entropy",
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
    uplink: {
      kicker: "Establishing Uplink",
      title: "Let us connect.",
      subtitle: "Open to internships, technical collaboration, and teams that value doing things right from day one.",
    },
  },
};
