import type { Category, Status } from '../core/models/Catalog'
import { contrastText } from '../core/utils/color'
import { iconDefinition } from '../core/constants/icons'

export interface MarkerSource {
  src: string
  width: number
  height: number
  anchor: [number, number]
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function shorten(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value
}

const PIN =
  'M20 1C9.5 1 1 9.5 1 20c0 13 19 26 19 26s19-13 19-26C39 9.5 30.5 1 20 1Z'

// Маркер собирается из цвета и иконки категории, а статус добавляется цветным ярлыком
export function markerSource(
  category: Pick<Category, 'color' | 'icon'>,
  status: Pick<Status, 'name' | 'color'> | null,
  selected = false,
): MarkerSource {
  const icon = iconDefinition(category.icon)
  const iconScale = 0.68
  const iconSize = 24 * iconScale
  const iconX = 20 - iconSize / 2
  const iconY = 20 - iconSize / 2

  const label = status ? shorten(status.name, 15) : ''
  const pillWidth = status ? Math.max(38, 20 + label.length * 6.1) : 0
  const width = Math.ceil(Math.max(40, 34 + pillWidth))
  const border = selected ? '#e5a54b' : '#0f0f11'

  const pill = status
    ? `<rect x="34" y="17" width="${pillWidth.toFixed(1)}" height="21" rx="10.5" fill="${status.color}" stroke="#0f0f11" stroke-width="1.5"/>
       <text x="${(34 + pillWidth / 2).toFixed(1)}" y="31.5" text-anchor="middle" font-family="-apple-system, Segoe UI, Roboto, Arial, sans-serif" font-size="10.5" font-weight="600" fill="${contrastText(status.color)}">${escapeXml(label)}</text>`
    : ''

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="56" viewBox="0 0 ${width} 56">
    ${pill}
    <path d="${PIN}" fill="${category.color}" stroke="${border}" stroke-width="${selected ? 2.6 : 2}"/>
    <g transform="translate(${iconX.toFixed(2)} ${iconY.toFixed(2)}) scale(${iconScale})" fill="none" stroke="${contrastText(category.color)}" stroke-width="${icon.stroke}" stroke-linecap="round" stroke-linejoin="round">${icon.body}</g>
  </svg>`

  return {
    src: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
    width,
    height: 56,
    anchor: [20, 47],
  }
}

// Метка выбранной пользователем точки на карте
export function pointMarkerSource(): MarkerSource {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30">
    <circle cx="15" cy="15" r="10" fill="rgba(229,165,75,0.22)" stroke="#e5a54b" stroke-width="2"/>
    <circle cx="15" cy="15" r="3.5" fill="#e5a54b" stroke="#0f0f11" stroke-width="1.5"/>
  </svg>`
  return {
    src: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
    width: 30,
    height: 30,
    anchor: [15, 15],
  }
}
