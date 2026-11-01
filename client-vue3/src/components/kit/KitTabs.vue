<script setup lang="ts">
import { computed } from 'vue';
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from 'reka-ui';

export interface KitTab {
  value: string;
  label: string;
  disabled?: boolean;
  lazy?: boolean;
}

const props = defineProps<{ tabs: KitTab[]; label: string }>();
const model = defineModel<string>();

const active = computed({
  get: () => model.value ?? props.tabs.find((tab) => !tab.disabled)?.value,
  set: (value) => {
    model.value = value;
  },
});
</script>

<template>
  <TabsRoot v-model="active" class="flex flex-col">
    <TabsList :aria-label="label" class="flex overflow-x-auto border-b border-line-subtle">
      <TabsTrigger
        v-for="tab in tabs"
        :key="tab.value"
        :value="tab.value"
        :disabled="tab.disabled"
        class="-mb-px inline-flex min-h-sm shrink-0 items-center whitespace-nowrap border-b-2 border-transparent px-3 text-sm font-medium text-ink-secondary hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary data-[state=active]:border-primary data-[state=active]:text-ink data-[disabled]:cursor-not-allowed data-[disabled]:text-ink-muted"
      >
        {{ tab.label }}
      </TabsTrigger>
    </TabsList>
    <TabsContent
      v-for="tab in tabs"
      :key="tab.value"
      :value="tab.value"
      :unmount-on-hide="!!tab.lazy"
      class="pt-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary"
    >
      <slot :name="`panel-${tab.value}`" />
    </TabsContent>
  </TabsRoot>
</template>
