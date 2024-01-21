<template>
  <div class="card-custom card-stretch card-stretch-fourth gutter-b">
    <div class="accordion accordion-solid accordion-panel accordion-svg-toggle" role="tablist">
      <div class="card">
        <div class="card-header" header-tag="header" role="tab" style="background: blue">
          <div class="card-title accord" v-b-toggle="'accordion-13'">
            <div class="card-label">Ward Round</div>
          </div>
        </div>
        <b-collapse id="accordion-13" accordion="my-accordion" role="tabpanel">
          <div class="card-body border">
            <ward-rounds-table :ward-rounds="wardRounds" />
          </div>
        </b-collapse>
      </div>
    </div>
  </div>
</template>
<script>
import WardRoundsTable from '@/view/components/table/WardRoundsTable.vue';

export default {
  components: { WardRoundsTable },
  computed: {
    wardRounds() {
      return this.$store.state.admission.wardRounds;
    },
    visit() {
      return this.$store.state.visit.visit;
    },
  },
  methods: {
    fetchWardRounds() {
      this.$store.dispatch('admission/fetchWardRounds', { id: this.visit.admission_id });
    },
  },
  created() {
    setTimeout(() => {
      this.fetchWardRounds();
    }, 500);
  },
};
</script>

<style scoped>
.accord {
  background: #f1f1f1 !important;
  padding: 0.5rem 1.25rem !important;
}
</style>
