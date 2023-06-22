<template>
  <div id="orders">
    <div class="mb-2">
      <test-orders />
    </div>
    <div>
      <investigation-orders />
    </div>
  </div>
</template>
<script>
import TestOrders from "@/view/pages/consultation/tabs/orders/TestOrders.vue";
import InvestigationOrders from "@/view/pages/consultation/tabs/orders/InvestigationOrders.vue";

export default {
  name: 'Orders',
  components: { InvestigationOrders, TestOrders },
  data() {
    return {
      activeTab: '',
      backgroundColor: '#3699ff29',
      searchString: '',
    };
  }
};
</script>

<style scoped></style>
