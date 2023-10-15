<template>
  <div class="card-custom card-stretch card-stretch-fourth gutter-b">
    <div class="accordion accordion-solid accordion-panel accordion-svg-toggle" role="tablist">
      <div class="card">
        <div class="card-header" header-tag="header" role="tab" style="background: blue">
          <div class="card-title accord" v-b-toggle="'accordion-13'">
            <div class="card-label">Triages</div>
          </div>
        </div>
        <b-collapse id="accordion-13" accordion="my-accordion" role="tabpanel">
          <div class="card-body border">
            <triage-table :triages="triages" />
          </div>
        </b-collapse>
      </div>
    </div>
  </div>
</template>
<script>
import TriageTable from '../table/AntenatalTriageTable.vue';
export default {
  components: { TriageTable },
  data: () => ({
    currentPage: 1,
    itemsPerPage: 10,
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
    fetchAntenatalTriages() {
      this.$store.dispatch('antenatal/fetchAntenatalTriages', {
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        filter: { visit_id: this.$route.params.id },
      });
    },
  },
  created() {
    this.fetchAntenatalTriages();
  },
};
</script>

<style scoped>
.accord {
  background: #f1f1f1 !important;
  padding: 0.5rem 1.25rem !important;
}
</style>
