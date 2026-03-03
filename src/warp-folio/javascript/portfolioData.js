export const ASSET_BASE = '/warp-folio';
export const APP_TITLE = 'WARP // World Drive';
export const PORTFOLIO_HOME = '/';

export function asset(input) {
  const value = String(input || '');
  if (!value) return value;
  if (/^(data:|blob:|https?:)/.test(value)) return value;
  const clean = value.replace(/^\.\//, '').replace(/^\/+/, '');
  return `${ASSET_BASE}/${clean}`;
}

export const CONTACT_LINKS = [
  {
    href: 'https://x.com/ikerperez12',
    labelTextureKey: 'informationContactTwitterLabelTexture',
  },
  {
    href: 'https://github.com/ikerperez12',
    labelTextureKey: 'informationContactGithubLabelTexture',
  },
  {
    href: 'https://linkedin.com/in/ikerperez',
    labelTextureKey: 'informationContactLinkedinLabelTexture',
  },
  {
    href: 'mailto:iker.perez@udc.es',
    labelTextureKey: 'informationContactMailLabelTexture',
  },
];

export const PORTFOLIO_PROJECTS = [
  {
    name: 'WARP Portfolio 3D',
    imageSources: [
      asset('./models/projects/threejsJourney/slideA.webp'),
      asset('./models/projects/threejsJourney/slideB.webp'),
      asset('./models/projects/threejsJourney/slideC.webp'),
      asset('./models/projects/threejsJourney/slideD.webp'),
    ],
    floorTextureKey: 'projectsThreejsJourneyFloorTexture',
    link: {
      href: 'https://portfolio-iker-perez.vercel.app/gaming.html',
      x: -4.8,
      y: -3,
      halfExtents: { x: 3.2, y: 1.5 },
    },
    distinctions: [{ type: 'fwa', x: 3.95, y: 4.15 }],
  },
  {
    name: 'Auditoria PQC',
    imageSources: [
      asset('./models/projects/orano/slideA.jpg'),
      asset('./models/projects/orano/slideB.jpg'),
      asset('./models/projects/orano/slideC.jpg'),
    ],
    floorTextureKey: 'projectsOranoFloorTexture',
    link: {
      href: 'https://github.com/ikerperez12/1.2-AuditoriaPQC',
      x: -4.8,
      y: -3.4,
      halfExtents: { x: 3.2, y: 1.5 },
    },
    distinctions: [
      { type: 'awwwards', x: 3.95, y: 4.15 },
      { type: 'cssda', x: 7.2, y: 4.15 },
    ],
  },
  {
    name: 'GPT CMD',
    imageSources: [
      asset('./models/projects/scout/slideA.jpg'),
      asset('./models/projects/scout/slideB.jpg'),
      asset('./models/projects/scout/slideC.jpg'),
    ],
    floorTextureKey: 'projectsScoutFloorTexture',
    link: {
      href: 'https://github.com/ikerperez12/GPT_CMD',
      x: -4.8,
      y: -2,
      halfExtents: { x: 3.2, y: 1.5 },
    },
    distinctions: [],
  },
  {
    name: 'Internet y Sistemas Distribuidos',
    imageSources: [
      asset('./models/projects/citrixRedbull/slideA.jpg'),
      asset('./models/projects/citrixRedbull/slideB.jpg'),
      asset('./models/projects/citrixRedbull/slideC.jpg'),
    ],
    floorTextureKey: 'projectsCitrixRedbullFloorTexture',
    link: {
      href: 'https://github.com/ikerperez12/ISD',
      x: -4.8,
      y: -4.4,
      halfExtents: { x: 3.2, y: 1.5 },
    },
    distinctions: [
      { type: 'fwa', x: 5.6, y: 4.15 },
      { type: 'cssda', x: 7.2, y: 4.15 },
    ],
  },
  {
    name: 'Basketball API',
    imageSources: [
      asset('./models/projects/luni/slideA.webp'),
      asset('./models/projects/luni/slideB.webp'),
      asset('./models/projects/luni/slideC.webp'),
      asset('./models/projects/luni/slideD.webp'),
    ],
    floorTextureKey: 'projectsLuniFloorTexture',
    link: {
      href: 'https://github.com/ikerperez12/Basketball-API',
      x: -4.8,
      y: -3,
      halfExtents: { x: 3.2, y: 1.5 },
    },
    distinctions: [{ type: 'fwa', x: 5.6, y: 4.15 }],
  },
  {
    name: 'Shell y Sistemas Operativos',
    imageSources: [
      asset('./models/projects/madbox/slideA.jpg'),
      asset('./models/projects/madbox/slideB.jpg'),
      asset('./models/projects/madbox/slideC.jpg'),
    ],
    floorTextureKey: 'projectsMadboxFloorTexture',
    link: {
      href: 'https://github.com/ikerperez12/SO-SHELL-p2',
      x: -4.8,
      y: -4,
      halfExtents: { x: 3.2, y: 1.5 },
    },
    distinctions: [],
  },
  {
    name: 'Software Design',
    imageSources: [
      asset('./models/projects/chartogne/slideA.jpg'),
      asset('./models/projects/chartogne/slideB.jpg'),
      asset('./models/projects/chartogne/slideC.jpg'),
    ],
    floorTextureKey: 'projectsChartogneFloorTexture',
    link: {
      href: 'https://github.com/ikerperez12/Software-Design',
      x: -4.8,
      y: -3.3,
      halfExtents: { x: 3.2, y: 1.5 },
    },
    distinctions: [{ type: 'cssda', x: 7.2, y: 4.15 }],
  },
  {
    name: 'Sistemas Operativos 23-24',
    imageSources: [
      asset('./models/projects/bonhomme10ans/slideA.webp'),
      asset('./models/projects/bonhomme10ans/slideB.webp'),
      asset('./models/projects/bonhomme10ans/slideC.webp'),
      asset('./models/projects/bonhomme10ans/slideD.webp'),
    ],
    floorTextureKey: 'projectsBonhomme10ansFloorTexture',
    link: {
      href: 'https://github.com/ikerperez12/SO-2324',
      x: -4.8,
      y: -2,
      halfExtents: { x: 3.2, y: 1.5 },
    },
    distinctions: [],
  },
];
