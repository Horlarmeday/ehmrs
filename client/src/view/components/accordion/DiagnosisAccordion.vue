<template>
  <div class="card-custom card-stretch card-stretch-fourth gutter-b">
    <div class="accordion accordion-solid accordion-panel accordion-svg-toggle" role="tablist">
      <div class="card">
        <div class="card-header" header-tag="header" role="tab" style="background: blue">
          <div class="card-title accord" v-b-toggle="'accordion-65'">
            <div class="card-label">Diagnosis and Findings</div>
          </div>
        </div>
        <b-collapse
          @show="fetchDiagnosesAndFindings"
          id="accordion-65"
          accordion="my-accordion"
          role="tabpanel"
        >
          <div class="card-body border">
            <div class="mt-3" v-if="clinicalFinding">
              <b-tabs content-class="mt-3">
                <b-tab title="Diagnoses" active>
                  <diagnoses-table :diagnoses="clinicalFinding.diagnoses" />
                </b-tab>
                <b-tab title="Observations">
                  <antenatal-observations-table
                    v-if="visit?.category === ANTENATAL"
                    :observations="clinicalFinding.findings"
                  />
                  <observations-table v-else :observations="clinicalFinding.findings" />
                </b-tab>
              </b-tabs>
            </div>
          </div>
        </b-collapse>
      </div>
    </div>
  </div>
</template>
<script>
import DiagnosesTable from '@/view/components/table/DiagnosesTable.vue';
import AntenatalObservationsTable from '@/view/components/table/AntenatalObservationsTable.vue';
import ObservationsTable from '@/view/components/table/ObservationsTable.vue';

export default {
  components: { ObservationsTable, AntenatalObservationsTable, DiagnosesTable },
  data: () => ({
    ANTENATAL: 'Antenatal',
  }),
  computed: {
    clinicalFinding() {
      return this.$store.state.consultation.clinicalFinding;
    },

    visit() {
      return this.$store.state.visit.visit;
    },
  },

  methods: {
    fetchDiagnosesAndFindings() {
      this.$store.dispatch('consultation/fetchDiagnosesAndFindings', this.$route.params.id);
    },
  },
};
</script>

<style scoped>
.accord {
  background: #f1f1f1 !important;
  padding: 0.5rem 1.25rem !important;
}
</style>
