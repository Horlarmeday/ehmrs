<template>
  <b-modal v-model="activePrompt" hide-footer title="Vendor">
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
        <label class="col-lg-3 col-form-label">Phone:</label>
        <div class="col-lg-8">
          <input
            type="text"
            v-validate="'required|min:11|max:11|phone_pattern'"
            class="form-control form-control-sm"
            placeholder="Optional"
            v-model="phone"
            :maxlength="11"
            :minlength="11"
          />
        </div>
      </div>
      <div class="form-group row">
        <label class="col-lg-3 col-form-label">Email:</label>
        <div class="col-lg-8">
          <input
            type="text"
            class="form-control form-control-sm"
            placeholder="Optional"
            v-model="email"
          />
        </div>
      </div>
      <div class="form-group row">
        <label class="col-lg-3 col-form-label">Address:</label>
        <div class="col-lg-8">
          <input
            type="text"
            class="form-control form-control-sm"
            placeholder="Optional"
            v-model="address"
          />
        </div>
      </div>
    </div>
    <button
      class="mt-3 btn btn-primary"
      @click="createVendor"
      :disabled="isDisabled"
      ref="kt_vendor_submit"
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
      email: '',
      phone: '',
      address: '',
      vendor_id: '',
      isDisabled: false,
    };
  },
  created() {
    this.phoneValidation();
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
        const { id, name, phone, address, email } = JSON.parse(JSON.stringify(this.data));
        this.vendor_id = id;
        this.name = name;
        this.phone = phone;
        this.email = email;
        this.address = address;
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

    phoneValidation() {
      this.$validator.extend('phone_pattern', {
        getMessage(field) {
          return 'The ' + field + ' field should match the Nigerian phone pattern e.g 07098765321';
        },
        validate(value) {
          return /((^090)([1-9]))|((^091)([0-9]))|((^070)([1-9]))|((^080)([2-9]))|((^081)([0-9]))(\d{7})/.test(
            value
          );
        },
      });
    },

    createVendor() {
      this.$validator.validateAll().then(result => {
        if (result) {
          const obj = {
            vendor_id: this.vendor_id,
            name: this.name,
            email: this.email,
            phone: this.phone,
            address: this.address,
          };
          // set spinner to submit button
          const submitButton = this.$refs['kt_vendor_submit'];
          this.addSpinner(submitButton);

          if (this.vendor_id && this.vendor_id >= 0) {
            this.$store
              .dispatch('store/updateVendor', obj)
              .then(() => this.endRequest(submitButton))
              .catch(() => this.removeSpinner(submitButton));
          } else {
            delete obj.vendor_id;
            this.$store
              .dispatch('store/addVendor', obj)
              .then(() => this.endRequest(submitButton))
              .catch(() => this.removeSpinner(submitButton));
          }
        }
      });
    },

    initValues() {
      this.name = '';
      this.email = '';
      this.address = '';
      this.phone = '';
      this.vendor_id = '';
    },
  },
};
</script>

<style></style>
