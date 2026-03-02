const copy = {
  es: {
    meta: { title: 'WARP Red Cyber Ops' },
    hud: {
      system: 'Red Cyber Ops',
      score: 'Score',
      integrity: 'Integrity',
      energy: 'Energy',
      mode: 'Modo',
      sector: 'Sector',
      status: 'Estado',
      objective: 'Objetivo',
      minimap: 'Mapa',
      minimapHint: 'Radar del distrito activo',
      alarm: 'Alarma',
      overflow: 'Overflow',
      overload: 'Overload',
      ready: 'Sistema estable',
      pylons: 'Pylons {count}/{total}',
      promptIdle: 'Explora el distrito activo y ac\u00e9rcate a una baliza interactiva.',
    },
    modes: { vehicle: 'Veh\u00edculo', foot: 'A pie' },
    sectors: {
      'boot-relay': 'Boot Relay',
      'firewall-sector': 'Firewall Sector',
      'routing-array': 'Routing Array',
      'inference-core': 'Inference Core',
      'core-chamber': 'Core Chamber',
    },
    start: {
      tag: 'Simulacion tactica',
      title: 'WARP Red Cyber Ops',
      lead: 'Simulacion tecnologica explorable con conduccion arcade, infiltracion a pie y tres operaciones conectadas dentro del mismo sistema.',
      blockA: {
        title: 'Veh\u00edculo',
        body: 'Cruza distritos, alimenta nodos y abre rutas con un control directo y r\u00e1pido.',
      },
      blockB: {
        title: 'A pie',
        body: 'Resuelve intrusiones, routing e inferencia con timing y lectura visual.',
      },
      blockC: {
        title: 'Cadena de misiones',
        body: 'Cinco fases enlazadas, progreso persistente y cierre en el nucleo central.',
      },
      metricA: {
        title: 'Cinco sectores',
        body: 'Boot Relay, Firewall, Routing, Inference y el core final dentro de una sola corrida.',
      },
      metricB: {
        title: 'Recorrido hibrido',
        body: 'Conduce, desembarca y cambia de modo solo cuando la operacion lo permite.',
      },
      metricC: {
        title: 'Partida persistente',
        body: 'Progreso local, score acumulado y reinicio limpio desde pausa o victoria.',
      },
      railA: {
        title: 'Boot Relay',
        body: 'Arranca el nodo, aprende la transici\u00f3n y abre el primer corredor.',
      },
      railB: {
        title: 'Firewall Sector',
        body: 'Infiltraci\u00f3n roja, shards, l\u00e1seres y secuencia de nodos.',
      },
      railC: {
        title: 'Routing + AI',
        body: 'Backbone azul, c\u00e1mara violeta y reinicio final del sistema.',
      },
      controlA: 'WASD / Flechas',
      controlB: 'E Interactuar',
      controlC: 'Shift Boost / Dash',
      controlD: 'Tab Intel',
      controlE: 'Esc Pausa',
    },
    pause: {
      tag: 'Pausa',
      title: 'Operacion en standby',
      lead: 'Ajusta preferencias, reinicia la simulacion o vuelve al dashboard del portfolio.',
    },
    gameOver: {
      tag: 'Conexi\u00f3n perdida',
      title: 'Sistema comprometido',
      lead: 'La integridad de la operaci\u00f3n ha ca\u00eddo a cero.',
      securityLead: 'La alarma del firewall ha alcanzado el nivel cr\u00edtico.',
      routingLead: 'El backbone ha colapsado por saturaci\u00f3n de rutas.',
      inferenceLead: 'El n\u00facleo de inferencia ha entrado en overload cr\u00edtico.',
    },
    victory: {
      tag: 'Core online',
      title: 'Reinicio completado',
      lead: 'La red vuelve a estar estable. Puedes reiniciar la simulacion o regresar al portfolio principal.',
      score: 'Score final',
    },
    toast: { tag: 'Actualizaci\u00f3n de misi\u00f3n' },
    loading: {
      tag: 'Carga',
      title: 'Inicializando distrito',
      lead: 'Importando mallas, materiales, senaletica y sistemas del distrito.',
      assets: 'Sincronizando escena 3D',
      ready: 'Sistema listo',
    },
    panel: {
      tag: 'Bit\u00e1cora',
      title: 'Briefing tactico',
      progress: 'Progreso',
      bestScores: 'Mejores scores',
      controls: 'Controles',
      controlsBody: 'Tab abre este panel. Esc pausa. E interactua. Q cambia de modo en dock pads.',
      progressValue: '{completed} / {total}',
      bestScoresValue: 'SEC {security} \u00b7 NET {routing} \u00b7 AI {inference}',
    },
    fallback: {
      tag: 'Compatibilidad',
      title: 'WebGL no disponible',
      lead: 'Tu navegador o GPU no exponen el contexto gr\u00e1fico necesario para cargar Red Cyber Ops.',
      loadFailed: 'No se pudo terminar de montar el distrito 3D. Recarga la pagina e intentalo de nuevo.',
    },
    settings: {
      quality: 'Calidad',
      theme: 'Tema',
      language: 'Idioma',
      controls: 'Controles',
      controlsBody: 'Cambia de modo en los dock pads. En movil se activa joystick virtual automaticamente.',
      themeToggleDark: 'Pasar a claro',
      themeToggleLight: 'Pasar a oscuro',
      langToggleEs: 'ES -> EN',
      langToggleEn: 'EN -> ES',
    },
    buttons: {
      start: 'Iniciar sistema',
      resume: 'Reanudar',
      retry: 'Reintentar',
      playAgain: 'Jugar otra vez',
      exit: 'Volver al portfolio',
      back: 'Volver',
      reset: 'Reiniciar simulacion',
    },
    touch: {
      boost: 'Boost',
      interact: 'Usar',
      toggle: 'Modo',
      pause: 'Pausa',
    },
    prompts: {
      bootConsole: 'Pulsa E sobre la baliza de arranque.',
      switchToFoot: 'Pulsa E en el dock pad para bajar a pie.',
      switchToVehicle: 'Pulsa E en el dock pad para desplegar el veh\u00edculo.',
      lockedSector: 'Este sector permanece bloqueado hasta completar la misi\u00f3n actual.',
      collect: 'Pulsa E para interactuar.',
      hazard: 'Zona caliente. Al\u00e9jate de las barreras l\u00e1ser.',
      completed: 'Objetivo cumplido. Sigue al siguiente distrito.',
      finalConsole: 'Pulsa E para reiniciar el n\u00facleo principal.',
    },
    missions: {
      'boot-sequence': {
        title: 'Boot sequence',
        objective: 'Alinea el enlace de arranque, activa el primer dock pad y sal hacia Firewall Sector.',
        toastTitle: 'Firewall Sector desbloqueado',
        toastBody: 'Ya puedes cruzar el corredor rojo y empezar la intrusi\u00f3n.',
      },
      'breach-firewall': {
        title: 'Security Breach',
        objective: 'Recoge 2 beacons en veh\u00edculo, cambia a pie y activa 3 nodos sin saturar la alarma.',
        toastTitle: 'Routing Array desbloqueado',
        toastBody: 'El backbone azul ya est\u00e1 disponible para su restauraci\u00f3n.',
      },
      'restore-routing': {
        title: 'Route Recovery',
        objective: 'Carga 3 torres en veh\u00edculo y resuelve los switches a pie para cerrar la ruta principal.',
        toastTitle: 'Inference Core desbloqueado',
        toastBody: 'La c\u00e1mara violeta queda online para estabilizar la IA.',
      },
      'stabilize-inference': {
        title: 'Inference Stabilizer',
        objective: 'Recoge 4 signal seeds y replica la secuencia correcta dentro del n\u00facleo de inferencia.',
        toastTitle: 'Core Chamber desbloqueada',
        toastBody: 'El anillo central ya puede iniciar el reinicio sist\u00e9mico.',
      },
      'system-reboot': {
        title: 'System Reboot',
        objective: 'Activa 3 pylons en veh\u00edculo, cambia a pie y reinicia la consola central.',
        toastTitle: 'Sistema estabilizado',
        toastBody: 'La red vuelve a estar operativa.',
      },
    },
  },
  en: {
    meta: { title: 'WARP Red Cyber Ops' },
    hud: {
      system: 'Red Cyber Ops',
      score: 'Score',
      integrity: 'Integrity',
      energy: 'Energy',
      mode: 'Mode',
      sector: 'Sector',
      status: 'Status',
      objective: 'Objective',
      minimap: 'Map',
      minimapHint: 'Active district tracker',
      alarm: 'Alarm',
      overflow: 'Overflow',
      overload: 'Overload',
      ready: 'System stable',
      pylons: 'Pylons {count}/{total}',
      promptIdle: 'Explore the active district and move close to an interactive beacon.',
    },
    modes: { vehicle: 'Vehicle', foot: 'On foot' },
    sectors: {
      'boot-relay': 'Boot Relay',
      'firewall-sector': 'Firewall Sector',
      'routing-array': 'Routing Array',
      'inference-core': 'Inference Core',
      'core-chamber': 'Core Chamber',
    },
    start: {
      tag: 'Tactical simulation',
      title: 'WARP Red Cyber Ops',
      lead: 'Explorable technology simulation with arcade traversal, on-foot infiltration, and three linked operations inside one system.',
      blockA: {
        title: 'Vehicle',
        body: 'Cross districts, power nodes, and open routes with responsive arcade movement.',
      },
      blockB: {
        title: 'On foot',
        body: 'Solve intrusions, routing, and inference through timing and pattern reading.',
      },
      blockC: {
        title: 'Mission chain',
        body: 'Five linked phases, persistent progress, and a final reboot inside the central core.',
      },
      metricA: {
        title: 'Five sectors',
        body: 'Boot Relay, Firewall, Routing, Inference, and the final core in one continuous run.',
      },
      metricB: {
        title: 'Hybrid traversal',
        body: 'Drive, disembark, and switch modes only when the district allows it.',
      },
      metricC: {
        title: 'Persistent run',
        body: 'Local progress, cumulative score, and clean restart from pause or victory.',
      },
      railA: {
        title: 'Boot Relay',
        body: 'Boot the node, learn the transition, and unlock the first corridor.',
      },
      railB: {
        title: 'Firewall Sector',
        body: 'Red-zone infiltration, shards, laser sweeps, and node sequencing.',
      },
      railC: {
        title: 'Routing + AI',
        body: 'Blue backbone, violet chamber, and the final system reboot.',
      },
      controlA: 'WASD / Arrows',
      controlB: 'E Interact',
      controlC: 'Shift Boost / Dash',
      controlD: 'Tab Intel',
      controlE: 'Esc Pause',
    },
    pause: {
      tag: 'Paused',
      title: 'Mission standby',
      lead: 'Adjust preferences, reset progress, or return to the main portfolio dashboard.',
    },
    gameOver: {
      tag: 'Connection lost',
      title: 'System compromised',
      lead: 'Operation integrity dropped to zero.',
      securityLead: 'Firewall alarm reached a critical level.',
      routingLead: 'The backbone collapsed because route saturation hit critical levels.',
      inferenceLead: 'The inference core entered critical overload.',
    },
    victory: {
      tag: 'Core online',
      title: 'System reboot complete',
      lead: 'The network is stable again. You can restart the simulation or return to the portfolio.',
      score: 'Final score',
    },
    toast: { tag: 'Mission update' },
    loading: {
      tag: 'Loading',
      title: 'Booting district runtime',
      lead: 'Importing meshes, materials, signage, and gameplay systems.',
      assets: 'Syncing 3D scene',
      ready: 'System ready',
    },
    panel: {
      tag: 'Mission log',
      title: 'Tactical briefing',
      progress: 'Progress',
      bestScores: 'Best scores',
      controls: 'Controls',
      controlsBody: 'Tab opens this panel. Esc pauses. E interacts. Q changes mode on dock pads.',
      progressValue: '{completed} / {total}',
      bestScoresValue: 'SEC {security} \u00b7 NET {routing} \u00b7 AI {inference}',
    },
    fallback: {
      tag: 'Fallback',
      title: 'WebGL unavailable',
      lead: 'Your browser or GPU does not expose the graphics context required to render Red Cyber Ops.',
      loadFailed: 'The 3D district could not finish initializing. Reload the page and try again.',
    },
    settings: {
      quality: 'Quality',
      theme: 'Theme',
      language: 'Language',
      controls: 'Controls',
      controlsBody: 'Switch mode only on dock pads. Virtual joystick appears automatically on touch devices.',
      themeToggleDark: 'Switch to light',
      themeToggleLight: 'Switch to dark',
      langToggleEs: 'ES -> EN',
      langToggleEn: 'EN -> ES',
    },
    buttons: {
      start: 'Start system',
      resume: 'Resume',
      retry: 'Retry',
      playAgain: 'Play again',
      exit: 'Back to portfolio',
      back: 'Back',
      reset: 'Reset run',
    },
    touch: {
      boost: 'Boost',
      interact: 'Use',
      toggle: 'Mode',
      pause: 'Pause',
    },
    prompts: {
      bootConsole: 'Press E on the boot beacon.',
      switchToFoot: 'Press E on the dock pad to deploy on foot.',
      switchToVehicle: 'Press E on the dock pad to deploy the vehicle.',
      lockedSector: 'This sector remains locked until the current mission is complete.',
      collect: 'Press E to interact.',
      hazard: 'Hot zone. Move away from the laser barriers.',
      completed: 'Objective complete. Move to the next district.',
      finalConsole: 'Press E to reboot the main core.',
    },
    missions: {
      'boot-sequence': {
        title: 'Boot sequence',
        objective: 'Align the boot relay, activate the first dock pad, and move toward Firewall Sector.',
        toastTitle: 'Firewall Sector unlocked',
        toastBody: 'The red corridor is now open for the first intrusion.',
      },
      'breach-firewall': {
        title: 'Security Breach',
        objective: 'Collect 2 beacons in vehicle mode, switch to on foot, and activate 3 nodes before the alarm maxes out.',
        toastTitle: 'Routing Array unlocked',
        toastBody: 'The blue backbone is now available for restoration.',
      },
      'restore-routing': {
        title: 'Route Recovery',
        objective: 'Charge 3 towers in vehicle mode and solve the switch layout on foot to restore the main route.',
        toastTitle: 'Inference Core unlocked',
        toastBody: 'The violet chamber is now online for AI stabilization.',
      },
      'stabilize-inference': {
        title: 'Inference Stabilizer',
        objective: 'Collect 4 signal seeds and reproduce the correct sequence inside the inference chamber.',
        toastTitle: 'Core Chamber unlocked',
        toastBody: 'The central ring is ready for final system reboot.',
      },
      'system-reboot': {
        title: 'System Reboot',
        objective: 'Activate 3 pylons in vehicle mode, switch to on foot, and reboot the central console.',
        toastTitle: 'System stabilized',
        toastBody: 'The network is now operational again.',
      },
    },
  },
};

export function getCopy(lang = 'es') {
  return copy[lang] || copy.es;
}

export function getMissionCopy(lang, missionId) {
  return getCopy(lang).missions[missionId];
}

export function getSectorCopy(lang, sectorId) {
  return getCopy(lang).sectors[sectorId] || sectorId;
}

export function formatCopy(template, params = {}) {
  return Object.entries(params).reduce(
    (value, [key, replacement]) => value.replaceAll(`{${key}}`, String(replacement)),
    template,
  );
}

export function getAllCopy() {
  return copy;
}
