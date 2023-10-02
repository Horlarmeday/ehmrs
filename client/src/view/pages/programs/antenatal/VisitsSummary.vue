<template>
  <div class="card card-custom card-stretch gutter-b card-shadowless">
    <div class="card-body">
      <div
        v-for="(summary, i) in summaries"
        :key="i"
        class="card card-custom card-stretch card-stretch-fourth gutter-b"
      >
        <!-- <div class="card-body"> -->
        <div class="accordion accordion-solid accordion-panel accordion-svg-toggle" role="tablist">
          <div class="card">
            <div class="card-header" header-tag="header" role="tab" style="background: blue">
              <div class="card-title accord" v-b-toggle="'accordion-1'">
                <div class="card-label text-dark-50">
                  <span class="mr-5">
                    <span class="mr-2 text-dark">Start:</span>
                    <span>{{ summary.date_visit_start | moment('ddd, MMM Do YYYY, h:mma') }}</span>
                  </span>
                  <span v-if="summary.date_visit_ended">
                    <span class="mr-2 text-dark">End:</span>
                    <span>{{ summary.date_visit_ended | moment('ddd, MMM Do YYYY, h:mma') }}</span>
                  </span>
                </div>
              </div>
            </div>
            <b-collapse id="accordion-1" accordion="my-accordion" role="tabpanel">
              <div class="mt-3 card-body border-bottom border-left border-right">
                <b-tabs content-class="mt-5">
                  <b-tab title="Triages" active>
                    <triage-table :triages="summary.triages" />
                  </b-tab>
                  <b-tab title="Observations">
                    <observations-table :observations="summary.observations" />
                  </b-tab>
                  <b-tab title="Diagnoses">
                    <diagnoses-table :diagnoses="summary.diagnoses" />
                  </b-tab>
                  <b-tab title="Tests">
                    <tests-table :tests="summary.tests" />
                  </b-tab>
                  <b-tab title="Medications">
                    <medications-table :drugs="summary.drugs" />
                  </b-tab>
                  <b-tab title="Radiology">
                    <radiology-table :investigations="summary.investigations" />
                  </b-tab>
                  <b-tab title="Clinical Notes">
                    <clinical-notes-table :notes="summary.notes" />
                  </b-tab>
                </b-tabs>
              </div>
            </b-collapse>
          </div>
        </div>
        <!-- </div> -->
      </div>
    </div>
  </div>
</template>
<script>
import TriageTable from '@/view/pages/programs/antenatal/components/TriageTable.vue';
import ObservationsTable from '@/view/pages/programs/antenatal/components/ObservationsTable.vue';
import DiagnosesTable from '@/view/pages/programs/antenatal/components/DiagnosesTable.vue';
import TestsTable from '@/view/pages/programs/antenatal/components/TestsTable.vue';
import MedicationsTable from '@/view/pages/programs/antenatal/components/MedicationsTable.vue';
import RadiologyTable from '@/view/pages/programs/antenatal/components/RadiologyTable.vue';
import ClinicalNotesTable from '@/view/pages/programs/antenatal/components/ClinicalNotesTable.vue';
export default {
  name: 'VisitsSummary',
  components: {
    ClinicalNotesTable,
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
    summaries() {
      return this.$store.state.antenatal.summaries;
    },
    queriedItems() {
      return this.$store.state.antenatal.totalSummaries;
    },
    pages() {
      return this.$store.state.antenatal.totalSummaryPages;
    },
    perPage() {
      return this.summaries.length;
    },
  },
  methods: {
    fetchVisitsSummary() {
      this.$store.dispatch('antenatal/fetchVisitsSummary', {
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        id: this.$route.query.antenatal,
      });
    },
  },
  created() {
    this.fetchVisitsSummary();
  },
};
</script>

<style scoped></style>