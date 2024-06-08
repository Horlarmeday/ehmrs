<template>
  <div>
    <div class="flex-row-fluid ml-lg-8">
      <!--begin::Card-->
      <div class="card card-custom">
        <!--begin::Header-->
        <div class="card-header py-3">
          <div class="card-title align-items-start flex-column">
            <h3 class="card-label font-weight-bolder text-dark">System Settings</h3>
            <span class="text-muted font-weight-bold font-size-sm mt-1"
              >Update your system settings</span
            >
          </div>
          <div class="card-toolbar">
            <button
              @click="updateSettings"
              ref="kt-systemSettings-submit"
              class="btn btn-primary mr-2"
              :disabled="isDisabled"
            >
              Save Changes
            </button>
          </div>
        </div>
        <!--end::Header-->

        <!--begin::Form-->
        <form class="form">
          <div class="card-body">
            <div class="row">
              <label class="col-xl-3"></label>
              <div class="col-lg-9 col-xl-6">
                <h5 class="font-weight-bold mb-6">Organization Information:</h5>
              </div>
            </div>
            <div class="form-group row align-items-center">
              <label
                class="col-xl-3 col-lg-3 col-form-label font-weight-bold text-left text-lg-right"
                >Name</label
              >
              <div class="col-lg-9 col-xl-6">
                <input
                  v-model="settings.name_of_organization"
                  type="text"
                  class="form-control form-control-solid"
                />
              </div>
            </div>
            <div class="form-group row align-items-center">
              <label
                class="col-xl-3 col-lg-3 col-form-label font-weight-bold text-left  text-lg-right"
                >Address</label
              >
              <div class="col-lg-9 col-xl-6">
                <input
                  v-model="settings.address_of_organization"
                  type="text"
                  class="form-control form-control-solid"
                />
              </div>
            </div>
            <div class="form-group row align-items-center">
              <label
                class="col-xl-3 col-lg-3 col-form-label font-weight-bold text-left  text-lg-right"
                >Email</label
              >
              <div class="col-lg-9 col-xl-6">
                <input
                  v-model="settings.email"
                  type="email"
                  class="form-control form-control-solid"
                />
              </div>
            </div>
            <div class="form-group row align-items-center">
              <label
                class="col-xl-3 col-lg-3 col-form-label font-weight-bold text-left  text-lg-right"
                >Phone</label
              >
              <div class="col-lg-9 col-xl-6">
                <input
                  v-model="settings.phone"
                  type="text"
                  class="form-control form-control-solid"
                />
              </div>
            </div>

            <div class="separator separator-dashed my-10"></div>

            <div class="row">
              <label class="col-xl-3"></label>
              <div class="col-lg-9 col-xl-6">
                <h5 class="font-weight-bold mb-6">System Images:</h5>
              </div>
            </div>
            <div class="form-group row align-items-center">
              <label
                class="col-xl-3 col-lg-3 col-form-label font-weight-bold text-left text-lg-right"
                >Logo</label
              >
              <div class="col-lg-9 col-xl-6">
                <input
                  type="file"
                  accept="image/*"
                  ref="logo"
                  class="form-control form-control-solid"
                />
              </div>
            </div>
            <div class="form-group row align-items-center">
              <label
                class="col-xl-3 col-lg-3 col-form-label font-weight-bold text-left text-lg-right"
                >Stamp</label
              >
              <div class="col-lg-9 col-xl-6">
                <input
                  type="file"
                  accept="image/*"
                  ref="stamp"
                  class="form-control form-control-solid"
                />
              </div>
            </div>
            <div class="separator separator-dashed my-10"></div>

            <div class="row">
              <label class="col-xl-3"></label>
              <div class="col-lg-9 col-xl-6">
                <h5 class="font-weight-bold mb-6">Other Settings:</h5>
              </div>
            </div>
            <div class="form-group row align-items-center">
              <label
                class="col-xl-3 col-lg-3 col-form-label font-weight-bold text-left text-lg-right"
                >Theme</label
              >
              <div class="col-lg-9 col-xl-6">
                <select
                  v-model="settings.system_color"
                  name=""
                  class="form-control form-control-solid custom-select"
                >
                  <option v-for="(theme, i) in themes" :value="theme" :key="i">{{ theme }}</option>
                </select>
              </div>
            </div>
            <div class="form-group row align-items-center">
              <label
                class="col-xl-3 col-lg-3 col-form-label font-weight-bold text-left  text-lg-right"
                >Hospital ID Prefix</label
              >
              <div class="col-lg-9 col-xl-6">
                <input
                  v-model="settings.patient_id_prefix"
                  type="text"
                  class="form-control form-control-solid"
                />
              </div>
            </div>
            <div class="form-group row align-items-center">
              <label
                class="col-xl-3 col-lg-3 col-form-label font-weight-bold text-left  text-lg-right"
                >NHIS Daily Quota</label
              >
              <div class="col-lg-9 col-xl-6">
                <input
                  v-model="settings.nhis_daily_quota_amount"
                  type="number"
                  class="form-control form-control-solid"
                />
              </div>
            </div>
          </div>
        </form>
        <!--end::Form-->
      </div>
      <!--end::Card-->
    </div>
  </div>
</template>
<script>
export default {
  data: () => ({
    themes: ['Blue', 'Green', 'Purple'],
    settings: '',
    isDisabled: false,
  }),
  computed: {
    systemSettings() {
      return this.$store.state.settings.settings;
    },
  },
  watch: {
    systemSettings() {
      this.settings = JSON.parse(JSON.stringify(this.systemSettings));
    },
  },
  created() {
    this.fetchSettings();
  },
  methods: {
    fetchSettings() {
      this.$store
        .dispatch('settings/fetchSettings')
        .then(response => localStorage.setItem('settings', response.data.data))
        .catch(e => console.error(e));
    },

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
    },

    updateSettings() {
      this.logo = this.$refs.logo.files;
      this.stamp = this.$refs.stamp.files;

      let formData;
      const hasImage = this.logo.length || this.stamp.length;
      console.log(this.stamp, this.logo);

      if (hasImage) {
        formData = new FormData();
        formData.append('logo', this.logo[0]);
        formData.append('stamp', this.stamp[0]);
        formData.append('settings', JSON.stringify(this.settings));
      }

      const submitButton = this.$refs['kt-systemSettings-submit'];
      this.addSpinner(submitButton);

      this.$store
        .dispatch('settings/updateSettings', hasImage ? formData : this.settings)
        .then(response => {
          this.removeSpinner(submitButton);
          localStorage.setItem('settings', JSON.stringify(response.data.data));
        })
        .catch(() => this.removeSpinner(submitButton));
    },
  },
};
</script>

<style scoped></style>
