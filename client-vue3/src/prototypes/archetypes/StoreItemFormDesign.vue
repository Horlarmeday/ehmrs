<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue';
import { useField, useForm } from 'vee-validate';
import KitButton from '../../components/kit/KitButton.vue';
import KitConfirmHost from '../../components/kit/KitConfirmHost.vue';
import KitDatePicker from '../../components/kit/KitDatePicker.vue';
import KitErrorSummary, { type KitFieldError } from '../../components/kit/KitErrorSummary.vue';
import KitInput from '../../components/kit/KitInput.vue';
import KitNativeSelect from '../../components/kit/KitNativeSelect.vue';
import KitPageHeader from '../../components/kit/KitPageHeader.vue';
import KitSelect from '../../components/kit/KitSelect.vue';
import { useConfirm } from '../../components/kit/useConfirm';
import { dosageForms, routes, stockItems, strengthUnits, units, vendors } from './designData';

const emit = defineEmits<{ done: [] }>();

const required = (name: string) => (value: unknown) =>
  value !== null && value !== undefined && value !== '' ? true : `The ${name} field is required.`;
const optional = (): true => true;

const { handleSubmit, meta, submitCount } = useForm();
const field = <T,>(
  key: string,
  title: string,
  rule: (value: unknown) => true | string,
  initialValue: T
) => ({ key, title, ...useField<T>(key, rule, { initialValue }) });

const drug = field<number | null>('drug', 'Generic drug', required('drug'), null);
const productCode = field('product_code', 'Product code', optional, '');
const voucher = field('voucher', 'Voucher or reference number', optional, '');
const batch = field('batch', 'Batch number', optional, '');
const expiration = field<string | null>('expiration', 'Expiry date', required('expiration'), null);
const dosageForm = field<string | null>(
  'dosage_form',
  'Dosage form',
  required('dosage form'),
  null
);
const strength = field('strength_input', 'Strength', required('strength'), '');
const strengthUnit = field<string | null>(
  'strength',
  'Strength unit',
  required('strength unit'),
  null
);
const route = field<string | null>('route', 'Route of administration', required('route'), null);
const quantity = field('quantity', 'Quantity', required('quantity'), '');
const unit = field<string | null>('unit', 'Unit', required('unit'), null);
const unitPrice = field('unit_price', 'Unit price', required('unit price'), '');
const sellingPrice = field('selling_price', 'Selling price', required('selling price'), '');
const dateReceived = field<string | null>(
  'date_received',
  'Date received',
  required('date received'),
  null
);
const brand = field('brand', 'Brand', optional, '');
const vendor = field<string | null>('vendor', 'Vendor', required('vendor'), null);

const all = [
  drug,
  productCode,
  voucher,
  batch,
  expiration,
  dosageForm,
  strength,
  strengthUnit,
  route,
  quantity,
  unit,
  unitPrice,
  sellingPrice,
  dateReceived,
  brand,
  vendor,
];
const summary = useTemplateRef<InstanceType<typeof KitErrorSummary>>('summary');
const errors = computed<KitFieldError[]>(() =>
  submitCount.value === 0
    ? []
    : all
        .filter((item) => item.errorMessage.value)
        .map((item) => ({
          field: item.key,
          label: item.title,
        }))
);
const saved = ref(false);
const { confirm } = useConfirm();

const searchDrugs = async (term: string) =>
  [...new Set(stockItems.map((item) => item.name.split(' ')[0] ?? item.name))]
    .filter((name) => name.toLowerCase().includes(term.toLowerCase()))
    .map((name, index) => ({ value: index + 1, label: name }));
const options = (values: string[]) => values.map((value) => ({ value, label: value }));

const onSubmit = handleSubmit(
  () => {
    saved.value = true;
  },
  () => summary.value?.focus()
);

async function cancel(): Promise<void> {
  if (meta.value.dirty) {
    const discard = await confirm({
      title: 'Discard this item?',
      text: 'What you have typed will be lost.',
      confirmLabel: 'Discard',
      cancelLabel: 'Keep editing',
      severity: 'danger',
    });
    if (!discard) return;
  }
  emit('done');
}

const section = 'flex flex-col gap-3 border-t border-line-subtle pt-4';
const heading = 'text-md font-semibold';
const grid = 'grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 xl:grid-cols-3';
</script>

