<script setup lang="ts">
import { ref } from 'vue';
import KitAccordion from '../KitAccordion.vue';
import KitButton from '../KitButton.vue';
import KitConfirmHost from '../KitConfirmHost.vue';
import KitDatePicker from '../KitDatePicker.vue';
import KitDialog from '../KitDialog.vue';
import KitDropdown, { type KitDropdownItem } from '../KitDropdown.vue';
import KitInput from '../KitInput.vue';
import KitSelect from '../KitSelect.vue';
import KitTabs from '../KitTabs.vue';
import KitTooltip from '../KitTooltip.vue';
import { useConfirm } from '../useConfirm';
import { searchDrugs } from './harnessApi';

const { confirm } = useConfirm();

const formOpen = ref(false);
const longOpen = ref(false);
const backdropOpen = ref(false);
const lockedOpen = ref(false);
const layersOpen = ref(false);
const menuDialogOpen = ref(false);
const opens = ref(0);
const closes = ref(0);
const note = ref('');
const dialogDrug = ref<number | number[] | null>(null);
const dialogDate = ref<string | null>(null);

const answer = ref('none');
const removableShown = ref(true);
const queued = ref<string[]>([]);

async function ask() {
  answer.value = String(await confirm({
    title: 'Delete this service?',
    text: 'The service is removed from this visit.',
    confirmLabel: 'Delete',
    severity: 'danger',
  }));
}

async function askThenRemove() {
  removableShown.value = false;
  answer.value = String(await confirm({ title: 'Removed row', text: 'Its button has gone.' }));
}

function askTwice() {
  queued.value = [];
  for (const name of ['first', 'second']) {
    confirm({ title: `Confirm ${name}`, text: `This is the ${name} question.` }).then((ok) => {
      queued.value = [...queued.value, `${name}:${ok}`];
    });
  }
}

const tab = ref('summary');
const tabs = [
  { value: 'summary', label: 'Summary' },
  { value: 'notes', label: 'Notes' },
  { value: 'locked', label: 'Billing', disabled: true },
  { value: 'lazy', label: 'History', lazy: true },
];
const manyTabs = Array.from({ length: 24 }, (_, index) => ({
  value: `t${index}`,
  label: `Department tab ${index + 1}`,
}));
const innerTabs = [
  { value: 'one', label: 'Inner one' },
  { value: 'two', label: 'Inner two' },
];
const tabNote = ref('');

const section = ref<string | string[] | undefined>('vitals');
const sections = ref<string | string[] | undefined>([]);
const accordionItems = [
  { value: 'vitals', title: 'Vitals' },
  { value: 'allergies', title: 'Allergies' },
  { value: 'closed', title: 'Archived', disabled: true },
  { value: 'lazy', title: 'Past visits', lazy: true },
];
const accordionNote = ref('');

const picked = ref('none');
const menu: KitDropdownItem[] = [
  { value: 'dispense', label: 'Dispense' },
  { value: 'reorder', label: 'Reorder', disabled: true },
  { value: 'export', label: 'Export' },
  { value: 'deactivate', label: 'Deactivate', danger: true, separatorBefore: true },
];

function onMenuSelect(value: string) {
  picked.value = value;
  if (value === 'export') menuDialogOpen.value = true;
}
</script>

