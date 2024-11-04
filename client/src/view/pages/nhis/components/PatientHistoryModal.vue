<template>
  <b-modal
    v-model="activePrompt"
    @show="fetchVisitsHistory"
    hide-footer
    title="Patient History"
    size="xl"
    scrollable
  >
    <div>
      <history-accordion
        :content="content"
        :is-in-last-page="isInLastPage"
        :is-empty-summary="isEmptySummary"
        :summaries="summaries"
        @fetchMore="onFetchMore"
        source="Consultation"
        :loading="loading"
      />
    </div>
  </b-modal>
</template>
<script>
import HistoryAccordion from '@/view/components/accordion/HistoryAccordion.vue';
import { isEmpty } from '@/common/common';

export default {
  components: { HistoryAccordion },
  data: () => ({
    currentPage: 1,
    itemsPerPage: 5,
    content: 'It seems this patient does not have any history of visits',
    loading: false,
  }),
  props: {
    displayPrompt: {
      type: Boolean,
      required: true,
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
  },
};
</script>

<style scoped></style>
