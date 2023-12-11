<template>
  <div>
    <div class="card-header p-0">
      <div class="card-title mb-2">
        <span class="card-label font-weight-bolder text-dark"></span>
        <span v-if="showSwitch" class="switch switch-sm switch-icon">
          <label>
            <input
              @change="flipSwitch($event)"
              type="checkbox"
              :checked="switchPosition && switchSpot"
            />
            <span />
          </label>
        </span>
      </div>
    </div>
    <div class="">
      <div v-for="(item, i) in additionalItems" :key="i">
        <div class="form-group row">
          <div class="col-lg-4">
            <label>Item</label>
            <v-select
              @search="onSearch"
              v-model="item.item"
              label="name"
              :options="drugOptions"
              :reduce="
                items => ({
                  name: items.name,
                  drug_id: items.id,
                  drug_type: items?.drug_type,
                  drug_form: items?.drug_form,
                  price: items.price,
                  unit_id: items.unit_id,
                })
              "
            />
          </div>
          <div class="col-lg-4">
            <label>Quantity:</label>
            <input
              v-model="item.quantity"
              type="number"
              class="form-control form-control-sm"
              placeholder="Quantity"
            />
          </div>
          <div class="col-lg-1">
            <br />
            <a href="#" class="col-lg-1 col-form-label">
              <i
                v-if="i === 0"
                class="far fa-plus-square mr-3 text-primary icon-lg mt-lg-3"
                @click="addNewItem"
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
      <div class="mb-3">
        <button
          class="btn btn-primary float-right mb-lg-5"
          @click="submitItems"
          :disabled="isDisabled || !additionalItems.length"
          ref="kt_addItems_submit"
        >
          Submit
        </button>
      </div>
    </div>
  </div>
</template>
<script>
import vSelect from 'vue-select';
import { debounce } from '@/common/common';

export default {
  components: { vSelect },
  props: {
    switchPosition: {
      type: Boolean,
      required: true,
      default: false,
    },
    showSwitch: {
      type: Boolean,
      required: true,
      default: false,
    },
    source: {
      type: String,
      required: true,
    },
    filter: {
      type: Object,
      required: true,
      default: () => {},
    },
  },
  data: () => ({
    switchSpot: true,
    isDisabled: false,
    additionalItems: [
      {
        item: '',
        quantity: 1,
      },
    ],
  }),
  created() {
    this.getInventories();
  },
  computed: {
    inventories() {
      return this.$store.state.inventory.inventories;
    },
    items() {
      return this.$store.state.inventory.items;
    },
    drugOptions: {
      get() {
        return this.items.map(item => ({
          name: item?.drug?.name,
          id: item?.drug?.id,
          price: item.selling_price,
          drug_type: item.drug_type,
          unit_id: item?.unit_id,
          drug_form: item?.drug_form,
        }));
      },
      set() {
        this.$store.commit('inventory/SET_ITEMS', []);
        this.drug = '';
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

    getInventories() {
      this.$store.dispatch('inventory/fetchInventories');
    },

    addNewItem() {
      this.additionalItems.push({
        item: '',
        quantity: 1,
      });
    },

    onSearch(search, loading) {
      if (search.length > 2) {
        loading(true);
        this.search(loading, search, this);
      }
    },

    search: debounce((loading, search, vm) => {
      const inventory = vm.getInventoryId();
      vm.inventory_id = inventory;
      vm.$store
        .dispatch('inventory/fetchInventoryItems', {
          search,
          inventory,
        })
        .then(() => loading(false));
    }, 500),

    getInventoryId() {
      const type = this.switchPosition && this.switchSpot ? 'NHIS' : 'Cash';
      return this.inventories.find(inventory =>
        inventory.name.toLowerCase().includes(type.toLowerCase())
      )?.id;
    },

    removeItem(i) {
      this.additionalItems.splice(i, 1);
    },

    endRequest(button) {
      this.removeSpinner(button);
      this.initValues();
      this.$store.dispatch('order/fetchPrescribedAdditionalItems', {
        currentPage: 1,
        itemsPerPage: 10,
        filter: this.filter,
      });
    },

    initValues() {
      this.additionalItems = [
        {
          item: '',
          quantity: 1,
        },
      ];
    },

    submitItems() {
      if (this.additionalItems.some(({ item }) => !item)) {
        return this.$notify({
          group: 'foo',
          title: 'Error message',
          text: 'An item cannot be empty',
          type: 'error',
        });
      }

      const data = this.additionalItems.map(({ item, quantity }) => ({
        ...item,
        quantity_to_dispense: quantity,
        inventory_id: this.getInventoryId(),
        source: this.source,
      }));

      // set spinner to submit button
      const submitButton = this.$refs['kt_addItems_submit'];
      this.addSpinner(submitButton);

      this.$store
        .dispatch('order/orderAdditionalItems', { data, id: this.filter.visit_id })
        .then(() => this.endRequest(submitButton))
        .catch(() => this.removeSpinner(submitButton));
    },

    flipSwitch(event) {
      this.switchSpot = !!event.target.checked;
    },
  },
};
</script>

<style scoped></style>
