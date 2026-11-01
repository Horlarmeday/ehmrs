<script setup lang="ts">
import { computed, ref, shallowRef, useId, watch } from 'vue';
import { CalendarDate, parseDate } from '@internationalized/date';
import {
  DatePickerAnchor,
  DatePickerCalendar,
  DatePickerCell,
  DatePickerCellTrigger,
  DatePickerContent,
  DatePickerField,
  DatePickerGrid,
  DatePickerGridBody,
  DatePickerGridHead,
  DatePickerGridRow,
  DatePickerHeadCell,
  DatePickerHeader,
  DatePickerHeading,
  DatePickerInput,
  DatePickerNext,
  DatePickerPrev,
  DatePickerRoot,
  DatePickerTrigger,
} from 'reka-ui';

const props = withDefaults(
  defineProps<{
    label: string;
    modelValue: string | null;
    min?: string;
    max?: string;
    error?: string;
    disabled?: boolean;
  }>(),
  { min: undefined, max: undefined, error: undefined, disabled: false }
);

const emit = defineEmits<{ 'update:modelValue': [value: string | null] }>();

const id = useId();
const outOfRange = ref(false);
const minValue = computed(() => (props.min ? parseDate(props.min) : undefined));
const maxValue = computed(() => (props.max ? parseDate(props.max) : undefined));
const value = shallowRef<CalendarDate | undefined>(
  props.modelValue ? parseDate(props.modelValue) : undefined
);
const message = computed(
  () => props.error ?? (outOfRange.value ? 'Date is out of range' : undefined)
);

watch(
  () => props.modelValue,
  (next) => {
    if (next && next !== value.value?.toString()) value.value = parseDate(next);
  }
);

function update(next: unknown): void {
  const date = next instanceof CalendarDate ? next : undefined;
  value.value = date;
  outOfRange.value = Boolean(
    date &&
    ((minValue.value && date.compare(minValue.value) < 0) ||
      (maxValue.value && date.compare(maxValue.value) > 0))
  );
  emit('update:modelValue', date && !outOfRange.value ? date.toString() : null);
}
</script>

<template>
  <div class="flex flex-col gap-1 text-sm text-ink">
    <span aria-hidden="true" class="font-medium text-ink-secondary">{{ label }}</span>
    <DatePickerRoot
      :model-value="value"
      :min-value="minValue"
      :max-value="maxValue"
      :disabled="disabled"
      locale="en-GB"
      granularity="day"
      close-on-select
      @update:model-value="update"
    >
      <DatePickerAnchor as-child>
        <DatePickerField
          v-slot="{ segments }"
          :aria-label="label"
          :aria-invalid="message ? 'true' : undefined"
          :aria-describedby="message ? `${id}-error` : undefined"
          class="inline-flex min-h-sm w-full items-center rounded-sm border bg-surface pl-2 focus-within:outline focus-within:outline-2 focus-within:outline-offset-1 focus-within:outline-primary"
          :class="[message ? 'border-danger' : 'border-line', disabled ? 'bg-surface-alt' : '']"
        >
          <template v-for="segment in segments" :key="segment.part">
            <DatePickerInput
              v-if="segment.part === 'literal'"
              :part="segment.part"
              class="text-ink-secondary"
            >
              {{ segment.value }}
            </DatePickerInput>
            <DatePickerInput
              v-else
              :part="segment.part"
              class="rounded-sm px-px font-mono tabular-nums focus:bg-teal-100 focus:outline-none data-[placeholder]:text-ink-muted"
            >
              {{ segment.value }}
            </DatePickerInput>
          </template>
          <DatePickerTrigger
            :aria-label="`Open ${label} calendar`"
            class="ml-auto h-[36px] w-[36px] rounded-sm text-ink-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          >
            ▾
          </DatePickerTrigger>
        </DatePickerField>
      </DatePickerAnchor>
      <DatePickerContent
        align="start"
        :side-offset="2"
        class="z-50 rounded border border-line bg-surface p-2 text-sm text-ink shadow-md"
      >
        <DatePickerCalendar v-slot="{ weekDays, grid }">
          <DatePickerHeader class="mb-1 flex items-center justify-between">
            <DatePickerPrev
              aria-label="Previous month"
              class="min-h-xs min-w-[24px] rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
            >
              ‹
            </DatePickerPrev>
            <DatePickerHeading class="font-semibold" />
            <DatePickerNext
              aria-label="Next month"
              class="min-h-xs min-w-[24px] rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
            >
              ›
            </DatePickerNext>
          </DatePickerHeader>
          <DatePickerGrid
            v-for="month in grid"
            :key="month.value.toString()"
            class="border-collapse"
          >
            <DatePickerGridHead>
              <DatePickerGridRow>
                <DatePickerHeadCell
                  v-for="day in weekDays"
                  :key="day"
                  class="h-[24px] w-[28px] font-medium text-ink-secondary"
                >
                  {{ day }}
                </DatePickerHeadCell>
              </DatePickerGridRow>
            </DatePickerGridHead>
            <DatePickerGridBody>
              <DatePickerGridRow v-for="week in month.rows" :key="week.toString()">
                <DatePickerCell v-for="day in week" :key="day.toString()" :date="day">
                  <DatePickerCellTrigger
                    :day="day"
                    :month="month.value"
                    class="flex h-[30px] w-[34px] items-center justify-center rounded-sm font-mono tabular-nums hover:bg-surface-alt focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary data-[outside-view]:text-ink-muted data-[disabled]:text-ink-disabled data-[disabled]:line-through data-[selected]:bg-primary data-[selected]:text-primary-on"
                  />
                </DatePickerCell>
              </DatePickerGridRow>
            </DatePickerGridBody>
          </DatePickerGrid>
        </DatePickerCalendar>
      </DatePickerContent>
    </DatePickerRoot>
    <span
      v-if="message"
      :id="`${id}-error`"
      :role="error ? undefined : 'alert'"
      class="text-danger-subtle-text"
    >
      {{ message }}
    </span>
  </div>
</template>
