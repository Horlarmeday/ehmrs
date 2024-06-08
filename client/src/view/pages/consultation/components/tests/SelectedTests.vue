<template>
  <div class="flex-row-auto offcanvas-mobile w-xl-250px">
    <div class="card-custom card-stretch">
      <div class="card-header">
        <h6 class="card-title">
          <span class="card-label font-weight-bolder text-dark">Selected Tests</span>
        </h6>
      </div>
      <div class="card-body">
        <div class="row">
          <div class="col-lg-12 mb-2 select-order" v-for="(test, i) in selectedTests" :key="i">
            <div class="p-2">
              <span
                :title="`${test.test_type}`"
                v-b-tooltip.hover
                :class="getLabelDotStatus(test.test_type)"
                class="label label-dot label-lg mr-2"
              ></span>
              <span class="mr-3">{{ truncateText(test.name) }}</span>
              <span class="float-right ml-4" v-b-tooltip.hover title="Delete">
                <a href="#" @click="removeSelectedTest(test)"
                  ><i class="flaticon2-rubbish-bin text-danger icon-md"
                /></a>
              </span>
              <span class="float-right" v-b-tooltip.hover title="Urgent!">
                <a href="#" @click="toggleTestUrgent(test.test_id, i)">
                  <i ref="selectedTest" class="flaticon2-warning icon-md" />
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SelectedTests',
  props: {
    selectedTests: {
      type: Array,
    },
    // sBackgroundColor: { type: String },
  },
  methods: {
    truncateText(test) {
      if (!test.length || test.length <= 17) return test;
      const truncatedText = test.substring(0, 17);
      return `${truncatedText}...`;
    },
    removeSelectedTest(test) {
      this.$store.dispatch('order/removeSelectedTest', test);
      this.$store.dispatch('order/removeSelectedButton', test.test_id);
    },
    toggleTestUrgent(testId, i) {
      const icon = this.$refs['selectedTest'][i];
      const test = this.selectedTests.find(({ test_id }) => test_id === testId);
      if (test && test.is_urgent) {
        icon.classList.remove('text-warning');
        this.$store.dispatch('order/toggleTestUrgent', testId);
      } else {
        icon.classList.add('text-warning');
        this.$store.dispatch('order/toggleTestUrgent', testId);
      }
    },
    getLabelDotStatus(type) {
      if (type === 'CASH') return 'label-success';
      if (type === 'Private') return 'label-primary';
      return 'label-danger';
    },
  },
};
</script>

<style scoped>
.select-order {
  background: linear-gradient(to bottom, #fff, #ddd);
  border: 1px solid #ddd;
  border-radius: 3px;
}
</style>
