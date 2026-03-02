import { prefs, togglePref } from './preferences.js';

const translations = {
  es: {
    nav: ['Sobre mí', 'Skills', 'Servicios', 'Proyectos', 'Método', 'Trayectoria', 'Visual', 'Contacto'],
    editor: 'Editor',
    heroBadge: 'Disponible para prácticas y proyectos tech de alto impacto',
    floatingBadge: 'Ingeniería de software - Ciberseguridad - IA - Cloud',
    heroLines: ['Iker Pérez García', 'Software & Security', 'Product Engineer'],
    heroDescription: 'Ingeniero de Software especializado en crear sistemas distribuidos, seguros y de alto rendimiento. Enfoque integral en arquitectura backend, hardening de sistemas y experiencias de usuario inmersivas. Especial interés en',
    heroHighlights: ['SICUE en UPM - enfoque empresarial', 'ES / GL nativo + Inglés B2', 'Cloud, redes y automatización', 'IA aplicada y ciberseguridad'],
    ctas: ['Ver proyectos', 'Minijuego 3D', 'Contactar'],
    stats: ['Año de carrera', 'Proyectos y prácticas', 'Cursos y certificaciones'],
    serviceFilters: ['Todo', 'Base técnica', 'Producción', 'I+D exploratoria'],
    projectFilters: ['Todos', 'Core', 'Producción', 'Exploración', 'Frontend', 'Backend', 'Cloud', 'Seguridad', 'IA/Datos', 'Sistemas'],
    projectDataStrip: ['Repos actualizados desde GitHub', 'Portadas con preview visual', 'Curación editable en public/projects.json'],
    ui: ['Grano', 'Cursor', 'Motion'],
    misc: {
      skip: 'Saltar al contenido principal',
      backTop: 'Volver arriba',
      threeCanvas: 'Escena 3D interactiva de portátil en movimiento',
      threeDesc: 'Fondo 3D decorativo de un portátil que responde al puntero y al scroll.',
      gamingNav: 'Gaming',
      uiToggle: 'Visual',
      mobileTheme: { dark: 'Oscuro', light: 'Claro' },
      themeAria: 'Cambiar tema',
      langAria: 'Cambiar idioma',
      adminAria: 'Abrir editor',
      deniedTitle: 'Not admin',
      deniedText: 'Este portal solo se abre desde tu red autorizada o desde un navegador ya confiado.',
      deniedClose: 'Cerrar',
    },
    ticker: ['Secure by design', 'Backend architecture', 'Cloud automation', 'AI product prototyping', 'Data reliability', 'UX with performance', 'Full stack delivery', 'Continuous improvement'],
    sections: {
      aboutTitle: 'Sobre mí',
      skillsTitle: 'Tech Stack',
      skillsSubtitle: 'Tecnologías y herramientas con las que trabajo',
      servicesTitle: 'Categorías de valor',
      servicesSubtitle: 'Trabajo por dominios claros para entregar resultados medibles, no solo código.',
      projectsTitle: 'Proyectos con impacto',
      projectsSubtitle: 'Trabajo técnico real: rendimiento, seguridad, experiencia de usuario y escalabilidad.',
      processTitle: 'Cómo trabajo',
      processSubtitle: 'Método de trabajo para entregar software útil, seguro y mantenible',
      experienceTitle: 'Formación & trayectoria',
      contactTitle: '¿Hablamos?',
      contactSubtitle: 'Busco prácticas, colaboraciones y proyectos interesantes',
      experienceHeroTitle: 'Experiencia Cinematográfica',
      experienceHeroSubtitle: 'Visuales guiados por scroll, paneles interactivos y storytelling técnico concentrados en una página para explorarlos sin fricciones.',
      experienceHeroPrimary: 'Volver al portfolio',
      experienceHeroSecondary: 'Contactar',
      experienceCtaTitle: 'Experiencia Visual',
      experienceCtaSubtitle: 'Accede a la narrativa cinematográfica, los laboratorios interactivos y el playbook técnico en una página dedicada.',
      experienceCtaBody: 'He separado las escenas de motion, los paneles y los comparadores para que la home cargue más rápido sin perder el bloque visual.',
      experienceCtaButton: 'Ver experiencia visual',
      engineeringTitle: 'Foco Ingeniería',
      engineeringSubtitle: 'Estructura clara de prioridades técnicas: backend, seguridad, cloud y delivery con mentalidad de producto.',
      showcaseTitle: 'Cinematic Composition',
      showcaseSubtitle: 'Dirección visual y ritmo de movimiento sincronizados al scroll para presentar producto con lectura editorial.',
      reelTitle: 'Casos Reales en Movimiento',
      reelSubtitle: 'Narrativa visual de proyectos con enfoque en impacto, ejecución técnica y resultado en producto.',
      neoTitle: 'Panel de Decisión Técnica',
      neoSubtitle: 'Simulación de priorización para elegir foco de sprint en proyectos reales: calidad, velocidad y seguridad.',
      animeTitle: 'Cadencia de Entrega',
      animeSubtitle: 'Bloques que muestran el flujo de trabajo real en un proyecto: entrada, transformación, release y aprendizaje.',
      deckTitle: 'Matriz de Prioridades',
      deckSubtitle: 'Mapa interactivo para decidir qué atacar primero en un proyecto: fiabilidad, experiencia, seguridad o velocidad.',
      cloudTitle: 'Stack Cloud Aplicado a Proyectos',
      cloudSubtitle: 'No es una lista de herramientas: son escenarios de portfolio donde cloud e IA aportan valor real.',
      flowTitle: 'Roadmap de Ejecución en Proyectos',
      flowSubtitle: 'Panel interactivo para explicar cómo paso de discovery a release estable con decisiones técnicas trazables.',
      topologyTitle: 'Arquitectura de Proyecto en Producción',
      topologySubtitle: 'Mapa interactivo para explicar cómo conecto cloud, seguridad, IA y datos en casos reales.',
      splitTitle: 'Evolución Visual de Proyecto',
      splitSubtitle: 'Comparador para mostrar el salto desde una versión base hasta una entrega optimizada y lista para escalar.',
      eliteTitle: 'Casos de Portfolio High Impact',
      eliteSubtitle: 'Ejemplos tipo producción con métricas de impacto y stack moderno para backend, seguridad, cloud e IA.',
      playbookTitle: 'Playbook Técnico Interactivo',
      playbookSubtitle: 'Escenarios reales para enseñar cómo aterrizo arquitectura, seguridad y observabilidad según objetivo de negocio.',
    },
    visualDna: {
      title: 'Arquitectura Visual',
      subtitle: 'Segunda capa de la experiencia: sistema visual, ritmo editorial y decisiones de composición documentadas.',
      cards: [
        {
          title: 'Ritmo editorial',
          text: 'Mapa de beats que alterna apertura, detalle técnico y cierre orientado a conversión.',
          tags: ['Beat map', 'Scroll sync', 'Timing'],
        },
        {
          title: 'Profundidad realista',
          text: 'Capas de luz, grano y sombra suave para mantener legibilidad sin perder atmósfera.',
          tags: ['Depth', 'Film grain', 'Contrast'],
        },
        {
          title: 'UI táctil',
          text: 'Botones y paneles con micro-feedback y peso visual inspirado en hardware.',
          tags: ['Neumorphism', 'Micro motion', 'Haptics'],
        },
        {
          title: 'Entrega técnica',
          text: 'Visualización clara del stack, resultados y garantías técnicas para perfiles senior.',
          tags: ['Stack clarity', 'Metrics', 'QA'],
        },
      ],
      stripLabel: 'Stack visual',
      stripTags: ['Three.js', 'Anime.js', 'Motion tokens', 'Scroll staging', 'Color grading'],
    },
    engineeringFocus: {
      cards: [
        {
          tag: 'Backend Systems',
          title: 'Arquitectura distribuida',
          text: 'Servicios modulares, contratos estables y observabilidad desde el primer release.',
          metrics: ['APIs', 'Reliability', 'Latency'],
        },
        {
          tag: 'Security',
          title: 'Secure by design',
          text: 'Hardening de superficie, validación estricta y reducción de riesgo en producción.',
          metrics: ['Threats', 'Validation', 'Audit'],
        },
        {
          tag: 'Cloud',
          title: 'Delivery en la nube',
          text: 'Pipeline CI/CD, despliegues trazables y escalado con costes controlados.',
          metrics: ['CI/CD', 'Infra', 'Cost'],
        },
        {
          tag: 'AI / Data',
          title: 'Prototipos útiles',
          text: 'Validación rápida de hipótesis con modelos y datos antes de escalar roadmap.',
          metrics: ['LLMs', 'Discovery', 'Ops'],
        },
      ],
      calloutKicker: 'Capas prioritarias',
      calloutTitle: 'Perfil técnico orientado a estabilidad y resultados',
      calloutText: 'Trabajo desde el core técnico hacia la experiencia, priorizando fiabilidad y claridad en cada entrega.',
      pills: ['Arquitectura', 'Seguridad', 'Producto', 'Escala'],
    },
    contact: {
      cards: ['Email', 'GitHub', 'LinkedIn', 'Ubicación'],
      topicLabel: 'Categoría',
      topicPlaceholder: 'Selecciona una categoría',
      topicOptions: ['Frontend + UX', 'Backend + APIs', 'Cloud + DevOps', 'Security review', 'AI / Data prototype', 'Otra colaboración'],
      nameLabel: 'Nombre',
      namePlaceholder: 'Tu nombre',
      emailLabel: 'Email',
      emailPlaceholder: 'tu@email.com',
      messageLabel: 'Mensaje',
      messagePlaceholder: 'Cuéntame tu propuesta...',
      websiteLabel: 'Website',
      submit: 'Enviar mensaje',
      success: 'Gracias. El mensaje se ha enviado correctamente.',
      error: 'No se pudo enviar el mensaje. Revisa los datos e intenta de nuevo.',
    },
    footer: {
      byline: 'Diseñado y desarrollado por Iker Pérez.',
      meta: 'Software, seguridad, cloud e IA aplicada.',
      nav: ['Sobre mí', 'Servicios', 'Proyectos', 'Contacto'],
      availability: 'Disponible para prácticas y colaboraciones técnicas.',
    },
  },
  en: {
    nav: ['About', 'Skills', 'Services', 'Projects', 'Method', 'Journey', 'Visual', 'Contact'],
    editor: 'Editor',
    heroBadge: 'Available for internships and high-impact tech projects',
    floatingBadge: 'Software engineering - Cybersecurity - AI - Cloud',
    heroLines: ['Iker Pérez García', 'Software & Security', 'Product Engineer'],
    heroDescription: 'Software Engineer focused on building distributed, secure and high-performance systems. End-to-end approach across backend architecture, system hardening and immersive product experiences. Special interest in',
    heroHighlights: ['SICUE at UPM - business-oriented perspective', 'Native ES / GL + English B2', 'Cloud, networking and automation', 'Applied AI and cybersecurity'],
    ctas: ['View projects', '3D minigame', 'Contact'],
    stats: ['Years of degree', 'Projects and internships', 'Courses and certifications'],
    serviceFilters: ['All', 'Core Skills', 'Production Ready', 'Exploratory R&D'],
    projectFilters: ['All', 'Core', 'Production', 'Exploratory', 'Frontend', 'Backend', 'Cloud', 'Security', 'AI/Data', 'Systems'],
    projectDataStrip: ['Repos synced from GitHub', 'Cards with visual preview', 'Editable curation in public/projects.json'],
    ui: ['Grain', 'Cursor', 'Motion'],
    misc: {
      skip: 'Skip to main content',
      backTop: 'Back to top',
      threeCanvas: 'Interactive 3D moving laptop scene',
      threeDesc: 'Decorative 3D laptop background reacting to pointer and scroll.',
      gamingNav: 'Gaming',
      uiToggle: 'Visual',
      mobileTheme: { dark: 'Dark', light: 'Light' },
      themeAria: 'Toggle theme',
      langAria: 'Change language',
      adminAria: 'Open editor',
      deniedTitle: 'Not admin',
      deniedText: 'This portal only opens from your authorized network or from a previously trusted browser.',
      deniedClose: 'Close',
    },
    ticker: ['Secure by design', 'Backend architecture', 'Cloud automation', 'AI product prototyping', 'Data reliability', 'UX with performance', 'Full stack delivery', 'Continuous improvement'],
    sections: {
      aboutTitle: 'About me',
      skillsTitle: 'Tech Stack',
      skillsSubtitle: 'Technologies and tools I work with',
      servicesTitle: 'Value categories',
      servicesSubtitle: 'I work through clear domains to deliver measurable outcomes, not just code.',
      projectsTitle: 'Projects with impact',
      projectsSubtitle: 'Real technical work across performance, security, user experience and scalability.',
      processTitle: 'How I work',
      processSubtitle: 'Working method to deliver useful, secure and maintainable software',
      experienceTitle: 'Education & journey',
      contactTitle: 'Let\'s talk',
      contactSubtitle: 'I am looking for internships, collaborations and interesting projects',
      experienceHeroTitle: 'Cinematic Experience',
      experienceHeroSubtitle: 'Scroll-driven visuals, interactive panels, and technical storytelling curated on a dedicated page.',
      experienceHeroPrimary: 'Back to portfolio',
      experienceHeroSecondary: 'Contact',
      experienceCtaTitle: 'Visual Experience',
      experienceCtaSubtitle: 'Access the cinematic narrative, interactive labs, and technical playbook on a dedicated page.',
      experienceCtaBody: 'I separated motion scenes, panels, and comparators so the home loads faster without losing the visual block.',
      experienceCtaButton: 'Open visual experience',
      engineeringTitle: 'Engineering Focus',
      engineeringSubtitle: 'Clear technical priorities: backend, security, cloud, and delivery with product mindset.',
      showcaseTitle: 'Cinematic Composition',
      showcaseSubtitle: 'Visual direction and motion rhythm synchronized to scroll to present product with editorial clarity.',
      reelTitle: 'Real Cases in Motion',
      reelSubtitle: 'Visual storytelling for projects focused on impact, technical execution and product outcome.',
      neoTitle: 'Technical Decision Panel',
      neoSubtitle: 'Prioritization simulator to choose sprint focus in real projects: quality, speed and security.',
      animeTitle: 'Delivery Cadence',
      animeSubtitle: 'Blocks showing a real project workflow: input, transformation, release and learning.',
      deckTitle: 'Priority Matrix',
      deckSubtitle: 'Interactive map to decide what to attack first in a project: reliability, experience, security or speed.',
      cloudTitle: 'Cloud Stack Applied to Projects',
      cloudSubtitle: 'Not a tool list: real portfolio scenarios where cloud and AI create value.',
      flowTitle: 'Project Execution Roadmap',
      flowSubtitle: 'Interactive panel explaining how I move from discovery to a stable release with traceable technical decisions.',
      topologyTitle: 'Production Project Architecture',
      topologySubtitle: 'Interactive map showing how I connect cloud, security, AI and data in real cases.',
      splitTitle: 'Project Visual Evolution',
      splitSubtitle: 'Comparator showing the jump from a base version to an optimized delivery ready to scale.',
      eliteTitle: 'High Impact Portfolio Cases',
      eliteSubtitle: 'Production-like examples with impact metrics and a modern stack for backend, security, cloud and AI.',
      playbookTitle: 'Interactive Technical Playbook',
      playbookSubtitle: 'Real scenarios showing how I land architecture, security and observability based on business goals.',
    },
    visualDna: {
      title: 'Visual Architecture',
      subtitle: 'Second layer of the experience: visual system, editorial rhythm, and documented composition decisions.',
      cards: [
        {
          title: 'Editorial rhythm',
          text: 'Beat map alternating opening, technical detail, and conversion-focused closure.',
          tags: ['Beat map', 'Scroll sync', 'Timing'],
        },
        {
          title: 'Realistic depth',
          text: 'Light, grain and soft shadow layers to keep legibility without losing atmosphere.',
          tags: ['Depth', 'Film grain', 'Contrast'],
        },
        {
          title: 'Tactile UI',
          text: 'Buttons and panels with micro feedback and hardware-inspired weight.',
          tags: ['Neumorphism', 'Micro motion', 'Haptics'],
        },
        {
          title: 'Technical delivery',
          text: 'Clear view of stack, results, and technical guarantees for senior profiles.',
          tags: ['Stack clarity', 'Metrics', 'QA'],
        },
      ],
      stripLabel: 'Visual stack',
      stripTags: ['Three.js', 'Anime.js', 'Motion tokens', 'Scroll staging', 'Color grading'],
    },
    engineeringFocus: {
      cards: [
        {
          tag: 'Backend Systems',
          title: 'Distributed architecture',
          text: 'Modular services, stable contracts, and observability from the first release.',
          metrics: ['APIs', 'Reliability', 'Latency'],
        },
        {
          tag: 'Security',
          title: 'Secure by design',
          text: 'Surface hardening, strict validation, and risk reduction in production.',
          metrics: ['Threats', 'Validation', 'Audit'],
        },
        {
          tag: 'Cloud',
          title: 'Cloud delivery',
          text: 'CI/CD pipeline, traceable deployments, and controlled scaling costs.',
          metrics: ['CI/CD', 'Infra', 'Cost'],
        },
        {
          tag: 'AI / Data',
          title: 'Useful prototypes',
          text: 'Fast hypothesis validation with models and data before scaling the roadmap.',
          metrics: ['LLMs', 'Discovery', 'Ops'],
        },
      ],
      calloutKicker: 'Priority layers',
      calloutTitle: 'Technical profile oriented to stability and results',
      calloutText: 'I work from the technical core toward experience, prioritizing reliability and clarity in every delivery.',
      pills: ['Architecture', 'Security', 'Product', 'Scale'],
    },
    contact: {
      cards: ['Email', 'GitHub', 'LinkedIn', 'Location'],
      topicLabel: 'Category',
      topicPlaceholder: 'Select a category',
      topicOptions: ['Frontend + UX', 'Backend + APIs', 'Cloud + DevOps', 'Security review', 'AI / Data prototype', 'Other collaboration'],
      nameLabel: 'Name',
      namePlaceholder: 'Your name',
      emailLabel: 'Email',
      emailPlaceholder: 'you@email.com',
      messageLabel: 'Message',
      messagePlaceholder: 'Tell me about your proposal...',
      websiteLabel: 'Website',
      submit: 'Send message',
      success: 'Thanks. The message has been sent successfully.',
      error: 'The message could not be sent. Check the data and try again.',
    },
    footer: {
      byline: 'Designed and developed by Iker Pérez.',
      meta: 'Software, security, cloud and applied AI.',
      nav: ['About', 'Services', 'Projects', 'Contact'],
      availability: 'Available for internships and technical collaborations.',
    },
  },
};

