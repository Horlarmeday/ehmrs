<template>
  <div>
    <!--begin::Accordion-->
    <div class="accordion accordion-solid accordion-panel accordion-svg-toggle">
      <div class="card">
        <div class="card-header" header-tag="header" role="tab">
          <div class="card-title">
            <div class="card-label">Store Item</div>
            <accordion-icon />
          </div>
        </div>
        <div class="card-body">
          <!-- NAME -->
          <div class="form-group row"></div>
          <div class="form-group row">
            <div class="col-lg-4">
              <label>Generic Drug <span class="text-danger">*</span></label>
              <v-select
                v-validate="'required'"
                data-vv-validate-on="blur"
                name="drug"
                @input="setDrugForm"
                @search="searchGenericDrugs"
                v-model="drug_id"
                label="name"
                :reduce="items => ({ id: items.id, type: items.type, name: items.name })"
                :options="drugs"
              />
              <span class="text-danger text-sm">{{ errors.first('drug') }}</span>
            </div>
            <div class="col-lg-4">
              <label>Product Code</label>
              <input
                type="text"
                class="form-control form-control-sm"
                v-model="product_code"
                placeholder="Product Code"
                name="product_code"
              />
              <span class="text-danger text-sm">{{ errors.first('product_code') }}</span>
            </div>
            <div class="col-lg-4">
              <label>Voucher/Ref Number</label>
              <input
                type="text"
                class="form-control form-control-sm"
                v-model="voucher"
                placeholder="Voucher/Ref Number"
                name="voucher"
              />
              <span class="text-danger text-sm">{{ errors.first('voucher') }}</span>
            </div>
            <div class="col-lg-4 mt-3">
              <label>Batch Number</label>
              <input
                type="text"
                class="form-control form-control-sm"
                name="batch"
                placeholder="Batch Number"
                v-model="batch"
              />
              <span class="text-danger text-sm">{{ errors.first('batch') }}</span>
            </div>
            <div class="col-lg-4 mt-3">
              <label>Expiry Date <span class="text-danger">*</span></label>
              <datepicker
                name="expiration"
                v-validate="'required'"
                data-vv-validate-on="blur"
                v-model="expiration"
                input-class="form-control form-control-sm"
                placeholder="Expiry Date"
              />
              <span class="text-danger text-sm">{{ errors.first('expiration') }}</span>
            </div>
            <div class="col-lg-4 mt-3" v-if="canSee">
              <label>Dosage Form <span class="text-danger">*</span></label>
              <select
                class="form-control form-control-sm"
                v-model="dosage_form"
                name="dosage_form"
                @change="getRoutesAndMeasurements"
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
            <div class="col-lg-4 mt-3" v-if="canSee">
              <label>Strength <span class="text-danger">*</span></label>
              <input
                type="text"
                class="form-control form-control-sm"
                v-model="strength_input"
                placeholder="Strength"
                name="strength_input"
              />
              <span class="text-danger text-sm">{{ errors.first('strength_input') }}</span>
            </div>
            <div class="col-lg-4 mt-3" v-if="canSee">
              <label>Strength Unit <span class="text-danger">*</span></label>
              <select class="form-control form-control-sm" v-model="strength" name="strength">
                <option
                  :value="measurement.id"
                  v-for="measurement in measurements"
                  :key="measurement.id"
                  >{{ measurement.name }}</option
                >
              </select>
              <span class="text-danger text-sm">{{ errors.first('strength') }}</span>
            </div>
            <div class="col-lg-4 mt-3" v-if="canSee">
              <label>Route of Administration <span class="text-danger">*</span></label>
              <select class="form-control form-control-sm" v-model="route" name="route">
                <option :value="route.id" v-for="route in routes" :key="route.id">{{
                  route.name
                }}</option>
              </select>
              <span class="text-danger text-sm">{{ errors.first('route') }}</span>
            </div>
            <div class="col-lg-4 mt-3">
              <label>Quantity <span class="text-danger">*</span></label>
              <input
                v-validate="'required'"
                data-vv-validate-on="blur"
                type="number"
                class="form-control form-control-sm"
                v-model="quantity"
                placeholder="Quantity"
                name="quantity"
              />
              <span class="text-danger text-sm">{{ errors.first('quantity') }}</span>
            </div>
            <div class="col-lg-4 mt-3">
              <label>Unit <span class="text-danger">*</span></label>
              <v-select
                v-validate="'required'"
                data-vv-validate-on="blur"
                name="unit"
                v-model="unit"
                label="name"
                :reduce="units => units.id"
                :options="units"
              />
              <span class="text-danger text-sm">{{ errors.first('unit') }}</span>
            </div>
            <div class="col-lg-4 mt-3">
              <label>Unit Price <span class="text-danger">*</span></label>
              <input
                v-validate="'required'"
                data-vv-validate-on="blur"
                type="number"
                class="form-control form-control-sm"
                v-model="unit_price"
                placeholder="Unit Price"
                name="unit_price"
              />
              <span class="text-danger text-sm">{{ errors.first('unit_price') }}</span>
            </div>
            <div class="col-lg-4 mt-3">
              <label>Selling Price <span class="text-danger">*</span></label>
              <input
                v-validate="'required'"
                data-vv-validate-on="blur"
                type="number"
                class="form-control form-control-sm"
                v-model="selling_price"
                placeholder="Selling Price"
                name="selling_price"
              />
              <span class="text-danger text-sm">{{ errors.first('selling_price') }}</span>
            </div>
            <div class="col-lg-4 mt-3">
              <label>Date Received <span class="text-danger">*</span></label>
              <datepicker
                name="date_received"
                v-validate="'required'"
                data-vv-validate-on="blur"
                v-model="date_received"
                input-class="form-control form-control-sm"
                placeholder="Date Received"
              />
              <span class="text-danger text-sm">{{ errors.first('date_received') }}</span>
            </div>
            <div class="col-lg-4 mt-3">
              <div class="form-group">
                <label>Item Type</label>
                <div class="checkbox-inline">
                  <label class="checkbox checkbox-rounded">
                    <input type="checkbox" :value="true" v-model="create_cash_item" />
                    <span></span>
                    Cash
                  </label>
                  <label class="checkbox checkbox-rounded">
                    <input type="checkbox" :value="true" v-model="create_nhis_item" />
                    <span></span>
                    NHIS
                  </label>
                </div>
                <span class="form-text text-muted">Tick as appropriate</span>
              </div>
            </div>
            <div class="col-lg-4 mt-3" v-if="create_nhis_item">
              <label>NHIS Selling Price <span class="text-danger">*</span></label>
              <input
                type="number"
                class="form-control form-control-sm"
                v-model="nhis_selling_price"
                placeholder="NHIS Selling Price"
                name="nhis_selling_price"
              />
              <span class="text-danger text-sm">{{ errors.first('nhis_selling_price') }}</span>
            </div>
          </div>
        </div>
      </div>
      <div>
        <button
          ref="kt_pharmacy_item_submit"
          class="btn btn-primary font-weight-bold float-right"
          @click="createPharmacyItem"
        >
          Submit
        </button>
      </div>
    </div>
    <!--end::Accordion-->
  </div>
