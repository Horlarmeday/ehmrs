<template>
  <b-modal v-model="activePrompt" hide-footer title="Routine Tests">
    <div v-if="defaults">
      <div class="form-group">
        <label class="font-weight-bolder mb-3">Tests</label>
        <div class="checkbox-list">
          <label class="checkbox" v-for="test in routineTests" :key="test.test_id">
            <input type="checkbox" :checked="isSelected(test)" @change="toggleTest(test)" />
            <span></span>
            {{ test.name }}
          </label>
        </div>
      </div>
      <div class="separator separator-solid separator-border-2"></div>
      <div class="mt-2">
        <button class="btn btn-primary btn-md" ref="kt-routineTests-submit" @click="submitTests">
          Submit
        </button>
      </div>
    </div>
    <div v-else>
      <DefaultSkeleton />
    </div>
  </b-modal>
</template>

<script>
import DefaultSkeleton from '@/utils/DefaultSkeleton.vue';

export default {
  components: { DefaultSkeleton },
  data: () => ({
    defaultData: 'ANC_ROUTINE_TESTS',
    switchSpot: true,
  }),
  props: {
    displayPrompt: {
      type: Boolean,
      required: true,
    },
    switchPosition: {
      type: Boolean,
      required: true,
    },
    showSwitch: {
      type: Boolean,
      required: true,
    },
    source: {
      type: String,
      required: true,
    },
  },
  computed: {
    activePrompt: {
      get() {
        return this.displayPrompt;
      },
      set(value) {
        this.$emit('closeModal', value);
      },
    },

    defaults() {
      if (this.$store.state.model.defaults?.length) {
        return this.$store.state.model.defaults;
      }
      return JSON.parse(localStorage.getItem('defaults'));
    },

    routineTests: {
      get() {
        const tests = this.defaults?.find(def => def.type === this.defaultData)?.data;
        if (tests) {
          return tests.map(test => ({
            test_id: test.test.id,
            is_urgent: false,
            test_type: this.switchPosition && this.switchSpot ? 'NHIS' : 'CASH',
            price: test.test.price,
            name: test.test.name,
            sample_id: test?.test?.sample_id,
            source: this.source,
            ...(this.source === 'Antenatal' && { ante_natal_id: this.$route.query.antenatal }),
          }));
        }
        return [];
      },
    },
  },
  watch: {
    displayPrompt(val) {
      if (!val) return false;
      this.fetchTests();
    },
  },
  methods: {
    addSpinner(submitButton) {
      this.isDisabled = true;
      submitButton.classList.add('spinner', 'spinner-light', 'spinner-right');
    },

    removeSpinner(submitButton) {
      this.isDisabled = false;
      submitButton.classList.remove('spinner', 'spinner-light', 'spinner-right');
    },

    endRequest(button) {
      this.removeSpinner(button);
      this.$emit('closeModal');
      this.initValues();
    },

    fetchTests() {
      if (!localStorage.getItem('defaults')) {
        this.$store
          .dispatch('model/fetchDefaults')
          .then(res => localStorage.setItem('defaults', JSON.stringify(res.data.data)));
      }
    },

    isSelected(test) {
      return this.routineTests.some(t => t.test_id === test.test_id);
    },

    toggleTest(test) {
      const index = this.routineTests.findIndex(t => t.test_id === test.test_id);
      if (index !== -1) {
        this.routineTests.splice(index, 1); // Remove test
      } else {
        this.routineTests.push(test); // Add test
      }
    },

    submitTests() {
      const submitButton = this.$refs['kt-routineTests-submit'];
      this.addSpinner(submitButton);
      const tests = this.routineTests.map(test => {
        delete test.name;
        return test;
      });
      this.$store
        .dispatch('order/orderLabTest', {
          tests,
          id: this.$route.params.id,
        })
        .then(() => this.endRequest(submitButton))
        .catch(() => this.removeSpinner(submitButton));
    },
  },
};
</script>

<style scoped></style>
