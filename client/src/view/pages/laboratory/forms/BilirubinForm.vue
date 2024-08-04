<template>
  <div class="form-container border border-gray-500">
    <table class="table">
      <thead>
        <tr>
          <th scope="col">Age in Days</th>
          <th scope="col">Total</th>
          <th scope="col">Direct</th>
          <th scope="col">Total Range</th>
          <th scope="col">Direct Range</th>
        </tr>
      </thead>
      <tbody>
        <bilirubin-form-row
          v-for="(item, index) in bilirubinItems"
          :key="index"
          :section="section"
          :bilirubin="bilirubin"
          :item="item"
          @emitBilirubinResult="emitBilirubinResult"
        />
      </tbody>
    </table>
  </div>
</template>

<script>
import { debounce } from '@/common/common';
import BilirubinFormRow from '@/view/pages/laboratory/forms/rows/BilirubinFormRow.vue';
const bilirubinItems = [
  {
    age: '0 - 1 day',
    totalModel: 'total_zero_to_one_day',
    directModel: 'direct_zero_to_one_day',
    totalRange: '3.5 - 10.4 mg/dl',
    directRange: '0.0 - 0-4 mg/dl',
  },
  {
    age: '2 - 3 days',
    totalModel: 'total_two_to_three_days',
    directModel: 'direct_two_to_three_days',
    totalRange: '3.4 - 11.5 mg/dl',
    directRange: '0.0 - 0-4 mg/dl',
  },
  {
    age: '3 - 5 days',
    totalModel: 'total_three_to_five_days',
    directModel: 'direct_three_to_five_days',
    totalRange: '1.5 - 12.0 mg/dl',
    directRange: '0.0 - 0-4 mg/dl',
  },
  {
    age: 'Above 5 days',
    totalModel: 'total_above_five_days',
    directModel: 'direct_above_five_days',
    totalRange: '0.2 - 1.2 mg/dl',
    directRange: '0.0 - 0-4 mg/dl',
  },
  {
    age: 'Comments',
    totalModel: 'comments',
    directModel: '',
    totalRange: '',
    directRange: '',
    isTextarea: true,
  },
];
export default {
  components: { BilirubinFormRow },
  data: () => ({
    bilirubin: {
      total_zero_to_one_day: '',
      direct_zero_to_one_day: '',
      total_two_to_three_days: '',
      direct_two_to_three_days: '',
      total_three_to_five_days: '',
      direct_three_to_five_days: '',
      total_above_five_days: '',
      direct_above_five_days: '',
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
    bilirubinItems() {
      return bilirubinItems;
    },
  },
  watch: {
    result: {
      immediate: true,
      handler(val) {
        if (!val) return;
        if (Object.entries(val)?.length) {
          const bilirubinData = JSON.parse(JSON.stringify(val));
          Object.keys(this.bilirubin).forEach(key => {
            this.bilirubin[key] = bilirubinData[key] || '';
          });
        }
      },
    },
  },
  methods: {
    emitBilirubinResult() {
      this.debounceInput(this);
    },

    debounceInput: debounce(vm => {
      vm.$emit('emitResult', vm.bilirubin, vm.testId);
    }, 500),
  },
};
</script>

<style scoped></style>
