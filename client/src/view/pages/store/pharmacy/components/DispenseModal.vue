<template>
  <b-modal size="xl" v-model="activePrompt" hide-footer title="Dispense">
    <div class="p-2">
      <div v-for="(item, i) in itemsToDispense" :key="i">
        <label class="font-weight-bolder">{{ item.drug_name }}</label>
        <div class="form-group row">
          <div class="col-lg-4">
            <label>Quantity To Dispense:</label>
            <div class="input-group input-group-sm">
              <div class="input-group-prepend">
                <span class="input-group-text">{{ item.unit }}</span>
              </div>
              <input
                v-model="item.quantity_to_dispense"
                type="number"
                class="form-control form-control-sm"
                placeholder="Quantity to dispense"
              />
            </div>
          </div>
          <div class="col-lg-4">
            <label>Dispensary:</label>
            <select class="form-control form-control-sm" v-model="item.dispensary">
              <option :value="inventory" v-for="(inventory, i) in inventories" :key="i">{{
                inventory
              }}</option>
            </select>
          </div>
          <div class="col-lg-3">
            <label>Item Receiver</label>
            <v-select
              @search="searchStaffs"
              v-model="item.staff"
              label="fullname"
              :reduce="staffs => ({ id: staffs.id })"
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
      @click="() => {}"
      :disabled="isDisabled"
      ref="kt_insurance_submit"
    >
      Submit
    </button>
  </b-modal>
</template>

<script>
import vSelect from 'vue-select';
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
      return this.$store.state.inventory.inventories
    }
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
  },
  created() {
    this.$store.dispatch('inventory/fetchInventories');
  }
};
</script>

<style scoped></style>
