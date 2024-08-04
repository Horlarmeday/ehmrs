<template>
  <div class="form-container border border-gray-500">
    <table class="table">
      <thead>
        <tr>
          <th scope="col">#</th>
          <th scope="col">Result</th>
          <th scope="col">Range/Unit</th>
        </tr>
      </thead>
      <tbody>
        <glucose-form-row
          v-for="(item, index) in glucoseItems"
          :key="index"
          :section="section"
          :glucose="glucose"
          :item="item"
          @emitGlucoseResult="emitGlucoseResult"
        />
      </tbody>
    </table>
  </div>
</template>

<script>
import { debounce } from '@/common/common';
import GlucoseFormRow from '@/view/pages/laboratory/forms/rows/GlucoseFormRow.vue';

const glucoseItems = [
  { name: 'Fasting glu.', model: 'fasting_glu', range: '3.9 - 5.8 Mmol/L', type: 'input' },
  { name: 'Random glu.', model: 'random_glu', range: '3.9 - 6.7 Mmol/L', type: 'input' },
  { name: '2hr pp', model: 'two_hour_pp', range: '3.9 - 6.7 Mmol/L', type: 'input' },
  { name: 'Comments', model: 'comments', range: '', type: 'textarea' },
];

export default {
  components: { GlucoseFormRow },
  data: () => ({
    glucose: {
      fasting_glu: '',
      random_glu: '',
      two_hour_pp: '',
      comments: '',
    },
  }),
  props: {
    result: {
      type: Object,
      required: true,
    },
    testId: {
      type: Number,
      required: true,
    },
    section: {
      type: String,
      required: true,
    },
  },
  computed: {
    glucoseItems() {
      return glucoseItems;
    },
  },
  watch: {
    result: {
      immediate: true,
      handler(val) {
        if (!val) return;
        if (Object.entries(val)?.length) {
          const { fasting_glu, random_glu, two_hour_pp, comments } = JSON.parse(
            JSON.stringify(val)
          );
          this.glucose.fasting_glu = fasting_glu;
          this.glucose.random_glu = random_glu;
          this.glucose.two_hour_pp = two_hour_pp;
          this.glucose.comments = comments;
        }
      },
    },
  },
  methods: {
    emitGlucoseResult() {
      this.debounceInput(this);
    },
    debounceInput: debounce(function(vm) {
      vm.$emit('emitResult', vm.glucose, vm.testId);
    }, 500),
  },
};
</script>

<style scoped>
.form-container {
  padding: 16px;
}
.table {
  width: 100%;
}
.form-control {
  width: 100%;
}
</style>