<template>
  <form
    novalidate
    class="flex max-w-[1040px] flex-col gap-5"
    aria-label="Add store item"
    @submit="onSubmit"
  >
    <KitPageHeader
      title="Add store item"
      description="Pharmacy store. Fields marked * are required."
    />

    <KitErrorSummary ref="summary" :errors="errors" />
    <p
      v-if="saved"
      role="status"
      class="rounded-sm bg-success-subtle px-3 py-2 text-success-subtle-text"
    >
      Item saved. This is a design screen, so nothing was sent.
    </p>

    <section :class="section" aria-labelledby="item-heading">
      <h2 id="item-heading" :class="heading">Item</h2>
      <div :class="grid">
        <div data-field="drug" class="sm:col-span-2 xl:col-span-1">
          <KitSelect
            v-model="drug.value.value"
            label="Generic drug *"
            placeholder="Search generic drugs"
            :search="searchDrugs"
            :error="drug.errorMessage.value"
          />
        </div>
        <div data-field="dosage_form">
          <KitNativeSelect
            v-model="dosageForm.value.value"
            label="Dosage form *"
            placeholder="Choose"
            :options="options(dosageForms)"
            :error="dosageForm.errorMessage.value"
          />
        </div>
        <div data-field="route">
          <KitNativeSelect
            v-model="route.value.value"
            label="Route of administration *"
            placeholder="Choose"
            :options="options(routes)"
            :error="route.errorMessage.value"
          />
        </div>
        <div data-field="strength_input">
          <KitInput
            v-model="strength.value.value"
            label="Strength *"
            inputmode="decimal"
            numeric
            :error="strength.errorMessage.value"
          />
        </div>
        <div data-field="strength">
          <KitNativeSelect
            v-model="strengthUnit.value.value"
            label="Strength unit *"
            placeholder="Choose"
            :options="options(strengthUnits)"
            :error="strengthUnit.errorMessage.value"
          />
        </div>
        <div data-field="brand">
          <KitInput v-model="brand.value.value" label="Brand" />
        </div>
      </div>
    </section>

    <section :class="section" aria-labelledby="batch-heading">
      <h2 id="batch-heading" :class="heading">Batch and supplier</h2>
      <div :class="grid">
        <div data-field="vendor">
          <KitNativeSelect
            v-model="vendor.value.value"
            label="Vendor *"
            placeholder="Choose"
            :options="options(vendors)"
            :error="vendor.errorMessage.value"
          />
        </div>
        <div data-field="batch"><KitInput v-model="batch.value.value" label="Batch number" /></div>
        <div data-field="expiration">
          <KitDatePicker
            v-model="expiration.value.value"
            label="Expiry date *"
            :error="expiration.errorMessage.value"
          />
        </div>
        <div data-field="date_received">
          <KitDatePicker
            v-model="dateReceived.value.value"
            label="Date received *"
            :error="dateReceived.errorMessage.value"
          />
        </div>
        <div data-field="product_code">
          <KitInput v-model="productCode.value.value" label="Product code" />
        </div>
        <div data-field="voucher">
          <KitInput v-model="voucher.value.value" label="Voucher or reference number" />
        </div>
      </div>
    </section>

    <section :class="section" aria-labelledby="price-heading">
      <h2 id="price-heading" :class="heading">Quantity and price</h2>
      <div :class="grid">
        <div data-field="quantity">
          <KitInput
            v-model="quantity.value.value"
            label="Quantity *"
            inputmode="numeric"
            numeric
            :error="quantity.errorMessage.value"
          />
        </div>
        <div data-field="unit">
          <KitNativeSelect
            v-model="unit.value.value"
            label="Unit *"
            placeholder="Choose"
            :options="options(units)"
            :error="unit.errorMessage.value"
          />
        </div>
        <div data-field="unit_price">
          <KitInput
            v-model="unitPrice.value.value"
            label="Unit price (₦) *"
            inputmode="decimal"
            numeric
            :error="unitPrice.errorMessage.value"
          />
        </div>
        <div data-field="selling_price">
          <KitInput
            v-model="sellingPrice.value.value"
            label="Selling price (₦) *"
            inputmode="decimal"
            numeric
            :error="sellingPrice.errorMessage.value"
          />
        </div>
      </div>
    </section>

    <div
      class="sticky bottom-0 z-10 -mx-4 flex justify-end gap-2 border-t border-line-subtle bg-surface-page px-4 py-3 xl:-mx-[30px] xl:px-[30px]"
    >
      <KitButton severity="secondary" @click="cancel">Cancel</KitButton>
      <KitButton type="submit">Save item</KitButton>
    </div>
    <KitConfirmHost />
  </form>
</template>
