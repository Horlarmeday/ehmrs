<template>
  <div class="d-flex flex-column flex-root">
    <div
      class="login login-1 d-flex flex-column flex-lg-row flex-column-fluid bg-white"
      :class="{
        'login-signin-on': this.state == 'signin',
        'login-forgot-on': this.state == 'forgot'
      }"
      id="kt_login"
    >
      <!--begin::Aside-->
      <div
        class="login-aside d-flex flex-column flex-row-auto"
        style="background-color: #D3E4FE;"
      >
        <div class="d-flex flex-column-auto flex-column pt-lg-40 pt-15">
          <a href="#" class="text-center mb-10">
            <img
              src="/media/logos/logo-letter-1.png"
              class="max-h-70px"
              alt=""
            />
          </a>
          <h3
            class="font-weight-bolder text-center font-size-h4 font-size-h1-lg"
            style="color: #000;"
          >
            Electronic Hospital Management <br />Resource System
          </h3>
        </div>
        <div
          class="aside-img d-flex flex-row-fluid bgi-no-repeat bgi-position-y-bottom bgi-position-x-center"
          :style="{ backgroundImage: `url(${backgroundImage})` }"
        ></div>
      </div>
      <!--begin::Aside-->
      <!--begin::Content-->
      <div
        class="login-content flex-row-fluid d-flex flex-column justify-content-center position-relative overflow-hidden p-7 mx-auto"
      >
        <div class="d-flex flex-column-fluid flex-center">
          <!--begin::Signin-->
          <div class="login-form login-signin">
            <div class="form" id="kt_login_signin_form">
              <div class="pb-13 pt-lg-0 pt-5">
                <h3
                  class="font-weight-bolder text-dark font-size-h4 font-size-h1-lg"
                >
                  Log in to your Account
                </h3>
              </div>
              <div class="form-group">
                <label class="font-size-h6 font-weight-bolder text-dark"
                  >Username</label
                >
                <div
                  id="example-input-group-1"
                  label=""
                  label-for="example-input-1"
                >
                  <input
                    v-validate="'required|min:3'"
                    data-vv-validate-on="blur"
                    class="form-control form-control-solid h-auto py-7 px-6 rounded-lg"
                    type="text"
                    autofocus="true"
                    autocomplete="off"
                    ref="username"
                    name="username"
                    v-model="form.username"
                  />
                  <span class="text-danger text-sm">{{
                    errors.first("username")
                  }}</span>
                </div>
              </div>
              <div class="form-group">
                <div class="d-flex justify-content-between mt-n5">
                  <label class="font-size-h6 font-weight-bolder text-dark pt-5"
                    >Password</label
                  >
                </div>
                <div
                  id="example-input-group-2"
                  label=""
                  label-for="example-input-2"
                >
                  <input
                    data-vv-validate-on="blur"
                    v-validate="'required|min:6'"
                    class="form-control form-control-solid h-auto py-7 px-6 rounded-lg"
                    type="password"
                    name="password"
                    ref="password"
                    v-model="form.password"
                    autocomplete="off"
                  />
                  <span class="text-danger text-sm">{{
                    errors.first("password")
                  }}</span>
                </div>
              </div>
              <a
                class="text-primary font-size-h6 font-weight-bolder text-hover-primary pt-5"
                id="kt_login_forgot"
                href="#"
                @click="showForm('forgot')"
                >Forgot Password ?</a
              >
              <div class="pb-lg-0 pb-5">
                <button
                  ref="kt_login_signin_submit"
                  @click="onSubmitLogin"
                  :disabled="isDisabled"
                  class="btn btn-primary font-weight-bolder font-size-h6 px-15 py-4 my-3 mr-3 btn-block"
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>
          <!--end::Signin-->

          <!--begin::Forgot-->
          <div class="login-form login-forgot">
            <!--begin::Form-->
            <form
              class="form"
              novalidate="novalidate"
              id="kt_login_forgot_form"
              ref="kt_login_forgot_form"
              @submit.prevent="onSubmitForgot"
            >
              <div class="pb-13 pt-lg-0 pt-5">
                <h3
                  class="font-weight-bolder text-dark font-size-h4 font-size-h1-lg"
                >
                  Forgotten Password ?
                </h3>
                <p class="text-muted font-weight-bold font-size-h4">
                  Enter your phone number to reset your password
                </p>
              </div>
              <div class="form-group">
                <input
                  class="form-control form-control-solid h-auto py-7 px-6 rounded-lg font-size-h6"
                  type="text"
                  placeholder="Phone"
                  name="phone"
                  autocomplete="off"
                  v-model="phone"
                  autofocus
                />
              </div>
              <div class="form-group d-flex flex-wrap pb-lg-0">
                <button
                  type="button"
                  ref="kt_login_forgot_submit"
                  class="btn btn-primary font-weight-bolder font-size-h6 px-8 py-4 my-3 mr-4"
                >
                  Submit
                </button>
                <button
                  type="button"
                  id="kt_login_forgot_cancel"
                  class="btn btn-light-primary font-weight-bolder font-size-h6 px-8 py-4 my-3"
                  @click="showForm('signin')"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
          <!--end::Forgot-->
        </div>
      </div>
      <!--end::Content-->
    </div>
    <notifications group="foo" />
  </div>
</template>

<!-- Load login custom page styles -->
<style lang="scss">
@import "@/assets/sass/pages/login/login-1.scss";
</style>

<script>
import KTUtil from "@/assets/js/components/util";

export default {
  name: "login-1",
  data() {
    return {
      state: "signin",
      form: {
        username: "",
        password: ""
      },
      phone: "",
      isDisabled: false
    };
  },
  computed: {
    isFormValid() {
      return !this.errors.any() && this.username && this.password;
    },

    backgroundImage() {
      return process.env.BASE_URL + "media/users/health.png";
    }
  },
  methods: {
    showForm(form) {
      this.state = form;
      const form_name = "kt_login_" + form + "_form";
      KTUtil.animateClass(
        KTUtil.getById(form_name),
        "animate__animated animate__backInUp"
      );
    },

    removeSpinner(submitButton) {
      this.isDisabled = false;
      submitButton.classList.remove(
        "spinner",
        "spinner-light",
        "spinner-right"
      );
    },

    onSubmitLogin() {
      this.$validator.validateAll().then(result => {
        if (result) {
          let username = this.form.username;
          let password = this.form.password;

          // set spinner to submit button
          const submitButton = this.$refs["kt_login_signin_submit"];
          this.isDisabled = true;
          submitButton.classList.add(
            "spinner",
            "spinner-light",
            "spinner-right"
          );

          this.$store
            .dispatch("auth/login", { username, password })
            .then(() => {
              this.$router.push("/dashboard");
              this.removeSpinner(submitButton);
            })
            .catch(() => this.removeSpinner(submitButton));
        }
      });
    },

    onSubmitForgot() {
      this.fv1.validate();

      this.fv1.on("core.form.valid", () => {
        const phone = this.phone;

        // set spinner to submit button
        const submitButton = this.$refs["kt_login_forgot_submit"];
        submitButton.classList.add("spinner", "spinner-light", "spinner-right");

        this.$store
          .dispatch("auth/forgot", { phone })
          .then(() => this.removeSpinner(submitButton))
          .catch(() => this.removeSpinner(submitButton));
      });
    }
  }
};
</script>
