<template>
  <div>
    <antenatal-triage-table :triages="triages" />
    <pagination
      :total-pages="pages"
      :total="queriedItems"
      :per-page="perPage"
      :current-page="currentPage"
      @pagechanged="onPageChange"
    />
  </div>
</template>
<script>
import AntenatalTriageTable from '@/view/components/table/AntenatalTriageTable.vue';
import Pagination from '@/utils/Pagination.vue';

export default {
  components: { Pagination, AntenatalTriageTable },
  created() {
    this.fetchAntenatalTriages();
  },
  data: () => ({
    currentPage: 1,
    itemsPerPage: 15,
  }),
  computed: {
    triages() {
      return this.$store.state.antenatal.triages;
    },
    queriedItems() {
      return this.$store.state.antenatal.totalTriage;
    },
    pages() {
      return this.$store.state.antenatal.triagePages;
    },
    perPage() {
      return this.triages.length;
    },
  },
  methods: {
    handlePageChange() {
      this.$store.dispatch('antenatal/fetchAntenatalTriages', {
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        filter: { ante_natal_id: this.$route.params.id },
      });
    },

    onPageChange(page) {
      this.currentPage = page;
      this.handlePageChange();
    },

    fetchAntenatalTriages() {
      this.$store.dispatch('antenatal/fetchAntenatalTriages', {
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        filter: { ante_natal_id: this.$route.params.id },
      });
    },
  },
};
</script>

<style scoped></style>
