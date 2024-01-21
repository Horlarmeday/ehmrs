<template>
  <div>
    <medications-table :drugs="drugs" />
  </div>
</template>
<script>
import MedicationsTable from '@/view/components/table/MedicationsTable.vue';

export default {
  components: { MedicationsTable },
  computed: {
    drugs() {
      return this.$store.state.order.drug_orders;
    },
  },
  methods: {
    viewPopover(item) {
      this.item = item;
      this.showPopover = true;
    },
    hidePopover() {
      this.showPopover = false;
    },
  },
  created() {
    this.$store.dispatch('order/fetchPrescribedDrugs', {
      currentPage: this.currentPage,
      itemsPerPage: this.itemsPerPage,
      filter: { ante_natal_id: this.$route.params.id },
    });
  },
};
</script>

<style scoped></style>
