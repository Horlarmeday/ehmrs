<script setup lang="ts">
import {
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionRoot,
  AccordionTrigger,
} from 'reka-ui';

export interface KitAccordionItem {
  value: string;
  title: string;
  disabled?: boolean;
  lazy?: boolean;
}

withDefaults(
  defineProps<{
    items: KitAccordionItem[];
    multiple?: boolean;
    headingLevel?: 'h2' | 'h3' | 'h4';
  }>(),
  { multiple: false, headingLevel: 'h3' }
);

const model = defineModel<string | string[]>();
</script>

<template>
  <AccordionRoot
    v-model="model"
    :type="multiple ? 'multiple' : 'single'"
    collapsible
    class="divide-y divide-line-subtle rounded-md border border-line-subtle"
  >
    <AccordionItem
      v-for="item in items"
      :key="item.value"
      :value="item.value"
      :disabled="item.disabled"
      :unmount-on-hide="!!item.lazy"
    >
      <AccordionHeader :as="headingLevel">
        <AccordionTrigger
          class="group flex min-h-lg w-full items-center justify-between gap-2 px-3 text-left text-sm font-semibold text-ink hover:bg-surface-alt focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary data-[disabled]:cursor-not-allowed data-[disabled]:text-ink-muted"
        >
          {{ item.title }}
          <svg
            aria-hidden="true"
            viewBox="0 0 16 16"
            class="h-4 w-4 shrink-0 text-ink-secondary group-data-[state=open]:rotate-180"
            fill="none"
          >
            <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" />
          </svg>
        </AccordionTrigger>
      </AccordionHeader>
      <AccordionContent class="text-sm text-ink">
        <div class="px-3 pb-3">
          <slot :name="`item-${item.value}`" />
        </div>
      </AccordionContent>
    </AccordionItem>
  </AccordionRoot>
</template>
