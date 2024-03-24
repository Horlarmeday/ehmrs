<template>
  <b-modal
    v-model="activePrompt"
    @show="fetchAdmissionHistory"
    hide-footer
    size="xl"
    title="Admission Details"
  >
    <div class="p-2 border-bottom border-left border-right">
      <div v-if="history">
        <b-tabs content-class="mt-3">
          <b-tab title="Observations" active>
            <triage-table :triages="history.observations" />
          </b-tab>
          <b-tab title="Treatments">
            <treatment-table :drugs="history.treatments" />
          </b-tab>
          <b-tab title="Care Plans">
            <care-plan-table :plans="history.plans" />
          </b-tab>
          <b-tab title="IO Charts">
            <i-o-chart-table :charts="history.charts" />
          </b-tab>
          <b-tab title="Ward Rounds">
            <ward-rounds-table :ward-rounds="history.wardRounds" />
          </b-tab>
          <b-tab title="Notes">
            <nursing-notes-table :nursing-notes="history.notes" />
          </b-tab>
        </b-tabs>
      </div>
      <TabsSkeleton v-else :tabs="tabs" />
    </div>
  </b-modal>
</template>
<script>
import TabsSkeleton from '@/view/pages/programs/immunization/components/TabsSkeleton.vue';
import TriageTable from '@/view/components/table/TriageTable.vue';
import TreatmentTable from '@/view/components/table/TreatmentTable.vue';
import CarePlanTable from '@/view/components/table/CarePlanTable.vue';
import IOChartTable from '@/view/components/table/IOChartTable.vue';
import WardRoundsTable from '@/view/components/table/WardRoundsTable.vue';
import NursingNotesTable from '@/view/components/table/NursingNoteTable.vue';

export default {
  components: {
    NursingNotesTable,
    WardRoundsTable,
    IOChartTable,
    CarePlanTable,
    TreatmentTable,
    TriageTable,
    TabsSkeleton,
  },
  data: () => ({
    tabs: ['Observations', 'Treatments', 'Care Plans', 'IO Charts', 'Ward Rounds', 'Notes'],
  }),
  props: {
    displayPrompt: {
      type: Boolean,
      required: true,
    },
    visit: {
      type: Object,
      required: true,
      default: () => {},
    },
  },
  computed: {
    activePrompt: {
      get() {
        return this.displayPrompt;
      },
      set(value) {
        this.$emit('closeModal', value);
      },
    },
    history() {
      return this.$store.state.admission.history;
    },
  },
  methods: {
    fetchAdmissionHistory() {
      this.$store.dispatch('admission/fetchAdmissionHistory', {
        id: this.visit.admission_id,
      });
    },
  },
};
</script>

<style scoped></style>
