<script setup lang="ts">
import { computed } from 'vue';
import KitBackLink from '../kit/KitBackLink.vue';
import KitPageHeader from '../kit/KitPageHeader.vue';
import KitRecordPager from '../kit/KitRecordPager.vue';
import KitTabs from '../kit/KitTabs.vue';
import { choiceField, useRouteParam } from './useRouteState';

export interface DetailTab {
  value: string;
  label: string;
  lazy?: boolean;
  hidden?: boolean;
  disabled?: boolean;
}

const props = withDefaults(
  defineProps<{
    title: string;
    tabs: DetailTab[];
    tabsLabel: string;
    backLabel?: string;
    position?: number;
    total?: number;
    noun?: string;
  }>(),
  { backLabel: undefined, position: 0, total: 0, noun: 'record' }
);

const emit = defineEmits<{ back: []; previous: []; next: [] }>();

const visibleTabs = computed(() =>
  props.tabs
    .filter((tab) => !tab.hidden)
    .map((tab) => ({ value: tab.value, label: tab.label, lazy: tab.lazy, disabled: tab.disabled }))
);
const tabParam = useRouteParam(
  'tab',
  choiceField(
    visibleTabs.value.filter((tab) => !tab.disabled).map((tab) => tab.value),
    visibleTabs.value[0]?.value ?? null
  )
);
const active = computed({
  get: () => tabParam.value ?? visibleTabs.value[0]?.value ?? '',
  set: (value: string) => {
    tabParam.value = value;
  },
});
</script>

<template>
  <div class="flex flex-col gap-5">
    <div v-if="backLabel || total" class="flex flex-wrap items-center justify-between gap-2">
      <KitBackLink v-if="backLabel" :label="backLabel" @click="emit('back')" />
      <KitRecordPager
        v-if="total"
        :position="position"
        :total="total"
        :noun="noun"
        :label="`${backLabel ?? 'Record'} list`"
        @previous="emit('previous')"
        @next="emit('next')"
      />
    </div>

    <KitPageHeader :title="title">
      <template v-if="$slots.before" #before><slot name="before" /></template>
      <template v-if="$slots.meta" #meta><slot name="meta" /></template>
      <template v-if="$slots.actions" #actions><slot name="actions" /></template>
    </KitPageHeader>

    <slot name="summary" />

    <KitTabs v-model="active" :tabs="visibleTabs" :label="tabsLabel">
      <template v-for="tab in visibleTabs" :key="tab.value" #[`panel-${tab.value}`]>
        <div class="pt-4"><slot :name="`panel-${tab.value}`" /></div>
      </template>
    </KitTabs>
  </div>
</template>