export function initSiteControls() {
  bindThemeToggle();
  bindLangToggle();
  bindAdminEntry();
  applyLanguage();
  syncControls();
  window.addEventListener('warp:prefs-changed', () => {
    applyLanguage();
    syncControls();
  });
  window.addEventListener('warp:site-content-applied', applyLanguage);
}

export function getLangCopy() {
  return translations[prefs.lang] || translations.es;
}

function bindThemeToggle() {
  const checkbox = document.getElementById('theme-toggle-input');
  const mobileBtn = document.getElementById('mobile-theme-toggle');
  if (checkbox) {
    checkbox.checked = prefs.theme === 'light';
    checkbox.addEventListener('change', () => togglePref('theme'));
  }
  mobileBtn?.addEventListener('click', () => togglePref('theme'));
}

function bindLangToggle() {
  const langBtn = document.getElementById('lang-toggle');
  const mobileBtn = document.getElementById('mobile-lang-toggle');
  langBtn?.addEventListener('click', () => togglePref('lang'));
  mobileBtn?.addEventListener('click', () => togglePref('lang'));
}

function bindAdminEntry() {
  const buttons = [document.getElementById('admin-entry-btn'), document.getElementById('mobile-admin-entry-btn')].filter(Boolean);
  const overlay = document.getElementById('admin-denied');
  const close = document.getElementById('admin-denied-close');
  const hideOverlay = () => {
    if (!overlay) return;
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
  };

  buttons.forEach((button) => {
    button.addEventListener('click', async () => {
      try {
        const response = await fetch('/api/admin-entry', { credentials: 'same-origin' });
        const payload = await response.json().catch(() => ({}));
        if (response.ok && payload?.allowed) {
          window.location.href = payload.redirectTo || '/admin.html';
          return;
        }
      } catch {
        // fall through
      }

      if (overlay) {
        overlay.classList.add('open');
        overlay.setAttribute('aria-hidden', 'false');
      }
    });
  });

  close?.addEventListener('click', hideOverlay);
  overlay?.addEventListener('click', (event) => {
    if (event.target === overlay || event.target.classList.contains('admin-denied-backdrop')) hideOverlay();
  });
}

