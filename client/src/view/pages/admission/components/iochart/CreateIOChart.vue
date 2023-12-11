<template>
  <div>
    <div class="p-2 border">
      <div class="mb-3 border-bottom">
        <span class="font-weight-bold font-size-lg">Input </span>
        <span class="border-left text-center" style="margin-left: 38%"></span>
        <span class="font-weight-bold font-size-lg text-center" style="margin-left: 10.7%"
          >Output
        </span>
      </div>
      <div v-for="(item, i) in items" :key="i">
        <div class="form-group row">
          <div class="col-lg-3">
            <label>Item</label>
            <input v-model="item.input_item" type="text" class="form-control form-control-sm" />
          </div>
          <div class="col-lg-2">
            <label>Quantity</label>
            <input
              v-model="item.input_quantity"
              type="number"
              @input="calcInputTotal"
              class="form-control form-control-sm"
            />
          </div>
          <div class="col-lg-3">
            <label>Item</label>
            <input v-model="item.output_item" type="text" class="form-control form-control-sm" />
          </div>
          <div class="col-lg-2">
            <label>Quantity</label>
            <input
              v-model="item.output_quantity"
              type="number"
              @input="calcOutputTotal"
              class="form-control form-control-sm"
            />
          </div>
          <div class="col-lg-2">
            <br />
            <a href="#">
              <i
                class="far fa-plus-square icon-md text-primary icon-lg mt-lg-3"
                v-if="i === 0"
                @click="addItem(i)"
              />
              <i
                class="far fa-trash-alt icon-md text-danger icon-lg mt-lg-3"
                v-if="i !== 0"
                @click="removeItem(i)"
              />
            </a>
          </div>
        </div>
      </div>
      <div>
        <span class="font-weight-bold font-size-lg"
          >Total: <span>{{ input_total }}</span>
        </span>
        <span class="font-weight-bold font-size-lg" style="margin-left: 47.9%"
          >Total: <span>{{ output_total }}</span>
        </span>
      </div>
    </div>
    <div class="mt-3">
      <button
        class="btn btn-primary float-right"
        @click="createIOChart"
        :disabled="isDisabled || !items.length"
        ref="kt_iochart_submit"
      >
        Submit
      </button>
    </div>
  </div>
</template>
<script>
export default {
  data: () => ({
    items: [
      {
        input_item: '',
        input_quantity: '',
        output_item: '',
        output_quantity: '',
      },
    ],
    input_total: '',
    output_total: '',
    isDisabled: false,
  }),
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
      this.initValues();
      this.$store.dispatch('admission/fetchIOCharts', {
        id: this.$route.params.id,
      });
    },

    removeItem(i) {
      this.items.splice(i, 1);
    },

    addItem() {
      this.items.push({
        input_item: '',
        input_quantity: '',
        output_item: '',
        output_quantity: '',
      });
    },

    initValues() {
      this.items = [
        {
          input_item: '',
          input_quantity: '',
          output_item: '',
          output_quantity: '',
        },
      ];
      this.output_total = '';
      this.input_total = '';
    },

    createIOChart() {
      if (this.items.some(({ input_item, output_item }) => !input_item || !output_item)) {
        return this.$notify({
          group: 'foo',
          title: 'Error message',
          text: 'You need to input at least one data',
          type: 'error',
        });
      }
      const items = this.items.map(item => ({
        ...item,
        input_total: this.input_total,
        output_total: this.output_total,
      }));
      const data = {
        id: this.$route.params.id,
        data: items,
      };

      // set spinner to submit button
      const submitButton = this.$refs['kt_iochart_submit'];
      this.addSpinner(submitButton);

      this.$store
        .dispatch('admission/createIOChart', data)
        .then(() => this.endRequest(submitButton))
        .catch(() => this.removeSpinner(submitButton));
    },

    calcInputTotal() {
      this.input_total = this.sumTotal(this.items, 'input_quantity');
    },

    calcOutputTotal() {
      this.output_total = this.sumTotal(this.items, 'output_quantity');
    },

    sumTotal(arr, field) {
      return arr.reduce((a, b) => a + +b[field], 0);
    },
  },
};
</script>

<style scoped></style>
