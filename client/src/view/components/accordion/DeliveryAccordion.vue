<template>
  <div class="card-custom card-stretch card-stretch-fourth gutter-b">
    <div class="accordion accordion-solid accordion-panel accordion-svg-toggle" role="tablist">
      <div class="card">
        <div class="card-header" header-tag="header" role="tab" style="background: blue">
          <div class="card-title accord" v-b-toggle="'accordion-13'">
            <div class="card-label">Delivery Information</div>
          </div>
        </div>
        <b-collapse id="accordion-13" accordion="my-accordion" role="tabpanel">
          <div class="card-body border">
            <delivery-table :deliveries="deliveries" />
          </div>
        </b-collapse>
      </div>
    </div>
  </div>
</template>
<script>
import DeliveryTable from '@/view/components/table/DeliveryTable.vue';
export default {
  components: { DeliveryTable },
  data: () => ({
    currentPage: 1,
    itemsPerPage: 10,
  }),
  computed: {
    deliveries() {
      return this.$store.state.antenatal.deliveries;
    },
  },
  methods: {
    fetchDelivery() {
      this.$store.dispatch('antenatal/fetchDeliveryInfo', { id: this.$route.query.antenatal });
    },
  },
  created() {
    this.fetchDelivery();
  },
};
</script>

<style scoped>
.accord {
  background: #f1f1f1 !important;
  padding: 0.5rem 1.25rem !important;
}
</style>
