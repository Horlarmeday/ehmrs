<template>
  <div class="card card-custom card-stretch gutter-b card-shadowless">
    <div v-if="!isEmptySummary">
      <div class="card-body">
        <div
          v-for="(summary, i) in summaries"
          :key="i"
          class="card card-custom card-stretch card-stretch-fourth gutter-b"
        >
          <!-- <div class="card-body"> -->
          <div
            class="accordion accordion-solid accordion-panel accordion-svg-toggle"
            role="tablist"
          >
            <div class="card">
              <div class="card-header" header-tag="header" role="tab" style="background: blue">
                <div class="card-title accord" v-b-toggle="`accordion-${i}`">
                  <div class="card-label text-dark-50">
                    <span class="mr-5">
                      <span class="mr-2 text-dark">Start:</span>
                      <span>{{ summary.date_visit_start | dayjs('ddd, MMM Do YYYY, h:mma') }}</span>
                    </span>
                    <span v-if="summary.date_visit_ended">
                      <span class="mr-2 text-dark">End:</span>
                      <span>{{ summary.date_visit_ended | dayjs('ddd, MMM Do YYYY, h:mma') }}</span>
                    </span>
                  </div>
                </div>
              </div>
              <b-collapse :id="`accordion-${i}`" accordion="my-accordion" role="tabpanel">
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
        <div class="m-auto">
          <a
            href="#"
            :disabled="isInLastPage"
            :class="isInLastPage ? disabled : ''"
            @click="onFetchMore"
            class="btn btn-outline-secondary mb-3 padding-right padding-left"
          >
            <i class="flaticon2-circle-vol-2"></i> See more
          </a>
        </div>
      </div>
    </div>
    <div v-else>
      <empty-data-card @addData="goToObservation" :text="content" />
    </div>
  </div>
</template>
<script>
import TriageTable from '@/view/components/table/AntenatalTriageTable.vue';
import ObservationsTable from '@/view/components/table/AntenatalObservationsTable.vue';
import DiagnosesTable from '@/view/components/table/DiagnosesTable.vue';
import TestsTable from '@/view/components/table/TestsTable.vue';
import MedicationsTable from '@/view/components/table/MedicationsTable.vue';
import RadiologyTable from '@/view/components/table/RadiologyTable.vue';
import ClinicalNotesTable from '@/view/components/table/ClinicalNotesTable.vue';
import EmptyDataCard from '@/utils/EmptyDataCard.vue';
import { isEmpty } from '@/common/common';
export default {
  name: 'Summary',
  components: {
    EmptyDataCard,
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
    disabled: 'disabled',
    content:
      'It seems this patient does not have any history of visits, click to start an observation',
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
    isInLastPage() {
      return this.currentPage === this.pages || !this.pages;
    },
    isEmptySummary() {
      return this.summaries.every(
        summary =>
          isEmpty(summary.drugs) &&
          isEmpty(summary.tests) &&
          isEmpty(summary.investigations) &&
          isEmpty(summary.diagnoses) &&
          isEmpty(summary.triages) &&
          isEmpty(summary.observations) &&
          isEmpty(summary.notes)
      );
    },
  },
  methods: {
    onFetchMore() {
      this.currentPage += 1;
      this.fetchVisitsSummary();
    },

    fetchVisitsSummary() {
      this.$store.dispatch('antenatal/fetchVisitsSummary', {
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        id: this.$route.query.antenatal,
      });
    },

    goToObservation() {
      this.$router.push({
        query: {
          tab: 'observations',
          tabIndex: this.tabIndex,
        },
      });
    },
  },
  created() {
    this.fetchVisitsSummary();
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
