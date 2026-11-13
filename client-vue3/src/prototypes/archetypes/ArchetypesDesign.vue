<script setup lang="ts">
import { computed, nextTick, reactive, ref } from 'vue';
import AppShell, { type ShellNavItem } from '../../components/shell/AppShell.vue';
import DispensePrescriptionDesign from './DispensePrescriptionDesign.vue';
import DispenseQueueDesign from './DispenseQueueDesign.vue';
import StockListDesign from './StockListDesign.vue';
import StoreItemDetailDesign from './StoreItemDetailDesign.vue';
import StoreItemFormDesign from './StoreItemFormDesign.vue';
import { designControls, prescriptions, stockItems, type StockItem } from './designData';

type Screen = 'list' | 'form' | 'detail' | 'dispense' | 'prescription';

const params = new URLSearchParams(window.location.search);
const screens: Screen[] = ['list', 'form', 'detail', 'dispense', 'prescription'];
const requested = params.get('screen') === 'worklist' ? 'dispense' : params.get('screen');
const screen = ref<Screen>(screens.find((item) => item === requested) ?? 'list');
const item = ref<StockItem>(stockItems[4] ?? stockItems[0]!);
const state = params.get('state');
designControls.empty = state === 'empty';
designControls.failNext = state === 'error';

const store = reactive(prescriptions);
const order = ref<number[]>(
  store.filter((entry) => entry.day === 'Today').map((entry) => entry.id)
);
const currentId = ref<number>(order.value[0] ?? 0);
const current = computed(() => store.find((entry) => entry.id === currentId.value) ?? store[0]!);
const position = computed(() => order.value.indexOf(currentId.value) + 1);

const navigation: ShellNavItem[] = [
  { value: 'home', label: 'Home', icon: 'home' },
  { value: 'pharmacy', label: 'Pharmacy', icon: 'pill' },
  { value: 'stock', label: 'Stock', icon: 'box' },
  { value: 'reports', label: 'Reports', icon: 'chart' },
];
const currentNav = computed(() =>
  screen.value === 'dispense' || screen.value === 'prescription' ? 'pharmacy' : 'stock'
);

async function focusHeading(): Promise<void> {
  await nextTick();
  window.scrollTo(0, 0);
  const heading = document.querySelector<HTMLElement>('main h1');
  if (!heading) return;
  heading.tabIndex = -1;
  heading.focus();
}

function navigate(value: string): void {
  if (value === 'pharmacy') screen.value = 'dispense';
  if (value === 'stock') screen.value = 'list';
}

function open(next: StockItem): void {
  item.value = next;
  screen.value = 'detail';
}

function openPrescription(id: number, ids: number[]): void {
  order.value = ids;
  currentId.value = id;
  screen.value = 'prescription';
  focusHeading();
}

function step(by: number): void {
  const next = order.value[position.value - 1 + by];
  if (next === undefined) return;
  currentId.value = next;
  focusHeading();
}
</script>

<template>
  <AppShell
    :navigation="navigation"
    :current="currentNav"
    user-name="Pharm. Amina Yusuf"
    @navigate="navigate"
  >
    <StockListDesign v-if="screen === 'list'" @open="open" @add="screen = 'form'" />
    <StoreItemFormDesign v-else-if="screen === 'form'" @done="screen = 'list'" />
    <StoreItemDetailDesign v-else-if="screen === 'detail'" :item="item" @back="screen = 'list'" />
    <DispenseQueueDesign
      v-if="screen === 'dispense' || screen === 'prescription'"
      v-show="screen === 'dispense'"
      @open="openPrescription"
    />
    <DispensePrescriptionDesign
      v-if="screen === 'prescription'"
      :prescription="current"
      :position="position"
      :total="order.length"
      @back="screen = 'dispense'"
      @previous="step(-1)"
      @next="step(1)"
    />
  </AppShell>
</template>
