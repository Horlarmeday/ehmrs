<template>
  <div class="saved-reports-page">
    <!-- Header Section -->
    <div class="page-header mb-4">
      <div class="row align-items-center">
        <div class="col-lg-8">
          <h1 class="text-dark font-weight-bold mb-2">
            <i class="flaticon2-folder text-primary mr-3"></i>
            Saved Reports
          </h1>
          <p class="text-muted font-size-lg mb-0">
            View and manage your saved medical records reports
          </p>
        </div>
        <div class="col-lg-4 text-right">
          <b-button variant="outline-secondary" @click="goBack" class="mr-2">
            <i class="flaticon2-back mr-2"></i>
            Back to Reports
          </b-button>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <b-card class="mb-4">
      <div class="row">
        <div class="col-md-4">
          <label class="form-label">Domain</label>
          <b-form-select v-model="filters.domain" @change="loadSavedReports">
            <option :value="null">All Domains</option>
            <option value="medical-records">Medical Records</option>
          </b-form-select>
        </div>
        <div class="col-md-4">
          <label class="form-label">Report Type</label>
          <b-form-select v-model="filters.report_type" @change="loadSavedReports">
            <option :value="null">All Types</option>
            <option value="patient-registrations">Patient Registrations</option>
            <option value="visit-categories">Visit Categories</option>
            <option value="demographics">Demographics</option>
            <option value="admissions">Admissions</option>
            <option value="deceased-patients">Deceased Patients</option>
          </b-form-select>
        </div>
        <div class="col-md-4">
          <label class="form-label">Created By</label>
          <b-form-select v-model="filters.created_by" @change="loadSavedReports">
            <option :value="null">All Users</option>
            <option :value="currentUserId">My Reports</option>
          </b-form-select>
        </div>
      </div>
    </b-card>

    <!-- Saved Reports List -->
    <b-card>
      <template #header>
        <div class="d-flex justify-content-between align-items-center">
          <h5 class="mb-0">
            <i class="flaticon2-list-1 text-primary mr-2"></i>
            Saved Reports ({{ savedReports.count || 0 }})
          </h5>
        </div>
      </template>

      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="sr-only">Loading...</span>
        </div>
      </div>

      <div
        v-else-if="!savedReports.rows || savedReports.rows.length === 0"
        class="text-center py-5"
      >
        <i class="flaticon2-file text-muted" style="font-size: 3rem"></i>
        <p class="text-muted mt-3">No saved reports found</p>
      </div>

      <div v-else>
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>Title</th>
                <th>Domain</th>
                <th>Report Type</th>
                <th>Date Range</th>
                <th>Created By</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="report in savedReports.rows" :key="report.id">
                <td>
                  <strong>{{ report.title }}</strong>
                </td>
                <td>
                  <span class="badge badge-info">{{ report.domain }}</span>
                </td>
                <td>
                  <span class="badge badge-primary">{{
                    formatReportType(report.report_type)
                  }}</span>
                </td>
                <td>
                  <span v-if="report.date_range_start && report.date_range_end">
                    {{ formatDate(report.date_range_start) }} -
                    {{ formatDate(report.date_range_end) }}
                  </span>
                  <span v-else class="text-muted">-</span>
                </td>
                <td>
                  {{ getCreatorName(report.creator) }}
                </td>
                <td>
                  {{ formatDateTime(report.created_at) }}
                </td>
                <td>
                  <b-button
                    variant="outline-primary"
                    size="sm"
                    @click="viewReport(report)"
                    class="mr-2"
                  >
                    <i class="flaticon2-eye mr-1"></i>
                    View
                  </b-button>
                  <b-button variant="outline-danger" size="sm" @click="confirmDelete(report)">
                    <i class="flaticon2-delete mr-1"></i>
                    Delete
                  </b-button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="d-flex justify-content-between align-items-center mt-3">
          <div>
            <span class="text-muted">
              Showing {{ (currentPage - 1) * pageLimit + 1 }} to
              {{ Math.min(currentPage * pageLimit, savedReports.count) }} of
              {{ savedReports.count }} entries
            </span>
          </div>
          <b-pagination
            v-model="currentPage"
            :total-rows="savedReports.count"
            :per-page="pageLimit"
            :first-number="true"
            :last-number="true"
            @change="onPageChange"
          ></b-pagination>
        </div>
      </div>
    </b-card>

    <!-- Delete Confirmation Modal -->
    <b-modal
      id="delete-report-modal"
      ref="deleteModal"
      title="Delete Report"
      @ok="handleDelete"
      ok-variant="danger"
    >
      <p>Are you sure you want to delete this report?</p>
      <p class="text-muted">
        <strong>{{ reportToDelete?.title }}</strong>
      </p>
    </b-modal>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import dayjs from 'dayjs';
import { parseJwt } from '@/common/common';

export default {
  name: 'SavedReports',
  data() {
    return {
      filters: {
        domain: null,
        report_type: null,
        created_by: null,
      },
      currentPage: 1,
      pageLimit: 10,
      loading: false,
      reportToDelete: null,
      currentUser: parseJwt(localStorage.getItem('user_token')),
    };
  },
  computed: {
    ...mapGetters('reports', ['savedReports']),
    currentUserId() {
      return this.currentUser.sub;
    },
  },
  mounted() {
    this.loadSavedReports();
  },
  methods: {
    ...mapActions('reports', ['fetchSavedReports', 'fetchSavedReportById', 'deleteSavedReport']),
    async loadSavedReports() {
      this.loading = true;
      try {
        await this.fetchSavedReports({
          ...this.filters,
          currentPage: this.currentPage,
          pageLimit: this.pageLimit,
        });
      } catch (error) {
        this.$bvToast.toast('Failed to load saved reports', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      } finally {
        this.loading = false;
      }
    },
    onPageChange(page) {
      this.currentPage = page;
      this.loadSavedReports();
    },
    viewReport(report) {
      this.$router.push({
        name: 'medical-records-report-details',
        params: {
          reportType: report.report_type,
        },
        query: {
          ...report.filters,
          savedReportId: report.id,
        },
      });
    },
    confirmDelete(report) {
      this.reportToDelete = report;
      this.$refs.deleteModal.show();
    },
    async handleDelete() {
      if (!this.reportToDelete) return;

      try {
        await this.deleteSavedReport(this.reportToDelete.id);
        this.$bvToast.toast('Report deleted successfully', {
          title: 'Success',
          variant: 'success',
          solid: true,
        });
        this.loadSavedReports();
      } catch (error) {
        this.$bvToast.toast('Failed to delete report', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      } finally {
        this.reportToDelete = null;
      }
    },
    formatReportType(type) {
      const types = {
        'patient-registrations': 'Patient Registrations',
        'visit-categories': 'Visit Categories',
        demographics: 'Demographics',
        admissions: 'Admissions',
        'deceased-patients': 'Deceased Patients',
      };
      return types[type] || type;
    },
    formatDate(date) {
      if (!date) return '-';
      return dayjs(date).format('YYYY-MM-DD');
    },
    formatDateTime(date) {
      if (!date) return '-';
      return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
    },
    getCreatorName(creator) {
      if (!creator) return '-';
      const parts = [creator.firstname, creator.middlename, creator.lastname].filter(Boolean);
      return parts.join(' ') || '-';
    },
    goBack() {
      this.$router.push({ name: 'medical-records-reports' });
    },
  },
};
</script>

<style scoped>
.saved-reports-page {
  padding: 1.5rem;
}

.page-header {
  margin-bottom: 1.5rem;
}
</style>
