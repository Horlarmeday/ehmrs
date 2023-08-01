<template>
  <div>
    <selected-services v-if="selectedServices.length" :selected-services="selectedServices" />
  </div>
</template>

<script>
import SelectedServices from '@/view/pages/consultation/components/services/SelectedServices.vue';

export default {
  name: 'TestSideBar',
  components: { SelectedServices },
  data() {
    return {
      tabIndex: 0,
      sBackgroundColor: '#3699ff29',
    };
  },
  created() {
    this.fetchServices('model/fetchServices');
  },
  computed: {
    selectedServices() {
      return this.$store.state.order.selectedServices;
    },
    visit() {
      return this.$store.state.visit.visit;
    },
  },
  methods: {
    fetchServices(type) {
      this.$store.dispatch(type, {
        currentPage: 1,
        itemsPerPage: 100,
      });
    },
  },
};
</script>

<style scoped>

</style>
