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

      const previous = button.textContent || 'Copy link';
      button.disabled = true;

      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(text);
        } else {
          fallbackCopy(text);
        }
        button.textContent = 'Copied';
      } catch {
        button.textContent = 'Copy failed';
      } finally {
        window.setTimeout(() => {
          button.textContent = previous;
          button.disabled = false;
        }, 1200);
      }
    });
  });
}
