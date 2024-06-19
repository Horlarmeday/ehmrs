<template>
  <b-modal size="xl" v-model="activePrompt" hide-footer title="Dispense">
    <div class="p-2">
      <div v-for="(item, i) in itemsToDispense" :key="i">
        <label class="font-weight-bolder"
          >{{ item.drug_name }}
          <span :class="getItemType(item.drug_type)" class="label label-inline mr-2">{{
            item.drug_type
          }}</span>
          <span :class="item.quantity_left > 50 ? 'text-success' : 'text-danger'"
            >({{ item.quantity_left }} {{ item.unit_name }})</span
          ></label
        >
        <div class="form-group row">
          <div class="col-lg-4">
            <label>Quantity To Dispense:</label>
            <div class="input-group input-group-sm">
              <div class="input-group-prepend">
                <span class="input-group-text">{{ item.unit_name }}</span>
              </div>
              <input
                v-model="item.quantity_to_dispense"
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
          <div class="col-lg-4">
            <label>Dispensary:</label>
            <select class="form-control form-control-sm" v-model="item.dispensary">
              <option
                :value="inventory.id"
                v-for="(inventory, i) in getRightInventory(item)"
                :key="i"
              >
                {{ inventory.name }}</option
              >
            </select>
          </div>
          <div class="col-lg-3">
            <label>Item Receiver</label>
            <v-select
              @search="searchStaffs"
              v-model="item.receiver"
              label="fullname"
              :reduce="staffs => staffs.id"
              :options="staffs"
            />
          </div>
          <div class="col-lg-1">
            <br />
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
    </div>
    <button
      class="btn btn-primary float-right"
      @click="dispenseItems"
      :disabled="isDisabled || !itemsToDispense.length || itemIsInvalid"
      ref="kt_dispense_submit"
    >
      Submit
    </button>
  </b-modal>
</template>

<script>
import vSelect from 'vue-select';
import { getItemType } from '@/common/common';
//import { debounce } from "@/common/common";
export default {
  name: 'DispenseModal',
  components: { vSelect },
  props: {
    displayPrompt: {
      type: Boolean,
      required: true,
    },
    itemsToDispense: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      isDisabled: false,
      itemIsInvalid: false,
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

    staffs() {
      return this.$store.state.employee.employees;
    },

    inventories() {
      return this.$store.state.inventory.inventories;
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
      // this.initValues();
      this.$store.dispatch('store/fetchPharmacyItems', {
        currentPage: this.$route.query.currentPage || 1,
        itemsPerPage: this.$route.query.itemsPerPage || 10,
      });
    },

    searchStaffs(search) {
      this.$store.dispatch('employee/fetchEmployees', {
        currentPage: 1,
        itemsPerPage: 10,
        search,
      });
    },

    removeItem(i) {
      this.itemsToDispense.splice(i, 1);
    },

    dispenseItems() {
      if (this.itemsToDispense.some(({ quantity_to_dispense }) => !quantity_to_dispense)) {
        return this.$notify({
          group: 'foo',
          title: 'Error message',
          text: 'An item does not contain quantity to dispense',
          type: 'error',
        });
      }

      // set spinner to submit button
      const submitButton = this.$refs['kt_dispense_submit'];
      this.addSpinner(submitButton);

      const itemsToDispense = this.itemsToDispense.map(
        // eslint-disable-next-line no-unused-vars
        ({ drug_type, isInvalid, quantity_left, unit_name, ...item }) => item
      );
      this.$store
        .dispatch('store/dispensePharmacyItems', itemsToDispense)
        .then(() => this.endRequest(submitButton))
        .catch(() => this.removeSpinner(submitButton));
    },

    checkQuantity(index, event) {
      const item = this.itemsToDispense[index];
      const result = parseInt(event.target.value) > item.quantity_left;
      item.isInvalid = result;
      this.itemIsInvalid = result;
    },

    isInvalid(index) {
      return this.itemsToDispense[index]?.isInvalid || false;
    },

    getRightInventory(item) {
      return this.inventories.filter(inventory => inventory.name.includes(item.drug_type));
    },
  },
  created() {
    this.$store.dispatch('inventory/fetchInventories');
  },
};
</script>

<style scoped></style>
