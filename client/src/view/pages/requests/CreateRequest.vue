<template>
  <div class="card card-custom gutter-b">
    <!--begin::Header-->
    <div class="card-header">
      <h3 class="card-title">
        <span class="card-label font-weight-bolder text-dark">Create Request</span>
      </h3>
    </div>
    <div class="card-body">
      <div v-for="(item, i) in itemsToRequest" :key="i">
        <div class="form-group row">
          <div class="col-lg-4">
            <label>Inventory:</label>
            <select
              name="inventory"
              @change="getInventoryId(i)"
              class="form-control form-control-sm"
              v-model="item.inventory"
            >
              <option :value="inventory.id" v-for="(inventory, i) in inventories" :key="i">
                {{ inventory.name }}</option
              >
            </select>
          </div>
          <div class="col-lg-4">
            <label>Item to Request:</label>
            <v-select
              @search="searchInventoryItems"
              v-model="item.item"
              label="name"
              :options="drugOptions"
              :reduce="
                items => ({
                  name: items.name,
                  id: items.id,
                  unit_name: items?.unit_name,
                })
              "
            />
          </div>
          <div class="col-lg-3">
            <label>Quantity to Request</label>
            <div class="input-group input-group-sm">
              <div class="input-group-prepend">
                <span class="input-group-text">{{ item.item.unit_name }}</span>
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
              title="Add more"
              v-b-tooltip.hover
              href="javascript:"
              data-repeater-delete=""
              class="btn font-weight-bold btn-primary btn-icon mr-2"
              v-if="i === 0"
              @click="addMoreRequest"
            >
              <i class="far fa-plus-square"></i>
            </a>
            <a
              href="javascript:"
              data-repeater-delete=""
              class="btn font-weight-bold btn-danger btn-icon"
              @click="removeItem(i)"
            >
              <i class="la la-remove"></i>
            </a>
          </div>
        </div>
      </div>
      <div>
        <button
          ref="kt-request-submit"
          @click="createRequest"
          :disabled="isDisabled"
          class="float-right btn btn-primary m-3"
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
  data: () => ({
    isDisabled: false,
    inventory: '',
    itemsToRequest: [
      {
        inventory: null,
        quantity: 0,
        item: '',
        unit_name: null,
      },
    ],
  }),
  computed: {
    inventories() {
      return this.$store.state.inventory.inventories;
    },
    items() {
      return this.$store.state.inventory.items;
    },
    drugOptions() {
      return this.items.map(item => ({
        name: item?.drug?.name,
        id: item?.id,
        drug_id: item?.drug?.id,
        unit_name: item?.unit?.name,
      }));
    },
  },
  methods: {
    addSpinner(submitButton) {
      this.isDisabled = true;
      submitButton.classList.add('spinner', 'spinner-light', 'spinner-right');
    },

    addMoreRequest() {
      this.itemsToRequest.push({
        inventory: null,
        quantity: 0,
        item: '',
        unit_name: null,
      });
    },

    removeSpinner(submitButton) {
      this.isDisabled = false;
      submitButton.classList.remove('spinner', 'spinner-light', 'spinner-right');
    },

    removeItem(i) {
      this.itemsToRequest.splice(i, 1);
    },

    getInventoryId(index) {
      this.inventory = this.itemsToRequest[index].inventory;
    },

    searchInventoryItems(search, loading) {
      if (search.length > 2) {
        loading(true);
        this.debounceSearch(search, this, loading);
      }
    },

    debounceSearch: debounce((search, vm, loading) => {
      vm.$store
        .dispatch('inventory/fetchInventoryItems', {
          currentPage: 1,
          itemsPerPage: 10,
          search,
          inventory: vm.inventory,
        })
        .then(() => loading(false))
        .catch(() => loading(false));
    }, 500),

    createRequest() {
      if (this.itemsToRequest.some(({ quantity }) => !quantity)) {
        return this.$notify({
          group: 'foo',
          title: 'Error message',
          text: 'A request does not contain quantity',
          type: 'error',
        });
      }
      const data = this.itemsToRequest.map(({ item, quantity, inventory }) => ({
        inventory_id: inventory,
        item_id: item.id,
        quantity: +quantity,
      }));
      const submitButton = this.$refs['kt-request-submit'];
      this.addSpinner(submitButton);
      this.$store
        .dispatch('request/createRequest', { requests: data })
        .then(() => this.endRequest(submitButton))
        .catch(() => this.removeSpinner(submitButton));
    },

    endRequest(button) {
      this.removeSpinner(button);
      this.initValues();
    },

    initValues() {
      this.itemsToRequest = [
        {
          inventory: null,
          quantity: 0,
          item: '',
          unit_name: null,
        },
      ];
    },
  },
  created() {
    this.$store.dispatch('inventory/fetchInventories');
  },
};
</script>

<style scoped></style>
