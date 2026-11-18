<script setup lang="ts">
import { CalendarDate } from '@internationalized/date';
import {
  CalendarCell,
  CalendarCellTrigger,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHead,
  CalendarGridRow,
  CalendarHeadCell,
  CalendarHeader,
  CalendarHeading,
  CalendarNext,
  CalendarPrev,
  CalendarRoot,
} from 'reka-ui';

defineProps<{
  modelValue: CalendarDate | undefined;
  minValue?: CalendarDate;
  maxValue?: CalendarDate;
  label: string;
}>();

const emit = defineEmits<{ select: [value: CalendarDate] }>();

function onUpdate(next: unknown): void {
  if (next instanceof CalendarDate) emit('select', next);
}

const navClass =
  'flex min-h-xs min-w-[30px] touch:min-h-touch touch:min-w-touch items-center justify-center rounded-sm text-ink-secondary hover:bg-surface-alt focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary';
</script>

<template>
  <CalendarRoot
    v-slot="{ weekDays, grid }"
    :model-value="modelValue"
    :min-value="minValue"
    :max-value="maxValue"
    :calendar-label="label"
    locale="en-GB"
    :week-starts-on="1"
    fixed-weeks
    initial-focus
    class="text-sm text-ink"
    @update:model-value="onUpdate"
  >
    <CalendarHeader class="mb-2 flex items-center justify-between">
      <CalendarPrev aria-label="Previous month" :class="navClass">
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          class="h-4 w-4"
          fill="none"
          stroke="currentColor"
          stroke-width="1.75"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M10 3.5L5.5 8l4.5 4.5" />
        </svg>
      </CalendarPrev>
      <CalendarHeading class="font-semibold" />
      <CalendarNext aria-label="Next month" :class="navClass">
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          class="h-4 w-4"
          fill="none"
          stroke="currentColor"
          stroke-width="1.75"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M6 3.5L10.5 8 6 12.5" />
        </svg>
      </CalendarNext>
    </CalendarHeader>
    <CalendarGrid
      v-for="month in grid"
      :key="month.value.toString()"
      class="mx-auto border-collapse"
    >
      <CalendarGridHead>
        <CalendarGridRow>
          <CalendarHeadCell
            v-for="day in weekDays"
            :key="day"
            class="h-[30px] w-[38px] touch:min-w-touch text-xs font-medium text-ink-muted"
          >
            {{ day }}
          </CalendarHeadCell>
        </CalendarGridRow>
      </CalendarGridHead>
      <CalendarGridBody>
        <CalendarGridRow v-for="week in month.rows" :key="week.toString()">
          <CalendarCell v-for="day in week" :key="day.toString()" :date="day">
            <CalendarCellTrigger
              :day="day"
              :month="month.value"
              class="mx-auto flex h-[34px] w-[34px] touch:min-h-touch touch:min-w-touch items-center justify-center rounded-full tabular-nums transition-colors hover:bg-primary-subtle focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary data-[outside-view]:text-ink-muted data-[disabled]:text-ink-disabled data-[disabled]:line-through data-[today]:font-bold data-[today]:text-primary data-[selected]:bg-primary data-[selected]:font-semibold data-[selected]:text-primary-on data-[selected]:hover:bg-primary-hover"
            />
          </CalendarCell>
        </CalendarGridRow>
      </CalendarGridBody>
    </CalendarGrid>
  </CalendarRoot>
</template>
