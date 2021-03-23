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
              <label>Generic Drug <span class="text-danger">*</span></label>
              <v-select
                v-validate="'required'"
                data-vv-validate-on="blur"
                name="drug"
                @input="setDrugForm"
                @search="searchGenericDrugs"
                v-model="drug_id"
                label="name"
                :reduce="drugs => ({ id: drugs.id, type: drugs.type })"
                :options="drugs"
              ></v-select>
              <span class="text-danger text-sm">{{
                errors.first("drug")
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
            <div class="col-lg-4" v-if="canSee">
              <label>Dosage Form <span class="text-danger">*</span></label>
              <select
                class="form-control form-control-sm"
                v-model="dosage_form"
                name="dosage_form"
              >
                <option value="Cap">Cap</option>
                <option value="Cream">Cream</option>
                <option value="Inj">Inj</option>
                <option value="Infusions">Infusions</option>
                <option value="Insulin">Insulin</option>
                <option value="IVF">IVF</option>
                <option value="Oint">Oint</option>
                <option value="Pessary">Pessary</option>
                <option value="Supp">Supp</option>
                <option value="Susp">Susp</option>
                <option value="Syr">Syr</option>
                <option value="Tab">Tab</option>
              </select>
              <span class="text-danger text-sm">{{
                errors.first("dosage_form")
              }}</span>
            </div>
            <div class="col-lg-4 mt-3" v-if="canSee && canSeeStrength">
              <label>Strength <span class="text-danger">*</span></label>
              <input
                type="text"
                class="form-control form-control-sm"
                v-model="strength_input"
                placeholder="Strength"
                name="strength_input"
              />
              <span class="text-danger text-sm">{{
                errors.first("strength_input")
              }}</span>
            </div>
            <div class="col-lg-4" v-if="canSee && canSeeStrength">
              <label>Strength Unit <span class="text-danger">*</span></label>
              <select
                class="form-control form-control-sm"
                v-model="strength"
                name="strength"
              >
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="mg">mg</option>
                <option value="ng">ng</option>
              </select>
              <span class="text-danger text-sm">{{
                errors.first("strength")
              }}</span>
            </div>
            <div class="col-lg-4 mt-3" v-if="canSee && !canSeeStrength">
              <label>Volume <span class="text-danger">*</span></label>
              <select
                class="form-control form-control-sm"
                v-model="volume"
                name="volume"
              >
                <option value="Mls">Mls</option>
                <option value="IU">IU</option>
              </select>
              <span class="text-danger text-sm">{{
                errors.first("volume")
              }}</span>
            </div>

            <div class="col-lg-4 mt-3" v-if="canSee">
              <label
                >Route of Administration
                <span class="text-danger">*</span></label
              >
              <select
                class="form-control form-control-sm"
                v-model="route"
                name="route"
              >
                <option value="IV">IV</option>
                <option value="IM">IM</option>
                <option value="SC">SC</option>
                <option value="PO">PO</option>
                <option value="intra rectally">intra rectally</option>
                <option value="OCC">OCC</option>
                <option value="transdermal">transdermal</option>
                <option value="intra spinal">intra spinal</option>
                <option value="inhalational">inhalational</option>
                <option value="intra vagina">intra vagina</option>
                <option value="gutt">gutt</option>
                <option value="sublingual">sublingual</option>
                <option value="topical">topical</option>
              </select>
              <span class="text-danger text-sm">{{
                errors.first("route")
              }}</span>
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
              <span class="text-danger text-sm">{{
                errors.first("quantity")
              }}</span>
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
              ></v-select>
              <span class="text-danger text-sm">{{
                errors.first("unit")
              }}</span>
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
              <span class="text-danger text-sm">{{
                errors.first("unit_price")
              }}</span>
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
              <span class="text-danger text-sm">{{
                errors.first("selling_price")
              }}</span>
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
              ></datepicker>
              <span class="text-danger text-sm">{{
                errors.first("date_received")
              }}</span>
            </div>
            <div class="col-lg-4 mt-3">
              <div class="form-group">
                <label>Item Type</label>
                <div class="checkbox-inline">
                  <label class="checkbox checkbox-rounded">
                    <input
                      type="checkbox"
                      :value="true"
                      v-model="create_cash_item"
                    />
                    <span></span>
                    Cash
                  </label>
                  <label class="checkbox checkbox-rounded">
                    <input
                      type="checkbox"
                      :value="true"
                      v-model="create_nhis_item"
                    />
                    <span></span>
                    NHIS
                  </label>
                </div>
                <span class="form-text text-muted">Tick as appropriate</span>
              </div>
            </div>
            <div class="col-lg-4 mt-3" v-if="create_nhis_item">
              <label
                >NHIS Selling Price <span class="text-danger">*</span></label
              >
              <input
                type="number"
                class="form-control form-control-sm"
                v-model="nhis_selling_price"
                placeholder="NHIS Selling Price"
                name="nhis_selling_price"
              />
              <span class="text-danger text-sm">{{
                errors.first("nhis_selling_price")
              }}</span>
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
import Datepicker from "vuejs-datepicker";
import AccordionIcon from "../../../../../assets/icons/AccordionIcon";
import Swal from "sweetalert2";
import vSelect from "vue-select";
export default {
  components: {
    Datepicker,
    AccordionIcon,
    vSelect
  },
  data() {
    return {
      drug_id: "",
      product_code: "",
      batch: "",
      voucher: "",
      shelf: "",
      shelf_num: "",
      dosage_form: "",
      expiration: "",
      strength: "",
      strength_input: "",
      volume: "",
      route: "",
      quantity: "",
      unit: "",
      unit_price: "",
      selling_price: "",
      nhis_selling_price: "",
      date_received: "",
      drug_form: "",

      isDisabled: false,
      create_cash_item: true,
      create_nhis_item: false
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
      return this.drug_id.type === "Drug";
    },

    canSeeStrength() {
      return (
        this.dosage_form === "Tab" ||
        this.dosage_form === "Cap" ||
        this.dosage_form === "Pessary"
      );
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
      this.drug_id = "";
      this.product_code = "";
      this.batch = "";
      this.voucher = "";
      this.shelf = "";
      this.shelf_num = "";
      this.expiration = "";
      this.dosage_form = "";
      this.strength = "";
      this.strength_input = "";
      this.volume = "";
      this.route = "";
      this.quantity = "";
      this.unit = "";
      this.unit_price = "";
      this.selling_price = "";
      this.nhis_selling_price = "";
      this.date_received = "";
      this.drug_form = "";
      this.create_cash_item = true;
      this.create_nhis_item = false;
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

    handleSuccess(response) {
      Swal.fire({
        title: "Success!",
        html: `${response.data.message}`,
        icon: "success",
        confirmButtonClass: "btn btn-primary",
        heightAuto: false
      });
    },

    setDrugForm() {
      this.drug_form = this.drug_id.type;
      this.dosage_form = "";
      this.strength = "";
      this.strength_input = "";
      this.volume = "";
    },

    searchGenericDrugs(search) {
      this.$store.dispatch("pharmacy/fetchGenericDrugs", {
        currentPage: 1,
        itemsPerPage: 20,
        search
      });
    },

    initRequest(button, response) {
      this.removeSpinner(button);
      this.handleSuccess(response);
      this.initValues();
    },

    createPharmacyItem() {
      this.$validator.validateAll().then(result => {
        if (result) {
          // set spinner to submit button
          const submitButton = this.$refs["kt_pharmacy_item_submit"];
          this.addSpinner(submitButton);

          const data = {
            drug_id: this.drug_id.id,
            product_code: this.product_code,
            batch: this.batch,
            voucher: this.voucher,
            shelf: `${this.shelf}${this.shelf_num}`,
            expiration: this.expiration,
            dosage_form: this.dosage_form,
            strength: this.strength || this.volume,
            strength_input: this.strength_input,
            route: this.route,
            unit_id: this.unit,
            quantity: this.quantity,
            unit_price: this.unit_price,
            selling_price: this.selling_price,
            nhis_selling_price: this.nhis_selling_price,
            date_received: this.date_received,
            drug_form: this.drug_form,
            create_cash_item: this.create_cash_item,
            create_nhis_item: this.create_nhis_item
          };
          this.$store
            .dispatch("store/addPharmacyItem", data)
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
