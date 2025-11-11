<template>
  <div>
    <div class="card card-custom gutter-b">
      <!--begin::Header-->
      <div class="card-header py-5">
        <h3 class="card-title align-items-start flex-column">
          <span class="card-label font-weight-bolder text-dark">
            <i class="fas fa-file-medical mr-2 text-primary"></i>
            Add Investigations to Visit
          </span>
          <span class="text-muted mt-2">Order investigations for this visit</span>
        </h3>
      </div>
      <div class="card-body">
        <b-tabs content-class="mt-4">
          <!-- Services Tab -->
          <b-tab title="Investigations" active>
            <template #title>
              <i class="fas fa-concierge-bell mr-2"></i>
              Investigations
            </template>

            <!-- Services Accordion -->
            <div class="mb-6">
              <investigations-accordion :filter="filter" />
            </div>

            <!-- Services Selection Form -->
            <div class="form-group row">
              <label class="col-lg-3 col-form-label font-weight-bold text-dark">
                <i class="fas fa-concierge-bell mr-1 text-primary"></i>
                Select Investigation(s):
              </label>
              <div class="col-lg-9">
                <v-select
                  multiple
                  name="investigation"
                  @search="onHandleSearch"
                  v-model="investigation_id"
                  label="name"
                  :options="investigations"
                  :reduce="
                    (investigations) => ({
                      id: investigations.id,
                      price: investigations.price,
                      name: investigations.name,
                      imaging_id: investigations.imaging_id,
                    })
                  "
                  placeholder="Search and select investigations..."
                  class="form-control-lg"
                >
                  <template #option="{ price, name }">
                    <span>{{ name }} - </span>
                    <strong> {{ price || '' }}</strong>
                  </template>
                </v-select>
                <small class="form-text text-muted"
                  >Select one or more investigations for this visit</small
                >
              </div>
            </div>

            <!-- Submit Button -->
            <div class="d-flex justify-content-end pt-4 border-top">
              <button
                class="btn btn-primary btn-lg px-8"
                @click="submitInvestigation"
                ref="kt-orderInvestigations-submit"
                :disabled="isDisabled"
              >
                <i class="fas fa-save mr-2"></i>
                <span v-if="!isDisabled">Submit Investigations</span>
                <span v-else>
                  <span class="spinner-border spinner-border-sm mr-2" role="status"></span>
                  Submitting...
                </span>
              </button>
            </div>
          </b-tab>
        </b-tabs>
      </div>
    </div>
  </div>
</template>
<script>
import { debounce } from '@/common/common';
import vSelect from 'vue-select';
import InvestigationsAccordion from '@/view/components/accordion/InvestigationAccordion.vue';

export default {
  name: 'AddActiveServices',
  components: { InvestigationsAccordion, vSelect },
  data() {
    return {
      investigation_id: '',
      isDisabled: false,
      itemsPerPage: 20,
    };
  },
  computed: {
    investigations() {
      return this.$store.state.radiology.investigations;
    },

    visit() {
      return this.$store.state.visit.visit;
    },

    filter() {
      return { visit_id: this.$route.params.id };
    },

    insuranceName() {
      return this.$store.state.patient.currentPatient?.insurance_name;
    },

    isSwitchOn() {
      return this.$store.state.patient.currentPatient?.has_insurance;
    },
  },
  methods: {
    onHandleSearch(search, loading) {
      if (search.length > 2) {
        loading(true);
        this.debounceSearch(loading, search, this);
      }
    },

    debounceSearch: debounce((loading, search, vm) => {
      vm.$store
        .dispatch('radiology/fetchInvestigations', {
          currentPage: 1,
          itemsPerPage: vm.itemsPerPage,
          search,
          selectedIds: vm.investigation_id || [], // Pass selected investigation IDs
        })
        .then(() => loading(false))
        .catch(() => loading(false));
    }, 500),

    addSpinner(submitButton) {
      this.isDisabled = true;
      submitButton.classList.add('spinner', 'spinner-light', 'spinner-right');
    },

    removeSpinner(submitButton) {
      this.isDisabled = false;
      submitButton.classList.remove('spinner', 'spinner-light', 'spinner-right');
    },

    initValues() {
      this.investigation_id = '';
    },

    endRequest(button) {
      this.removeSpinner(button);
      this.initValues();
      this.$store.dispatch('order/fetchPrescribedInvestigationsPerVisit', {
        id: this.$route.params.id,
      });
    },

    submitInvestigation() {
      if (
        !this.investigation_id ||
        (Array.isArray(this.investigation_id) && this.investigation_id.length === 0)
      ) {
        this.$bvToast.toast('Please select at least one investigation', {
          title: 'Validation Error',
          variant: 'warning',
          solid: true,
        });
        return;
      }

      const submitButton = this.$refs['kt-orderInvestigations-submit'];
      this.addSpinner(submitButton);

      const investigations = this.investigation_id.map((investigation) => ({
        investigation_id: investigation.id,
        imaging_id: investigation.imaging_id,
        investigation_type: this.getInvestigationType(this.insuranceName),
        is_urgent: false,
        price: investigation.price,
        name: investigation.name,
        source: 'Consultation',
        ...(this.visit?.ante_natal_id && { ante_natal_id: this.visit?.ante_natal_id }),
        ...(this.visit?.surgery_id && { surgery_id: this.visit?.surgery_id }),
      }));

      this.$store
        .dispatch('order/orderInvestigationTest', {
          investigations,
          id: this.$route.params.id,
        })
        .then(() => {
          this.endRequest(submitButton);
        })
        .catch((error) => {
          this.$bvToast.toast(error.response?.data?.message || 'Failed to order services', {
            title: 'Error',
            variant: 'danger',
            solid: true,
          });
          this.removeSpinner(submitButton);
        });
    },

    getInvestigationType(insuranceName) {
      const isSwitchOn = this.switchSpot && this.switchPosition;
      if (isSwitchOn) return 'NHIS';
      const insuranceMapping = {
        FHSS: 'NHIS',
        NHIS: 'NHIS',
        PHIS: 'Private',
        Retainership: 'Cash',
      };
      const selectedInsurance = insuranceMapping[insuranceName];
      if (selectedInsurance === 'NHIS' && !isSwitchOn) return 'Cash';
      return insuranceMapping[insuranceName] || 'Cash';
    },

    fetchInvestigations() {
      this.$store.dispatch('radiology/fetchInvestigations', {
        currentPage: 1,
        itemsPerPage: 100,
      });
    },
  },
  created() {
    this.fetchInvestigations();
    this.$store.dispatch('visit/fetchVisit', this.$route.params.id).then((response) => {
      const res = response.data.data;
      this.$store.dispatch('patient/setCurrentPatient', {
        ...res.insurance,
        ...res.patient,
      });
    });
  },
};
</script>

<style scoped></style>
