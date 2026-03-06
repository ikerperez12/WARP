export function initExperienceRail() {
  const rail = document.getElementById('experience-rail');
  if (!rail) return;

  const links = Array.from(rail.querySelectorAll('a[data-rail]'));
  if (!links.length) return;

  const sectionIds = links.map((link) => link.dataset.rail).filter(Boolean);
  const sectionSelector = sectionIds
    .map((id) => (CSS.escape ? `#${CSS.escape(id)}` : `#${id}`))
    .join(',');

  const sectionNodes = sectionSelector ? document.querySelectorAll(sectionSelector) : [];
  const sectionMap = new Map(Array.from(sectionNodes).map((node) => [node.id, node]));
  const sections = sectionIds.map((id) => sectionMap.get(id)).filter(Boolean);

  const countEl = document.getElementById('experience-rail-count');
  const updateCount = () => {
    if (!countEl) return;
    const label = countEl.dataset.countLabel || '';
    countEl.textContent = label ? `${links.length} ${label}` : `${links.length}`;
  };
  updateCount();

  const setActive = (id) => {
    links.forEach((link) => {
      const active = link.dataset.rail === id;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  };

  let ticking = false;
  const update = () => {
    ticking = false;
    const marker = window.innerHeight * 0.35;
    let current = sections[0]?.id || '';
    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      if (rect.top - marker <= 0) current = section.id;
    });
    if (current) setActive(current);
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  window.addEventListener('warp:lang-changed', updateCount);
  update();
}
