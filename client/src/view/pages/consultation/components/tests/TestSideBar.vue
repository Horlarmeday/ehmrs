<template>
  <div>
    <selected-tests v-if="selectedTests.length" :selected-tests="selectedTests" />
  </div>
</template>

<script>
import SelectedTests from './SelectedTests';
import { getTestTypeToFetch } from '@/common/common';
export default {
  name: 'TestSideBar',
  components: { SelectedTests },
  data() {
    return {
      tabIndex: 0,
      sBackgroundColor: '#3699ff29',
    };
  },
  props: {
    insuranceName: {
      type: String,
      required: false,
    },
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
      const testType = getTestTypeToFetch(this.insuranceName);
      this.$store.dispatch(type, {
        currentPage: 1,
        itemsPerPage: 100,
        ...(testType && { filter: testType }),
      });
    },
  },
};
</script>

<style scoped></style>
