<template>
  <div>
    <textarea
      v-model="defaultResult.result"
      @input="emitDefaultResult"
      class="form-control"
      cols="30"
      :disabled="shouldDisableRow"
      rows="5"
    ></textarea>
  </div>
</template>
<script>
import { debounce } from '@/common/common';

export default {
  data: () => ({
    defaultResult: {
      result: '',
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
  watch: {
    result: {
      immediate: true,
      handler(val) {
        if (!val) return;
        if (Object.entries(val)?.length) {
          const { result } = JSON.parse(JSON.stringify(val));
          this.defaultResult.result = result;
        }
      },
    },
  },
  computed: {
    shouldDisableRow() {
      return this.section === 'ValidationSection' || this.section === 'ApprovalSection';
    },
  },
  methods: {
    emitDefaultResult() {
      this.debounceInput(this);
    },

    debounceInput: debounce(vm => {
      vm.$emit('emitResult', vm.defaultResult, vm.testId);
    }, 500),
  },
};
</script>

<style scoped></style>
