<template>
  <div>
    <delivery-table :deliveries="deliveries" />
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
      this.$store.dispatch('antenatal/fetchDeliveryInfo', { id: this.$route.params.id });
    },
  },
  created() {
    this.fetchDelivery();
  },
};
</script>

<style scoped></style>
