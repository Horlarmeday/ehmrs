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
        <LFTFormRow
          v-for="row in rows"
          :key="row.id"
          :section="section"
          :lft="lft"
          :row="row"
          @emitLFTResult="emitLFTResult"
        />
      </tbody>
    </table>
  </div>
</template>
<script>
import { debounce, randomId } from '@/common/common';
import LFTFormRow from '@/view/pages/laboratory/forms/rows/LFTFormRow.vue';

export default {
  components: { LFTFormRow },
  data() {
    return {
      lft: {
        ast: '',
        alt: '',
        alp: '',
        tp: '',
        alb: '',
        tb: '',
        db: '',
        comments: '',
      },
      rows: [
        { id: randomId(), label: 'AST', model: 'ast', range: '5.0 - 50 IU/L' },
        { id: randomId(), label: 'ALT', model: 'alt', range: '5.0 - 46 IU/L' },
        { id: randomId(), label: 'ALP', model: 'alp', range: '20 - 147 IU/L' },
        { id: randomId(), label: 'TP', model: 'tp', range: '6.2 - 8.0 g/dl' },
        { id: randomId(), label: 'ALB', model: 'alb', range: '3.5 - 5.5 g/dl' },
        { id: randomId(), label: 'TB', model: 'tb', range: '0.2 - 1.2 mg/dl' },
        { id: randomId(), label: 'DB', model: 'db', range: '0.0 - 0.4 mg/dl' },
        { id: randomId(), label: 'Comments', model: 'comments', isTextArea: true },
      ],
    };
  },
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
  watch: {
    result: {
      immediate: true,
      handler(val) {
        if (!val) return;
        if (Object.entries(val)?.length) {
          const lftData = JSON.parse(JSON.stringify(val));
          Object.keys(this.lft).forEach(key => {
            this.lft[key] = lftData[key] || '';
          });
        }
      },
    },
  },
  methods: {
    emitLFTResult() {
      this.debounceInput(this);
    },

    debounceInput: debounce(vm => {
      vm.$emit('emitResult', vm.lft, vm.testId);
    }, 500),
  },
};
</script>

<style scoped></style>
