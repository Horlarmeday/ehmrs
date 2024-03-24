<template>
  <b-modal
    v-model="activePrompt"
    size="xl"
    hide-footer
    title="Routine Drugs"
    @show="getInventories"
  >
    <div v-if="defaults">
      <div class="mb-5" v-for="item in routineItems" :key="item.drug_id">
        <div class="form-group row">
          <div class="col-sm-1">
            <label class="checkbox" style="margin-top: 30px">
              <input type="checkbox" :checked="isSelected(item)" @change="toggleDrug(item)" />
              <span></span>
            </label>
          </div>
          <div class="col-lg-4">
            <label>Item:</label>
            <input readonly v-model="item.name" class="form-control-sm form-control" type="text" />
          </div>
          <div class="col-lg-4">
            <label>Quantity:</label>
            <input
              readonly
              v-model="item.quantity_to_dispense"
              class="form-control-sm form-control"
              type="number"
            />
          </div>
        </div>
      </div>
      <div class="separator separator-solid separator-border-2"></div>
      <div class="mt-2">
        <button class="btn btn-primary btn-md" ref="kt-routineItems-submit" @click="submitItems">
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
    currentPage: 1,
    itemsPerPage: 10,
    defaultData: 'OPERATION_ITEMS',
    switchSpot: true,
    isDisabled: false,
    showError: false,
    errorMessage: '',
    errorList: [],
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
    filter: {
      type: Object,
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

    inventories() {
      return this.$store.state.inventory.inventories;
    },

    routineItems: {
      get() {
        const items = this.defaults?.find(def => def.type === this.defaultData)?.data;
        if (items) {
          return items.map(item => ({
            name: item?.drug?.name,
            drug_id: item?.drug?.drug_id,
            price: item.drug?.price,
            drug_type: this.switchPosition && this.switchSpot ? 'NHIS' : 'Cash',
            unit_id: item?.drug?.unit_id,
            drug_form: item?.drug?.drug_form || 'Drug',
            quantity_to_dispense: +item?.quantity,
          }));
        }
        return [];
      },
    },
  },
  watch: {
    displayPrompt(val) {
      if (!val) return false;
      this.fetchDrugs();
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
      this.$store.dispatch('order/fetchPrescribedAdditionalItems', {
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        filter: this.filter,
      });
    },

    fetchDrugs() {
      if (!localStorage.getItem('defaults')) {
        this.$store
          .dispatch('model/fetchDefaults')
          .then(res => localStorage.setItem('defaults', JSON.stringify(res.data.data)));
      }
    },

    isSelected(item) {
      return this.routineItems.some(t => t.drug_id === item.drug_id);
    },

    toggleDrug(item) {
      const index = this.routineItems.findIndex(t => t.drug_id === item.drug_id);
      if (index !== -1) {
        this.routineItems.splice(index, 1); // Remove drug
      } else {
        this.routineItems.push(item); // Add drug
      }
    },

    getInventories() {
      this.$store.dispatch('inventory/fetchInventories');
    },

    getInventoryId() {
      const type = this.switchPosition && this.switchSpot ? 'NHIS' : 'Cash';
      return this.inventories.find(inventory =>
        inventory.name.toLowerCase().includes(type.toLowerCase())
      )?.id;
    },

    submitItems() {
      const data = this.routineItems.map(item => ({
        ...item,
        inventory_id: this.getInventoryId(),
        source: this.source,
        ...(this.source === 'Theater' && { surgery_id: this.$route.query.surgery }),
        ...(this.source === 'Antenatal' && { ante_natal_id: this.$route.query.antenatal }),
      }));

      // set spinner to submit button
      const submitButton = this.$refs['kt-routineItems-submit'];
      this.addSpinner(submitButton);

      console.log(data);

      this.$store
        .dispatch('order/orderAdditionalItems', { data, id: this.$route.params.id })
        .then(() => this.endRequest(submitButton))
        .catch(() => this.removeSpinner(submitButton));
    },

    flipSwitch(value) {
      this.switchSpot = value;
    },
  },
};
</script>

<style scoped></style>
