<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useField, useForm } from 'vee-validate';
import KitButton from '../../components/kit/KitButton.vue';
import KitDatePicker from '../../components/kit/KitDatePicker.vue';
import KitInput from '../../components/kit/KitInput.vue';
import KitRadioGroup from '../../components/kit/KitRadioGroup.vue';
import KitSelect from '../../components/kit/KitSelect.vue';
import KitTextarea from '../../components/kit/KitTextarea.vue';
import {
  addPatient,
  findByPhone,
  localSearch,
  options,
  registrationFees,
  statesAndLgas,
  type FakePatient,
} from './fakeData';

const props = defineProps<{ term: string }>();
const emit = defineEmits<{
  cancel: [];
  open: [patient: FakePatient];
  saved: [patient: FakePatient];
}>();

const PHONE =
  /((^090)([1-9]))|((^091)([0-9]))|((^070)([1-9]))|((^080)([2-9]))|((^081)([0-9]))(\d{7})/;
const accountType = ref('Normal');
const walkIn = computed(() => accountType.value === 'Walk-in');
const required = (value: unknown): true | string => (value ? true : 'This field is required');
const fullOnly = (value: unknown): true | string => (walkIn.value ? true : required(value));
const phoneRule = (value: unknown): true | string => {
  const text = String(value ?? '');
  if (!text) return 'This field is required';
  return text.length === 11 && PHONE.test(text)
    ? true
    : 'The phone field should match the Nigerian phone pattern e.g 07098765321';
};
const nokPhoneRule = (value: unknown): true | string => (walkIn.value ? true : phoneRule(value));

const trimmed = props.term.trim();
const isNumber = /^\d+$/.test(trimmed);
const nameParts = isNumber ? [] : trimmed.split(/\s+/).filter(Boolean);

const { handleSubmit } = useForm();
const text = (name: string, rule: (value: unknown) => true | string, initialValue = '') =>
  useField<string>(name, rule, { initialValue });
const firstname = text('firstname', required, nameParts[0] ?? '');
const lastname = text('lastname', required, nameParts.slice(1).join(' '));
const middlename = text('middlename', () => true);
const phone = text('phone', phoneRule, isNumber ? trimmed : '');
const altPhone = text('alt_phone', () => true);
const email = text('email', () => true);
const gender = text('gender', required);
const birth = useField<string | null>('date_of_birth', required, { initialValue: null });
const religion = useField<string | null>('religion', required, { initialValue: null });
const marital = useField<string | null>('marital_status', required, { initialValue: null });
const occupation = text('occupation', fullOnly);
const country = useField<string | null>('country', required, { initialValue: 'Nigeria' });
const state = useField<string | null>('state', required, { initialValue: null });
const lga = useField<string | null>('lga', required, { initialValue: null });
const address = text('address', required);
const kinName = text('next_of_kin_name', fullOnly);
const kinPhone = text('next_of_kin_phone', nokPhoneRule);
const kinAddress = text('next_of_kin_address', fullOnly);
const relationship = useField<string | null>('relationship', fullOnly, { initialValue: null });
const photo = useField<string>(
  'photo',
  (value) => (walkIn.value || value ? true : 'Please take patient photo'),
  { initialValue: '' }
);
const fee = ref<string | undefined>();

watch(state.value, () => {
  lga.value.value = null;
});
const lgaOptions = computed(() => statesAndLgas[state.value.value ?? ''] ?? []);
const searchLga = (term: string) => localSearch(lgaOptions.value)(term);
const existing = computed(() => findByPhone(phone.value.value));

function takePhoto(): void {
  photo.value.value = 'captured';
}

const genders = options(['Male', 'Female', 'Other']);
const types = [
  { value: 'Normal', label: 'Normal' },
  { value: 'Walk-in', label: 'Walk-in' },
];
const onSubmit = handleSubmit(() => {
  if (existing.value) return;
  emit(
    'saved',
    addPatient({
      firstname: firstname.value.value,
      lastname: lastname.value.value,
      phone: phone.value.value,
      gender: gender.value.value,
      walkIn: walkIn.value,
    })
  );
});
const section = 'border-t border-line-subtle pt-4';
const heading = 'mb-3 text-md font-semibold';
const grid = 'grid grid-cols-3 gap-x-4 gap-y-3';
</script>