function syncControls() {
  const copy = getLangCopy();
  const checkbox = document.getElementById('theme-toggle-input');
  if (checkbox) checkbox.checked = prefs.theme === 'light';

  const langLabels = document.querySelectorAll('.lang-toggle-label');
  if (langLabels[0]) langLabels[0].classList.toggle('muted', prefs.lang !== 'es');
  if (langLabels[1]) langLabels[1].classList.toggle('muted', prefs.lang !== 'en');

  const mobileTheme = document.getElementById('mobile-theme-toggle');
  if (mobileTheme) mobileTheme.textContent = prefs.theme === 'light' ? copy.misc.mobileTheme.light : copy.misc.mobileTheme.dark;

  const mobileLang = document.getElementById('mobile-lang-toggle');
  if (mobileLang) mobileLang.textContent = prefs.lang === 'es' ? 'ES / EN' : 'EN / ES';
}

function applyLanguage() {
  const copy = getLangCopy();

  applyNavCopy('.nav-links .nav-link', copy.nav, copy.misc.gamingNav);
  applyNavCopy('.mobile-menu .mobile-link', copy.nav, copy.misc.gamingNav);
  document.querySelectorAll('.footer-nav a').forEach((node, index) => setNodeText(node, copy.footer.nav[index]));
  document.querySelectorAll('.ticker-item').forEach((node, index) => setNodeText(node, copy.ticker[index]));

  setText('.skip-link', copy.misc.skip);
  setText('.nav-topline', copy.heroBadge);
  setAria('#back-to-top', copy.misc.backTop);
  setAria('#three-canvas', copy.misc.threeCanvas);
  setText('#three-scene-desc', copy.misc.threeDesc);
  setAria('#lang-toggle', copy.misc.langAria);
  setAria('.cosmic-toggle', copy.misc.themeAria);
  setAria('#admin-entry-btn', copy.misc.adminAria);
  setText('#ui-toggle', copy.misc.uiToggle);

  const editorButtons = [document.getElementById('admin-entry-btn'), document.getElementById('mobile-admin-entry-btn')];
  editorButtons.forEach((button) => {
    if (!button) return;
    const textNode = button.querySelector('.admin-entry-text');
    if (textNode) textNode.textContent = copy.editor;
    else button.textContent = copy.editor;
  });

  setText('.hero-badge-text', copy.heroBadge);
  setText('.floating-badge', copy.floatingBadge);
  document.querySelectorAll('.hero-title .hero-line').forEach((node, index) => setNodeText(node, copy.heroLines[index]));
  setText('.hero-description-text', copy.heroDescription);
  document.querySelectorAll('.hero-value-pill').forEach((node, index) => setNodeText(node, copy.heroHighlights[index]));
  document.querySelectorAll('.hero-cta .btn span').forEach((node, index) => setNodeText(node, copy.ctas[index]));
  document.querySelectorAll('.stat-label').forEach((node, index) => setNodeText(node, copy.stats[index]));
  document.querySelectorAll('.ui-option > span:first-child').forEach((node, index) => setNodeText(node, copy.ui[index]));
  document.querySelectorAll('.service-chip').forEach((node, index) => setNodeText(node, copy.serviceFilters[index]));
  document.querySelectorAll('.project-filter').forEach((node, index) => setNodeText(node, copy.projectFilters[index]));
  document.querySelectorAll('.project-data-pill').forEach((node, index) => setNodeText(node, copy.projectDataStrip[index]));

  setSectionTitle('about', copy.sections.aboutTitle);
  setSectionTitle('skills', copy.sections.skillsTitle);
  setSectionSubtitle('skills', copy.sections.skillsSubtitle);
  setSectionTitle('services', copy.sections.servicesTitle);
  setSectionSubtitle('services', copy.sections.servicesSubtitle);
  setSectionTitle('projects', copy.sections.projectsTitle);
  setSectionSubtitle('projects', copy.sections.projectsSubtitle);
  setSectionTitle('process', copy.sections.processTitle);
  setSectionSubtitle('process', copy.sections.processSubtitle);
  setSectionTitle('experience', copy.sections.experienceTitle);
  setSectionTitle('contact', copy.sections.contactTitle);
  setSectionSubtitle('contact', copy.sections.contactSubtitle);
  setSectionTitle('experience-hero', copy.sections.experienceHeroTitle);
  setSectionSubtitle('experience-hero', copy.sections.experienceHeroSubtitle);
  const experienceActions = document.querySelectorAll('#experience-hero .experience-hero-actions a');
  if (experienceActions[0]) experienceActions[0].textContent = copy.sections.experienceHeroPrimary;
  if (experienceActions[1]) experienceActions[1].textContent = copy.sections.experienceHeroSecondary;
  setSectionTitle('experience-cta', copy.sections.experienceCtaTitle);
  setSectionSubtitle('experience-cta', copy.sections.experienceCtaSubtitle);
  setText('#experience-cta .experience-cta-body p', copy.sections.experienceCtaBody);
  setText('#experience-cta .experience-cta-body a', copy.sections.experienceCtaButton);
  setSectionTitle('showcase', copy.sections.showcaseTitle);
  setSectionSubtitle('showcase', copy.sections.showcaseSubtitle);
  setSectionTitle('motion-reel', copy.sections.reelTitle);
  setSectionSubtitle('motion-reel', copy.sections.reelSubtitle);
  setSectionTitle('neo-lab', copy.sections.neoTitle);
  setSectionSubtitle('neo-lab', copy.sections.neoSubtitle);
  setSectionTitle('anime-lab', copy.sections.animeTitle);
  setSectionSubtitle('anime-lab', copy.sections.animeSubtitle);
  setSectionTitle('interaction-deck', copy.sections.deckTitle);
  setSectionSubtitle('interaction-deck', copy.sections.deckSubtitle);
  setSectionTitle('google-services-section', copy.sections.cloudTitle);
  setSectionSubtitle('google-services-section', copy.sections.cloudSubtitle);
  setSectionTitle('flow-simulator', copy.sections.flowTitle);
  setSectionSubtitle('flow-simulator', copy.sections.flowSubtitle);
  setSectionTitle('topology-lab', copy.sections.topologyTitle);
  setSectionSubtitle('topology-lab', copy.sections.topologySubtitle);
  setSectionTitle('split-reveal', copy.sections.splitTitle);
  setSectionSubtitle('split-reveal', copy.sections.splitSubtitle);
  setSectionTitle('elite-cases', copy.sections.eliteTitle);
  setSectionSubtitle('elite-cases', copy.sections.eliteSubtitle);
  setSectionTitle('tech-playbook', copy.sections.playbookTitle);
  setSectionSubtitle('tech-playbook', copy.sections.playbookSubtitle);

  if (copy.visualDna) {
    setSectionTitle('visual-dna', copy.visualDna.title);
    setSectionSubtitle('visual-dna', copy.visualDna.subtitle);
    const visualCards = Array.from(document.querySelectorAll('#visual-dna .visual-dna-card'));
    visualCards.forEach((card, index) => {
      const cardCopy = copy.visualDna.cards?.[index];
      if (!cardCopy) return;
      setNodeText(card.querySelector('h3'), cardCopy.title);
      setNodeText(card.querySelector('p'), cardCopy.text);
      const pills = Array.from(card.querySelectorAll('.visual-dna-pills span'));
      pills.forEach((pill, pillIndex) => setNodeText(pill, cardCopy.tags?.[pillIndex]));
    });
    setText('#visual-dna .visual-dna-label', copy.visualDna.stripLabel);
    document.querySelectorAll('#visual-dna .visual-dna-tags span').forEach((tag, index) => {
      setNodeText(tag, copy.visualDna.stripTags?.[index]);
    });
  }

  setSectionTitle('engineering-focus', copy.sections.engineeringTitle);
  setSectionSubtitle('engineering-focus', copy.sections.engineeringSubtitle);
  if (copy.engineeringFocus) {
    const cards = Array.from(document.querySelectorAll('#engineering-focus [data-engineering-card]'));
    cards.forEach((card, index) => {
      const cardCopy = copy.engineeringFocus.cards?.[index];
      if (!cardCopy) return;
      setNodeText(card.querySelector('.engineering-tag'), cardCopy.tag);
      setNodeText(card.querySelector('h3'), cardCopy.title);
      setNodeText(card.querySelector('p'), cardCopy.text);
      const metrics = Array.from(card.querySelectorAll('.engineering-metrics span'));
      metrics.forEach((metric, metricIndex) => setNodeText(metric, cardCopy.metrics?.[metricIndex]));
    });
    setText('#engineering-focus .engineering-callout-kicker', copy.engineeringFocus.calloutKicker);
    setText('#engineering-focus .engineering-callout h3', copy.engineeringFocus.calloutTitle);
    setText('#engineering-focus .engineering-callout p', copy.engineeringFocus.calloutText);
    document.querySelectorAll('#engineering-focus .engineering-pill-row span').forEach((pill, index) => {
      setNodeText(pill, copy.engineeringFocus.pills?.[index]);
    });
  }

  document.querySelectorAll('#contact .contact-card h4').forEach((node, index) => setNodeText(node, copy.contact.cards[index]));
  setFormField('#topic', '#contact label[for="topic"]', copy.contact.topicPlaceholder, copy.contact.topicLabel, copy.contact.topicOptions);
  setInput('#name', '#contact label[for="name"]', copy.contact.namePlaceholder, copy.contact.nameLabel);
  setInput('#email', '#contact label[for="email"]', copy.contact.emailPlaceholder, copy.contact.emailLabel);
  setTextarea('#message', '#contact label[for="message"]', copy.contact.messagePlaceholder, copy.contact.messageLabel);
  setInput('#website', '#contact label[for="website"]', '', copy.contact.websiteLabel);
  setText('#contact-form button[type="submit"] span', copy.contact.submit);
  setText('#contact-success', copy.contact.success);
  setText('#contact-error', copy.contact.error);

  setText('.footer-brand > p:first-of-type', copy.footer.byline);
  setText('.footer-meta', copy.footer.meta);
  setText('.footer-availability', copy.footer.availability);

  setText('#admin-denied h3', copy.misc.deniedTitle);
  setText('#admin-denied p', copy.misc.deniedText);
  setText('#admin-denied-close', copy.misc.deniedClose);

  document.documentElement.lang = prefs.lang;
  window.dispatchEvent(new CustomEvent('warp:lang-changed', { detail: { lang: prefs.lang, copy } }));
}

