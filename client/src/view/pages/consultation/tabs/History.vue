<template>
  <history-accordion
    :content="content"
    :is-in-last-page="isInLastPage"
    :is-empty-summary="isEmptySummary"
    :summaries="summaries"
    @openObservation="goToObservation"
    @fetchMore="onFetchMore"
    source="Consultation"
    :loading="loading"
  />
</template>
<script>
import HistoryAccordion from '@/view/components/accordion/HistoryAccordion.vue';
import { isEmpty } from '@/common/common';

export default {
  name: 'History',
  components: {
    HistoryAccordion,
  },
  data: () => ({
    currentPage: 1,
    itemsPerPage: 5,
    disabled: 'disabled',
    tabIndex: 1,
    content: 'It seems this patient does not have any history of visits, click to start an history',
    loading: false,
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
    visit() {
      return this.$store.state.visit.visit;
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
          isEmpty(summary.items) &&
          isEmpty(summary.diagnoses) &&
          isEmpty(summary.triages) &&
          isEmpty(summary.observations.histories) &&
          isEmpty(summary.observations.complaints)
      );
    },
  },
  methods: {
    onFetchMore() {
      this.currentPage += 1;
      this.fetchVisitsHistory();
    },

    fetchVisitsHistory() {
      this.loading = true;
      this.$store
        .dispatch('consultation/fetchVisitsHistory', {
          currentPage: this.currentPage,
          itemsPerPage: this.itemsPerPage,
          visitId: this.$route.params.id,
        })
        .then(() => (this.loading = false));
    },

    goToObservation() {
      this.$router.push({
        query: {
          tab: 'observations',
          tabIndex: this.tabIndex,
        },
      });
      window.location.reload();
    },
  },
  created() {
    this.fetchVisitsHistory();
  },
};
</script>

<style scoped></style>
