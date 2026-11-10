// Единый реестр SVG-иконок: используется и в интерфейсе, и при сборке маркеров карты.
// Тело иконки хранится без внешнего <svg>, чтобы масштабировать её под нужный размер.

export interface IconDefinition {
  viewBox: string
  stroke: number
  size: number
  body: string
}

export const ICONS: Record<string, IconDefinition> = {
  bell: {
    viewBox: '0 0 24 24',
    stroke: 1.8,
    size: 16,
    body: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/>',
  },
  user: {
    viewBox: '0 0 24 24',
    stroke: 1.8,
    size: 15,
    body: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  },
  users: {
    viewBox: '0 0 24 24',
    stroke: 1.8,
    size: 15,
    body: '<circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0"/><circle cx="17" cy="9" r="2.5"/><path d="M15 15.5a5 5 0 0 1 6 4.5"/>',
  },
  plus: {
    viewBox: '0 0 24 24',
    stroke: 2.4,
    size: 12,
    body: '<path d="M12 5v14M5 12h14"/>',
  },
  search: {
    viewBox: '0 0 24 24',
    stroke: 1.8,
    size: 14,
    body: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  },
  'chevron-down': {
    viewBox: '0 0 24 24',
    stroke: 2,
    size: 10,
    body: '<path d="m6 9 6 6 6-6"/>',
  },
  warning: {
    viewBox: '0 0 24 24',
    stroke: 2,
    size: 36,
    body: '<path d="M12 3 2.5 20h19L12 3Z"/><path d="M12 9v5"/><circle cx="12" cy="17.2" r=".9" fill="currentColor" stroke="none"/>',
  },
  logout: {
    viewBox: '0 0 24 24',
    stroke: 1.8,
    size: 15,
    body: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
  },
  lock: {
    viewBox: '0 0 24 24',
    stroke: 1.8,
    size: 15,
    body: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  },
  image: {
    viewBox: '0 0 24 24',
    stroke: 1.8,
    size: 15,
    body: '<rect x="4" y="5" width="16" height="14" rx="2"/><circle cx="9.5" cy="10" r="1.5"/><path d="m20 16-4.5-4.5L9 18"/>',
  },
  road: {
    viewBox: '0 0 24 24',
    stroke: 1.8,
    size: 15,
    body: '<path d="M8 3 5 21M16 3l3 18"/><path d="M12 4v3M12 11v2M12 17v3"/>',
  },
  light: {
    viewBox: '0 0 24 24',
    stroke: 1.8,
    size: 15,
    body: '<path d="M9 21h6M12 3v2M5.6 6.6 7 8M18.4 6.6 17 8M3 13h2M19 13h2"/><path d="M8 13a4 4 0 1 1 8 0c0 2-1.5 2.5-1.5 4h-5C9.5 15.5 8 15 8 13Z"/>',
  },
  trash: {
    viewBox: '0 0 24 24',
    stroke: 1.8,
    size: 15,
    body: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/><path d="M10 11v5M14 11v5"/>',
  },
  parking: {
    viewBox: '0 0 24 24',
    stroke: 1.8,
    size: 15,
    body: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M10 16V8h3a3 3 0 0 1 0 6h-3"/>',
  },
  water: {
    viewBox: '0 0 24 24',
    stroke: 1.8,
    size: 15,
    body: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z"/>',
  },
  tree: {
    viewBox: '0 0 24 24',
    stroke: 1.8,
    size: 15,
    body: '<path d="M12 3 6 12h3l-4 6h14l-4-6h3L12 3Z"/><path d="M12 18v3"/>',
  },
  building: {
    viewBox: '0 0 24 24',
    stroke: 1.8,
    size: 15,
    body: '<path d="M4 21V5l8-3 8 3v16"/><path d="M9 21v-4h6v4M8 8h1M15 8h1M8 12h1M15 12h1"/>',
  },
  transport: {
    viewBox: '0 0 24 24',
    stroke: 1.8,
    size: 15,
    body: '<rect x="4" y="4" width="16" height="13" rx="3"/><path d="M4 11h16M8 21v-2M16 21v-2M8 8h.01M16 8h.01"/>',
  },
  signal: {
    viewBox: '0 0 24 24',
    stroke: 1.8,
    size: 15,
    body: '<path d="M4 20v-4M9 20v-8M14 20V8M19 20V4"/>',
  },
  bench: {
    viewBox: '0 0 24 24',
    stroke: 1.8,
    size: 15,
    body: '<path d="M4 10h16M6 10v5M18 10v5M4 15h16M7 20v-3M17 20v-3M8 6h8"/>',
  },
  pipe: {
    viewBox: '0 0 24 24',
    stroke: 1.8,
    size: 15,
    body: '<path d="M4 8h6a4 4 0 0 1 4 4v0a4 4 0 0 0 4 4h2"/><path d="M4 5v6M20 13v6"/>',
  },
  message: {
    viewBox: '0 0 24 24',
    stroke: 1.8,
    size: 14,
    body: '<path d="M4 5h16v11H9l-5 5V5Z"/>',
  },
  vote: {
    viewBox: '0 0 24 24',
    stroke: 1.8,
    size: 14,
    body: '<path d="M7 10v10H4V10h3Zm0 10h8.5a2 2 0 0 0 1.9-1.4l1.5-5A2 2 0 0 0 17 10h-3V5a2 2 0 0 0-2-2l-5 7"/>',
  },
  clock: {
    viewBox: '0 0 24 24',
    stroke: 1.8,
    size: 13,
    body: '<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>',
  },
  calendar: {
    viewBox: '0 0 24 24',
    stroke: 1.8,
    size: 14,
    body: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/>',
  },
  'map-pin': {
    viewBox: '0 0 24 24',
    stroke: 1.8,
    size: 15,
    body: '<path d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11Z"/><circle cx="12" cy="10" r="2.5"/>',
  },
  edit: {
    viewBox: '0 0 24 24',
    stroke: 1.8,
    size: 14,
    body: '<path d="M4 20h4L20 8l-4-4L4 16v4Z"/><path d="m14 6 4 4"/>',
  },
  close: {
    viewBox: '0 0 24 24',
    stroke: 2,
    size: 14,
    body: '<path d="m6 6 12 12M18 6 6 18"/>',
  },
  check: {
    viewBox: '0 0 24 24',
    stroke: 2,
    size: 14,
    body: '<path d="m5 12 4 4L19 6"/>',
  },
  filter: {
    viewBox: '0 0 24 24',
    stroke: 1.8,
    size: 14,
    body: '<path d="M3 5h18l-7 8v6l-4 2v-8L3 5Z"/>',
  },
  settings: {
    viewBox: '0 0 24 24',
    stroke: 1.8,
    size: 15,
    body: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1"/>',
  },
  shield: {
    viewBox: '0 0 24 24',
    stroke: 1.8,
    size: 15,
    body: '<path d="M12 3 5 6v5c0 5 7 10 7 10s7-5 7-10V6l-7-3Z"/>',
  },
  dashboard: {
    viewBox: '0 0 24 24',
    stroke: 1.8,
    size: 15,
    body: '<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',
  },
  list: {
    viewBox: '0 0 24 24',
    stroke: 1.8,
    size: 15,
    body: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  },
  tag: {
    viewBox: '0 0 24 24',
    stroke: 1.8,
    size: 14,
    body: '<path d="M3 4h8l10 10-7 7L4 11V4Z"/><circle cx="7.5" cy="7.5" r="1"/>',
  },
  eye: {
    viewBox: '0 0 24 24',
    stroke: 1.8,
    size: 14,
    body: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  },
  'eye-off': {
    viewBox: '0 0 24 24',
    stroke: 1.8,
    size: 14,
    body: '<path d="m3 3 18 18M10.6 6.2A10.9 10.9 0 0 1 12 6c6 0 10 6 10 6a17 17 0 0 1-3.4 4M6.6 6.6C3.8 8.4 2 12 2 12s4 6 10 6c1.5 0 2.9-.4 4.1-1"/>',
  },
  refresh: {
    viewBox: '0 0 24 24',
    stroke: 1.8,
    size: 14,
    body: '<path d="M20 7v5h-5M4 17v-5h5"/><path d="M6.1 9A7 7 0 0 1 18 7M18 15a7 7 0 0 1-11.9 2"/>',
  },
  'arrow-left': {
    viewBox: '0 0 24 24',
    stroke: 1.8,
    size: 14,
    body: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  },
  external: {
    viewBox: '0 0 24 24',
    stroke: 1.8,
    size: 13,
    body: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 13v6H5V6h6"/>',
  },
}

// Набор иконок, доступных модератору при настройке категории
export const CATEGORY_ICONS: { value: string; label: string }[] = [
  { value: 'warning', label: 'Другое' },
  { value: 'road', label: 'Дороги' },
  { value: 'light', label: 'Освещение' },
  { value: 'trash', label: 'Мусор' },
  { value: 'parking', label: 'Парковка' },
  { value: 'water', label: 'Вода' },
  { value: 'tree', label: 'Озеленение' },
  { value: 'building', label: 'Дома' },
  { value: 'transport', label: 'Транспорт' },
  { value: 'signal', label: 'Связь' },
  { value: 'bench', label: 'Благоустройство' },
  { value: 'pipe', label: 'Коммуникации' },
]

export function iconDefinition(name: string | null | undefined): IconDefinition {
  return ICONS[name || ''] ?? ICONS.warning
}
