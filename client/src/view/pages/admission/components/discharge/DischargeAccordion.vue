<template>
  <div class="card-custom card-stretch card-stretch-fourth gutter-b">
    <div class="accordion accordion-solid accordion-panel accordion-svg-toggle" role="tablist">
      <div class="card">
        <div class="card-header" header-tag="header" role="tab" style="background: blue">
          <div class="card-title accord" v-b-toggle="'accordion-74'">
            <div class="card-label">Discharge Record</div>
          </div>
        </div>
        <b-collapse id="accordion-74" accordion="my-accordion" role="tabpanel">
          <div class="card-body border">
            <discharge-table :discharge="discharge" />
          </div>
        </b-collapse>
      </div>
    </div>
  </div>
</template>
<script>
import DischargeTable from '@/view/components/table/DischargeTable.vue';

export default {
  components: { DischargeTable },
  computed: {
    discharge() {
      return this.$store.state.admission.discharge || {};
    },
  },
  methods: {
    fetchDischargeRecord() {
      this.$store.dispatch('admission/fetchDischargeRecord', { id: this.$route.params.id });
    },
  },
  created() {
    this.fetchDischargeRecord();
  },
};
</script>

<style scoped>
.accord {
  background: #f1f1f1 !important;
  padding: 0.5rem 1.25rem !important;
}
</style>
