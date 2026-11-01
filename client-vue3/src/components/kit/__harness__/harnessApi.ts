import type { KitOption } from '../KitSelect.vue';

interface HarnessControls {
  log: string[];
  delays: Record<string, number>;
  failing: string[];
}

const controls: HarnessControls = { log: [], delays: {}, failing: [] };
Object.assign(window, { kitHarness: controls });

const DRUGS: KitOption<number>[] = [
  { value: 101, label: 'Paracetamol 500mg' },
  { value: 102, label: 'Paracetamol 1g' },
  { value: 201, label: 'Amoxicillin 250mg' },
  { value: 301, label: 'Metformin 500mg' },
];

export async function searchDrugs(term: string): Promise<KitOption<number>[]> {
  controls.log.push(term);
  await new Promise((resolve) => setTimeout(resolve, controls.delays[term] ?? 10));
  if (controls.failing.includes(term)) throw new Error('search failed');
  return DRUGS.filter((drug) => drug.label.toLowerCase().includes(term.toLowerCase()));
}
