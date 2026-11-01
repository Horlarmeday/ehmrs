import { expect, type Locator, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

export async function expectNoSeriousA11yIssues(page: Page, state: string): Promise<void> {
  const { violations } = await new AxeBuilder({ page }).analyze();
  const serious = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  expect(
    serious.map((v) => `${state}: ${v.id} ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`)
  ).toEqual([]);
}

export async function heightOf(locator: Locator): Promise<number> {
  const box = await locator.boundingBox();
  if (!box) throw new Error('element has no box');
  return box.height;
}

function channels(color: string): number[] {
  const values = color.match(/[\d.]+/g);
  if (!values) throw new Error(`cannot parse color ${color}`);
  return values.slice(0, 3).map(Number);
}

function luminance(color: string): number {
  const [r = 0, g = 0, b = 0] = channels(color).map((value) => {
    const c = value / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string): number {
  const high = Math.max(luminance(a), luminance(b));
  const low = Math.min(luminance(a), luminance(b));
  return (high + 0.05) / (low + 0.05);
}

export async function colorsOf(locator: Locator): Promise<{ fg: string; bg: string }> {
  return locator.evaluate((element) => {
    const style = getComputedStyle(element);
    return { fg: style.color, bg: style.backgroundColor };
  });
}
