<template>
  <b-modal
    @show="fetchPrescriptionsHistory"
    v-model="activePrompt"
    hide-footer
    title="Prescriptions History"
    size="xl"
  >
    <div>
      <history-accordion
        :visit-id="visitId"
        :is-in-last-page="isInLastPage"
        :summaries="summaries"
      />
    </div>
  </b-modal>
</template>
<script>
import HistoryAccordion from '@/view/pages/pharmacy/history/HistoryAccordion.vue';

export default {
  components: { HistoryAccordion },
  props: {
    displayPrompt: {
      type: Boolean,
      required: true,
    },
    visitId: {
      type: Number,
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
      return this.$store.state.pharmacy.prescriptionsHistory;
    },
    queriedItems() {
      return this.$store.state.pharmacy.totalHistory;
    },
    pages() {
      return this.$store.state.pharmacy.historyPages;
    },
    perPage() {
      return this.summaries.length;
    },
    isInLastPage() {
      return this.currentPage === this.pages || !this.pages;
    },
  },
  watch: {
    displayPrompt(val) {
      if (!val) return false;
    },
  },
  data: () => ({
    loading: false,
    currentPage: 1,
    itemsPerPage: 5,
  }),
  methods: {
    fetchPrescriptionsHistory() {
      this.loading = true;
      this.$store
        .dispatch('pharmacy/fetchDrugsPrescriptionsHistory', {
          currentPage: this.currentPage,
          itemsPerPage: this.itemsPerPage,
          visitId: this.visitId,
        })
        .then(() => (this.loading = false));
    },

    fetchMore() {
      this.currentPage += 1;
      this.fetchPrescriptionsHistory();
    },
  },
};
</script>

<style scoped></style>
