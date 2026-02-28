const SELECTORS = {
  heroBadge: '.hero-badge-text',
  heroLines: '.hero-title .hero-line',
  heroDescription: '.hero-description-text',
  heroHighlights: '.hero-value-pill',
  heroCtaPrimary: '.hero-cta .btn-primary span',
  heroCtaSecondary: '.hero-cta .btn-secondary span',
  contactEmailLink: '#contact .contact-card:nth-of-type(1) a',
  contactGithubLink: '#contact .contact-card:nth-of-type(2) a',
  contactLinkedinLink: '#contact .contact-card:nth-of-type(3) a',
};

function setText(selector, value) {
  const node = document.querySelector(selector);
  if (node && typeof value === 'string') node.textContent = value;
}

function setAttr(selector, attr, value) {
  const node = document.querySelector(selector);
  if (node && typeof value === 'string' && value) node.setAttribute(attr, value);
}

export async function initSiteContent() {
  try {
    const response = await fetch('/api/site-content', { headers: { Accept: 'application/json' } });
    if (!response.ok) return;
    const payload = await response.json();
    if (!payload?.ok || !payload.data) return;
    applySiteContent(payload.data);
    window.dispatchEvent(new CustomEvent('warp:site-content-applied'));
  } catch (error) {
    console.warn('[content] failed to load site content', error);
  }
}

export function applySiteContent(data) {
  if (!data || typeof data !== 'object') return;

  if (data.meta) {
    if (typeof data.meta.siteTitle === 'string' && data.meta.siteTitle) document.title = data.meta.siteTitle;
    setMeta('description', data.meta.siteDescription);
    setMetaProperty('og:title', data.meta.ogTitle);
    setMetaProperty('og:description', data.meta.ogDescription);
  }

  if (data.hero) {
    setText(SELECTORS.heroBadge, data.hero.badge);
    const heroLines = document.querySelectorAll(SELECTORS.heroLines);
    if (heroLines[0] && typeof data.hero.name === 'string') heroLines[0].textContent = data.hero.name;
    if (heroLines[1] && typeof data.hero.roleLineA === 'string') heroLines[1].textContent = data.hero.roleLineA;
    if (heroLines[2] && typeof data.hero.roleLineB === 'string') heroLines[2].textContent = data.hero.roleLineB;
    setText(SELECTORS.heroDescription, data.hero.description);
    setText(SELECTORS.heroCtaPrimary, data.hero.ctaPrimary);
    setText(SELECTORS.heroCtaSecondary, data.hero.ctaSecondary);

    if (Array.isArray(data.hero.highlights)) {
      const pills = document.querySelectorAll(SELECTORS.heroHighlights);
      data.hero.highlights.slice(0, pills.length).forEach((item, index) => {
        if (typeof item === 'string' && pills[index]) pills[index].textContent = item;
      });
    }
  }

  if (data.contact) {
    const emailHref = data.contact.email ? `mailto:${data.contact.email}` : '';
    setText(SELECTORS.contactEmailLink, data.contact.email);
    setAttr(SELECTORS.contactEmailLink, 'href', emailHref);

    setText(SELECTORS.contactGithubLink, stripProtocol(data.contact.github));
    setAttr(SELECTORS.contactGithubLink, 'href', data.contact.github);

    setText(SELECTORS.contactLinkedinLink, stripProtocol(data.contact.linkedin));
    setAttr(SELECTORS.contactLinkedinLink, 'href', data.contact.linkedin);
  }
}

function setMeta(name, value) {
  const node = document.querySelector(`meta[name="${name}"]`);
  if (node && typeof value === 'string' && value) node.setAttribute('content', value);
}

function setMetaProperty(name, value) {
  const node = document.querySelector(`meta[property="${name}"]`);
  if (node && typeof value === 'string' && value) node.setAttribute('content', value);
}

function stripProtocol(value) {
  return String(value || '').replace(/^https?:\/\//, '');
}

