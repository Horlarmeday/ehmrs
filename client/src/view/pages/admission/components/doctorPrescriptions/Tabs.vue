<template>
  <div class="p-2 border-bottom border-left border-right">
    <b-tabs content-class="mt-5">
      <!--      <b-tab title="Vitals" active>-->
      <!--        <triage-table :triages="summary?.triages" />-->
      <!--      </b-tab>-->
      <b-tab title="Diagnoses" active>
        <diagnoses-table :diagnoses="summary?.diagnoses" />
      </b-tab>
      <b-tab title="Observations">
        <observations-table :observations="summary?.observations" />
      </b-tab>
      <b-tab title="Tests">
        <tests-table :tests="summary?.tests" />
      </b-tab>
      <b-tab title="Medications">
        <medications-table :drugs="summary?.drugs" />
      </b-tab>
      <b-tab title="Items">
        <additional-items-table :items="summary?.items" />
      </b-tab>
      <b-tab title="Radiology">
        <radiology-table :investigations="summary?.investigations" />
      </b-tab>
      <b-tab title="Services">
        <services-table :services="summary?.services" />
      </b-tab>
    </b-tabs>
  </div>
</template>

<script>
import DiagnosesTable from '@/view/components/table/DiagnosesTable.vue';
import TestsTable from '@/view/components/table/TestsTable.vue';
import RadiologyTable from '@/view/components/table/RadiologyTable.vue';
import ServicesTable from '@/view/components/table/ServicesTable.vue';
import MedicationsTable from '@/view/components/table/MedicationsTable.vue';
import ObservationsTable from '@/view/components/table/ObservationsTable.vue';
import AdditionalItemsTable from '@/view/components/table/AdditionalItemsTable.vue';

export default {
  components: {
    AdditionalItemsTable,
    ObservationsTable,
    MedicationsTable,
    ServicesTable,
    RadiologyTable,
    TestsTable,
    DiagnosesTable,
  },
  computed: {
    summary() {
      return this.$store.state.admission.summary;
    },
  },
  methods: {
    fetchDoctorPrescriptions() {
      this.$store.dispatch('admission/fetchDoctorPrescriptions', {
        id: this.$route.params.id,
      });
    },
  },
  created() {
    this.fetchDoctorPrescriptions();
  },
};
</script>
<style scoped></style>
