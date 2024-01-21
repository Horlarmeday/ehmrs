<template>
  <history-accordion
    :content="content"
    :is-in-last-page="isInLastPage"
    :is-empty-summary="isEmptySummary"
    :summaries="summaries"
    @openObservation="goToObservation"
    @fetchMore="onFetchMore"
    source="Consultation"
  />
</template>
<script>
import HistoryAccordion from '@/view/components/accordion/HistoryAccordion.vue';

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
    content:
      'It seems this patient does not have any history of visits, click to start an observation',
  }),
  props: {
    isEmptySummary: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
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
  },
  methods: {
    onFetchMore() {
      this.currentPage += 1;
      this.fetchVisitsHistory();
    },

    fetchVisitsHistory() {
      this.$store.dispatch('consultation/fetchVisitsHistory', {
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        visitId: this.$route.params.id,
      });
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
};
</script>

<style scoped></style>
