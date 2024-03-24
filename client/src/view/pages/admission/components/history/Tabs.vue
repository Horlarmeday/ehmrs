<template>
  <div class="p-2 border-bottom border-left border-right">
    <b-tabs content-class="mt-5" v-if="history">
      <b-tab title="Observations" active>
        <triage-table :triages="history.observations" />
      </b-tab>
      <b-tab title="Diagnoses">
        <diagnoses-table :diagnoses="history.diagnoses" />
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
      <b-tab title="Tests">
        <tests-table :tests="history.tests" />
      </b-tab>
      <b-tab title="Medications">
        <medications-table :drugs="history.drugs" />
      </b-tab>
      <b-tab title="Items">
        <additional-items-table :items="history.items" />
      </b-tab>
      <b-tab title="Radiology">
        <radiology-table :investigations="history.investigations" />
      </b-tab>
      <b-tab title="Services">
        <services-table :services="history.services" />
      </b-tab>
    </b-tabs>
    <b-card v-else>
      <b-skeleton animation="wave" width="85%"></b-skeleton>
      <b-skeleton animation="wave" width="55%"></b-skeleton>
      <b-skeleton animation="wave" width="70%"></b-skeleton>
    </b-card>
  </div>
</template>

<script>
import DiagnosesTable from '@/view/components/table/DiagnosesTable.vue';
import TestsTable from '@/view/components/table/TestsTable.vue';
import RadiologyTable from '@/view/components/table/RadiologyTable.vue';
import ServicesTable from '@/view/components/table/ServicesTable.vue';
import TriageTable from '@/view/components/table/TriageTable.vue';
import MedicationsTable from '@/view/components/table/MedicationsTable.vue';
import TreatmentTable from '@/view/components/table/TreatmentTable.vue';
import CarePlanTable from '@/view/components/table/CarePlanTable.vue';
import IOChartTable from '@/view/components/table/IOChartTable.vue';
import WardRoundsTable from '@/view/components/table/WardRoundsTable.vue';
import NursingNotesTable from '@/view/components/table/NursingNoteTable.vue';
import AdditionalItemsTable from '@/view/components/table/AdditionalItemsTable.vue';

export default {
  components: {
    AdditionalItemsTable,
    TestsTable,
    NursingNotesTable,
    WardRoundsTable,
    IOChartTable,
    CarePlanTable,
    TreatmentTable,
    MedicationsTable,
    TriageTable,
    ServicesTable,
    RadiologyTable,
    DiagnosesTable,
  },
  computed: {
    history() {
      return this.$store.state.admission.history;
    },
  },
  methods: {
    fetchAdmissionHistory() {
      this.$store.dispatch('admission/fetchAdmissionHistory', {
        id: this.$route.params.id,
      });
    },
  },
  created() {
    this.fetchAdmissionHistory();
  },
};
</script>
<style scoped></style>
