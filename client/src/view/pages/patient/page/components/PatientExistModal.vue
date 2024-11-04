<template>
  <b-modal v-model="activePrompt" hide-footer title="Patient Exists">
    <div class="mb-15">
      <h6>Duplicate Patient</h6>
      <div class="card card-custom gutter-b">
        <div class="card-body pt-4">
          <div class="d-flex align-items-center">
            <div
              class="symbol symbol-60 symbol-xxl-100 mr-5 align-self-start align-self-xxl-center"
            >
              <div
                class="symbol-label"
                style="background-image:url('/media/users/blank.png')"
              ></div>
              <i class="symbol-badge bg-success"></i>
            </div>
            <div>
              <a href="#" class="font-weight-bold font-size-h5 text-dark-75 text-hover-primary">
                James Jones
              </a>
              <div class="text-muted">
                Application Developer
              </div>
              <div class="mt-2">
                <a
                  href="#"
                  class="btn btn-sm btn-primary font-weight-bold mr-2 py-2 px-3 px-xxl-5 my-1"
                  >Chat</a
                >
                <a href="#" class="btn btn-sm btn-success font-weight-bold py-2 px-3 px-xxl-5 my-1"
                  >Follow</a
                >
              </div>
            </div>
          </div>
          <!--end::User-->

          <!--begin::Contact-->
          <div class="pt-8 pb-6">
            <div class="d-flex align-items-center justify-content-between mb-2">
              <span class="font-weight-bold mr-2">Email:</span>
              <a href="#" class="text-muted text-hover-primary">matt@fifestudios.com</a>
            </div>
            <div class="d-flex align-items-center justify-content-between mb-2">
              <span class="font-weight-bold mr-2">Phone:</span>
              <span class="text-muted">44(76)34254578</span>
            </div>
            <div class="d-flex align-items-center justify-content-between">
              <span class="font-weight-bold mr-2">Location:</span>
              <span class="text-muted">Melbourne</span>
            </div>
          </div>
          <!--end::Contact-->

          <!--begin::Contact-->
          <div class="pb-6">
            Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a
            piece of classical.
          </div>
        </div>
        <!--end::Body-->
      </div>
    </div>
    <button
      class="mt-3 btn btn-primary"
      @click="createInsurance"
      :disabled="isDisabled"
      ref="kt_insurance_submit"
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
      description: '',
      insurance_id: '',
      isDisabled: false,
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
        const { id, name, description } = JSON.parse(JSON.stringify(this.data));
        this.insurance_id = id;
        this.name = name;
        this.description = description;
      }
    },
  },
  methods: {
    initValues() {
      this.name = '';
      this.description = '';
      this.insurance_id = '';
    },
  },
};
</script>

<style></style>
