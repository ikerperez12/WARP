import { prefs, togglePref } from './preferences.js';

const translations = {
  es: {
    nav: ['Sobre mí', 'Skills', 'Servicios', 'Proyectos', 'Método', 'Trayectoria', 'Media', 'Contacto'],
    editor: 'Editor',
    heroBadge: 'Disponible para prácticas y proyectos tech de alto impacto',
    heroLines: ['Iker Perez Garcia', 'Software & Security', 'Product Engineer'],
    heroDescription: 'Ingeniero de Software especializado en crear sistemas distribuidos, seguros y de alto rendimiento. Enfoque integral en arquitectura backend, hardening de sistemas y experiencias de usuario inmersivas. Especial interés en',
    heroHighlights: ['SICUE en UPM - enfoque empresarial', 'ES / GL nativo + Inglés B2', 'Cloud, redes y automatización', 'IA aplicada y ciberseguridad'],
    ctas: ['Ver proyectos', 'Contactar'],
    stats: ['Año de carrera', 'Proyectos y prácticas', 'Cursos y certificaciones'],
    ui: ['Grano', 'Cursor', 'Motion'],
    misc: {
      skip: 'Saltar al contenido principal',
      backTop: 'Volver arriba',
      threeCanvas: 'Escena 3D interactiva de portátil en movimiento',
      threeDesc: 'Fondo 3D decorativo de un portátil que responde al puntero y al scroll.',
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
      servicesTitle: 'Categorias de valor',
      servicesSubtitle: 'Trabajo por dominios claros para entregar resultados medibles, no solo código.',
      projectsTitle: 'Proyectos con impacto',
      projectsSubtitle: 'Trabajo técnico real: rendimiento, seguridad, experiencia de usuario y escalabilidad.',
      processTitle: 'Cómo trabajo',
      processSubtitle: 'Método de trabajo para entregar software útil, seguro y mantenible',
      experienceTitle: 'Formación & trayectoria',
      contactTitle: '¿Hablamos?',
      contactSubtitle: 'Busco prácticas, colaboraciones y proyectos interesantes',
      showcaseTitle: 'Cinematic Composition',
      showcaseSubtitle: 'Dirección visual y ritmo de movimiento sincronizados al scroll para presentar producto con lectura editorial.',
      reelTitle: 'Casos Reales en Movimiento',
      reelSubtitle: 'Narrativa visual de proyectos con enfoque en impacto, ejecución técnica y resultado en producto.',
      neoTitle: 'Panel de Decision Tecnica',
      neoSubtitle: 'Simulación de priorización para elegir foco de sprint en proyectos reales: calidad, velocidad y seguridad.',
      animeTitle: 'Cadencia de Entrega',
      animeSubtitle: 'Bloques que muestran el flujo de trabajo real en un proyecto: entrada, transformación, release y aprendizaje.',
      deckTitle: 'Matriz de Prioridades',
      deckSubtitle: 'Mapa interactivo para decidir qué atacar primero en un proyecto: fiabilidad, experiencia, seguridad o velocidad.',
      cloudTitle: 'Stack Cloud Aplicado a Proyectos',
      cloudSubtitle: 'No es una lista de herramientas: son escenarios de portfolio donde cloud e IA aportan valor real.',
      flowTitle: 'Roadmap de Ejecucion en Proyectos',
      flowSubtitle: 'Panel interactivo para explicar cómo paso de discovery a release estable con decisiones técnicas trazables.',
      topologyTitle: 'Arquitectura de Proyecto en Produccion',
      topologySubtitle: 'Mapa interactivo para explicar cómo conecto cloud, seguridad, IA y datos en casos reales.',
      splitTitle: 'Evolucion Visual de Proyecto',
      splitSubtitle: 'Comparador para mostrar el salto desde una versión base hasta una entrega optimizada y lista para escalar.',
      eliteTitle: 'Casos de Portfolio High Impact',
      eliteSubtitle: 'Ejemplos tipo producción con métricas de impacto y stack moderno para backend, seguridad, cloud e IA.',
      playbookTitle: 'Playbook Técnico Interactivo',
      playbookSubtitle: 'Escenarios reales para enseñar cómo aterrizo arquitectura, seguridad y observabilidad según objetivo de negocio.',
    },
    contact: {
      cards: ['Email', 'GitHub', 'LinkedIn', 'Ubicación'],
      topicLabel: 'Categoria',
      topicPlaceholder: 'Selecciona una categoria',
      topicOptions: ['Frontend + UX', 'Backend + APIs', 'Cloud + DevOps', 'Security review', 'AI / Data prototype', 'Otra colaboracion'],
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
    nav: ['About', 'Skills', 'Services', 'Projects', 'Method', 'Journey', 'Media', 'Contact'],
    editor: 'Editor',
    heroBadge: 'Available for internships and high-impact tech projects',
    heroLines: ['Iker Perez Garcia', 'Software & Security', 'Product Engineer'],
    heroDescription: 'Software Engineer focused on building distributed, secure and high-performance systems. End-to-end approach across backend architecture, system hardening and immersive product experiences. Special interest in',
    heroHighlights: ['SICUE at UPM - business-oriented perspective', 'Native ES / GL + English B2', 'Cloud, networking and automation', 'Applied AI and cybersecurity'],
    ctas: ['View projects', 'Contact'],
    stats: ['Years of degree', 'Projects and internships', 'Courses and certifications'],
    ui: ['Grain', 'Cursor', 'Motion'],
    misc: {
      skip: 'Skip to main content',
      backTop: 'Back to top',
      threeCanvas: 'Interactive 3D moving laptop scene',
      threeDesc: 'Decorative 3D laptop background reacting to pointer and scroll.',
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

  document.querySelectorAll('.nav-links .nav-link').forEach((node, index) => setNodeText(node, copy.nav[index]));
  document.querySelectorAll('.mobile-menu .mobile-link').forEach((node, index) => setNodeText(node, copy.nav[index]));
  document.querySelectorAll('.footer-nav a').forEach((node, index) => setNodeText(node, copy.footer.nav[index]));
  document.querySelectorAll('.ticker-item').forEach((node, index) => setNodeText(node, copy.ticker[index]));

  setText('.skip-link', copy.misc.skip);
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
  document.querySelectorAll('.hero-title .hero-line').forEach((node, index) => setNodeText(node, copy.heroLines[index]));
  setText('.hero-description-text', copy.heroDescription);
  document.querySelectorAll('.hero-value-pill').forEach((node, index) => setNodeText(node, copy.heroHighlights[index]));
  document.querySelectorAll('.hero-cta .btn span').forEach((node, index) => setNodeText(node, copy.ctas[index]));
  document.querySelectorAll('.stat-label').forEach((node, index) => setNodeText(node, copy.stats[index]));
  document.querySelectorAll('.ui-option > span:first-child').forEach((node, index) => setNodeText(node, copy.ui[index]));

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
