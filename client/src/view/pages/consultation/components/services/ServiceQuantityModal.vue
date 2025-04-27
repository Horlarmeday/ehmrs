<template>
  <b-modal
    no-close-on-backdrop
    no-close-on-esc
    size="s"
    v-model="activePrompt"
    hide-footer
    :title="`Add Quantity to ${service.name}`"
  >
    <div class="mb-15">
      <div class="form-group row">
        <label class="col-lg-3 col-form-label">Quantity</label>
        <div class="col-lg-8">
          <input
            v-validate="'required'"
            data-vv-validate-on="blur"
            type="number"
            class="form-control form-control-sm"
            placeholder="Quantity"
            v-model="quantity"
            name="quantity"
          />
          <span class="text-danger text-sm">{{ errors.first('quantity') }}</span>
        </div>
      </div>
    </div>
    <button
      class="mt-3 btn btn-primary float-right"
      @click="insertQuantity"
      :disabled="isDisabled"
      ref="kt_quantity_submit"
    >
      Insert Quantity
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
    service: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      quantity: 1,
      isDisabled: false,
    };
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
  },
  watch: {
    displayPrompt(val) {
      if (!val) return;
      if (Object.entries(this.service).length === 0) {
        this.initValues();
        this.$validator.reset();
      } else {
        const { quantity } = JSON.parse(JSON.stringify(this.service));
        this.quantity = quantity;
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

    endRequest(submitButton) {
      this.removeSpinner(submitButton);
      this.$emit('closeModal');
      this.initValues();
    },

    insertQuantity() {
      this.$validator.validateAll().then(result => {
        if (result) {
          const submitButton = this.$refs['kt_quantity_submit'];
          this.addSpinner(submitButton);

          this.$store
            .dispatch('order/updateServiceQuantity', {
              serviceId: this.service.service_id,
              quantity: this.quantity,
            })
            .then(() => this.endRequest(submitButton))
            .catch(() => this.removeSpinner(submitButton));
        }
      });
    },

    initValues() {
      this.quantity = '';
    },
  },
};
</script>

<style></style>
