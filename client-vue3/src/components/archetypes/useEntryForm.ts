import { computed, onBeforeUnmount, ref, shallowRef, type Ref } from 'vue';
import { useField, useForm, type RuleExpression } from 'vee-validate';
import { onBeforeRouteLeave } from 'vue-router';
import { useConfirm } from '../kit/useConfirm';
import type { KitFieldError } from '../kit/KitErrorSummary.vue';

export interface EntryField<T> {
  name: string;
  label: string;
  value: Ref<T>;
  errorMessage: Ref<string | undefined>;
  handleBlur: (event?: Event) => void;
}

export interface EntryFormOptions {
  discardTitle?: string;
  discardText?: string;
}

export function useEntryForm(options: EntryFormOptions = {}) {
  const { handleSubmit, meta, submitCount, resetForm, values } = useForm();
  const fields = shallowRef<
    Array<{ name: string; label: string; errorMessage: Ref<string | undefined> }>
  >([]);
  const saving = ref(false);
  const summaryFocus = ref<(() => void) | null>(null);
  const { confirm } = useConfirm();

  function field<T>(
    name: string,
    config: {
      label: string;
      as?: string;
      rules?: RuleExpression<T>;
      initial: T;
      validateOn?: 'change' | 'blur';
    }
  ): EntryField<T> {
    const bound = useField<T>(name, config.rules, {
      label: config.as ?? name,
      initialValue: config.initial,
      validateOnValueUpdate: config.validateOn !== 'blur',
    });
    const entry: EntryField<T> = {
      name,
      label: config.label,
      value: bound.value,
      errorMessage: bound.errorMessage,
      handleBlur: (event?: Event) => bound.handleBlur(event, config.validateOn === 'blur'),
    };
    fields.value = [
      ...fields.value,
      { name, label: config.label, errorMessage: bound.errorMessage },
    ];
    return entry;
  }

  const errors = computed<KitFieldError[]>(() =>
    submitCount.value === 0
      ? []
      : fields.value
          .filter((item) => item.errorMessage.value)
          .map((item) => ({ field: item.name, label: item.label }))
  );

  const dirty = computed(() => meta.value.dirty);

  function submit(handler: (values: Record<string, unknown>) => Promise<unknown> | unknown) {
    return handleSubmit(
      async (current) => {
        if (saving.value) return;
        saving.value = true;
        try {
          await handler(current);
          resetForm({ values: { ...values } });
        } finally {
          saving.value = false;
        }
      },
      () => summaryFocus.value?.()
    );
  }

  async function confirmDiscard(): Promise<boolean> {
    if (!dirty.value) return true;
    return confirm({
      title: options.discardTitle ?? 'Discard your changes?',
      text: options.discardText ?? 'What you have typed will be lost.',
      confirmLabel: 'Discard',
      cancelLabel: 'Keep editing',
      severity: 'danger',
    });
  }

  function onBeforeUnload(event: BeforeUnloadEvent): void {
    if (!dirty.value) return;
    event.preventDefault();
    event.returnValue = '';
  }
  window.addEventListener('beforeunload', onBeforeUnload);
  onBeforeUnmount(() => window.removeEventListener('beforeunload', onBeforeUnload));
  onBeforeRouteLeave(() => confirmDiscard());

  return {
    field,
    submit,
    errors,
    dirty,
    saving,
    values,
    confirmDiscard,
    reset: (next: Record<string, unknown>) => resetForm({ values: next }),
    bindSummary: (focus: () => void) => {
      summaryFocus.value = focus;
    },
  };
}
