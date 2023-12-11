<template>
  <div class="card card-custom card-stretch gutter-b card-shadowless">
    <page-skeleton v-if="!prescription" title="Doctor Prescriptions" :times="6" />
    <div v-else>
      <div class="card-body">
        <b-tabs content-class="mt-5">
          <b-tab title="Triages" active>
            <triage-table :triages="prescription.triages" />
          </b-tab>
          <b-tab title="Observations">
            <observations-table :observations="prescription.observations" />
          </b-tab>
          <b-tab title="Diagnoses">
            <diagnoses-table :diagnoses="prescription.diagnoses" />
          </b-tab>
          <b-tab title="Tests">
            <tests-table :tests="prescription.tests" />
          </b-tab>
          <b-tab title="Medications">
            <medications-table :drugs="prescription.drugs" />
          </b-tab>
          <b-tab title="Items">
            <additional-items-table :items="prescription.items" />
          </b-tab>
          <b-tab title="Radiology">
            <radiology-table :investigations="prescription.investigations" />
          </b-tab>
          <b-tab title="Services">
            <services-table :services="prescription.services" />
          </b-tab>
        </b-tabs>
      </div>
    </div>
  </div>
</template>
<script>
import TriageTable from '@/view/components/table/TriageTable.vue';
import ObservationsTable from '@/view/components/table/ObservationsTable.vue';
import DiagnosesTable from '@/view/components/table/DiagnosesTable.vue';
import TestsTable from '@/view/components/table/TestsTable.vue';
import MedicationsTable from '@/view/components/table/MedicationsTable.vue';
import RadiologyTable from '@/view/components/table/RadiologyTable.vue';
import ServicesTable from '@/view/components/table/ServicesTable.vue';
import AdditionalItemsTable from '@/view/components/table/AdditionalItemsTable.vue';
import PageSkeleton from '@/utils/PageSkeleton.vue';
export default {
  name: 'DoctorPrescriptions',
  components: {
    PageSkeleton,
    AdditionalItemsTable,
    ServicesTable,
    RadiologyTable,
    MedicationsTable,
    TestsTable,
    DiagnosesTable,
    ObservationsTable,
    TriageTable,
  },
  data: () => ({
    currentPage: 1,
    itemsPerPage: 5,
  }),
  computed: {
    prescription() {
      return this.$store.state.visit.visitPrescriptions;
    },
  },
  methods: {
    fetchVisitPrescriptions() {
      this.$store.dispatch('visit/fetchVisitPrescriptions', this.$route.params.id);
    },
  },
  created() {
    this.fetchVisitPrescriptions();
  },
};
</script>

<style scoped>
.padding-left {
  padding-left: 50px;
}

.padding-right {
  padding-right: 70px;
}
</style>
