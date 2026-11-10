// Контрастный цвет текста для бейджа: считается по относительной яркости фона
export function contrastText(hex: string): string {
  const value = hex.replace('#', '')
  if (!/^[0-9a-fA-F]{6}$/.test(value)) return '#ffffff'
  const channels = [0, 2, 4].map((offset) => {
    const channel = parseInt(value.slice(offset, offset + 2), 16) / 255
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  })
  const luminance = 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
  return luminance > 0.45 ? '#16130d' : '#ffffff'
}

export function withAlpha(hex: string, alpha: number): string {
  const value = hex.replace('#', '')
  if (!/^[0-9a-fA-F]{6}$/.test(value)) return `rgba(229, 165, 75, ${alpha})`
  const r = parseInt(value.slice(0, 2), 16)
  const g = parseInt(value.slice(2, 4), 16)
  const b = parseInt(value.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
