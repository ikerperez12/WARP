import * as THREE from 'three';
import { damp } from '../utils/math.js';

export function createScreenTexture() {
  const width = 1536;
  const height = 960;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  const baseCanvas = document.createElement('canvas');
  baseCanvas.width = width;
  baseCanvas.height = height;
  const baseCtx = baseCanvas.getContext('2d');

  function roundedRect(drawCtx, x, y, w, h, r) {
    drawCtx.beginPath();
    drawCtx.moveTo(x + r, y);
    drawCtx.lineTo(x + w - r, y);
    drawCtx.quadraticCurveTo(x + w, y, x + w, y + r);
    drawCtx.lineTo(x + w, y + h - r);
    drawCtx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    drawCtx.lineTo(x + r, y + h);
    drawCtx.quadraticCurveTo(x, y + h, x, y + h - r);
    drawCtx.lineTo(x, y + r);
    drawCtx.quadraticCurveTo(x, y, x + r, y);
    drawCtx.closePath();
  }

  const ide = {
    x: 22,
    y: 16,
    w: 1492,
    h: 928,
    sidebarX: 44,
    codeX: 168,
    codeY: 104,
    codeW: 1312,
    codeH: 590,
    termX: 168,
    termY: 716,
    termW: 1312,
    termH: 184,
  };

  const tabDefinitions = [
    { label: 'hero.config.ts', accent: 'rgba(194, 164, 255, 0.88)' },
    { label: 'scene/laptop.ts', accent: 'rgba(150, 205, 255, 0.88)' },
    { label: 'fx/scroll-driven.ts', accent: 'rgba(148, 236, 197, 0.86)' },
    { label: 'terminal/live.log', accent: 'rgba(247, 189, 146, 0.88)' },
  ];

  const defaultProjectRegistry = [
    {
      id: 'hero_motion_engine',
      name: 'Hero Motion Engine',
      description: 'Coreografia del hero: intro, loops y parallax.',
      language: 'JavaScript',
      stack: ['Three.js', 'Anime.js'],
    },
    {
      id: 'scene_laptop_render',
      name: 'Laptop Scene Render',
      description: 'Pipeline visual del portatil 3D con materiales y luces.',
      language: 'JavaScript',
      stack: ['Three.js', 'PBR'],
    },
    {
      id: 'scroll_driven_fx',
      name: 'Scroll Driven FX',
      description: 'Transiciones por scroll y narrativa visual.',
      language: 'JavaScript',
      stack: ['Timeline', 'IntersectionObserver'],
    },
    {
      id: 'terminal_runtime',
      name: 'Terminal Runtime',
      description: 'Terminal simulada con comandos y estado.',
      language: 'JavaScript',
      stack: ['Canvas UI'],
    },
  ];

  const codeBanks = [
    [
      'import { animate } from "animejs";',
      'const heroTitle = document.querySelector(".hero-title");',
      'const ctas = document.querySelectorAll(".hero-cta .btn");',
      '',
      'animate(heroTitle, {',
      '  opacity: [0, 1],',
      '  translateY: [28, 0],',
      '  duration: 950,',
      '  easing: "out(3)",',
      '});',
      '',
      'animate(ctas, {',
      '  opacity: [0, 1],',
      '  scale: [0.94, 1],',
      '  delay: (_, i) => 120 * i,',
      '});',
    ],
    [
      'import * as THREE from "three";',
      'const scene = new THREE.Scene();',
      'const laptop = createLaptopModel({ quality: "ultra" });',
      '',
      'laptop.setMaterials({',
      '  chassis: { metalness: 0.62, roughness: 0.28 },',
      '  glass: { transmission: 0.9, roughness: 0.05 },',
      '  leds: { intensity: 1.2, accent: "#c084fc" },',
      '});',
      '',
      'renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8));',
      'renderer.toneMappingExposure = 0.98;',
      'renderer.render(scene, camera);',
    ],
    [
      'const state = { pointer: 0, scroll: 0, velocity: 0 };',
      '',
      'function onScroll(progress, velocity) {',
      '  state.scroll = progress;',
      '  state.velocity = velocity;',
      '  laptop.setDepth(0.2 + progress * 0.9);',
      '  laptop.setParallax(progress * 0.8);',
      '  stars.parallax(progress, velocity);',
      '}',
      '',
      'window.addEventListener("scroll", () => {',
      '  const p = readScrollProgress();',
      '  onScroll(p, p - state.scroll);',
      '}, { passive: true });',
    ],
    [
      'visitor@warp:~$ help',
      'commands: help, status, runtime, projects, run <id>, about <id>, demo, launcher, stop',
      '',
      'visitor@warp:~$ status',
      'scene: online | stars: synced | hero: active',
      '',
      'visitor@warp:~$ stack',
      'three.js + anime.js + vite + canvas texture',
      '',
      'visitor@warp:~$ ping',
      'pong :: render loop stable',
    ],
  ];

  const keywordTokens = new Set([
    'const',
    'let',
    'function',
    'return',
    'import',
    'from',
    'export',
    'default',
    'new',
    'window',
    'document',
  ]);

  const terminal = {
    focused: false,
    input: '',
    lines: [],
    history: [],
    historyIndex: -1,
    metrics: {
      scroll: 0,
      velocity: 0,
      time: 0,
      energy: 0,
    },
    milestones: {
      m1: false,
      m2: false,
      m3: false,
    },
  };

  let projectRegistry = defaultProjectRegistry.slice();
  const runtime = {
    phase: 'idle',
    activeProject: null,
    profile: null,
    queue: [],
    queueIndex: 0,
    queueClock: 0,
    traceClock: 0,
    traceIndex: 0,
    startedAtMs: 0,
    completedRuns: 0,
    autoHintClock: 0,
  };

  function getProjectProfile(projectId) {
    switch (projectId) {
      case 'hero_motion_engine':
        return {
          boot: [
            'Loading hero timeline assets...',
            'Binding parallax and pointer easing...',
          ],
          traces: [
            'timeline intro ready',
            'hero text stagger synced',
            'cta micro-interactions online',
            'pointer smoothing stable',
          ],
        };
      case 'scene_laptop_render':
        return {
          boot: [
            'Compiling material graph...',
            'Calibrating rim/key/fill lights...',
          ],
          traces: [
            'pbr roughness tuned',
            'panel reflection pass stable',
            'keyboard emissive wave running',
            'camera damping settled',
          ],
        };
      case 'scroll_driven_fx':
        return {
          boot: [
            'Building scroll timeline...',
            'Registering section progress markers...',
          ],
          traces: [
            'hero fade transition active',
            'screen bloom response tuned',
            'terminal tab synced to scroll',
            'velocity damping healthy',
          ],
        };
      case 'terminal_runtime':
        return {
          boot: [
            'Bootstrapping command parser...',
            'Attaching runtime telemetry bridge...',
          ],
          traces: [
            'command queue idling',
            'history buffer stable',
            'live status bridge active',
            'interactive mode responsive',
          ],
        };
      default:
        return {
          boot: ['Initializing generic project runtime...'],
          traces: ['runtime stable', 'render loop nominal'],
        };
    }
  }

  function buildProjectTraceLine(project, traceIndex, metrics) {
    const profile = runtime.profile || getProjectProfile(project.id);
    const samples = profile.traces || [];
    const sample = samples.length > 0 ? samples[traceIndex % samples.length] : 'runtime stable';
    const scrollPct = (metrics.scroll * 100).toFixed(1);
    const velocity = metrics.velocity.toFixed(2);
    const glow = metrics.energy.toFixed(2);
    return `[${project.id}] ${sample} | scroll ${scrollPct}% | vel ${velocity} | glow ${glow}`;
  }

  function getRuntimeUptimeSec() {
    if (!runtime.startedAtMs) return 0;
    return Math.max(0, (performance.now() - runtime.startedAtMs) / 1000);
  }

  function runNextProjectDemo() {
    if (!projectRegistry.length) return null;
    const next = projectRegistry[runtime.completedRuns % projectRegistry.length];
    queueProjectBoot(next);
    return next;
  }

  function pushLine(text, type = 'info') {
    terminal.lines.push({ text, type, at: performance.now() });
    if (terminal.lines.length > 72) terminal.lines.shift();
  }

  function emitTerminalStatus(status, extra = {}) {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(
      new CustomEvent('warp:terminal-status', {
        detail: { status, ...extra },
      })
    );
  }

  function normalizeProjects(raw) {
    if (!Array.isArray(raw)) return defaultProjectRegistry.slice();
    const cleaned = raw
      .map((item) => {
        if (!item || typeof item !== 'object') return null;
        const id = typeof item.id === 'string' ? item.id.trim() : '';
        const name = typeof item.name === 'string' ? item.name.trim() : '';
        if (!id || !name) return null;
        return {
          id,
          name,
          description: typeof item.description === 'string' ? item.description : '',
          language: typeof item.language === 'string' ? item.language : 'N/A',
          stack: Array.isArray(item.stack) ? item.stack.filter((v) => typeof v === 'string') : [],
        };
      })
      .filter(Boolean);

    return cleaned.length > 0 ? cleaned : defaultProjectRegistry.slice();
  }

  function setProjects(raw) {
    projectRegistry = normalizeProjects(raw);
    pushLine(`[registry] ${projectRegistry.length} project(s) loaded`, 'ok');
    if (runtime.activeProject) {
      const stillAvailable = projectRegistry.some((project) => project.id === runtime.activeProject.id);
      if (!stillAvailable) stopProject('removed from registry');
    }
    emitTerminalStatus('registry-loaded', { count: projectRegistry.length });
  }

  function getProjects() {
    return projectRegistry.slice();
  }

  function findProject(identifier) {
    if (!identifier) return null;
    const query = String(identifier).trim().toLowerCase();
    return (
      projectRegistry.find((project) => project.id.toLowerCase() === query) ||
      projectRegistry.find((project) => project.name.toLowerCase() === query) ||
      null
    );
  }

  function printProjects() {
    pushLine(`projects (${projectRegistry.length}):`, 'ok');
    projectRegistry.forEach((project) => {
      pushLine(`- ${project.id} :: ${project.name} [${project.language}]`, 'hint');
    });
    pushLine('tip: run <id>  |  about <id>  |  demo', 'hint');
  }

  function stopProject(reason = 'stopped by user') {
    if (!runtime.activeProject) return;
    const current = runtime.activeProject;
    pushLine(`[runtime] ${current.name} ${reason}`, 'warn');
    emitTerminalStatus('idle', { projectId: current.id, projectName: current.name });
    runtime.completedRuns += 1;
    runtime.phase = 'idle';
    runtime.activeProject = null;
    runtime.profile = null;
    runtime.queue = [];
    runtime.queueIndex = 0;
    runtime.queueClock = 0;
    runtime.traceClock = 0;
    runtime.traceIndex = 0;
    runtime.startedAtMs = 0;
    runtime.autoHintClock = 0;
  }

  function queueProjectBoot(project) {
    if (!project) return;
    if (runtime.activeProject && runtime.activeProject.id !== project.id) {
      stopProject('preempted');
    }

    const profile = getProjectProfile(project.id);
    runtime.phase = 'booting';
    runtime.activeProject = project;
    runtime.profile = profile;
    runtime.queue = [
      { t: 0.1, text: 'WARP OS v1.0 Inicializando...', type: 'ok' },
      { t: 0.35, text: 'Estableciendo entorno virtual...', type: 'ok' },
      { t: 0.6, text: `Descargando binario [${project.id}.wasm] (simulado)... [##########] 100%`, type: 'ok' },
      { t: 0.86, text: 'Verificando integridad del paquete... OK', type: 'ok' },
      { t: 1.12, text: 'Compilando modulo WebAssembly...', type: 'ok' },
      { t: 1.42, text: 'Montando sistema de archivos virtual (MEMFS)...', type: 'ok' },
      { t: 1.74, text: 'Enlazando I/O y runtime bridge...', type: 'ok' },
      { t: 2.0, text: `Entorno listo. Ejecutando proyecto '${project.name}'`, type: 'ok' },
      { t: 2.2, text: `stack: ${(project.stack || []).join(' + ') || 'n/a'}`, type: 'hint' },
      { t: 2.4, text: project.description || 'Proyecto en ejecucion.', type: 'hint' },
      ...profile.boot.map((line, index) => ({
        t: 2.65 + index * 0.22,
        text: line,
        type: 'hint',
      })),
    ];
    runtime.queueIndex = 0;
    runtime.queueClock = 0;
    runtime.traceClock = 0;
    runtime.traceIndex = 0;
    runtime.startedAtMs = performance.now();
    runtime.autoHintClock = 0;
    terminal.metrics.energy = Math.min(2.8, terminal.metrics.energy + 0.34);

    pushLine(`[launch] ${project.name}`, 'cmd');
    emitTerminalStatus('loading', { projectId: project.id, projectName: project.name });
  }

  function runProjectById(projectId) {
    const project = findProject(projectId);
    if (!project) {
      pushLine(`project not found: ${projectId}`, 'warn');
      pushLine('tip: use "projects" to list available ids', 'hint');
      return false;
    }
    queueProjectBoot(project);
    return true;
  }

  setProjects(defaultProjectRegistry);
  pushLine('[boot] portfolio scene initialized', 'ok');
  pushLine('[hint] click screen and type "help"', 'hint');

  function executeCommand(raw) {
    const input = raw.trim();
    if (!input) return;

    pushLine(`visitor@warp:~$ ${input}`, 'cmd');
    terminal.history.push(input);
    terminal.historyIndex = terminal.history.length;

    const [command, ...rest] = input.split(/\s+/);
    const arg = rest.join(' ').toLowerCase();

    switch (command.toLowerCase()) {
      case 'help':
        pushLine(
          'commands: help, status, runtime, stack, sections, projects, run <id>, about <id>, demo, launcher, stop, focus, clear, glow, ping',
          'ok'
        );
        break;
      case 'status':
        pushLine(
          `scene: online | scroll ${(terminal.metrics.scroll * 100).toFixed(1)}% | velocity ${terminal.metrics.velocity.toFixed(2)} | glow ${terminal.metrics.energy.toFixed(2)} | runtime ${runtime.phase}`,
          'ok'
        );
        if (runtime.activeProject) {
          pushLine(`active project: ${runtime.activeProject.name} (${runtime.activeProject.id})`, 'hint');
        }
        break;
      case 'stack':
        pushLine('stack: Three.js + Anime.js + Vite + CanvasTexture', 'ok');
        break;
      case 'sections':
        pushLine('sections: hero, about, skills, projects, experience, contact', 'ok');
        break;
      case 'projects':
        printProjects();
        break;
      case 'registry':
        pushLine(`registry entries: ${projectRegistry.length}`, 'ok');
        break;
      case 'run': {
        if (!arg) {
          pushLine('usage: run <project-id>', 'hint');
          break;
        }
        runProjectById(arg);
        break;
      }
      case 'open': {
        if (!arg) {
          pushLine('usage: open <project-id>', 'hint');
          break;
        }
        runProjectById(arg);
        break;
      }
      case 'demo': {
        const next = runNextProjectDemo();
        if (!next) {
          pushLine('no projects available', 'warn');
        } else {
          pushLine(`demo launch -> ${next.id}`, 'hint');
        }
        break;
      }
      case 'about': {
        if (!arg) {
          pushLine('usage: about <project-id>', 'hint');
          break;
        }
        const project = findProject(arg);
        if (!project) {
          pushLine(`project not found: ${arg}`, 'warn');
          break;
        }
        pushLine(`${project.name} [${project.id}]`, 'ok');
        pushLine(project.description || 'No description available.', 'hint');
        pushLine(`lang: ${project.language} | stack: ${(project.stack || []).join(' · ') || 'n/a'}`, 'hint');
        break;
      }
      case 'launcher':
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('warp:open-project-list'));
          pushLine('opening accessible launcher...', 'ok');
        }
        break;
      case 'runtime': {
        const uptime = getRuntimeUptimeSec();
        const active = runtime.activeProject ? runtime.activeProject.id : 'none';
        pushLine(
          `runtime: ${runtime.phase} | active: ${active} | uptime: ${uptime.toFixed(1)}s | runs: ${runtime.completedRuns}`,
          'ok'
        );
        break;
      }
      case 'stop':
        if (!runtime.activeProject) {
          pushLine('runtime idle', 'hint');
        } else {
          stopProject('stopped');
        }
        break;
      case 'focus':
        pushLine('focus target: hero laptop + live IDE overlay', 'ok');
        break;
      case 'ping':
        pushLine('pong :: render loop stable', 'ok');
        break;
      case 'glow':
        if (arg === 'up') {
          terminal.metrics.energy = Math.min(2.8, terminal.metrics.energy + 0.22);
          pushLine('glow intensity boosted', 'ok');
        } else if (arg === 'down') {
          terminal.metrics.energy = Math.max(0.1, terminal.metrics.energy - 0.2);
          pushLine('glow intensity reduced', 'ok');
        } else {
          pushLine('usage: glow up | glow down', 'hint');
        }
        break;
      case 'clear':
        terminal.lines = [];
        pushLine('[terminal] cleared', 'ok');
        break;
      default:
        pushLine(`unknown command: ${command}`, 'warn');
        pushLine('tip: type "help"', 'hint');
    }
  }

  function setFocus(focused) {
    if (terminal.focused === focused) return;
    terminal.focused = focused;
    if (focused) {
      pushLine('[interactive] terminal focus enabled', 'ok');
      emitTerminalStatus('focus-on');
    } else {
      pushLine('[interactive] terminal focus released', 'hint');
      emitTerminalStatus('focus-off');
    }
  }

  function handleKeyDown(event) {
    const target = event.target;
    const isTypingTarget =
      target &&
      (target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable);

    if (!terminal.focused) {
      if (isTypingTarget) return false;
      if ((event.ctrlKey && event.key.toLowerCase() === 'i') || event.key === '`') {
        setFocus(true);
        return true;
      }
      return false;
    }

    if (event.key === 'Escape') {
      setFocus(false);
      return true;
    }

    if (event.key === 'Enter') {
      executeCommand(terminal.input);
      terminal.input = '';
      return true;
    }

    if (event.key === 'Backspace') {
      terminal.input = terminal.input.slice(0, -1);
      return true;
    }

    if (event.key === 'ArrowUp') {
      if (terminal.history.length > 0) {
        terminal.historyIndex = Math.max(0, terminal.historyIndex - 1);
        terminal.input = terminal.history[terminal.historyIndex] || '';
      }
      return true;
    }

    if (event.key === 'ArrowDown') {
      if (terminal.history.length > 0) {
        terminal.historyIndex = Math.min(terminal.history.length, terminal.historyIndex + 1);
        terminal.input = terminal.history[terminal.historyIndex] || '';
      }
      return true;
    }

    if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
      terminal.input += event.key;
      return true;
    }

    return false;
  }

  function tokenizeCode(line) {
    return line.match(/(\".*?\"|\'.*?\'|`.*?`|\/\/.*|[A-Za-z_]\w*|\d+|[^\sA-Za-z_])/g) || [''];
  }

  function tokenColor(token) {
    if (!token) return 'rgba(224, 234, 255, 0.84)';
    if (token.startsWith('//')) return 'rgba(160, 176, 215, 0.78)';
    if (token[0] === '"' || token[0] === "'" || token[0] === '`') return 'rgba(237, 198, 255, 0.97)';
    if (keywordTokens.has(token)) return 'rgba(162, 212, 255, 0.98)';
    if (/^\d+$/.test(token)) return 'rgba(255, 196, 196, 0.95)';
    if (/^[{}()[\].,;:+\-*/<>!=]+$/.test(token)) return 'rgba(176, 196, 238, 0.9)';
    return 'rgba(228, 236, 255, 0.95)';
  }

  // Pre-tokenize all code lines once to avoid repeating regex tokenization on every frame.
  const tokenizedCodeBanks = codeBanks.map((bank) =>
    bank.map((line) =>
      tokenizeCode(line).map((token) => ({
        token,
        color: tokenColor(token),
      }))
    )
  );

  function drawBase() {
    const bg = baseCtx.createLinearGradient(0, 0, width, height);
    bg.addColorStop(0, '#090d1a');
    bg.addColorStop(0.45, '#0f1632');
    bg.addColorStop(1, '#0b1023');
    baseCtx.fillStyle = bg;
    baseCtx.fillRect(0, 0, width, height);

    const nebulaA = baseCtx.createRadialGradient(width * 0.2, height * 0.26, 0, width * 0.2, height * 0.26, width * 0.58);
    nebulaA.addColorStop(0, 'rgba(155,100,255,0.34)');
    nebulaA.addColorStop(1, 'rgba(155,100,255,0)');
    baseCtx.fillStyle = nebulaA;
    baseCtx.fillRect(0, 0, width, height);

    const nebulaB = baseCtx.createRadialGradient(width * 0.82, height * 0.74, 0, width * 0.82, height * 0.74, width * 0.54);
    nebulaB.addColorStop(0, 'rgba(96,165,250,0.32)');
    nebulaB.addColorStop(1, 'rgba(96,165,250,0)');
    baseCtx.fillStyle = nebulaB;
    baseCtx.fillRect(0, 0, width, height);

    roundedRect(baseCtx, ide.x, ide.y, ide.w, ide.h, 12);
    baseCtx.fillStyle = 'rgba(7, 10, 20, 0.86)';
    baseCtx.fill();
    baseCtx.strokeStyle = 'rgba(170, 190, 248, 0.1)';
    baseCtx.lineWidth = 1;
    baseCtx.stroke();

    roundedRect(baseCtx, ide.x + 1, ide.y + 1, ide.w - 2, 46, 10);
    baseCtx.fillStyle = 'rgba(22, 34, 68, 0.72)';
    baseCtx.fill();

    const dots = ['#fb7185', '#f59e0b', '#34d399'];
    dots.forEach((color, i) => {
      baseCtx.beginPath();
      baseCtx.fillStyle = color;
      baseCtx.globalAlpha = 0.8;
      baseCtx.arc(ide.x + 24 + i * 18, ide.y + 26, 5, 0, Math.PI * 2);
      baseCtx.fill();
    });
    baseCtx.globalAlpha = 1;

    // Window controls (minimize / maximize / close) for terminal UX cues
    const controlY = ide.y + 19;
    const controlX = ide.x + ide.w - 118;
    roundedRect(baseCtx, controlX, controlY, 90, 16, 8);
    baseCtx.fillStyle = 'rgba(28, 38, 73, 0.62)';
    baseCtx.fill();
    baseCtx.strokeStyle = 'rgba(148, 170, 230, 0.24)';
    baseCtx.stroke();

    baseCtx.fillStyle = 'rgba(192, 205, 238, 0.74)';
    baseCtx.fillRect(controlX + 14, controlY + 8, 12, 1.4);
    baseCtx.strokeStyle = 'rgba(192, 205, 238, 0.78)';
    baseCtx.strokeRect(controlX + 39, controlY + 5, 9, 7);
    baseCtx.beginPath();
    baseCtx.strokeStyle = 'rgba(255, 164, 180, 0.9)';
    baseCtx.moveTo(controlX + 63, controlY + 5);
    baseCtx.lineTo(controlX + 76, controlY + 12);
    baseCtx.moveTo(controlX + 76, controlY + 5);
    baseCtx.lineTo(controlX + 63, controlY + 12);
    baseCtx.stroke();

    roundedRect(baseCtx, ide.sidebarX, ide.y + 58, 92, ide.h - 126, 8);
    baseCtx.fillStyle = 'rgba(14, 21, 42, 0.72)';
    baseCtx.fill();

    for (let i = 0; i < 14; i++) {
      roundedRect(baseCtx, ide.sidebarX + 17, ide.y + 82 + i * 42, 58, 8, 4);
      baseCtx.fillStyle = i === 2 ? 'rgba(194, 164, 255, 0.88)' : 'rgba(130, 150, 206, 0.42)';
      baseCtx.fill();
    }

    roundedRect(baseCtx, ide.codeX - 18, ide.codeY - 16, ide.codeW, ide.codeH + 12, 8);
    baseCtx.fillStyle = 'rgba(7, 11, 24, 0.88)';
    baseCtx.fill();

    roundedRect(baseCtx, ide.termX - 18, ide.termY - 12, ide.termW, ide.termH, 8);
    baseCtx.fillStyle = 'rgba(7, 12, 24, 0.9)';
    baseCtx.fill();

    roundedRect(baseCtx, ide.x + ide.w - 34, ide.codeY - 10, 10, ide.codeH - 20, 3);
    baseCtx.fillStyle = 'rgba(98, 118, 175, 0.25)';
    baseCtx.fill();
  }

  drawBase();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;

  let visualScroll = 0;
  let visualVelocity = 0;
  let energy = 0;
  let cursorBlink = 0;
  let lastTick = -1;
  let lastScroll = 0;
  let autoLogTime = 0;
  let activeTabIndex = 0;

  function update(time, scrollProgress, scrollVelocity = 0, dt = 1 / 60) {
    const delta = Math.min(Math.max(dt, 1 / 180), 1 / 20);
    if (time - lastTick < 0.032 && Math.abs(scrollProgress - lastScroll) < 0.002 && Math.abs(scrollVelocity) < 0.01 && !terminal.focused) return;
    lastTick = time;
    lastScroll = scrollProgress;

    visualVelocity = damp(visualVelocity, Math.abs(scrollVelocity), 7.5, delta);
    energy = damp(energy, 0.22 + scrollProgress * 0.92 + visualVelocity * 0.42 + terminal.metrics.energy * 0.06, 4.8, delta);
    const scrollKick = Math.sign(scrollVelocity) * Math.min(Math.abs(scrollVelocity) * 90, 200);
    visualScroll = damp(visualScroll, scrollProgress * 860 + time * 8 + scrollKick, 5.3, delta);
    cursorBlink += delta;
    autoLogTime += delta;

    let nextTabIndex = 0;
    if (scrollProgress >= 0.3) nextTabIndex = 1;
    if (scrollProgress >= 0.58) nextTabIndex = 2;
    if (scrollProgress >= 0.82) nextTabIndex = 3;
    if (runtime.phase !== 'idle' && terminal.focused) nextTabIndex = 3;
    if (nextTabIndex !== activeTabIndex) {
      activeTabIndex = nextTabIndex;
      pushLine(`[tab] switched to ${tabDefinitions[activeTabIndex].label}`, 'ok');
    }

    terminal.metrics.scroll = scrollProgress;
    terminal.metrics.velocity = scrollVelocity;
    terminal.metrics.time = time;
    terminal.metrics.energy = energy;

    if (scrollProgress > 0.12 && !terminal.milestones.m1) {
      terminal.milestones.m1 = true;
      pushLine('[event] scene::stage one synced', 'ok');
    }
    if (scrollProgress > 0.35 && !terminal.milestones.m2) {
      terminal.milestones.m2 = true;
      pushLine('[event] scene::deep parallax enabled', 'ok');
    }
    if (scrollProgress > 0.62 && !terminal.milestones.m3) {
      terminal.milestones.m3 = true;
      pushLine('[event] viewport::docs mode active', 'ok');
    }

    if (runtime.phase === 'booting' && runtime.activeProject) {
      runtime.queueClock += delta;
      while (
        runtime.queueIndex < runtime.queue.length &&
        runtime.queueClock >= runtime.queue[runtime.queueIndex].t
      ) {
        const step = runtime.queue[runtime.queueIndex];
        pushLine(step.text, step.type || 'info');
        runtime.queueIndex += 1;
      }

      if (runtime.queueIndex >= runtime.queue.length) {
        runtime.phase = 'running';
        runtime.traceClock = 0;
        emitTerminalStatus('running', {
          projectId: runtime.activeProject.id,
          projectName: runtime.activeProject.name,
        });
      }
    }

    if (runtime.phase === 'running' && runtime.activeProject) {
      runtime.traceClock += delta;
      if (runtime.traceClock > 4.8) {
        runtime.traceClock = 0;
        const trace = buildProjectTraceLine(runtime.activeProject, runtime.traceIndex, terminal.metrics);
        runtime.traceIndex += 1;
        pushLine(trace, 'hint');
      }
    }

    if (runtime.phase === 'idle') {
      runtime.autoHintClock += delta;
      if (runtime.autoHintClock > 12) {
        runtime.autoHintClock = 0;
        pushLine('[hint] use "projects" or "launcher" to explore demos', 'hint');
      }
    }

    if (!terminal.focused && autoLogTime > 3.2) {
      autoLogTime = 0;
      pushLine(`[trace] orbit ${(0.44 + scrollProgress * 0.7).toFixed(2)} | render stable`, 'hint');
    }

    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(baseCanvas, 0, 0);

    const tabX = ide.codeX - 18;
    const tabY = ide.codeY - 52;
    const tabW = 270;
    const tabH = 30;
    tabDefinitions.forEach((tab, index) => {
      const x = tabX + index * (tabW - 8);
      roundedRect(ctx, x, tabY, tabW, tabH, 8);
      const selected = index === activeTabIndex;
      ctx.fillStyle = selected ? `rgba(25, 37, 74, ${0.84 + energy * 0.06})` : 'rgba(11, 16, 31, 0.72)';
      ctx.fill();
      ctx.strokeStyle = selected ? tab.accent : 'rgba(142, 164, 220, 0.2)';
      ctx.lineWidth = selected ? 1.4 : 1;
      ctx.stroke();
      ctx.fillStyle = selected ? 'rgba(234, 241, 255, 0.95)' : 'rgba(162, 178, 222, 0.76)';
      ctx.font = '16px "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
      ctx.fillText(tab.label, x + 12, tabY + 20);
    });

    const activeCode = codeBanks[activeTabIndex] || codeBanks[0];
    const activeCodeTokens = tokenizedCodeBanks[activeTabIndex] || tokenizedCodeBanks[0];

    const lineHeight = 31;
    const firstLine = Math.floor(visualScroll / lineHeight);
    const offsetY = visualScroll % lineHeight;
    const visibleLines = 17;

    ctx.save();
    ctx.beginPath();
    roundedRect(ctx, ide.codeX - 18, ide.codeY - 16, ide.codeW, ide.codeH + 12, 11);
    ctx.clip();

    ctx.font = '19px "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
    ctx.textBaseline = 'middle';

    for (let i = -1; i < visibleLines; i++) {
      const lineIndex = (firstLine + i + activeCode.length * 32) % activeCode.length;
      const line = activeCode[lineIndex];
      const y = ide.codeY + i * lineHeight - offsetY;

      if (lineIndex === 4 || lineIndex === 5 || lineIndex === 6) {
        roundedRect(ctx, ide.codeX + 8, y - 11, ide.codeW - 68, 22, 7);
        ctx.fillStyle = `rgba(120, 92, 255, ${0.11 + energy * 0.04})`;
        ctx.fill();
      }

      ctx.fillStyle = 'rgba(152, 168, 206, 0.72)';
      ctx.fillText(String(((lineIndex % 54) + 1)).padStart(2, ' '), ide.codeX + 8, y);

      let cursorX = ide.codeX + 50;
      const tokens = activeCodeTokens[lineIndex] || [];
      tokens.forEach(({ token, color }) => {
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.86 + energy * 0.1;
        ctx.fillText(token, cursorX, y);
        cursorX += ctx.measureText(token).width + 8;
      });
      ctx.globalAlpha = 1;
    }

    ctx.restore();

    const terminalRows = terminal.lines.slice(-6);
    ctx.font = '16px "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
    terminalRows.forEach((entry, i) => {
      let color = 'rgba(146, 170, 226, 0.72)';
      if (entry.type === 'ok') color = 'rgba(172, 244, 196, 0.82)';
      if (entry.type === 'warn') color = 'rgba(255, 191, 168, 0.85)';
      if (entry.type === 'cmd') color = 'rgba(208, 219, 255, 0.9)';
      if (entry.type === 'hint') color = 'rgba(156, 178, 230, 0.72)';
      ctx.fillStyle = color;
      ctx.fillText(entry.text, ide.termX, ide.termY + 18 + i * 22);
    });

    const promptY = ide.termY + ide.termH - 24;
    ctx.fillStyle = terminal.focused ? 'rgba(224, 236, 255, 0.94)' : 'rgba(153, 172, 221, 0.74)';
    ctx.fillText('visitor@warp:~$ ', ide.termX, promptY);

    const promptOffset = ctx.measureText('visitor@warp:~$ ').width;
    const visibleInput = terminal.input.slice(-76);
    ctx.fillStyle = 'rgba(236, 240, 255, 0.92)';
    ctx.fillText(visibleInput, ide.termX + promptOffset, promptY);

    if (terminal.focused && Math.sin(cursorBlink * 5.2) > 0) {
      const caretX = ide.termX + promptOffset + ctx.measureText(visibleInput).width + 2;
      ctx.fillStyle = `rgba(247, 212, 255, ${0.55 + energy * 0.35})`;
      ctx.fillRect(caretX, promptY - 9, 2, 17);
    }

    if (!terminal.focused) {
      ctx.fillStyle = 'rgba(172, 188, 229, 0.58)';
      ctx.font = '15px "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
      ctx.fillText('click screen or press Ctrl+I · type "projects" or "launcher"', ide.termX + 344, promptY);
    }

    const activityWidth = 60 + scrollProgress * 420 + (Math.sin(time * 3.2) * 20 + 20);
    roundedRect(ctx, ide.termX, ide.termY + ide.termH - 7, activityWidth, 4, 2);
    ctx.fillStyle = `rgba(172, 224, 255, ${0.24 + energy * 0.22})`;
    ctx.fill();

    const screenGlow = ctx.createRadialGradient(width * 0.5, height * 0.56, 0, width * 0.5, height * 0.56, width * 0.68);
    screenGlow.addColorStop(0, `rgba(125, 106, 255, ${0.13 + energy * 0.07})`);
    screenGlow.addColorStop(1, 'rgba(125, 106, 255, 0)');
    ctx.fillStyle = screenGlow;
    ctx.fillRect(0, 0, width, height);

    const reflect = ctx.createLinearGradient(width * 0.08, height * 0.14, width * 0.86, height * 0.86);
    reflect.addColorStop(0, 'rgba(255,255,255,0)');
    reflect.addColorStop(0.45, `rgba(255,255,255,${0.04 + energy * 0.02})`);
    reflect.addColorStop(0.58, 'rgba(255,255,255,0.01)');
    reflect.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = reflect;
    ctx.fillRect(0, 0, width, height);

    ctx.globalAlpha = 0.05 + energy * 0.04;
    for (let i = 0; i < 36; i++) {
      const y = (i / 35) * height;
      ctx.fillStyle = i % 2 === 0 ? '#cbc4ff' : '#8eb6ff';
      ctx.fillRect(0, y, width, 1);
    }
    ctx.globalAlpha = 1;

    texture.needsUpdate = true;
  }

  update(0, 0, 0, 1 / 60);

  return {
    texture,
    update,
    setFocus,
    handleKeyDown,
    setProjects,
    runProjectById,
    getProjects,
    isFocused: () => terminal.focused,
  };
}
