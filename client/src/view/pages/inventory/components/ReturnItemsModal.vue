<template>
  <b-modal size="xl" v-model="activePrompt" hide-footer title="Request to Return to Store">
    <div class="p-2">
      <div v-for="(item, i) in itemsToReturn" :key="i">
        <label class="font-weight-bolder"
          >{{ item.drug_name }}
          <span :class="item.quantity_left > 50 ? 'text-success' : 'text-danger'"
            >({{ item.quantity_left }} {{ item.unit_name }})</span
          ></label
        >
        <div class="form-group row">
          <div class="col-lg-5">
            <label>Quantity To Return:</label>
            <div class="input-group input-group-sm">
              <div class="input-group-prepend">
                <span class="input-group-text">{{ item.unit_name }}</span>
              </div>
              <input
                v-model="item.quantity"
                type="number"
                class="form-control form-control-sm"
                :class="{ 'is-invalid': isInvalid(i) }"
                placeholder="Quantity to dispense"
                :disabled="item.quantity_left === 0"
                @input="checkQuantity(i, $event)"
              />
              <span v-if="item.isInvalid" :class="{ 'invalid-feedback': isInvalid(i) }"
                >invalid item quantity</span
              >
            </div>
          </div>
          <div class="col-lg-6">
            <label>Reason for return:</label>
            <input
              v-validate="'required'"
              data-vv-validate-on="blur"
              v-model="item.reason_for_return"
              type="text"
              class="form-control form-control-sm"
              placeholder="Reason for return"
              name="reason_for_return"
            />
            <span class="text-danger text-sm">{{ errors.first('reason_for_return') }}</span>
          </div>
          <div class="col-lg-1">
            <br />
            <a href="#" class="col-lg-1 col-form-label">
              <i
                class="far fa-trash-alt icon-md text-danger icon-lg mt-lg-3"
                @click="removeItem(i)"
              />
            </a>
          </div>
        </div>
      </div>
    </div>
    <button
      class="btn btn-primary float-right"
      @click="createReturnRequests"
      :disabled="isDisabled || !itemsToReturn.length || itemIsInvalid"
      ref="kt_return_submit"
    >
      Submit
    </button>
  </b-modal>
</template>

<script>
/* eslint-disable no-unused-vars */
export default {
  props: {
    displayPrompt: {
      type: Boolean,
      required: true,
    },
    itemsToReturn: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      isDisabled: false,
      itemIsInvalid: false,
      error: null,
    };
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

    endRequest(button) {
      this.removeSpinner(button);
      this.$emit('closeModal');
      this.$store.commit('inventory/REMOVE_ALL_SELECTED_ITEMS', []);
      this.$store.dispatch('inventory/fetchInventoryItems', {
        currentPage: this.$route.query.currentPage || 1,
        itemsPerPage: this.$route.query.itemsPerPage || 10,
        inventory: this.$route.params.id,
      });
    },

    removeItem(i) {
      this.itemsToReturn.splice(i, 1);
    },

    createReturnRequests() {
      if (this.itemsToReturn.some(({ quantity }) => !quantity)) {
        return this.$notify({
          group: 'foo',
          title: 'Error message',
          text: 'An item does not contain quantity to return',
          type: 'error',
        });
      }

      this.$validator.validateAll().then(result => {
        if (result) {
          // set spinner to submit button
          const submitButton = this.$refs['kt_return_submit'];
          this.addSpinner(submitButton);
          const itemsToReturn = this.itemsToReturn.map(
            ({
              drug_type,
              isInvalid,
              quantity_left,
              unit_name,
              unit_id,
              receiver,
              drug_name,
              ...item
            }) => item
          );
          this.$store
            .dispatch('inventory/createInventoryItemsReturnRequest', itemsToReturn)
            .then(() => this.endRequest(submitButton))
            .catch(err => {
              this.removeSpinner(submitButton);
              this.error = err?.message;
            });
        }
      });
    },

    checkQuantity(index, event) {
      const item = this.itemsToReturn[index];
      const result = parseInt(event.target.value) > item.quantity_left;
      item.isInvalid = result;
      this.itemIsInvalid = result;
    },

    isInvalid(index) {
      return this.itemsToReturn[index]?.isInvalid || false;
    },
  },
};
</script>

<style scoped></style>
