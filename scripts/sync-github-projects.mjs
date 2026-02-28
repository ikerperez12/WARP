import { writeFile } from 'node:fs/promises';

const USERNAME = 'ikerperez12';
const OUTPUT_PATH = new URL('../public/projects.json', import.meta.url);

const REPO_OVERRIDES = {
  WARP: {
    displayName: 'WARP Portfolio 3D',
    description: 'Portfolio inmersivo con Three.js, motion design y una interfaz cuidada para presentar trabajo tecnico con identidad propia.',
    impact: 'Unifica marca personal, casos tecnicos y visualizacion interactiva en una sola experiencia web.',
    domain: 'web frontend ux production core',
    stack: ['Vite', 'Three.js', 'Anime.js', 'Vercel'],
    accent: 'accent-1',
    featured: true,
  },
  '1.2-AuditoriaPQC': {
    displayName: 'Auditoria PQC',
    description: 'Analisis aplicado de protocolos criptograficos post-cuanticos, trazas de red y validacion de seguridad en laboratorio.',
    impact: 'Refuerza criterio tecnico en criptografia, auditoria y evaluacion de riesgo.',
    domain: 'security backend data production core',
    stack: ['Python', 'PQC', 'Wireshark', 'Auditing'],
    accent: 'accent-3',
    featured: true,
  },
  GPT_CMD: {
    displayName: 'GPT CMD',
    description: 'CLI experimental para automatizar flujos asistidos por IA y acelerar tareas repetitivas en entorno tecnico.',
    impact: 'Reduce tiempo operativo en prompts, ejecucion y experimentacion local.',
    domain: 'ai backend exploratory core',
    stack: ['Python', 'CLI', 'LLM Ops'],
    accent: 'accent-2',
    featured: true,
  },
  ISD: {
    displayName: 'Internet y Sistemas Distribuidos',
    description: 'Repositorio de practicas y entregables sobre APIs, servicios distribuidos, despliegue y comunicacion entre componentes.',
    impact: 'Muestra base solida en arquitectura distribuida y servicios backend.',
    language: 'Java',
    domain: 'backend cloud production core',
    stack: ['Java', 'REST', 'Docker', 'PostgreSQL'],
    accent: 'accent-4',
    featured: true,
  },
  'SO-SHELL-p2': {
    displayName: 'Shell y Sistemas Operativos',
    description: 'Implementacion academica centrada en shell, procesos, concurrencia y fundamentos de sistemas.',
    impact: 'Aporta profundidad en sistemas, bajo nivel y diagnostico de comportamiento.',
    domain: 'systems backend core exploratory',
    stack: ['C', 'POSIX', 'Shell', 'Processes'],
    accent: 'accent-1',
    featured: true,
  },
  'SO-2324': {
    displayName: 'Sistemas Operativos 23/24',
    description: 'Coleccion de practicas y ejercicios sobre gestion de procesos, memoria y herramientas de sistemas.',
    impact: 'Consolida fundamentos para software robusto y cercano a infraestructura.',
    language: 'C',
    domain: 'systems backend exploratory',
    stack: ['C', 'Linux', 'Diagnostics'],
    accent: 'accent-2',
    featured: true,
  },
  'Software-Design': {
    displayName: 'Software Design',
    description: 'Trabajo orientado a modelado de software, estructura de dominio y patrones de diseno aplicados.',
    impact: 'Refuerza base de analisis, modelado y mantenimiento de sistemas complejos.',
    language: 'Java',
    domain: 'backend core production',
    stack: ['Java', 'Design Patterns', 'Modeling'],
    accent: 'accent-3',
  },
  'Basketball-API': {
    displayName: 'Basketball API',
    description: 'Backend con API REST y capa web para exponer datos y flujos funcionales sobre dominio deportivo.',
    impact: 'Demuestra integracion de backend, routing y presentacion sobre una misma base de codigo.',
    language: 'Python',
    domain: 'frontend backend production core',
    stack: ['Python', 'Django', 'REST API', 'Frontend'],
    accent: 'accent-4',
  },
};

