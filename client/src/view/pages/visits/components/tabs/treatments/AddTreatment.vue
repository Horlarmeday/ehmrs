<template>
  <div>
    <div class="mt-3">
      <div v-for="(item, i) in treatments" :key="i">
        <div class="d-flex justify-content-between">
          <div class="d-flex flex-column flex-root" style="flex: 2">
            <label>Drug:</label>
            <v-select
              @search="onSearch"
              v-model="item.drug_id"
              label="name"
              :options="drugs"
              :reduce="items => items.id"
            />
          </div>
          <div class="d-flex flex-column flex-root">
            <label>Dosage Form:</label>
            <select
              @change="getRoutes(item.dosage_form_id)"
              v-model="item.dosage_form_id"
              class="form-control form-control-sm"
            >
              <option :value="dose.id" v-for="dose in dosageForms" :key="dose.id">{{
                dose.name
              }}</option>
            </select>
          </div>
          <div class="d-flex flex-column flex-root">
            <label>Route:</label>
            <select v-model="item.route_id" class="form-control form-control-sm">
              <option :value="route.id" v-for="route in routes" :key="route.id">{{
                route.name
              }}</option>
            </select>
          </div>
          <div class="d-flex flex-column flex-root">
            <label>Dosage Administered:</label>
            <input
              type="text"
              v-model="item.dosage_administered"
              class="form-control form-control-sm"
            />
          </div>
          <div class="d-flex flex-column flex-root">
            <label>Remarks:</label>
            <input type="text" v-model="item.remarks" class="form-control form-control-sm" />
          </div>
          <div class="d-flex flex-column flex-root">
            <br />
            <a href="#" class="col-lg-1 col-form-label">
              <i
                v-if="i === 0"
                class="far fa-plus-square mr-3 text-primary icon-lg mt-lg-3"
                @click="addNewDrug"
              />
              <i
                class="far fa-trash-alt icon-md text-danger icon-lg mt-lg-3"
                v-if="i !== 0"
                @click="removeDrug(i)"
              />
            </a>
          </div>
        </div>
      </div>
      <div class="col-lg-12 offset-10">
        <button
          class="btn btn-primary mb-3"
          @click="submitDrugs"
          :disabled="isDisabled || !treatments.length"
          ref="kt_addTreatment_submit"
        >
          Submit
        </button>
      </div>
    </div>
  </div>
</template>
<script>
import vSelect from 'vue-select';
import { debounce } from '@/common/common';

export default {
  components: { vSelect },
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
  data: () => ({
    isDisabled: false,
    treatments: [
      {
        drug_id: '',
        dosage_form_id: '',
        route_id: '',
        dosage_administered: '',
        remarks: '',
      },
    ],
  }),
  created() {
    this.getDosageForms();
  },
  computed: {
    dosageForms() {
      return this.$store.state.pharmacy.dosageForms;
    },

    routes() {
      return this.$store.state.pharmacy.routes;
    },

    drugs() {
      return this.$store.state.pharmacy.drugs;
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

    addNewDrug() {
      this.treatments.push({
        drug_id: '',
        dosage_form_id: '',
        route_id: '',
        dosage_administered: '',
        remarks: '',
      });
    },

    onSearch(search, loading) {
      if (search.length > 2) {
        loading(true);
        this.search(loading, search, this);
      }
    },

    search: debounce((loading, search, vm) => {
      vm.$store
        .dispatch('pharmacy/fetchGenericDrugs', {
          search,
        })
        .then(() => loading(false));
    }, 500),

    getRoutes(dosage_form_id) {
      this.$store.dispatch('pharmacy/fetchRoutesAndMeasurements', {
        dosage_form_id,
      });
    },

    getDosageForms() {
      this.$store.dispatch('pharmacy/fetchDosageForms');
    },

    removeDrug(i) {
      this.treatments.splice(i, 1);
    },

    endRequest(button) {
      this.removeSpinner(button);
      this.initValues();
      this.$store.dispatch('order/fetchTreatments', {
        currentPage: 1,
        itemsPerPage: 10,
        filter: this.filter,
      });
    },

    initValues() {
      this.treatments = [
        {
          drug_id: '',
          dosage_form_id: '',
          route_id: '',
          dosage_administered: '',
          remarks: '',
        },
      ];
    },

    submitDrugs() {
      if (this.treatments.some(({ drug_id }) => !drug_id)) {
        return this.$notify({
          group: 'foo',
          title: 'Error message',
          text: 'A drug cannot be empty',
          type: 'error',
        });
      }

      // set spinner to submit button
      const submitButton = this.$refs['kt_addTreatment_submit'];
      this.addSpinner(submitButton);

      const treatments = this.treatments.map(treatment => ({
        ...treatment,
        source: this.source,
      }));

      this.$store
        .dispatch('order/orderTreatment', { data: treatments, id: this.$route.params.id })
        .then(() => this.endRequest(submitButton))
        .catch(() => this.removeSpinner(submitButton));
    },
  },
};
</script>

<style scoped></style>
