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
          <div class="form-group row">
            <div class="col-lg-4">
              <label>Name <span class="text-danger">*</span></label>
              <input
                type="text"
                class="form-control form-control-sm"
                v-model="name"
                name="name"
              />
              <span class="text-danger text-sm">{{
                errors.first("name")
              }}</span>
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
              <span class="text-danger text-sm">{{
                errors.first("product_code")
              }}</span>
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
              <span class="text-danger text-sm">{{
                errors.first("voucher")
              }}</span>
            </div>
          </div>
          <!-- Contact -->
          <div class="form-group row">
            <div class="col-lg-4">
              <label>Batch Number</label>
              <input
                type="text"
                class="form-control form-control-sm"
                name="batch"
                placeholder="Batch Number"
                v-model="batch"
              />
              <span class="text-danger text-sm">{{
                errors.first("batch")
              }}</span>
            </div>
            <div class="col-lg-4">
              <label>Shelf <span class="text-danger">*</span></label>
              <select
                v-validate="'required'"
                data-vv-validate-on="blur"
                class="form-control form-control-sm"
                v-model="shelf"
                name="shelf"
              >
                <option>A</option>
                <option>B</option>
                <option>C</option>
                <option>D</option>
                <option>E</option>
                <option>F</option>
                <option>G</option>
                <option>H</option>
                <option>I</option>
                <option>J</option>
                <option>K</option>
                <option>L</option>
                <option>M</option>
                <option>N</option>
                <option>O</option>
                <option>P</option>
                <option>Q</option>
                <option>R</option>
                <option>S</option>
                <option>T</option>
                <option>U</option>
                <option>V</option>
                <option>W</option>
                <option>X</option>
                <option>Y</option>
                <option>Z</option>
              </select>
              <span class="text-danger text-sm">{{
                errors.first("shelf")
              }}</span>
            </div>
            <div class="col-lg-4">
              <label>Shelf Number <span class="text-danger">*</span></label>
              <select
                v-model="shelf_num"
                class="form-control form-control-sm"
                name="shelf_num"
                v-validate="'required'"
                data-vv-validate-on="blur"
              >
                <option>1</option>
                <option>2</option>
                <option>3</option>
                <option>4</option>
                <option>5</option>
                <option>6</option>
                <option>7</option>
                <option>8</option>
                <option>9</option>
                <option>10</option>
              </select>
              <span class="text-danger text-sm">{{
                errors.first("shelf_num")
              }}</span>
            </div>
          </div>
          <div class="form-group row">
            <div class="col-lg-4">
              <label>Expiry Date <span class="text-danger">*</span></label>
              <datepicker
                name="expiration"
                v-validate="'required'"
                data-vv-validate-on="blur"
                v-model="expiration"
                input-class="form-control form-control-sm"
                placeholder="Expiry Date"
              ></datepicker>
              <span class="text-danger text-sm">{{
                errors.first("expiration")
              }}</span>
            </div>
            <div class="col-lg-4">
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
              <span class="text-danger text-sm">{{
                errors.first("quantity")
              }}</span>
            </div>
            <div class="col-lg-4">
              <label>Unit <span class="text-danger">*</span></label>
              <v-select
                v-validate="'required'"
                data-vv-validate-on="blur"
                name="unit"
                v-model="unit"
                label="name"
                :reduce="units => units.id"
                :options="units"
              ></v-select>
              <span class="text-danger text-sm">{{
                errors.first("unit")
              }}</span>
            </div>
          </div>
          <div class="form-group row">
            <div class="col-lg-4">
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
              <span class="text-danger text-sm">{{
                errors.first("unit_price")
              }}</span>
            </div>
            <div class="col-lg-4">
              <label>Date Received <span class="text-danger">*</span></label>
              <datepicker
                name="date_received"
                v-validate="'required'"
                data-vv-validate-on="blur"
                v-model="date_received"
                input-class="form-control form-control-sm"
                placeholder="Date Received"
              ></datepicker>
              <span class="text-danger text-sm">{{
                errors.first("date_received")
              }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div>
      <button
        ref="kt_lab_item_submit"
        class="btn btn-primary font-weight-bold float-right"
        @click="createLabItem"
      >
        Submit
      </button>
    </div>
  </div>
  <!--end::Accordion-->
</template>

<script>
import Datepicker from "vuejs-datepicker";
import AccordionIcon from "../../../../../assets/icons/AccordionIcon";
import vSelect from "vue-select";
export default {
  components: {
    Datepicker,
    AccordionIcon,
    vSelect
  },
  data() {
    return {
      name: "",
      product_code: "",
      batch: "",
      voucher: "",
      shelf: "",
      shelf_num: "",
      expiration: "",
      quantity: "",
      unit: "",
      unit_price: "",
      date_received: "",

      isDisabled: false
    };
  },
  computed: {
    units() {
      return this.$store.state.model.units;
    }
  },

  created() {
    this.$store.dispatch("model/fetchUnits", {
      currentPage: 1,
      itemsPerPage: 20
    });
  },
  methods: {
    initValues() {
      this.name = "";
      this.product_code = "";
      this.batch = "";
      this.voucher = "";
      this.shelf = "";
      this.shelf_num = "";
      this.expiration = "";
      this.quantity = "";
      this.unit = "";
      this.unit_price = "";
      this.date_received = "";
    },

    addSpinner(submitButton) {
      this.isDisabled = true;
      submitButton.classList.add("spinner", "spinner-light", "spinner-right");
    },

    removeSpinner(submitButton) {
      this.isDisabled = false;
      submitButton.classList.remove(
        "spinner",
        "spinner-light",
        "spinner-right"
      );
    },

    initRequest(button, response) {
      this.removeSpinner(button);
      this.handleSuccess(response);
      this.initValues();
    },

    createLabItem() {
      this.$validator.validateAll().then(result => {
        if (result) {
          // set spinner to submit button
          const submitButton = this.$refs["kt_lab_item_submit"];
          this.addSpinner(submitButton);

          const data = {
            name: this.name,
            product_code: this.product_code,
            batch: this.batch,
            voucher: this.voucher,
            shelf: `${this.shelf}${this.shelf_num}`,
            expiration: this.expiration,
            unit_id: this.unit,
            quantity: this.quantity,
            unit_price: this.unit_price,
            date_received: this.date_received
          };
          this.$store
            .dispatch("store/addLaboratoryItem", data)
            .then(response => this.initRequest(submitButton, response))
            .catch(() => this.removeSpinner(submitButton));
        }
      });
    }
  }
};
</script>

<style scoped>
.form-group {
  margin-bottom: 0.9rem !important;
}
</style>