function setSectionTitle(id, value) {
  const node = document.querySelector(`#${id} .section-title`);
  if (node && typeof value === 'string') node.textContent = value;
}

function setSectionSubtitle(id, value) {
  setText(`#${id} .section-subtitle`, value);
}

function setFormField(selectSelector, labelSelector, placeholder, label, options) {
  const select = document.querySelector(selectSelector);
  if (select) {
    const first = select.querySelector('option[value=""]');
    if (first) first.textContent = placeholder;
    const optionNodes = Array.from(select.querySelectorAll('option:not([value=""])'));
    optionNodes.forEach((node, index) => setNodeText(node, options?.[index]));
  }
  setText(labelSelector, label);
}

function setInput(inputSelector, labelSelector, placeholder, label) {
  const input = document.querySelector(inputSelector);
  if (input && typeof placeholder === 'string') input.setAttribute('placeholder', placeholder);
  setText(labelSelector, label);
}

function setTextarea(selector, labelSelector, placeholder, label) {
  const node = document.querySelector(selector);
  if (node && typeof placeholder === 'string') node.setAttribute('placeholder', placeholder);
  setText(labelSelector, label);
}

function setText(selector, value) {
  const node = document.querySelector(selector);
  setNodeText(node, value);
}

function setAria(selector, value) {
  const node = document.querySelector(selector);
  if (node && typeof value === 'string') node.setAttribute('aria-label', value);
}

function setNodeText(node, value) {
  if (node && typeof value === 'string') node.textContent = value;
}

function applyNavCopy(selector, labels, gamingLabel) {
  let navIndex = 0;
  document.querySelectorAll(selector).forEach((node) => {
    const href = node.getAttribute('href') || '';
    const isGaming = href.includes('/gaming.html') || href.endsWith('gaming.html');
    if (isGaming) {
      setNodeText(node, gamingLabel);
      return;
    }
    setNodeText(node, labels?.[navIndex]);
    navIndex += 1;
  });
}

