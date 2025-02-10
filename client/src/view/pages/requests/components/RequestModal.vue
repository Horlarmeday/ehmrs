<template>
  <b-modal size="lg" v-model="activePrompt" hide-footer title="Update Request">
    <ErrorBanner v-if="lists?.length" :message="message" :lists="lists" />
    <div v-for="(item, i) in selectedRequests" :key="i">
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
      :disabled="isDisabled || !selectedRequests.length"
      ref="kt_updateRequest_submit"
    >
      Submit
    </button>
  </b-modal>
</template>

<script>
import ErrorBanner from '@/view/components/util/ErrorBanner.vue';

export default {
  components: { ErrorBanner },
  data: () => ({
    isDisabled: false,
    message: 'You have the following errors while trying to process your requests: ',
    lists: [],
    localItemsToRequest: [],
  }),
  created() {
    this.localItemsToRequest = JSON.parse(JSON.stringify(this.itemsToRequest)); // Deep copy
  },
  props: {
    displayPrompt: {
      type: Boolean,
      required: true,
    },
    itemsToRequest: {
      type: Array,
      required: true,
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
    selectedRequests: {
      get() {
        return this.localItemsToRequest;
      },
      set(value) {
        this.localItemsToRequest = value;
      },
    },
  },
  watch: {
    itemsToRequest: {
      handler(newVal) {
        this.localItemsToRequest = JSON.parse(JSON.stringify(newVal)); // Update local copy
      },
      immediate: true, // Trigger the watcher immediately on component creation
      deep: true, // Watch for deep changes in the array or object
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
      this.selectedRequests.splice(i, 1);
      this.$store.dispatch('request/removeSelectedRequest', item);
    },

    fetchRequests() {
      this.$store.dispatch('request/fetchRequests', {
        currentPage: this.$route.query.currentPage || 1,
        itemsPerPage: this.$route.query.itemsPerPage || 10,
        filter: this.$route.query.filter,
      });
    },

    successfulRequest() {
      this.$store.commit('request/EMPTY_SELECTED_REQUESTS', []);
      this.fetchRequests();
      this.$emit('closeModal');
      this.lists = [];
    },

    unsuccessfulRequests(errors, successRequestIds) {
      this.lists = errors.map(reason => reason);
      const updatedRequests = this.selectedRequests.filter(
        ({ id }) => !successRequestIds.includes(id)
      );
      this.selectedRequests = JSON.parse(JSON.stringify(updatedRequests));
      this.$emit('updateItemsToRequest', updatedRequests);
      this.$store.dispatch('request/removeSelectedRequests', successRequestIds);
    },

    endRequest(button, response) {
      this.removeSpinner(button);
      const res = response.data.data;
      const requests = res?.requests;
      // check if the number of items sent is the same as the number of items returned
      if (requests?.length === this.selectedRequests?.length) {
        // if it is empty the selected requests and refetch
        this.successfulRequest();
        return;
      }
      // if not check the errors array and display the errors in the banner
      const errors = res?.errors;
      const successRequestIds = requests?.map(({ id }) => id);
      if (errors?.length) {
        // check the response requests array, select the ids of the returned requests, remove them from the itemsToRequest array
        // and uncheck them from the requests table
        this.unsuccessfulRequests(errors, successRequestIds);
      }
      if (successRequestIds?.length) this.fetchRequests();
    },

    updateRequests() {
      if (this.selectedRequests.some(({ status }) => !status)) {
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

      const requests = this.selectedRequests.map(({ id, status }) => ({ id, status }));
      this.$store
        .dispatch('request/updateRequests', { requests })
        .then(response => this.endRequest(submitButton, response))
        .catch(() => this.removeSpinner(submitButton));
    },
  },
};
</script>

<style scoped></style>
