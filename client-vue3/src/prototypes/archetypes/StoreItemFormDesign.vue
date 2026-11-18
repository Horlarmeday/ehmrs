<script setup lang="ts">
import { ref } from 'vue';
import EntryForm from '../../components/archetypes/EntryForm.vue';
import { useEntryForm } from '../../components/archetypes/useEntryForm';
import KitDatePicker from '../../components/kit/KitDatePicker.vue';
import KitFormSection from '../../components/kit/KitFormSection.vue';
import KitInput from '../../components/kit/KitInput.vue';
import KitNativeSelect from '../../components/kit/KitNativeSelect.vue';
import KitSelect from '../../components/kit/KitSelect.vue';
import { dosageForms, routes, stockItems, strengthUnits, units, vendors } from './designData';

const emit = defineEmits<{ done: [] }>();

const form = useEntryForm({ discardTitle: 'Discard this item?' });
const blur = { validateOn: 'blur' as const };
const drug = form.field<number | null>('drug', {
  label: 'Generic drug',
  rules: 'required',
  initial: null,
  ...blur,
});
const productCode = form.field('product_code', { label: 'Product code', initial: '' });
const voucher = form.field('voucher', { label: 'Voucher or reference number', initial: '' });
const batch = form.field('batch', { label: 'Batch number', initial: '' });
const expiration = form.field<string | null>('expiration', {
  label: 'Expiry date',
  rules: 'required',
  initial: null,
  ...blur,
});
const dosageForm = form.field<string | null>('dosage_form', {
  label: 'Dosage form',
  initial: null,
});
const strength = form.field('strength_input', { label: 'Strength', initial: '' });
const strengthUnit = form.field<string | null>('strength', {
  label: 'Strength unit',
  initial: null,
});
const route = form.field<string | null>('route', {
  label: 'Route of administration',
  initial: null,
});
const quantity = form.field('quantity', {
  label: 'Quantity',
  rules: 'required',
  initial: '',
  ...blur,
});
const unit = form.field<string | null>('unit', {
  label: 'Unit',
  rules: 'required',
  initial: null,
  ...blur,
});
const unitPrice = form.field('unit_price', {
  label: 'Unit price',
  rules: 'required',
  initial: '',
  ...blur,
});
const sellingPrice = form.field('selling_price', {
  label: 'Selling price',
  rules: 'required',
  initial: '',
  ...blur,
});
const dateReceived = form.field<string | null>('date_received', {
  label: 'Date received',
  rules: 'required',
  initial: null,
  ...blur,
});
const brand = form.field('brand', { label: 'Brand', initial: '' });
const vendor = form.field<string | null>('vendor', {
  label: 'Vendor',
  rules: 'required',
  initial: null,
  ...blur,
});

const saved = ref(false);
const onSubmit = form.submit(async () => {
  await new Promise((resolve) => setTimeout(resolve, 400));
  saved.value = true;
});

async function cancel(): Promise<void> {
  if (await form.confirmDiscard()) emit('done');
}

const searchDrugs = async (term: string) =>
  [...new Set(stockItems.map((item) => item.name.split(' ')[0] ?? item.name))]
    .filter((name) => name.toLowerCase().includes(term.toLowerCase()))
    .map((name, index) => ({ value: index + 1, label: name }));
const options = (values: string[]) => values.map((value) => ({ value, label: value }));
</script>

<template>
  <EntryForm
    title="Add store item"
    description="Pharmacy store. Fields marked * are required."
    :errors="form.errors.value"
    :saving="form.saving.value"
    submit-label="Save item"
    :bind-summary="form.bindSummary"
    @submit="onSubmit"
    @cancel="cancel"
  >
    <template #notices>
      <p
        v-if="saved"
        role="status"
        class="rounded-sm bg-success-subtle px-3 py-2 text-success-subtle-text"
      >
        Item saved. This is a design screen, so nothing was sent.
      </p>
    </template>

    <KitFormSection title="Item">
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
          label="Dosage form"
          placeholder="Choose"
          :options="options(dosageForms)"
          :error="dosageForm.errorMessage.value"
        />
      </div>
      <div data-field="route">
        <KitNativeSelect
          v-model="route.value.value"
          label="Route of administration"
          placeholder="Choose"
          :options="options(routes)"
          :error="route.errorMessage.value"
        />
      </div>
      <div data-field="strength_input">
        <KitInput
          v-model="strength.value.value"
          label="Strength"
          inputmode="decimal"
          numeric
          :error="strength.errorMessage.value"
        />
      </div>
      <div data-field="strength">
        <KitNativeSelect
          v-model="strengthUnit.value.value"
          label="Strength unit"
          placeholder="Choose"
          :options="options(strengthUnits)"
          :error="strengthUnit.errorMessage.value"
        />
      </div>
      <div data-field="brand">
        <KitInput v-model="brand.value.value" label="Brand" />
      </div>
    </KitFormSection>

    <KitFormSection title="Batch and supplier">
      <div data-field="vendor">
        <KitNativeSelect
          v-model="vendor.value.value"
          label="Vendor *"
          placeholder="Choose"
          :options="options(vendors)"
          :error="vendor.errorMessage.value"
          @blur="vendor.handleBlur"
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
    </KitFormSection>

    <KitFormSection title="Quantity and price">
      <div data-field="quantity">
        <KitInput
          v-model="quantity.value.value"
          label="Quantity *"
          inputmode="numeric"
          numeric
          :error="quantity.errorMessage.value"
          @blur="quantity.handleBlur"
        />
      </div>
      <div data-field="unit">
        <KitNativeSelect
          v-model="unit.value.value"
          label="Unit *"
          placeholder="Choose"
          :options="options(units)"
          :error="unit.errorMessage.value"
          @blur="unit.handleBlur"
        />
      </div>
      <div data-field="unit_price">
        <KitInput
          v-model="unitPrice.value.value"
          label="Unit price (₦) *"
          inputmode="decimal"
          numeric
          :error="unitPrice.errorMessage.value"
          @blur="unitPrice.handleBlur"
        />
      </div>
      <div data-field="selling_price">
        <KitInput
          v-model="sellingPrice.value.value"
          label="Selling price (₦) *"
          inputmode="decimal"
          numeric
          :error="sellingPrice.errorMessage.value"
          @blur="sellingPrice.handleBlur"
        />
      </div>
    </KitFormSection>
  </EntryForm>
</template>
