<template>
  <b-modal size="lg" v-model="activePrompt" hide-footer title="Update Request">
    <div v-for="(item, i) in itemsToRequest" :key="i">
      <label class="font-weight-bolder">{{ item.drug_name }}</label>
      <div class="form-group row">
        <div class="col-lg-6">
          <label>Status:</label>
          <select class="form-control form-control-sm" v-model="item.status">
            <option value="Granted">Granted</option>
            <option value="Declined">Declined</option>
          </select>
        </div>
        <div class="col-lg-5">
          <label>Quantity</label>
          <div class="input-group input-group-sm">
            <div class="input-group-prepend">
              <span class="input-group-text">{{ item.unit_name }}</span>
            </div>
            <input
              v-model="item.quantity"
              type="number"
              name="quantity"
              class="form-control form-control-sm"
              placeholder="Quantity to Request"
            />
          </div>
        </div>
        <div class="col-lg-1">
          <br />
          <a
            href="javascript:"
            data-repeater-delete=""
            class="btn font-weight-bold btn-danger btn-icon"
            v-if="i !== 0"
            @click="removeItem(i, item)"
          >
            <i class="la la-remove"></i>
          </a>
        </div>
      </div>
    </div>
    <button
      class="btn btn-primary float-right"
      @click="updateRequests"
      :disabled="isDisabled || !itemsToRequest.length"
      ref="kt_updateRequest_submit"
    >
      Submit
    </button>
  </b-modal>
</template>

<script>
export default {
  data: () => ({
    isDisabled: false,
  }),
  props: {
    displayPrompt: {
      type: Boolean,
      required: true,
    },
    itemsToRequest: {
      type: Array,
      default: () => [],
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

    removeItem(i, item) {
      this.itemsToRequest.splice(i, 1);
      this.$store.dispatch('request/removeSelectedRequest', item);
    },

    endRequest(button) {
      this.removeSpinner(button);
      this.$emit('closeModal');
      this.$store.dispatch('request/fetchRequests', {
        currentPage: this.$route.query.currentPage || 1,
        itemsPerPage: this.$route.query.itemsPerPage || 10,
      });
    },

    updateRequests() {
      if (this.itemsToRequest.some(({ status }) => !status)) {
        return this.$notify({
          group: 'foo',
          title: 'Error message',
          text: 'A request does not contain a status',
          type: 'error',
        });
      }

      // set spinner to submit button
      const submitButton = this.$refs['kt_updateRequest_submit'];
      this.addSpinner(submitButton);

      const requests = this.itemsToRequest.map(({ id, status }) => ({ id, status }));
      this.$store
        .dispatch('request/updateRequests', { requests })
        .then(() => this.endRequest(submitButton))
        .catch(() => this.removeSpinner(submitButton));
    },
  },
};
</script>

<style scoped></style>