<template>
  <form
    novalidate
    class="flex max-w-[960px] flex-col gap-5"
    aria-label="Register patient"
    @submit="onSubmit"
  >
    <div class="flex items-start justify-between gap-3">
      <div>
        <p class="text-ink-secondary">
          Enter the phone number first. It shows straight away if the patient is already registered.
        </p>
      </div>
      <KitRadioGroup v-model="accountType" label="Account type" :options="types" />
    </div>

    <section :class="section" aria-labelledby="contact-heading">
      <h3 id="contact-heading" :class="heading">Contact</h3>
      <div :class="grid">
        <KitInput
          v-model="phone.value.value"
          label="Phone"
          inputmode="numeric"
          maxlength="11"
          :error="phone.errorMessage.value"
          @blur="phone.handleBlur"
        />
        <KitInput
          v-model="altPhone.value.value"
          label="Alternate phone (optional)"
          inputmode="numeric"
        />
        <KitInput v-model="email.value.value" label="Email (optional)" type="email" />
      </div>
      <div
        v-if="existing"
        role="alert"
        data-testid="duplicate"
        class="mt-2 flex items-center justify-between gap-2 rounded-sm bg-warning-subtle px-2 py-1 text-warning-subtle-text"
      >
        <span
          >This phone number already belongs to <strong>{{ existing.name }}</strong> ({{
            existing.hospitalNumber
          }}). A new account can't use it.</span
        >
        <KitButton size="xs" severity="secondary" @click="emit('open', existing!)"
          >Open their chart</KitButton
        >
      </div>
    </section>

    <section :class="section" aria-labelledby="identity-heading">
      <h3 id="identity-heading" :class="heading">Identity</h3>
      <div :class="grid">
        <KitInput
          v-model="firstname.value.value"
          label="First name"
          :error="firstname.errorMessage.value"
        />
        <KitInput v-model="middlename.value.value" label="Middle name (optional)" />
        <KitInput
          v-model="lastname.value.value"
          label="Last name"
          :error="lastname.errorMessage.value"
        />
        <KitDatePicker
          v-model="birth.value.value"
          label="Date of birth"
          :error="birth.errorMessage.value"
        />
        <KitRadioGroup
          v-model="gender.value.value"
          label="Gender"
          :options="genders"
          :error="gender.errorMessage.value"
        />
        <KitSelect
          v-model="marital.value.value"
          label="Marital status"
          :search="localSearch(['Married', 'Single', 'Widow', 'Widower', 'Divorced'])"
          :error="marital.errorMessage.value"
        />
        <KitSelect
          v-model="religion.value.value"
          label="Religion"
          :search="localSearch(['Islam', 'Christianity', 'Traditional', 'Other'])"
          :error="religion.errorMessage.value"
        />
        <KitInput
          v-if="!walkIn"
          v-model="occupation.value.value"
          label="Occupation"
          :error="occupation.errorMessage.value"
        />
      </div>
    </section>

    <section :class="section" aria-labelledby="address-heading">
      <h3 id="address-heading" :class="heading">Address</h3>
      <div :class="grid">
        <KitSelect
          v-model="country.value.value"
          label="Country"
          :search="localSearch(['Nigeria'])"
          :initial-options="options(['Nigeria'])"
          :error="country.errorMessage.value"
        />
        <KitSelect
          v-model="state.value.value"
          label="State"
          :search="localSearch(Object.keys(statesAndLgas))"
          :error="state.errorMessage.value"
        />
        <KitSelect
          :key="state.value.value ?? 'none'"
          v-model="lga.value.value"
          label="Local government area"
          :disabled="!state.value.value"
          :search="searchLga"
          :error="lga.errorMessage.value"
        />
      </div>
      <div class="mt-2">
        <KitTextarea
          v-model="address.value.value"
          label="Address"
          :rows="2"
          :error="address.errorMessage.value"
        />
      </div>
    </section>

    <template v-if="!walkIn">
      <section :class="section" aria-labelledby="kin-heading">
        <h3 id="kin-heading" :class="heading">Next of kin</h3>
        <div :class="grid">
          <KitInput
            v-model="kinName.value.value"
            label="Next of kin name"
            :error="kinName.errorMessage.value"
          />
          <KitInput
            v-model="kinPhone.value.value"
            label="Next of kin phone"
            inputmode="numeric"
            maxlength="11"
            :error="kinPhone.errorMessage.value"
          />
          <KitSelect
            v-model="relationship.value.value"
            label="Relationship"
            :search="
              localSearch([
                'Father',
                'Mother',
                'Wife',
                'Husband',
                'Son',
                'Daughter',
                'Uncle',
                'Aunt',
              ])
            "
            :error="relationship.errorMessage.value"
          />
        </div>
        <div class="mt-2">
          <KitTextarea
            v-model="kinAddress.value.value"
            label="Next of kin address"
            :rows="2"
            :error="kinAddress.errorMessage.value"
          />
        </div>
      </section>

      <section :class="section" aria-labelledby="photo-heading">
        <h3 id="photo-heading" :class="heading">Photo and fee</h3>
        <div class="flex items-start gap-6">
          <div class="flex items-center gap-2">
            <div
              class="flex h-16 w-16 items-center justify-center rounded-full bg-surface-alt text-center text-xs text-ink-secondary"
              data-testid="photo"
            >
              {{ photo.value.value ? 'Taken' : 'No photo' }}
            </div>
            <div class="flex flex-col gap-1">
              <KitButton @click="takePhoto">{{
                photo.value.value ? 'Retake photo' : 'Take photo'
              }}</KitButton>
              <span v-if="photo.errorMessage.value" class="text-danger-subtle-text">{{
                photo.errorMessage.value
              }}</span>
            </div>
          </div>
          <KitRadioGroup v-model="fee" label="Registration fee" :options="registrationFees" />
        </div>
      </section>
    </template>

    <div
      class="sticky bottom-0 flex justify-end gap-2 border-t border-line-subtle bg-surface-page py-3"
    >
      <KitButton severity="secondary" @click="emit('cancel')">Cancel</KitButton>
      <KitButton type="submit" :disabled="Boolean(existing)">Register patient</KitButton>
    </div>
  </form>
</template>
