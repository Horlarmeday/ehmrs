<template>
  <div class="card card-custom gutter-b">
    <div class="card-header py-5">
      <h3 class="card-title align-items-start flex-column">
        <span class="card-label font-weight-bolder text-dark">Custom Reports</span>
      </h3>
      <div class="card-toolbar">
        <button class="btn btn-primary" @click="openReportBuilder">
          <i class="fas fa-plus mr-2"></i>
          Create New Report
        </button>
      </div>
    </div>
    <div class="card-body">
      <div v-if="loading" class="text-center py-10">
        <div class="spinner-border text-primary" role="status">
          <span class="sr-only">Loading...</span>
        </div>
      </div>
      <div v-else>
        <!-- Saved Reports -->
        <div class="row mb-5">
          <div class="col-12">
            <div class="card">
              <div class="card-header">
                <h3 class="card-title">Saved Reports</h3>
              </div>
              <div class="card-body">
                <div class="table-responsive">
                  <table class="table table-head-custom table-head-bg table-vertical-center">
                    <thead>
                      <tr>
                        <th>Report Name</th>
                        <th>Type</th>
                        <th>Last Generated</th>
                        <th>Created By</th>
                        <th class="text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="report in savedReports" :key="report.id">
                        <td>{{ report.name }}</td>
                        <td>{{ report.type }}</td>
                        <td>{{ report.lastGenerated | formatDate }}</td>
                        <td>{{ report.createdBy }}</td>
                        <td class="text-right">
                          <button
                            class="btn btn-sm btn-light-primary mr-2"
                            @click="handleGenerateReport(report)"
                          >
                            <i class="fas fa-sync-alt"></i>
                          </button>
                          <button
                            class="btn btn-sm btn-light-info mr-2"
                            @click="editReport(report)"
                          >
                            <i class="fas fa-edit"></i>
                          </button>
                          <button
                            class="btn btn-sm btn-light-danger"
                            @click="handleDeleteReport(report)"
                          >
                            <i class="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Report Builder Modal -->
    <b-modal
      v-model="showModal"
      :title="isEditing ? 'Edit Report' : 'Create New Report'"
      size="lg"
      @hide="resetForm"
    >
      <form @submit.prevent="saveReport">
        <div class="form-group">
          <label>Report Name</label>
          <input type="text" class="form-control" v-model="reportForm.name" required />
        </div>
        <div class="form-group">
          <label>Report Type</label>
          <select class="form-control" v-model="reportForm.type" required>
            <option value="financial">Financial Report</option>
            <option value="operational">Operational Report</option>
            <option value="custom">Custom Report</option>
          </select>
        </div>
        <div class="form-group">
          <label>Date Range</label>
          <date-picker v-model="reportForm.dateRange" range />
        </div>
        <div class="form-group">
          <label>Report Parameters</label>
          <div class="row">
            <div class="col-md-6" v-for="(param, index) in reportForm.parameters" :key="index">
              <div class="form-group">
                <input
                  type="text"
                  class="form-control"
                  v-model="param.name"
                  placeholder="Parameter Name"
                />
                <select class="form-control mt-2" v-model="param.type">
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="date">Date</option>
                  <option value="select">Select</option>
                </select>
              </div>
            </div>
          </div>
          <button type="button" class="btn btn-light-primary" @click="addParameter">
            <i class="fas fa-plus mr-2"></i>
            Add Parameter
          </button>
        </div>
      </form>
      <template #modal-footer>
        <button type="button" class="btn btn-secondary" @click="showModal = false">Cancel</button>
        <button type="button" class="btn btn-primary" @click="saveReport">Save Report</button>
      </template>
    </b-modal>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import DatePicker from '@/components/DatePicker.vue';
import dayjs from 'dayjs';

export default {
  name: 'CustomReports',
  components: {
    DatePicker,
  },
  data: () => ({
    showModal: false,
    isEditing: false,
    reportForm: {
      name: '',
      type: 'financial',
      dateRange: [dayjs().startOf('month').toDate(), dayjs().endOf('month').toDate()],
      parameters: [],
    },
  }),
  computed: {
    ...mapGetters('account', ['savedReports', 'loading']),
  },
  methods: {
    ...mapActions('account', [
      'fetchSavedReports',
      'createReport',
      'updateReport',
      'deleteReport',
      'generateReport',
    ]),
    openReportBuilder() {
      this.isEditing = false;
      this.resetForm();
      this.showModal = true;
    },
    editReport(report) {
      this.isEditing = true;
      this.reportForm = { ...report };
      this.showModal = true;
    },
    resetForm() {
      this.reportForm = {
        name: '',
        type: 'financial',
        dateRange: [dayjs().startOf('month').toDate(), dayjs().endOf('month').toDate()],
        parameters: [],
      };
    },
    addParameter() {
      this.reportForm.parameters.push({
        name: '',
        type: 'text',
      });
    },
    async saveReport() {
      try {
        if (this.isEditing) {
          await this.updateReport(this.reportForm);
        } else {
          await this.createReport(this.reportForm);
        }
        this.showModal = false;
        this.fetchSavedReports();
      } catch (error) {
        this.$notify({
          group: 'foo',
          title: 'Error message',
          text: 'Failed to save report',
          type: 'error',
        });
      }
    },
    async handleDeleteReport(report) {
      if (confirm('Are you sure you want to delete this report?')) {
        try {
          await this.deleteReport(report.id);
          await this.fetchSavedReports();
        } catch (error) {
          this.$notify({
            group: 'foo',
            title: 'Error message',
            text: 'Failed to delete report',
            type: 'error',
          });
        }
      }
    },
    async handleGenerateReport(report) {
      try {
        await this.generateReport(report);
      } catch (error) {
        this.$notify({
          group: 'foo',
          title: 'Error message',
          text: 'Failed to generate report',
          type: 'error',
        });
      }
    },
  },
  created() {
    this.fetchSavedReports();
  },
  filters: {
    formatDate(date) {
      return dayjs(date).format('MMM D, YYYY');
    },
  },
};
</script>