<template>
  <div class="flex max-w-3xl flex-col gap-6 pb-[1200px]">
    <section aria-label="Dialogs" class="flex flex-wrap gap-2">
      <KitButton data-testid="open-form" @click="formOpen = true">Open form</KitButton>
      <KitButton severity="secondary" data-testid="open-long" @click="longOpen = true"
        >Open long</KitButton
      >
      <KitButton severity="secondary" data-testid="open-backdrop" @click="backdropOpen = true"
        >Open backdrop</KitButton
      >
      <KitButton severity="secondary" data-testid="open-locked" @click="lockedOpen = true"
        >Open locked</KitButton
      >
      <KitButton severity="secondary" data-testid="open-layers" @click="layersOpen = true"
        >Open layers</KitButton
      >
      <output data-testid="dialog-events">{{ opens }}/{{ closes }}</output>
    </section>

    <section aria-label="Confirms" class="flex flex-wrap gap-2">
      <KitButton severity="danger" data-testid="ask" @click="ask">Delete service</KitButton>
      <KitButton
        v-if="removableShown"
        severity="secondary"
        data-testid="ask-remove"
        @click="askThenRemove"
        >Ask then remove</KitButton
      >
      <KitButton severity="secondary" data-testid="ask-twice" @click="askTwice">Ask twice</KitButton>
      <output data-testid="answer">{{ answer }}</output>
      <output data-testid="queued">{{ queued.join(',') }}</output>
    </section>

    <section aria-label="Tabs examples" class="flex flex-col gap-4">
      <KitButton severity="secondary" data-testid="tab-from-parent" @click="tab = 'notes'"
        >Go to notes</KitButton
      >
      <KitTabs v-model="tab" :tabs="tabs" label="Patient record" data-testid="tabs">
        <template #panel-summary>
          <KitTabs :tabs="innerTabs" label="Summary sections">
            <template #panel-one>Inner one content</template>
            <template #panel-two>Inner two content</template>
          </KitTabs>
        </template>
        <template #panel-notes><KitInput v-model="tabNote" label="Tab note" /></template>
        <template #panel-locked>Billing content</template>
        <template #panel-lazy><p data-testid="lazy-panel">History content</p></template>
      </KitTabs>
      <output data-testid="active-tab">{{ tab }}</output>
      <KitTabs :tabs="manyTabs" label="Departments" data-testid="many-tabs">
        <template v-for="item in manyTabs" :key="item.value" #[`panel-${item.value}`]>
          {{ item.label }} content
        </template>
      </KitTabs>
    </section>

    <section aria-label="Accordions" class="flex flex-col gap-4">
      <KitButton severity="secondary" data-testid="section-from-parent" @click="section = 'allergies'"
        >Go to allergies</KitButton
      >
      <KitAccordion v-model="section" :items="accordionItems" data-testid="accordion">
        <template #item-vitals><KitInput v-model="accordionNote" label="Vitals note" /></template>
        <template #item-allergies>No known allergies</template>
        <template #item-closed>Archived content</template>
        <template #item-lazy><p data-testid="lazy-item">Past visit content</p></template>
      </KitAccordion>
      <output data-testid="active-section">{{ section }}</output>
      <KitAccordion
        v-model="sections"
        multiple
        :items="accordionItems.slice(0, 2)"
        data-testid="accordion-multiple"
      >
        <template #item-vitals>Multi vitals</template>
        <template #item-allergies>Multi allergies</template>
      </KitAccordion>
    </section>

    <section aria-label="Tooltips" class="flex gap-2">
      <KitTooltip text="Print the record">
        <KitButton severity="secondary" aria-label="Print" data-testid="tooltip-trigger"
          >P</KitButton
        >
      </KitTooltip>
    </section>

    <section aria-label="Dropdowns" class="flex items-center gap-2">
      <KitDropdown
        label="More actions"
        :items="menu"
        data-testid="dropdown"
        @select="onMenuSelect"
      />
      <output data-testid="picked">{{ picked }}</output>
    </section>

    <KitDialog
      v-model:open="formOpen"
      title="Create visit"
      description="Start a new visit for this patient."
      @opened="opens++"
      @closed="closes++"
    >
      <KitInput v-model="note" label="Reason" />
      <template #footer>
        <KitButton severity="secondary" data-testid="form-cancel" @click="formOpen = false"
          >Cancel</KitButton
        >
        <KitButton data-testid="form-save" @click="formOpen = false">Save visit</KitButton>
      </template>
    </KitDialog>

    <KitDialog v-model:open="longOpen" title="Prescriptions history" size="xl">
      <p v-for="line in 80" :key="line" class="py-1">History line {{ line }}</p>
      <template #footer><KitButton data-testid="long-done" @click="longOpen = false">Done</KitButton></template>
    </KitDialog>

    <KitDialog v-model:open="backdropOpen" title="Details" size="sm" close-on-backdrop>
      <p>Nothing to lose here.</p>
    </KitDialog>

    <KitDialog v-model:open="lockedOpen" title="Session timeout" :close-on-escape="false">
      <p>You will be signed out soon.</p>
    </KitDialog>

    <KitDialog v-model:open="layersOpen" title="Layered controls" size="lg">
      <div class="flex flex-col gap-3">
        <KitSelect v-model="dialogDrug" label="Dialog drug" placeholder="Search drugs" :search="searchDrugs" />
        <KitDatePicker v-model="dialogDate" label="Dialog date" min="2026-01-10" max="2026-12-20" />
        <KitTooltip text="Inside the dialog">
          <KitButton severity="secondary" data-testid="dialog-tooltip">Hint</KitButton>
        </KitTooltip>
        <KitButton severity="danger" data-testid="dialog-ask" @click="ask">Delete inside</KitButton>
      </div>
    </KitDialog>

    <KitDialog v-model:open="menuDialogOpen" title="Export data">
      <KitInput v-model="note" label="File name" />
    </KitDialog>

    <KitConfirmHost />
  </div>
</template>
