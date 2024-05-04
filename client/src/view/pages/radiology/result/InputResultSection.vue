<template>
  <div class="mt-3">
    <div class="accordion accordion-toggle-arrow" id="accordionExample1">
      <div v-if="!investigations?.length">
        <DefaultSkeleton />
        <DefaultSkeleton />
      </div>
      <div v-else class="card" v-for="(investigation, i) in investigations" :key="i">
        <div class="card-header">
          <div class="card-title" v-b-toggle="`collapse-${i}`">
            <span class="mr-5 text-black-50">Investigation:</span>
            <span class="mr-5 text-dark">{{ investigation.name }}</span>
          </div>
        </div>
        <div :class="investigation.payment_status === PENDING && 'disabledCard'">
          <b-collapse
            :disabled="investigation.payment_status === PENDING"
            visible
            :id="`collapse-${i}`"
          >
            <b-card>
              <editor
                :disabled="
                  investigation.status === ACCEPTED || investigation.payment_status === PENDING
                "
                :api-key="apiKey"
                v-model="investigation.result"
                :init="editorConfig"
              />
            </b-card>
          </b-collapse>
        </div>
      </div>
    </div>
    <div class="separator separator-solid mb-6"></div>
    <div class="text-center">
      <button
        :disabled="isDisabled"
        @click="addResult"
        ref="kt-addInvestigationResult-submit"
        class="btn btn-lg btn-primary"
      >
        Save
      </button>
    </div>
  </div>
</template>

<script>
import Editor from '@tinymce/tinymce-vue';
import DefaultSkeleton from '@/utils/DefaultSkeleton.vue';
export default {
  name: 'InvestigationResultSection',
  props: {
    tests: {
      type: Array,
      required: true,
    },
    patient_id: {
      type: Number,
      required: true,
    },
  },
  components: {
    DefaultSkeleton,
    Editor,
  },
  data() {
    return {
      investigations: this.tests.map(test => {
        return {
          result: test?.result?.result || '',
          patient_id: this.patient_id,
          name: test.investigation.name,
          investigation_prescription_id: this.$route.params.id,
          prescribed_investigation_id: test.id,
          status: test?.result?.status || 'Pending',
          payment_status: test?.payment_status,
        };
      }),
      isDisabled: false,
      apiKey: process.env.VUE_APP_TINY_API_KEY,
      editorConfig: {
        plugins: [
          'advlist',
          'autolink',
          'lists',
          'link',
          'image',
          'charmap',
          'preview',
          'anchor',
          'searchreplace',
          'visualblocks',
          'code',
          'fullscreen',
          'insertdatetime',
          'media',
          'table',
          'help',
          'wordcount',
          'autosave',
          'save',
          'visualchars',
        ],
        toolbar:
          'undo redo | blocks | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | insertfile image media pageembed link anchor codesample | help',
        images_upload_handler: this.handleImageUpload,
        images_upload_base_path: '/static',
      },
      COMPLETED: 'Completed',
      ACCEPTED: 'Accepted',
      PENDING: 'Pending',
    };
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
    },

    handleImageUpload(blobInfo, success, failure) {
      const formData = new FormData();
      formData.append('image', blobInfo.blob(), blobInfo.filename());

      return this.$store
        .dispatch('radiology/uploadResultImages', formData)
        .then(response => {
          const host = window.location.origin;
          success(`${host}/${response.data.data}`);
        })
        .catch(error => {
          failure(`Image upload failed, ${error}`);
        });
    },

    addResult() {
      const investigations = this.investigations
        .filter(investigation => investigation.status !== this.ACCEPTED)
        // eslint-disable-next-line no-unused-vars
        .map(({ payment_status, ...rest }) => rest);

      if (!investigations.some(({ result }) => result)) {
        return this.$notify({
          group: 'foo',
          title: 'Error message',
          text: 'Result cannot be empty',
          type: 'error',
        });
      }

      const submitButton = this.$refs['kt-addInvestigationResult-submit'];
      this.addSpinner(submitButton);

      this.$store
        .dispatch('radiology/addInvestigationResult', investigations)
        .then(() => this.endRequest(submitButton))
        .catch(() => this.removeSpinner(submitButton));
    },
  },
};
</script>

<style scoped>
.disabledCard {
  pointer-events: none;
  opacity: 0.4;
}
</style>
