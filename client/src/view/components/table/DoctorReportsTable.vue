<template>
  <div class="table-responsive">
    <table class="table table-sm">
      <thead class="thead-light">
        <tr class="text-uppercase">
          <th scope="col">Report Summary</th>
          <th scope="col">Created By</th>
          <th scope="col">Date Created</th>
          <th scope="col">Actions</th>
        </tr>
      </thead>
      <tbody v-if="!reports?.length">
        <tr>
          <td colspan="4" align="center" class="text-muted">No Data</td>
        </tr>
      </tbody>
      <tbody v-else>
        <tr v-for="(report, i) in reports" :key="i">
          <td>{{ getTruncatedText(report.report_content, 80) }}</td>
          <td>{{ report?.staff?.fullname || '-' }}</td>
          <td>{{ report.createdAt | dayjs('DD/MM/YYYY, h:mma') }}</td>
          <td>
            <a @click="viewModal(report)" href="#"
              ><i class="icon-xl text-primary la la-eye"></i
            ></a>
          </td>
        </tr>
      </tbody>
    </table>
    <doctor-report-modal
      :display-prompt="displayPrompt"
      @closeModal="hideModal"
      :report="currentReport"
    />
  </div>
</template>

<script>
import DoctorReportModal from '@/view/components/modal/DoctorReportModal.vue';

export default {
  name: 'DoctorReportsTable',
  components: { DoctorReportModal },
  props: {
    reports: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
  data: () => ({
    displayPrompt: false,
    currentReport: {},
  }),
  methods: {
    getTruncatedText(text, maxLength) {
      if (!text) return '-';
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + '...';
    },
    viewModal(report) {
      this.currentReport = report;
      this.displayPrompt = true;
    },
    hideModal() {
      this.displayPrompt = false;
    },
  },
};
</script>

<style scoped></style>
