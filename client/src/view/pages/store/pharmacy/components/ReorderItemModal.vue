<template>
  <b-modal size="xl" v-model="activePrompt" hide-footer title="Reorder Items">
    <div class="mb-5" v-for="(item, i) in itemsToReorder" :key="i">
      <label class="font-weight-bolder"
        >{{ item.drug_name }}
        <span :class="getItemType(item.drug_type)" class="label label-inline">{{
          item.drug_type
        }}</span>
      </label>
      <div class="d-flex justify-content-between">
        <div class="d-flex flex-column flex-root">
          <label>Quantity:</label>
          <div class="input-group input-group-sm">
            <div class="input-group-prepend">
              <span class="input-group-text">{{ item.unit_name }}</span>
            </div>
            <input
              v-model="item.quantity_received"
              type="number"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': isInvalid(i) }"
            />
            <span v-if="item.isInvalid" :class="{ 'invalid-feedback': isInvalid(i) }"
              >invalid item quantity</span
            >
          </div>
        </div>
        <div class="d-flex flex-column flex-root">
          <label>Price:</label>
          <input v-model="item.unit_price" type="number" class="form-control form-control-sm" />
        </div>
        <div class="d-flex flex-column flex-root">
          <label>Selling Price:</label>
          <input v-model="item.selling_price" type="number" class="form-control form-control-sm" />
        </div>
        <div class="d-flex flex-column flex-root">
          <label>Voucher:</label>
          <input v-model="item.voucher" type="text" class="form-control form-control-sm" />
        </div>
        <div class="d-flex flex-column flex-root">
          <label>Batch:</label>
          <input v-model="item.batch" type="text" class="form-control form-control-sm" />
        </div>
        <div class="d-flex flex-column flex-root">
          <label>Expiry Date:</label>
          <datepicker v-model="item.expiration" input-class="form-control form-control-sm" />
        </div>
        <div class="d-flex flex-column flex-root">
          <label>Date Received:</label>
          <datepicker v-model="item.date_received" input-class="form-control form-control-sm" />
        </div>
        <div class="pt-lg-5">
          <a href="#" class="col-lg-1 col-form-label">
            <i
              class="far fa-trash-alt icon-md text-danger icon-lg mt-lg-3"
              v-if="i !== 0"
              @click="removeItem(i)"
            />
          </a>
        </div>
      </div>
    </div>
    <button
      class="btn btn-primary float-right"
      @click="reorderItems"
      :disabled="isDisabled || !itemsToReorder.length || itemIsInvalid"
      ref="kt_reorder_submit"
    >
      Submit
    </button>
  </b-modal>
</template>

<script>
import Datepicker from 'vuejs-datepicker';
import { getItemType } from '@/common/common';
export default {
  data: () => ({
    isDisabled: false,
    itemIsInvalid: false,
  }),

  components: {
    Datepicker,
  },

  props: {
    displayPrompt: {
      type: Boolean,
      required: true,
    },
    itemsToReorder: {
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
    getItemType,
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
      this.$store.dispatch('store/fetchPharmacyItems', {
        currentPage: this.$route.query.currentPage || 1,
        itemsPerPage: this.$route.query.itemsPerPage || 10,
      });
    },

    removeItem(i) {
      this.itemsToReorder.splice(i, 1);
    },

    isInvalid(index) {
      return this.itemsToReorder[index]?.isInvalid || false;
    },

    reorderItems() {
      if (this.itemsToReorder.some(({ quantity_received }) => !quantity_received)) {
        return this.$notify({
          group: 'foo',
          title: 'Error message',
          text: 'An item does not contain quantity received',
          type: 'error',
        });
      }

      // set spinner to submit button
      const submitButton = this.$refs['kt_reorder_submit'];
      this.addSpinner(submitButton);

      const itemsToReorder = this.itemsToReorder.map(
        // eslint-disable-next-line no-unused-vars
        ({ drug_type, drug_name, isInvalid, unit_name, ...item }) => item
      );
      this.$store
        .dispatch('store/reorderPharmacyItems', itemsToReorder)
        .then(() => this.endRequest(submitButton))
        .catch(() => this.removeSpinner(submitButton));
    },
  },
};
</script>
<style scoped></style>
