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
import InViewMonitor from "./visuals/InViewMonitor.jsx";
import SectionGutter from "./components/SectionGutter.jsx";
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
              pinLength={120}
            />
          </div>
        </ErrorBoundary>

        <SectionGutter />

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

        <SectionGutter size="lg" />

        <ErrorBoundary label="blueprint">
          <InViewMonitor rootMargin="20% 0px 20% 0px">
            <Suspense fallback={<SectionSkeleton />}>
              <BlueprintStage
                title={lang === "en" ? "Engineering background — UDC + SICUE-UPM" : "Formación — UDC + SICUE-UPM"}
                subtitle={
                  lang === "en"
                    ? "Four years inside a Computer Engineering degree covering algorithms, operating systems, networking, databases, AI and distributed systems. Plus a SICUE exchange at ETSISI-UPM to broaden the view of enterprise systems."
                    : "Cuatro años de Grado en Ingeniería Informática: algoritmos, sistemas operativos, redes, bases de datos, IA y sistemas distribuidos. Más un intercambio SICUE en ETSISI-UPM ampliando la visión de sistemas empresariales."
                }
                lines={
                  lang === "en"
                    ? [
                        { label: "Degree", value: "Computer Engineering · UDC" },
                        { label: "Exchange", value: "SICUE · ETSISI-UPM" },
                        { label: "Focus", value: "Backend · Systems · Security" },
                        { label: "Languages", value: "ES / GL native · EN B2" },
                        { label: "Location", value: "A Coruña / Galicia" },
                        { label: "Availability", value: "Internship / Junior role" },
                      ]
                    : [
                        { label: "Grado", value: "Ing. Informática · UDC" },
                        { label: "Intercambio", value: "SICUE · ETSISI-UPM" },
                        { label: "Foco", value: "Backend · Sistemas · Seguridad" },
                        { label: "Idiomas", value: "ES / GL nativo · EN B2" },
                        { label: "Ubicación", value: "A Coruña / Galicia" },
                        { label: "Disponibilidad", value: "Prácticas / Junior" },
                      ]
                }
              />
            </Suspense>
          </InViewMonitor>
        </ErrorBoundary>

        <SectionGutter />

        <ErrorBoundary label="liquid-metal">
          <InViewMonitor rootMargin="20% 0px 20% 0px">
            <Suspense fallback={<SectionSkeleton />}>
              <LiquidMetalTransition
                title={vtCopy.alloy.title}
                subtitle={vtCopy.alloy.subtitle}
              />
            </Suspense>
          </InViewMonitor>
        </ErrorBoundary>

        <SectionGutter />

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
              pinLength={180}
            />
          </div>
        </ErrorBoundary>

        <SectionGutter />

        <ErrorBoundary label="experience">
          <div className="interactive">
            <Suspense fallback={<SectionSkeleton />}>
              <ExperienceSection />
            </Suspense>
          </div>
        </ErrorBoundary>

        <SectionGutter size="lg" />

        <ErrorBoundary label="galaxy">
          <InViewMonitor rootMargin="20% 0px 20% 0px">
            <Suspense fallback={<SectionSkeleton />}>
              <ParticleGalaxyStage
                kicker={lang === "en" ? "Technical breadth" : "Alcance técnico"}
                title={lang === "en" ? "One galaxy of domains." : "Una galaxia de dominios."}
                subtitle={
                  lang === "en"
                    ? "Distributed systems, databases, operating systems, networks, cryptography and AI. Each a branch I have walked through the degree — and still explore in the lab."
                    : "Sistemas distribuidos, bases de datos, sistemas operativos, redes, criptografía e IA. Cada rama una he recorrido en el grado — y sigo explorando en el laboratorio."
                }
              />
            </Suspense>
          </InViewMonitor>
        </ErrorBoundary>

        <SectionGutter size="lg" />

        <ErrorBoundary label="morph">
          <InViewMonitor rootMargin="20% 0px 20% 0px">
            <div id="morph" className="interactive">
              <Suspense fallback={<SectionSkeleton />}>
                <MorphParticlesTransition
                  title={lang === "en" ? "ADAPT" : "ADAPTAR"}
                  subtitle={lang === "en" ? "From problem → system → maintainable software" : "De problema → sistema → software mantenible"}
                  lines={
                    lang === "en"
                      ? [
                          "Translate business need into technical contract",
                          "Architecture that survives the second requirement change",
                          "Tests and validation as part of the build",
                        ]
                      : [
                          "Traducir necesidad de negocio a contrato técnico",
                          "Arquitectura que aguanta el segundo cambio de requisitos",
                          "Tests y validación como parte del build",
                        ]
                  }
                />
              </Suspense>
            </div>
          </InViewMonitor>
        </ErrorBoundary>

        <SectionGutter size="lg" />

        <ErrorBoundary label="frutiger">
          <InViewMonitor rootMargin="20% 0px 20% 0px">
            <Suspense fallback={<SectionSkeleton />}>
              <FrutigerAeroStage
                kicker={lang === "en" ? "Ready to join a team" : "Listo para un equipo"}
                title={lang === "en" ? "Let's build something useful." : "Construyamos algo útil."}
                subtitle={
                  lang === "en"
                    ? "Open to internships and junior roles in backend, systems and applied security. A Coruña, remote or hybrid — wherever there's a team that values doing things properly."
                    : "Disponible para prácticas y puesto junior en backend, sistemas y seguridad aplicada. A Coruña, remoto o híbrido — donde haya un equipo al que le importe hacer las cosas bien."
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
      kicker: "Presentación",
      title: "Backend con criterio.",
      subtitle:
        "Ingeniero informático en formación enfocado en APIs, Linux, Docker y seguridad aplicada. Busco prácticas y primer puesto junior donde aportar trabajo real desde el primer día.",
      lines: [
        "APIs mantenibles con contratos explícitos",
        "Linux + Docker + despliegues reproducibles",
        "Seguridad aplicada y validación técnica",
      ],
    },
    alloy: {
      title: "LIQUID ALLOY",
      subtitle: "Sección visual · Cambio de ritmo entre bloques",
    },
    mastery: {
      kicker: "Proyectos destacados",
      title: "Iteración técnica real.",
      subtitle:
        "Cada repositorio es una vuelta más al problema — arquitectura, seguridad, automatización y tooling interno. Proyectos académicos y personales con lectura técnica clara.",
      lines: [
        "ISD · Internet y Sistemas Distribuidos",
        "Auditoría PQC · Criptografía postcuántica",
        "GPT CMD · CLI de automatización con IA",
        "SO-SHELL · Programación de sistemas",
      ],
    },
  },
  en: {
    creative: {
      kicker: "Introduction",
      title: "Backend with judgement.",
      subtitle:
        "Computer engineering student focused on APIs, Linux, Docker and applied security. Looking for internships and a first junior role where I can contribute real work from day one.",
      lines: [
        "Maintainable APIs with explicit contracts",
        "Linux + Docker + reproducible deployments",
        "Applied security and technical validation",
      ],
    },
    alloy: {
      title: "LIQUID ALLOY",
      subtitle: "Visual break · Pace change between blocks",
    },
    mastery: {
      kicker: "Selected projects",
      title: "Real technical iteration.",
      subtitle:
        "Every repository is another pass at the problem — architecture, security, automation and internal tooling. Academic and personal projects with clear technical reading.",
      lines: [
        "ISD · Internet and Distributed Systems",
        "PQC Audit · Post-quantum cryptography",
        "GPT CMD · Automation CLI with AI",
        "SO-SHELL · Systems programming",
      ],
    },
  },
};
