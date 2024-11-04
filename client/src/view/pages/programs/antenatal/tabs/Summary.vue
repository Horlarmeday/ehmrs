<template>
  <history-accordion
    :content="content"
    source="Antenatal"
    :is-in-last-page="isInLastPage"
    :is-empty-summary="isEmptySummary"
    :summaries="summaries"
    @openObservation="goToObservation"
    @fetchMore="onFetchMore"
  />
</template>
<script>
import { isEmpty } from '@/common/common';
import HistoryAccordion from '@/view/components/accordion/HistoryAccordion.vue';
export default {
  name: 'Summary',
  components: {
    HistoryAccordion,
  },
  data: () => ({
    currentPage: 1,
    tabIndex: 6,
    itemsPerPage: 5,
    disabled: 'disabled',
    content:
      'It seems this patient does not have any history of visits, click to start an observation',
  }),
  computed: {
    summaries() {
      return this.$store.state.consultation.histories;
    },
    queriedItems() {
      return this.$store.state.consultation.totalHistories;
    },
    pages() {
      return this.$store.state.consultation.totalHistoryPages;
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
    antenatal() {
      return this.$store.state.antenatal.antenatal;
    },
  },
  methods: {
    onFetchMore() {
      this.currentPage += 1;
      this.fetchVisitsSummary();
    },

    fetchVisitsSummary() {
      this.$store.dispatch('consultation/fetchVisitsHistory', {
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        visitId: this.$route.params.id,
      });
    },

    goToObservation() {
      this.$router.push({
        query: {
          tab: 'observation',
          tabIndex: this.tabIndex,
          antenatal: this.antenatal.id,
        },
      });
      window.location.reload();
    },
  },
  created() {
    this.fetchVisitsSummary();
  },
};
</script>

<style scoped></style>
