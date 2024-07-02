<template>
  <div>
    <div class="accordion accordion-solid accordion-panel accordion-svg-toggle">
      <div class="card">
        <div class="card-header" header-tag="header" role="tab">
          <div class="card-title">
            <div class="card-label">Update Store Items</div>
            <accordion-icon />
          </div>
        </div>
        <div class="card-body">
          <div class="form-group row" v-for="item in pharmItems" :key="item.id">
            <div class="col-lg-12">
              <section-title :text="item.drug.name" />
            </div>
            <div class="col-lg-3">
              <label>Product Code</label>
              <input
                type="text"
                class="form-control form-control-sm"
                v-model="item.product_code"
                placeholder="Product Code"
                name="product_code"
              />
            </div>
            <div class="col-lg-3">
              <label>Voucher/Ref Number</label>
              <input
                type="text"
                class="form-control form-control-sm"
                v-model="item.voucher"
                placeholder="Voucher/Ref Number"
                name="voucher"
              />
            </div>
            <div class="col-lg-3">
              <label>Batch Number</label>
              <input
                type="text"
                class="form-control form-control-sm"
                name="batch"
                placeholder="Batch Number"
                v-model="item.batch"
              />
            </div>
            <div class="col-lg-3">
              <label>Expiry Date <span class="text-danger">*</span></label>
              <datepicker
                v-model="item.expiration"
                input-class="form-control form-control-sm"
                placeholder="Expiry Date"
              />
            </div>
            <div class="col-lg-3">
              <label>Dosage Form <span class="text-danger">*</span></label>
              <select
                class="form-control form-control-sm"
                v-model="item.dosage_form_id"
                name="dosage_form"
              >
                <option
                  :value="dosageForm.id"
                  v-for="dosageForm in dosageForms"
                  :key="dosageForm.id"
                  >{{ dosageForm.name }}</option
                >
              </select>
              <span class="text-danger text-sm">{{ errors.first('dosage_form') }}</span>
            </div>
            <div class="col-lg-3">
              <label>Strength <span class="text-danger">*</span></label>
              <input
                type="text"
                class="form-control form-control-sm"
                v-model="item.strength_input"
                placeholder="Strength"
                name="strength_input"
              />
            </div>
            <div class="col-lg-3">
              <label>Strength Unit <span class="text-danger">*</span></label>
              <select
                class="form-control form-control-sm"
                v-model="item.measurement_id"
                name="strength"
              >
                <option
                  :value="measurement.id"
                  v-for="measurement in measurements"
                  :key="measurement.id"
                  >{{ measurement.name }}</option
                >
              </select>
              <span class="text-danger text-sm">{{ errors.first('strength') }}</span>
            </div>
            <div class="col-lg-3">
              <label>Route of Administration <span class="text-danger">*</span></label>
              <select class="form-control form-control-sm" v-model="item.route_id" name="route">
                <option :value="route.id" v-for="route in routes" :key="route.id">{{
                  route.name
                }}</option>
              </select>
            </div>
            <div class="col-lg-3">
              <label>Quantity <span class="text-danger">*</span></label>
              <input
                type="number"
                class="form-control form-control-sm"
                v-model="item.quantity"
                placeholder="Quantity"
                name="quantity"
              />
            </div>
            <div class="col-lg-3">
              <label>Unit <span class="text-danger">*</span></label>
              <v-select
                name="unit"
                v-model="item.unit"
                label="name"
                :reduce="units => units.id"
                :options="units"
              />
            </div>
            <div class="col-lg-3">
              <label>Unit Price <span class="text-danger">*</span></label>
              <input
                type="number"
                class="form-control form-control-sm"
                v-model="item.unit_price"
                placeholder="Unit Price"
                name="unit_price"
              />
            </div>
            <div class="col-lg-3">
              <label>Selling Price <span class="text-danger">*</span></label>
              <input
                type="number"
                class="form-control form-control-sm"
                v-model="item.selling_price"
                placeholder="Selling Price"
                name="selling_price"
              />
            </div>
            <div class="col-lg-3">
              <label>Date Received <span class="text-danger">*</span></label>
              <datepicker
                name="date_received"
                v-model="item.date_received"
                input-class="form-control form-control-sm"
                placeholder="Date Received"
              />
            </div>
            <div class="col-lg-3">
              <label>Brand</label>
              <input
                type="text"
                class="form-control form-control-sm"
                v-model="item.brand"
                placeholder="Brand"
                name="brand"
              />
            </div>
          </div>
          <div>
            <button
              ref="kt_update_pharmacy_items_submit"
              class="btn btn-primary font-weight-bold float-right"
              @click="updatePharmacyItems"
              :disabled="isDisabled"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import AccordionIcon from '@/assets/icons/AccordionIcon.vue';
import vSelect from 'vue-select';
import Datepicker from 'vuejs-datepicker';
import SectionTitle from '@/utils/SectionTitle.vue';
export default {
  components: { SectionTitle, AccordionIcon, vSelect, Datepicker },
  data: () => ({
    pharmItems: [],
    isDisabled: false,
    currentPage: 1,
  }),
  computed: {
    units() {
      return this.$store.state.model.units;
    },

    dosageForms() {
      return this.$store.state.pharmacy.dosageForms;
    },

    measurements() {
      return this.$store.state.pharmacy.measurements;
    },

    routes() {
      return this.$store.state.pharmacy.routes;
    },
  },
  created() {
    this.fetchStoreItems();
    this.getRoutes();
    this.getDosageForms();
    this.getMeasurements();
    this.getUnits();
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

    fetchStoreItems() {
      this.$store
        .dispatch('store/fetchSelectedPharmacyItems', {
          itemIds: this.$route.query.itemIds,
        })
        .then(response => (this.pharmItems = JSON.parse(JSON.stringify(response.data.data))));
    },

    getRoutes() {
      this.$store.dispatch('pharmacy/fetchRoutes');
    },

    getMeasurements() {
      this.$store.dispatch('pharmacy/fetchMeasurements');
    },

    getDosageForms() {
      this.$store.dispatch('pharmacy/fetchDosageForms');
    },

    getUnits() {
      this.$store.dispatch('model/fetchUnits', { currentPage: 1, itemsPerPage: 100 });
    },

    endRequest(submitButton) {
      this.fetchPharmacyItems();
      this.removeAllSelectedItems();
      this.removeSpinner(submitButton);
      this.$router.go(-1);
    },

    fetchPharmacyItems() {
      this.$store.dispatch('store/fetchPharmacyItems', {
        currentPage: this.currentPage || this.$route.query.currentPage,
        itemsPerPage: 10,
      });
    },

    removeAllSelectedItems() {
      this.$store.dispatch('store/removeAllSelectedItems', []);
    },

    updatePharmacyItems() {
      const submitButton = this.$refs['kt_update_pharmacy_items_submit'];
      this.addSpinner(submitButton);

      this.$store
        .dispatch('store/updatePharmacyItems', { items: this.pharmItems })
        .then(() => this.endRequest(submitButton))
        .catch(() => this.removeSpinner(submitButton));
    },
  },
};
</script>
