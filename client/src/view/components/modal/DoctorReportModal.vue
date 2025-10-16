<template>
  <b-modal
    v-model="activePrompt"
    hide-footer
    title="Doctor's Report"
    no-close-on-backdrop
    size="xl"
  >
    <div class="mb-15">
      <div class="mb-5">
        <div class="row">
          <div class="col-md-6">
            <strong>Created By:</strong>
            <span class="ml-2">{{ report?.staff?.fullname || '-' }}</span>
          </div>
          <div class="col-md-6">
            <strong>Date Created:</strong>
            <span class="ml-2">{{ report.createdAt | dayjs('DD/MM/YYYY, h:mma') }}</span>
          </div>
        </div>
      </div>

      <div class="card card-custom card-stretch gutter-b">
        <div class="card-body">
          <h5 class="mb-3">Report Content:</h5>
          <div class="report-content" style="white-space: pre-wrap">
            {{ report.report_content || '-' }}
          </div>
        </div>
      </div>
    </div>
  </b-modal>
</template>

<script>
export default {
  name: 'DoctorReportModal',
  props: {
    displayPrompt: {
      type: Boolean,
      required: true,
    },
    report: {
      type: Object,
      default: () => ({}),
    },
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
};
</script>

<style scoped>
.report-content {
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 0.25rem;
  line-height: 1.6;
}
</style>
