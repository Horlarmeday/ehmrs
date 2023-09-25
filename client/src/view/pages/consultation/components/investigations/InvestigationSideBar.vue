<template>
  <div>
    <selected-investigations
      v-if="selectedInvestigations.length"
      :selected-investigations="selectedInvestigations"
    />
  </div>
</template>

<script>
import SelectedInvestigations from './SelectedInvestigations.vue';
export default {
  name: 'InvestigationSideBar',
  components: { SelectedInvestigations },
  data() {
    return {
      tabIndex: 0,
      sBackgroundColor: '#3699ff29',
    };
  },
  computed: {
    selectedInvestigations() {
      return this.$store.state.order.selectedInvestigations;
    },
  },
};
</script>

<style scoped></style>
