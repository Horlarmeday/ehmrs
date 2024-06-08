<template>
  <b-modal v-model="activePrompt" hide-footer title="Create Inventory">
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
          <span class="text-danger text-sm">{{ errors.first('name') }}</span>
        </div>
      </div>
      <div class="form-group row">
        <label class="col-lg-3 col-form-label">Allowed Drugs Type:</label>
        <div class="col-lg-8">
          <select
            v-validate="'required'"
            data-vv-validate-on="blur"
            name="accepted_drug_type"
            v-model="accepted_drug_type"
            class="form-control-sm form-control"
          >
            <option :value="type" v-for="(type, i) in acceptedDrugTypes" :key="i">{{
              type
            }}</option>
          </select>
        </div>
      </div>
      <div class="form-group row">
        <label class="col-lg-3 col-form-label">Refill Level</label>
        <div class="col-lg-8">
          <input
            type="text"
            class="form-control form-control-sm"
            placeholder="Optional"
            v-model="refill_level"
          />
        </div>
      </div>
      <div class="form-group row">
        <label class="col-lg-3 col-form-label">Description:</label>
        <div class="col-lg-8">
          <input
            type="text"
            class="form-control form-control-sm"
            placeholder="Optional"
            v-model="desc"
          />
        </div>
      </div>
    </div>
    <button
      class="mt-3 btn btn-primary"
      @click="createInventory"
      :disabled="isDisabled"
      ref="kt_inventory_submit"
    >
      Submit
    </button>
  </b-modal>
</template>

<script>
export default {
  props: {
    displayPrompt: {
      type: Boolean,
      required: true,
    },
    data: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      name: '',
      accepted_drug_type: '',
      refill_level: '',
      desc: '',
      isDisabled: false,
      acceptedDrugTypes: ['Cash Drug', 'NHIS Drug', 'Private Drug', 'Both'],
    };
  },
  computed: {
    validateForm() {
      return !this.errors.any() && this.name !== '';
    },
    activePrompt: {
      get() {
        return this.displayPrompt;
      },
      set(value) {
        this.$emit('closeModal', value);
      },
    },
  },
  watch: {
    displayPrompt(val) {
      if (!val) return;
      if (Object.entries(this.data).length === 0) {
        this.initValues();
        this.$validator.reset();
      } else {
        const { id, name, desc, accepted_drug_type, refill_level } = JSON.parse(JSON.stringify(this.data));
        this.inventory_id = id;
        this.name = name;
        this.desc = desc;
        this.accepted_drug_type = accepted_drug_type;
        this.refill_level = refill_level;
      }
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
      this.initValues();
    },
    createInventory() {
      this.$validator.validateAll().then(result => {
        if (result) {
          const obj = {
            inventory_id: this.id,
            name: this.name,
            desc: this.desc,
            accepted_drug_type: this.accepted_drug_type,
            refill_level: this.refill_level,
          };
          // set spinner to submit button
          const submitButton = this.$refs['kt_inventory_submit'];
          this.addSpinner(submitButton);

          if (this.inventory_id && this.inventory_id >= 0) {
            this.$store
              .dispatch('inventory/updateInventory', obj)
              .then(() => this.endRequest(submitButton))
              .catch(() => this.removeSpinner(submitButton));
          } else {
            delete obj.inventory_id;
            this.$store
              .dispatch('inventory/addInventory', obj)
              .then(() => this.endRequest(submitButton))
              .catch(() => this.removeSpinner(submitButton));
          }
        }
      });
    },
    initValues() {
      this.inventory_id = '';
      this.name = '';
      this.desc = '';
      this.accepted_drug_type = '';
      this.refill_level = '';
    },
  },
};
</script>

<style></style>
