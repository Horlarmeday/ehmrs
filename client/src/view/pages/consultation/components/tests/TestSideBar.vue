<template>
  <div>
    <selected-tests v-if="selectedTests.length" :selected-tests="selectedTests" />
  </div>
</template>

<script>
import SelectedTests from './SelectedTests.vue';
export default {
  name: 'TestSideBar',
  components: { SelectedTests },
  data() {
    return {
      tabIndex: 0,
      sBackgroundColor: '#3699ff29',
    };
  },
  created() {
    this.fetchTests('laboratory/fetchTests');
  },
  computed: {
    selectedTests() {
      return this.$store.state.order.selectedTests;
    },
  },
  methods: {
    fetchTests(type) {
      this.$store.dispatch(type, {
        currentPage: 1,
        itemsPerPage: 100,
      });
    },
  },
};
</script>

<style scoped></style>
