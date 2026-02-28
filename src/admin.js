const state = {
  authenticated: false,
};

const els = {
  loginCard: document.getElementById('admin-login-card'),
  loginForm: document.getElementById('admin-login-form'),
  loginStatus: document.getElementById('admin-login-status'),
  logout: document.getElementById('admin-logout'),
  refreshPreview: document.getElementById('admin-refresh-preview'),
  contentCard: document.getElementById('admin-content-card'),
  projectsCard: document.getElementById('admin-projects-card'),
  contentForm: document.getElementById('admin-content-form'),
  projectsForm: document.getElementById('admin-projects-form'),
  contentEditor: document.getElementById('admin-content-editor'),
  projectsEditor: document.getElementById('admin-projects-editor'),
  contentStatus: document.getElementById('admin-content-status'),
  projectsStatus: document.getElementById('admin-projects-status'),
  previewFrame: document.getElementById('admin-preview-frame'),
};

boot();

async function boot() {
  bindEvents();
  await checkSession();
}

function bindEvents() {
  els.loginForm?.addEventListener('submit', onLogin);
  els.logout?.addEventListener('click', onLogout);
  els.contentForm?.addEventListener('submit', (event) => onSaveJson(event, {
    editor: els.contentEditor,
    endpoint: '/api/admin-content',
    status: els.contentStatus,
    success: 'Contenido guardado.',
  }));
  els.projectsForm?.addEventListener('submit', (event) => onSaveJson(event, {
    editor: els.projectsEditor,
    endpoint: '/api/admin-projects',
    status: els.projectsStatus,
    success: 'Proyectos guardados.',
  }));
  els.refreshPreview?.addEventListener('click', () => reloadPreview());
}

async function checkSession() {
  const response = await fetch('/api/admin-session', { credentials: 'same-origin' });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload?.authenticated) {
    renderAuth(false);
    return;
  }

  state.authenticated = true;
  renderAuth(true);
  await Promise.all([loadContent(), loadProjects()]);
}

function renderAuth(authenticated) {
  state.authenticated = authenticated;
  els.loginCard?.classList.toggle('admin-hidden', authenticated);
  els.contentCard?.classList.toggle('admin-hidden', !authenticated);
  els.projectsCard?.classList.toggle('admin-hidden', !authenticated);
  els.logout?.classList.toggle('admin-hidden', !authenticated);
}

async function onLogin(event) {
  event.preventDefault();
  setStatus(els.loginStatus, 'Validando acceso...');
  const formData = new FormData(event.currentTarget);
  const response = await fetch('/api/admin-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify({
      username: formData.get('username'),
      password: formData.get('password'),
    }),
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    setStatus(els.loginStatus, payload?.error || 'No se pudo iniciar sesion.', true);
    return;
  }

  event.currentTarget.reset();
  setStatus(els.loginStatus, 'Sesion iniciada.', false, true);
  renderAuth(true);
  await Promise.all([loadContent(), loadProjects()]);
  reloadPreview();
}

async function onLogout() {
  await fetch('/api/admin-logout', { method: 'POST', credentials: 'same-origin' });
  renderAuth(false);
  setStatus(els.loginStatus, 'Sesion cerrada.', false, true);
}

async function loadContent() {
  const response = await fetch('/api/admin-content', { credentials: 'same-origin' });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    setStatus(els.contentStatus, payload?.error || 'No se pudo cargar el contenido.', true);
    return;
  }
  els.contentEditor.value = JSON.stringify(payload.data, null, 2);
  setStatus(els.contentStatus, 'Contenido cargado.', false, true);
}

async function loadProjects() {
  const response = await fetch('/api/admin-projects', { credentials: 'same-origin' });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    setStatus(els.projectsStatus, payload?.error || 'No se pudieron cargar los proyectos.', true);
    return;
  }
  els.projectsEditor.value = JSON.stringify(payload.data, null, 2);
  setStatus(els.projectsStatus, 'Proyectos cargados.', false, true);
}

async function onSaveJson(event, config) {
  event.preventDefault();
  let parsed;

  try {
    parsed = JSON.parse(config.editor.value);
  } catch (error) {
    setStatus(config.status, `JSON invalido: ${error.message}`, true);
    return;
  }

  setStatus(config.status, 'Guardando...');
  const response = await fetch(config.endpoint, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify(parsed),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    setStatus(config.status, payload?.error || 'No se pudo guardar.', true);
    return;
  }

  setStatus(config.status, config.success, false, true);
  reloadPreview();
}

function reloadPreview() {
  if (!els.previewFrame) return;
  const nextUrl = new URL('/', window.location.origin);
  nextUrl.searchParams.set('preview', String(Date.now()));
  els.previewFrame.src = nextUrl.toString();
}

function setStatus(node, message, isError = false, isOk = false) {
  if (!node) return;
  node.textContent = message;
  node.classList.toggle('is-error', Boolean(isError));
  node.classList.toggle('is-ok', Boolean(isOk));
}

