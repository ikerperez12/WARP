export function initGoogleServicesSection() {
  const root = document.getElementById('google-services-section');
  if (!root) return;

  const cards = Array.from(root.querySelectorAll('.google-service-card'));
  const filter = document.getElementById('google-service-filter');
  const search = document.getElementById('google-search-service');
  const count = document.getElementById('google-service-count');
  const copyButtons = Array.from(root.querySelectorAll('.google-service-copy'));

  const updateCount = () => {
    if (!count) return;
    const visible = cards.filter((card) => card.style.display !== 'none').length;
    count.textContent = String(visible);
    const countLabel = root.querySelector('.google-count');
    if (countLabel) {
      const isEn = document.documentElement.lang === 'en';
      countLabel.childNodes[0].textContent = isEn ? 'Visible cases: ' : 'Casos visibles: ';
    }
  };

  const applyFilters = () => {
    const activeType = filter?.value || 'all';
    const query = (search?.value || '').trim().toLowerCase();

    cards.forEach((card) => {
      const type = (card.dataset.type || '').toLowerCase();
      const haystack = `${card.dataset.service || ''} ${card.querySelector('h3')?.textContent || ''}`.toLowerCase();
      const matchType = activeType === 'all' || type === activeType;
      const matchQuery = !query || haystack.includes(query);
      card.style.display = matchType && matchQuery ? '' : 'none';
    });
    updateCount();
  };

  filter?.addEventListener('change', applyFilters);
  search?.addEventListener('input', applyFilters);
  applyFilters();

  const fallbackCopy = (text) => {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', 'true');
    area.style.position = 'absolute';
    area.style.opacity = '0';
    area.style.pointerEvents = 'none';
    document.body.appendChild(area);
    area.select();
    document.execCommand('copy');
    area.remove();
  };

  copyButtons.forEach((button) => {
    button.addEventListener('click', async () => {
      const text = button.dataset.copy || '';
      if (!text) return;

      const isEn = document.documentElement.lang === 'en';
      const previous = button.textContent || (isEn ? 'Copy stack' : 'Copiar stack');
      button.disabled = true;

      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(text);
        } else {
          fallbackCopy(text);
        }
        button.textContent = isEn ? 'Copied' : 'Copiado';
      } catch {
        button.textContent = isEn ? 'Copy failed' : 'Copia fallida';
      } finally {
        window.setTimeout(() => {
          button.textContent = previous;
          button.disabled = false;
        }, 1200);
      }
    });
  });

  window.addEventListener('warp:lang-changed', () => {
    const isEn = document.documentElement.lang === 'en';
    root.querySelector('label[for="google-service-filter"]')?.replaceChildren(isEn ? 'Objective' : 'Objetivo');
    root.querySelector('label[for="google-search-service"]')?.replaceChildren(isEn ? 'Search case' : 'Buscar caso');
    if (search) search.placeholder = isEn ? 'Eg: deploy, observability, AI, data...' : 'Ej: deploy, observabilidad, IA, datos...';
    root.querySelectorAll('.google-service-copy').forEach((button) => {
      button.textContent = isEn ? 'Copy stack' : 'Copiar stack';
    });
    updateCount();
  });
}
