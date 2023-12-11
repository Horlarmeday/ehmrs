<template>
  <div class="card-custom card-stretch card-stretch-fourth gutter-b">
    <div class="accordion accordion-solid accordion-panel accordion-svg-toggle" role="tablist">
      <div class="card">
        <div class="card-header" header-tag="header" role="tab" style="background: blue">
          <div class="card-title accord" v-b-toggle="'accordion-13'">
            <div class="card-label">Observations</div>
          </div>
        </div>
        <b-collapse id="accordion-13" accordion="my-accordion" role="tabpanel">
          <div class="card-body border">
            <triage-table :triages="observations" />
          </div>
        </b-collapse>
      </div>
    </div>
  </div>
</template>
<script>
import TriageTable from '@/view/components/table/TriageTable.vue';

export default {
  components: { TriageTable },
  computed: {
    observations() {
      return this.$store.state.admission.observations;
    },
  },
  methods: {
    fetchObservations() {
      this.$store.dispatch('admission/fetchObservations', { id: this.$route.params.id });
    },
  },
  created() {
    this.fetchObservations();
  },
};
</script>

<style scoped>
.accord {
  background: #f1f1f1 !important;
  padding: 0.5rem 1.25rem !important;
}
</style>