const DEFAULT_DESCRIPTIONS = {
  JavaScript: 'Desarrollo frontend y experiencia de usuario con foco en interaccion y rendimiento.',
  TypeScript: 'Aplicacion tipada para mejorar mantenibilidad, contratos y calidad del desarrollo.',
  Python: 'Automatizacion, analisis y tooling tecnico con enfoque practico.',
  Java: 'Servicios backend y modelado de aplicaciones empresariales.',
  C: 'Trabajo de bajo nivel orientado a sistemas, memoria y procesos.',
};

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function inferDomain(repo) {
  const source = `${repo.name} ${repo.description || ''} ${(repo.topics || []).join(' ')}`.toLowerCase();
  const tags = new Set();

  if (/three|react|vite|web|portfolio|frontend|ui|ux/.test(source)) tags.add('frontend');
  if (/api|spring|backend|server|micro|distributed|isd|postgres|sql/.test(source)) tags.add('backend');
  if (/docker|cloud|deploy|infra|aws|azure|ci|cd/.test(source)) tags.add('cloud');
  if (/security|audit|pqc|crypto|wire|hardening/.test(source)) tags.add('security');
  if (/ai|ml|llm|gpt|ollama|kaggle|nlp/.test(source)) tags.add('ai');
  if (/shell|linux|system|so-|operat|c\b|process/.test(source)) tags.add('systems');

  tags.add('production');
  if (!tags.size) tags.add('core');
  if (repo.language === 'C' || repo.language === 'Python') tags.add('core');
  if (/lab|experiment|demo|cmd/.test(source)) tags.add('exploratory');

  return Array.from(tags).join(' ');
}

function inferStack(repo, override) {
  if (override?.stack?.length) return override.stack;
  const stack = [];
  if (repo.language) stack.push(repo.language);
  (repo.topics || []).slice(0, 3).forEach((topic) => stack.push(topic));
  if (!stack.length) stack.push('GitHub', 'Code', 'Engineering');
  return Array.from(new Set(stack)).slice(0, 4);
}

function inferDescription(repo, override) {
  if (override?.description) return override.description;
  if (repo.description) return repo.description;
  return DEFAULT_DESCRIPTIONS[repo.language] || 'Proyecto tecnico orientado a construccion, aprendizaje aplicado y mejora continua.';
}

function inferImpact(repo, override) {
  if (override?.impact) return override.impact;
  if (repo.homepage) return 'Cuenta con despliegue o enlace publico para validar resultado y ejecucion real.';
  if ((repo.stargazers_count || 0) > 0) return 'Ha generado interes publico y sirve como pieza visible del portfolio tecnico.';
  return 'Aporta evidencia practica del stack, el criterio tecnico y la capacidad de entrega.';
}

function inferLanguage(repo, override) {
  if (override?.language) return override.language;
  return repo.language || 'Code';
}

function buildImageUrl(repo) {
  return `https://opengraph.githubassets.com/1/${USERNAME}/${repo.name}`;
}

function pickRepos(repos) {
  return repos
    .filter((repo) => !repo.fork && !repo.archived)
    .sort((a, b) => {
      const aFeatured = REPO_OVERRIDES[a.name]?.featured ? 1 : 0;
      const bFeatured = REPO_OVERRIDES[b.name]?.featured ? 1 : 0;
      if (aFeatured !== bFeatured) return bFeatured - aFeatured;
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    })
    .slice(0, 8);
}

async function main() {
  const response = await fetch(`https://api.github.com/users/${USERNAME}/repos?per_page=100&sort=updated`, {
    headers: { 'User-Agent': 'WARP-sync-script', Accept: 'application/vnd.github+json' },
  });

  if (!response.ok) {
    throw new Error(`GitHub API error ${response.status}`);
  }

  const repos = await response.json();
  const selected = pickRepos(repos).map((repo, index) => {
    const override = REPO_OVERRIDES[repo.name] || {};
    return {
      id: slugify(override.displayName || repo.name),
      repoName: repo.name,
      name: override.displayName || repo.name,
      description: inferDescription(repo, override),
      impact: inferImpact(repo, override),
      language: inferLanguage(repo, override),
      stack: inferStack(repo, override),
      domain: override.domain || inferDomain(repo),
      githubUrl: repo.html_url,
      demoUrl: repo.homepage || '',
      imageUrl: buildImageUrl(repo),
      imageAlt: `Vista previa del repositorio ${override.displayName || repo.name}`,
      stars: Number(repo.stargazers_count || 0),
      forks: Number(repo.forks_count || 0),
      updatedAt: repo.updated_at,
      accent: override.accent || `accent-${(index % 4) + 1}`,
      featured: Boolean(override.featured),
    };
  });

  await writeFile(OUTPUT_PATH, `${JSON.stringify(selected, null, 2)}\n`, 'utf8');
  console.log(`Synced ${selected.length} projects to ${OUTPUT_PATH.pathname}`);
}

main().catch((error) => {
  console.error('[sync:projects] failed', error);
  process.exitCode = 1;
});