</template>

<script>
import Datepicker from 'vuejs-datepicker';
import AccordionIcon from '@/assets/icons/AccordionIcon';
import vSelect from 'vue-select';
export default {
  components: {
    Datepicker,
    AccordionIcon,
    vSelect,
  },
  data() {
    return {
      drug_id: '',
      product_code: '',
      batch: '',
      voucher: '',
      shelf: '',
      shelf_num: '',
      dosage_form: null,
      expiration: '',
      strength: null,
      strength_input: '',
      route: null,
      quantity: '',
      unit: '',
      unit_price: '',
      selling_price: '',
      nhis_selling_price: '',
      date_received: new Date(),
      drug_form: '',

      isDisabled: false,
      create_cash_item: true,
      create_nhis_item: false,
    };
  },
  computed: {
    units() {
      return this.$store.state.model.units;
    },

    drugs() {
      return this.$store.state.pharmacy.drugs;
    },

    canSee() {
      return this.drug_id.type === 'Drug';
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
    this.$store.dispatch('model/fetchUnits', {
      currentPage: 1,
      itemsPerPage: 20,
    });
  },
  methods: {
    initValues() {
      this.drug_id = '';
      this.product_code = '';
      this.batch = '';
      this.voucher = '';
      this.shelf = '';
      this.shelf_num = '';
      this.expiration = '';
      this.dosage_form = null;
      this.strength = null;
      this.strength_input = '';
      this.route = null;
      this.quantity = '';
      this.unit = '';
      this.unit_price = '';
      this.selling_price = '';
      this.nhis_selling_price = '';
      this.date_received = new Date();
      this.drug_form = '';
      this.create_cash_item = true;
      this.create_nhis_item = false;
    },

    addSpinner(submitButton) {
      this.isDisabled = true;
      submitButton.classList.add('spinner', 'spinner-light', 'spinner-right');
    },

    removeSpinner(submitButton) {
      this.isDisabled = false;
      submitButton.classList.remove('spinner', 'spinner-light', 'spinner-right');
    },

    setDrugForm() {
      this.drug_form = this.drug_id.type;
      this.dosage_form = null;
      this.strength = null;
      this.strength_input = '';
      this.$store.dispatch('pharmacy/fetchDosageForms');
    },

    searchGenericDrugs(search) {
      this.$store.dispatch('pharmacy/fetchGenericDrugs', {
        currentPage: 1,
        itemsPerPage: 20,
        search,
      });
    },

    initRequest(button) {
      this.removeSpinner(button);
      this.initValues();
    },

    getRoutesAndMeasurements() {
      this.$store.dispatch('pharmacy/fetchRoutesAndMeasurements', {
        dosage_form_id: this.dosage_form,
      });
    },

    createPharmacyItem() {
      this.$validator.validateAll().then(result => {
        if (result) {
          // set spinner to submit button
          const submitButton = this.$refs['kt_pharmacy_item_submit'];
          this.addSpinner(submitButton);

          const data = {
            drug_id: this.drug_id.id,
            product_code: this.product_code,
            batch: this.batch,
            voucher: this.voucher,
            shelf: `${this.shelf}${this.shelf_num}`,
            expiration: this.expiration,
            dosage_form_id: this.dosage_form,
            measurement_id: this.strength,
            strength_input: this.strength_input,
            route_id: this.route,
            unit_id: this.unit,
            quantity_received: this.quantity,
            unit_price: this.unit_price,
            selling_price: this.selling_price,
            nhis_selling_price: this.nhis_selling_price,
            date_received: this.date_received,
            drug_form: this.drug_form,
            create_cash_item: this.create_cash_item,
            create_nhis_item: this.create_nhis_item,
          };
          this.$store
            .dispatch('store/addPharmacyItem', data)
            .then(() => this.initRequest(submitButton))
            .catch(() => this.removeSpinner(submitButton));
        }
      });
    },
  },
};
</script>

<style scoped>
.form-group {
  margin-bottom: 0.9rem !important;
}
</style>
