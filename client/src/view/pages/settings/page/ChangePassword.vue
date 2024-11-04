<template>
  <div class="card card-custom gutter-b">
    <div class="card-header py-5">
      <h3 class="card-title align-items-start flex-column">
        <span class="card-label font-weight-bolder text-dark">Change Password</span>
      </h3>
    </div>
    <div class="card-body">
      <div class="form-group row">
        <label class="col-xl-3 col-lg-3 col-form-label text-alert">Current Password</label>
        <div class="col-lg-9 col-xl-6">
          <input
            v-validate="'required'"
            data-vv-validate-on="blur"
            type="password"
            class="form-control form-control-lg form-control-solid mb-2"
            v-model="oldPassword"
            placeholder="Current password"
            name="current_password"
          />
          <span class="text-danger text-sm">{{ errors.first('current_password') }}</span>
        </div>
      </div>
      <div class="form-group row">
        <label class="col-xl-3 col-lg-3 col-form-label text-alert">New Password</label>
        <div class="col-lg-9 col-xl-6">
          <input
            v-validate="'required|confirmed:confirmPassword'"
            data-vv-validate-on="blur"
            name="new_password"
            type="password"
            class="form-control form-control-lg form-control-solid"
            v-model="newPassword"
            placeholder="New password"
          />
          <span class="text-danger text-sm">{{ errors.first('new_password') }}</span>
        </div>
      </div>
      <div class="form-group row">
        <label class="col-xl-3 col-lg-3 col-form-label text-alert">Verify Password</label>
        <div class="col-lg-9 col-xl-6">
          <input
            v-validate="'required'"
            data-vv-validate-on="blur"
            name="confirm_password"
            ref="confirmPassword"
            type="password"
            class="form-control form-control-lg form-control-solid"
            v-model="confirmPassword"
            placeholder="Confirm password"
          />
          <span class="text-danger text-sm">{{ errors.first('confirm_password') }}</span>
        </div>
      </div>
      <div>
        <button
          @click="changePassword"
          :disabled="isDisabled"
          ref="kt_changePassword_submit"
          class="btn btn-primary float-right"
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
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
    isDisabled: false,
  }),
  methods: {
    addSpinner(submitButton) {
      this.isDisabled = true;
      submitButton.classList.add('spinner', 'spinner-light', 'spinner-right');
    },

    removeSpinner(submitButton) {
      this.isDisabled = false;
      submitButton.classList.remove('spinner', 'spinner-light', 'spinner-right');
    },

    changePassword() {
      this.$validator.validateAll().then(result => {
        if (result) {
          const obj = {
            oldPassword: this.oldPassword,
            newPassword: this.newPassword,
            confirmPassword: this.confirmPassword,
          };

          const submitButton = this.$refs['kt_changePassword_submit'];
          this.addSpinner(submitButton);

          this.$store
            .dispatch('settings/changePassword', obj)
            .then(() => this.endRequest(submitButton))
            .catch(() => this.removeSpinner(submitButton));
        }
      });
    },

    endRequest(button) {
      this.removeSpinner(button);
      this.initValues();
    },

    initValues() {
      this.oldPassword = '';
      this.confirmPassword = '';
      this.newPassword = '';
    },
  },
};
</script>

<style scoped></style>
