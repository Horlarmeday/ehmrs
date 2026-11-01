<script setup lang="ts" generic="TValue extends string | number">
import { computed, ref, shallowRef, useId, watch } from 'vue';
import {
  ComboboxAnchor,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxPortal,
  ComboboxRoot,
  ComboboxViewport,
} from 'reka-ui';
import { useLatest } from './useLatest';

export interface KitOption<T> {
  value: T;
  label: string;
}

const props = withDefaults(
  defineProps<{
    label: string;
    hideLabel?: boolean;
    modelValue: TValue | TValue[] | null;
    multiple?: boolean;
    clearable?: boolean;
    disabled?: boolean;
    placeholder?: string;
    error?: string;
    initialOptions?: KitOption<TValue>[];
    search: (term: string) => Promise<KitOption<TValue>[]>;
  }>(),
  {
    hideLabel: false,
    multiple: false,
    clearable: true,
    disabled: false,
    placeholder: undefined,
    error: undefined,
    initialOptions: () => [],
  }
);

const emit = defineEmits<{ 'update:modelValue': [value: TValue | TValue[] | null] }>();

const id = useId();
const options = shallowRef<KitOption<TValue>[]>(props.initialOptions);
const known = new Map<TValue, string>(
  props.initialOptions.map((option) => [option.value, option.label])
);
const open = ref(false);
const searched = ref(false);
const failed = ref(false);
const input = ref<{ $el: HTMLInputElement } | null>(null);

const labelOf = (value: TValue): string => known.get(value) ?? String(value);

const selected = computed<TValue[]>(() => {
  if (props.modelValue === null) return [];
  return Array.isArray(props.modelValue) ? props.modelValue : [props.modelValue];
});

const currentLabel = (): string => {
  const current = selected.value[0];
  return props.multiple || current === undefined ? '' : labelOf(current);
};

const term = ref(currentLabel());

const { loading, run } = useLatest(
  props.search,
  (result) => {
    result.forEach((option) => known.set(option.value, option.label));
    options.value = result;
    searched.value = true;
    failed.value = false;
  },
  {
    debounceMs: 200,
    onError: () => {
      options.value = [];
      searched.value = true;
      failed.value = true;
    },
  }
);

const displayValue = (value: TValue | null | undefined): string =>
  props.multiple || value === null || value === undefined ? '' : labelOf(value);

const closedAria = computed(() =>
  open.value ? {} : { 'aria-controls': '', 'aria-activedescendant': '' }
);

watch(term, (value, previous) => {
  if (!open.value || value === previous || value === currentLabel()) return;
  run(value);
});

watch(open, (isOpen) => {
  if (isOpen && !searched.value) run('');
});

watch(
  () => props.modelValue,
  () => {
    if (!open.value) term.value = currentLabel();
  }
);

function update(value: TValue | TValue[] | null | undefined): void {
  const next = value ?? null;
  emit('update:modelValue', next);
  term.value = next === null || Array.isArray(next) ? '' : labelOf(next);
}

function focusInput(): void {
  input.value?.$el.focus();
}

function remove(value: TValue): void {
  emit(
    'update:modelValue',
    selected.value.filter((item) => item !== value)
  );
  focusInput();
}

function clear(): void {
  emit('update:modelValue', null);
  term.value = '';
  focusInput();
}

function restoreLabel(): void {
  term.value = currentLabel();
}

function onBackspace(): void {
  const last = selected.value[selected.value.length - 1];
  if (props.multiple && !term.value && last !== undefined) remove(last);
}
</script>

<template>
  <div class="flex flex-col gap-1 text-sm text-ink">
    <label :for="id" :class="hideLabel ? 'sr-only' : 'font-medium text-ink-secondary'">{{
      label
    }}</label>
    <ComboboxRoot
      v-model:open="open"
      :model-value="modelValue"
      :multiple="multiple"
      :disabled="disabled"
      ignore-filter
      :reset-search-term-on-blur="false"
      :reset-search-term-on-select="false"
      @update:model-value="update"
    >
      <ComboboxAnchor
        class="flex min-h-sm flex-wrap items-center gap-1 rounded-sm border bg-surface px-2 focus-within:outline focus-within:outline-2 focus-within:outline-offset-1 focus-within:outline-primary"
        :class="[error ? 'border-danger' : 'border-line', disabled ? 'bg-surface-alt' : '']"
      >
        <template v-if="multiple">
          <span
            v-for="value in selected"
            :key="value"
            class="my-px inline-flex items-center gap-1 rounded-sm bg-primary-subtle pl-1 text-primary-subtle-text"
          >
            {{ labelOf(value) }}
            <button
              type="button"
              class="h-[24px] w-[24px] rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
              :disabled="disabled"
              :aria-label="`Remove ${labelOf(value)}`"
              @click="remove(value)"
            >
              ×
            </button>
          </span>
        </template>
        <ComboboxInput
          :id="id"
          ref="input"
          v-model="term"
          v-bind="closedAria"
          :display-value="displayValue"
          :placeholder="placeholder"
          :aria-invalid="error ? 'true' : undefined"
          :aria-describedby="error ? `${id}-error` : undefined"
          class="h-[26px] min-w-16 flex-1 bg-transparent outline-none placeholder:text-ink-muted disabled:text-ink-secondary"
          @focus="open = true"
          @blur="restoreLabel"
          @keydown.backspace="onBackspace"
        />
        <button
          v-if="clearable && !multiple && !disabled && selected.length"
          type="button"
          class="h-[24px] w-[24px] shrink-0 rounded-sm text-ink-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          :aria-label="`Clear ${label}`"
          @click="clear"
        >
          ×
        </button>
      </ComboboxAnchor>
      <ComboboxPortal>
        <ComboboxContent
          position="popper"
          :side-offset="2"
          class="z-50 max-h-60 w-[var(--reka-combobox-trigger-width)] overflow-hidden rounded border border-line bg-surface text-sm text-ink shadow-md"
        >
          <ComboboxViewport class="p-1">
            <div v-if="loading" role="status" class="px-2 py-1 text-ink-secondary">Searching…</div>
            <div v-else-if="failed" role="alert" class="px-2 py-1 text-danger-subtle-text">
              Search failed
            </div>
            <ComboboxEmpty v-else class="px-2 py-1 text-ink-secondary"
              >No results found</ComboboxEmpty
            >
            <template v-if="!loading">
              <ComboboxItem
                v-for="option in options"
                :key="option.value"
                :value="option.value"
                class="flex min-h-xs cursor-default items-center rounded-sm px-2 data-[highlighted]:bg-blue-100 data-[state=checked]:font-semibold"
              >
                {{ option.label }}
              </ComboboxItem>
            </template>
          </ComboboxViewport>
        </ComboboxContent>
      </ComboboxPortal>
    </ComboboxRoot>
    <span v-if="error" :id="`${id}-error`" class="text-danger-subtle-text">{{ error }}</span>
  </div>
</template>
