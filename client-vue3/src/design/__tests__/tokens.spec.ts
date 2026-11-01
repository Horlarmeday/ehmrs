import { describe, it, expect } from 'vitest'
import tokens, { EHMRS_TOKENS } from '../../../tailwind.tokens'

function channel(c: number): number {
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}

function luminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

function ratio(fg: string, bg: string): number {
  const l1 = luminance(fg)
  const l2 = luminance(bg)
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
}

function resolveToken(name: string): string {
  const flat: Record<string, string> = {}
  for (const [rampName, ramp] of Object.entries(EHMRS_TOKENS.palettes)) {
    for (const [step, value] of Object.entries(ramp)) flat[`${rampName}.${step}`] = value
  }
  Object.assign(flat, EHMRS_TOKENS.semantic)
  let current: string = flat[name] ?? ''
  while (/^\{[a-z0-9.]+\}$/.test(current)) current = flat[current.slice(1, -1)] ?? ''
  return current
}

describe('token snapshot', () => {
  it('every data-text pair in DESIGN.md meets WCAG-AA (>= 4.5:1)', () => {
    expect(EHMRS_TOKENS.contrastPairs.length).toBeGreaterThan(10)
    const failures = EHMRS_TOKENS.contrastPairs
      .filter((p) => p.cls === 'data-text')
      .map((p) => ({ p, actual: ratio(resolveToken(p.fg), resolveToken(p.bg)) }))
      .filter(({ p, actual }) => actual < Math.max(4.5, p.min))
    expect(failures.map(({ p, actual }) => `${p.fg}/${p.bg} ${actual.toFixed(2)}:1`)).toEqual([])
  })

  it('pins the density scale (sm = 38px controls, 14px font, 44px rows)', () => {
    expect(resolveToken('control.height.sm')).toBe('38px')
    expect(resolveToken('control.font.sm')).toBe('14px')
    expect(resolveToken('table.row.height')).toBe('44px')
    expect(resolveToken('control.height.lg')).toBe('44px')
  })

  it('keeps one source: Tailwind tokens carry the DESIGN.md values', () => {
    expect(tokens.colors.primary.DEFAULT).toBe(resolveToken('primary.color'))
    expect(tokens.colors.ink.DEFAULT).toBe(resolveToken('text.primary'))
    expect(tokens.colors.surface.page).toBe(resolveToken('surface.50'))
    expect(tokens.minHeight.sm).toBe('38px')
    expect(tokens.height.row).toBe(resolveToken('table.row.height'))
    expect(tokens.colors.ink.muted).toBe(resolveToken('text.muted'))
    for (const [color, group] of [
      [tokens.colors.primary, 'primary'],
      [tokens.colors.success, 'success'],
      [tokens.colors.danger, 'danger'],
      [tokens.colors.warning, 'warning'],
    ] as const) {
      expect(color.on).toBe(resolveToken(`${group}.on`))
      expect(ratio(color.on, color.DEFAULT)).toBeGreaterThanOrEqual(4.5)
      expect(ratio(color.on, color.hover)).toBeGreaterThanOrEqual(4.5)
      expect(ratio(color.on, color.active)).toBeGreaterThanOrEqual(4.5)
    }
  })
})
