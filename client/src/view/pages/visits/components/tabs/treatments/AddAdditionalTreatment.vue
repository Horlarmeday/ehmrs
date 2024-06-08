<template>
  <div>
    <div class="card-header p-0">
      <div class="card-title mb-2">
        <span class="card-label font-weight-bolder text-dark"></span>
      </div>
    </div>
    <div class="">
      <div v-for="(item, i) in additionalTreatments" :key="i">
        <div class="form-group row">
          <div class="col-lg-3">
            <label>Item</label>
            <input type="text" class="form-control" v-model="item.drug" />
          </div>
          <div class="col-lg-2">
            <label>Quantity:</label>
            <input v-model="item.quantity" type="number" class="form-control form-control-sm" />
          </div>
          <div class="col-lg-3">
            <label>Dosage:</label>
            <input
              v-model="item.dosage_administered"
              type="text"
              class="form-control form-control-sm"
            />
          </div>
          <div class="col-lg-3">
            <label>Remarks:</label>
            <input v-model="item.remarks" type="text" class="form-control form-control-sm" />
          </div>
          <div class="col-lg-1">
            <br />
            <a href="#" class="col-lg-1 col-form-label">
              <i
                v-if="i === 0"
                class="far fa-plus-square mr-3 text-primary icon-lg mt-lg-3"
                @click="addNewItem"
              />
              <i
                class="far fa-trash-alt icon-md text-danger icon-lg mt-lg-3"
                v-if="i !== 0"
                @click="removeItem(i)"
              />
            </a>
          </div>
        </div>
      </div>

      <div class="mb-3">
        <button
          class="btn btn-primary float-right  mb-lg-5"
          @click="submitTreatments"
          :disabled="isDisabled || !additionalTreatments.length"
          ref="kt_additionalItems_submit"
        >
          Submit
        </button>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  data: () => ({
    isDisabled: false,
    additionalTreatments: [
      {
        drug: '',
        quantity: 1,
        dosage_administered: '',
        remarks: '',
      },
    ],
  }),
  props: {
    source: {
      type: String,
      required: true,
    },
    filter: {
      type: Object,
      required: true,
      default: () => {},
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

    addNewItem() {
      this.additionalTreatments.push({
        drug: '',
        quantity: 1,
        dosage_administered: '',
        remarks: '',
      });
    },

    removeItem(i) {
      this.additionalTreatments.splice(i, 1);
    },

    endRequest(button) {
      this.removeSpinner(button);
      this.initValues();
      this.$store.dispatch('order/fetchAdditionalTreatments', {
        currentPage: 1,
        itemsPerPage: 10,
        filter: this.filter,
      });
    },

    initValues() {
      this.additionalTreatments.forEach(treatment => {
        treatment.dosage_administered = '';
        treatment.remarks = '';
        treatment.drug = '';
        treatment.quantity = 1;
      });
    },

    submitTreatments() {
      // set spinner to submit button
      const submitButton = this.$refs['kt_additionalItems_submit'];
      this.addSpinner(submitButton);

      const treatments = this.additionalTreatments.map(treatment => ({
        ...treatment,
        source: this.source,
      }));

      this.$store
        .dispatch('order/addAdditionalTreatment', { data: treatments, id: this.$route.params.id })
        .then(() => this.endRequest(submitButton))
        .catch(() => this.removeSpinner(submitButton));
    },
  },
};
</script>

<style scoped></style>
