<template>
  <b-modal v-model="activePrompt" hide-footer title="HMO">
    <div class="mb-15">
      <div class="form-group row">
        <label class="col-lg-3 col-form-label">Name</label>
        <div class="col-lg-8">
          <input
            v-validate="'required'"
            data-vv-validate-on="blur"
            type="text"
            class="form-control form-control-sm"
            placeholder="Name"
            v-model="name"
            name="name"
          />
          <span class="text-danger text-sm">{{ errors.first("name") }}</span>
        </div>
      </div>
      <div class="form-group row">
        <label class="col-lg-3 col-form-label">Insurance:</label>
        <div class="col-lg-8">
          <v-select
            v-validate="'required'"
            data-vv-validate-on="blur"
            name="insurance_id"
            v-model="insurance_id"
            @search="searchInsurance"
            :reduce="insurances => insurances.id"
            label="name"
            :options="insurances"
          >
            <template slot="no-options">
              <span>Type to search</span>
            </template>
          </v-select>
          <span class="text-danger text-sm">{{
            errors.first("insurance_id")
          }}</span>
        </div>
      </div>
      <div class="form-group row">
        <label class="col-lg-3 col-form-label">HMO Number:</label>
        <div class="col-lg-8">
          <input
            v-validate="'required'"
            data-vv-validate-on="blur"
            type="text"
            name="hmo_num"
            class="form-control form-control-sm"
            placeholder="E.g HMO 21"
            v-model="hmo_num"
          />
          <span class="text-danger text-sm">{{ errors.first("hmo_num") }}</span>
        </div>
      </div>
    </div>
    <button
      class="mt-3 btn btn-primary"
      @click="createHMO"
      :disabled="isDisabled"
      ref="kt_hmo_submit"
    >
      Submit
    </button>
  </b-modal>
</template>

<script>
import vSelect from "vue-select";
export default {
  props: {
    displayPrompt: {
      type: Boolean,
      required: true
    },
    data: {
      type: Object,
      default: () => {}
    }
  },
  components: {
    vSelect
  },
  data() {
    return {
      name: "",
      hmo_num: "",
      hmo_id: "",
      insurance_id: "",
      isDisabled: false
    };
  },
  computed: {
    insurances() {
      return this.$store.state.insurance.insurances;
    },
    validateForm() {
      return (
        !this.errors.any() &&
        this.name !== "" &&
        this.hmo_num !== "" &&
        this.insurance_id !== ""
      );
    },
    activePrompt: {
      get() {
        return this.displayPrompt;
      },
      set(value) {
        this.$emit("closeModal", value);
      }
    }
  },
  watch: {
    displayPrompt(val) {
      if (!val) return;
      if (Object.entries(this.data).length === 0) {
        this.initValues();
        this.$validator.reset();
      } else {
        const { insurance_id, name, hmo_num, id } = JSON.parse(
          JSON.stringify(this.data)
        );
        this.insurance_id = insurance_id;
        this.name = name;
        this.hmo_num = hmo_num;
        this.hmo_id = id;
      }
    }
  },
  methods: {
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
    searchInsurance(search) {
      this.$store.dispatch("insurance/fetchInsurances", {
        currentPage: 1,
        itemsPerPage: 20,
        search
      });
    },
    initializeRequest(button) {
      this.removeSpinner(button);
      this.$emit("closeModal");
      this.initValues();
    },
    createHMO() {
      this.$validator.validateAll().then(result => {
        if (result) {
          const obj = {
            insurance_id: this.insurance_id,
            name: this.name,
            hmo_num: this.hmo_num,
            hmo_id: this.hmo_id
          };
          // set spinner to submit button
          const submitButton = this.$refs["kt_hmo_submit"];
          this.addSpinner(submitButton);

          if (this.hmo_id && this.hmo_id >= 0) {
            this.$store
              .dispatch("insurance/updateHMO", obj)
              .then(() => this.initializeRequest(submitButton))
              .catch(() => this.removeSpinner(submitButton));
          } else {
            delete obj.hmo_id;
            this.$store
              .dispatch("insurance/addHMO", obj)
              .then(() => this.initializeRequest(submitButton))
              .catch(() => this.removeSpinner(submitButton));
          }
        }
      });
    },
    initValues() {
      this.name = "";
      this.hmo_num = "";
      this.hmo_id = "";
      this.insurance_id = "";
    }
  }
};
</script>

<style></style>
