<template>
  <div id="doctor-reports">
    <div class="d-flex flex-column-fluid">
      <div class="container">
        <!-- Add New Report Section -->
        <div class="card card-custom gutter-b">
          <div class="card-header">
            <h3 class="card-title">
              <i class="fas fa-file-medical mr-2"></i>
              {{ editingReport ? 'Edit Doctor Report' : 'Add Doctor Report' }}
            </h3>
          </div>
          <div class="card-body">
            <form @submit.prevent="submitReport">
              <div class="form-group">
                <label for="report-content"
                  >Report Content <span class="text-danger">*</span></label
                >
                <textarea
                  id="report-content"
                  v-model="formData.report_content"
                  class="form-control"
                  rows="8"
                  placeholder="Enter your comprehensive report here..."
                  :disabled="submitting"
                ></textarea>
                <small class="form-text text-muted"> Minimum 10 characters required </small>
              </div>

              <div class="d-flex justify-content-between">
                <button
                  type="button"
                  v-if="editingReport"
                  @click="cancelEdit"
                  class="btn btn-secondary"
                  :disabled="submitting"
                >
                  <i class="fas fa-times mr-2"></i>
                  Cancel
                </button>
                <div v-else></div>

                <button type="submit" class="btn btn-primary" :disabled="!canSubmit || submitting">
                  <i
                    :class="submitting ? 'fas fa-spinner fa-spin' : 'fas fa-save'"
                    class="mr-2"
                  ></i>
                  {{ submitting ? 'Saving...' : editingReport ? 'Update Report' : 'Save Report' }}
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Existing Reports List -->
        <div class="card card-custom">
          <div class="card-header">
            <h3 class="card-title">
              <i class="fas fa-list mr-2"></i>
              Existing Reports ({{ reports.length }})
            </h3>
          </div>
          <div class="card-body">
            <div v-if="loading" class="text-center py-5">
              <div class="spinner-border text-primary" role="status">
                <span class="sr-only">Loading...</span>
              </div>
              <p class="mt-2">Loading reports...</p>
            </div>

            <div v-else-if="reports.length === 0" class="text-center py-5 text-muted">
              <i class="fas fa-inbox fa-3x mb-3"></i>
              <p>No reports available for this visit</p>
            </div>

            <div v-else>
              <div
                v-for="(report, index) in reports"
                :key="report.id"
                class="card card-custom card-stretch gutter-b"
              >
                <div
                  class="accordion accordion-solid accordion-panel accordion-svg-toggle"
                  role="tablist"
                >
                  <div class="card">
                    <div class="card-header accord-header" role="tab">
                      <div class="card-title accord" v-b-toggle="`report-accordion-${index}`">
                        <div class="d-flex justify-content-between align-items-center w-100">
                          <div class="d-flex align-items-center">
                            <span class="label label-dot label-lg label-primary mr-3"></span>
                            <div>
                              <div class="font-weight-bold text-dark">
                                {{ getTruncatedText(report.report_content, 80) }}
                              </div>
                              <div class="text-muted font-size-sm mt-1">
                                <i class="fas fa-user-md mr-1"></i>
                                {{ report?.staff?.fullname || '-' }}
                                <span class="mx-2">|</span>
                                <i class="fas fa-calendar mr-1"></i>
                                {{ report.createdAt | dayjs('DD/MM/YYYY, h:mma') }}
                              </div>
                            </div>
                          </div>
                          <div class="btn-group" @click.stop>
                            <button
                              v-if="canEditReport(report)"
                              @click="editReport(report)"
                              class="btn btn-sm btn-icon btn-light-warning mr-2"
                              title="Edit"
                            >
                              <i class="fas fa-edit"></i>
                            </button>
                            <button
                              v-if="canEditReport(report)"
                              @click="confirmDelete(report)"
                              class="btn btn-sm btn-icon btn-light-danger"
                              title="Delete"
                            >
                              <i class="fas fa-trash"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <b-collapse
                      :id="`report-accordion-${index}`"
                      accordion="reports-accordion"
                      role="tabpanel"
                    >
                      <div class="card-body border-bottom border-left border-right">
                        <div class="report-content-display">
                          <h6 class="font-weight-bold mb-3">Full Report:</h6>
                          <div class="report-text">{{ report.report_content }}</div>
                        </div>
                        <div class="mt-4 pt-3 border-top">
                          <div class="row">
                            <div class="col-md-6">
                              <small class="text-muted">Created By:</small>
                              <div class="font-weight-bold">
                                {{ report?.staff?.fullname || '-' }}
                              </div>
                            </div>
                            <div class="col-md-6">
                              <small class="text-muted">Date Created:</small>
                              <div class="font-weight-bold">
                                {{ report.createdAt | dayjs('DD/MM/YYYY, h:mma') }}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </b-collapse>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { parseJwt } from '@/common/common';

export default {
  name: 'DoctorReport',
  data() {
    return {
      formData: {
        report_content: '',
      },
      submitting: false,
      editingReport: null,
      user: parseJwt(localStorage.getItem('user_token')),
    };
  },
  computed: {
    ...mapState('doctorReport', ['reports', 'loading', 'error']),
    ...mapState('visit', ['visit']),

    canSubmit() {
      return this.formData.report_content && this.formData.report_content.trim().length >= 10;
    },

    visitId() {
      return this.$route.params.id;
    },
  },
  methods: {
    ...mapActions('doctorReport', [
      'fetchVisitDoctorReports',
      'createDoctorReport',
      'updateDoctorReport',
      'deleteDoctorReport',
    ]),

    getTruncatedText(text, maxLength) {
      if (!text) return '-';
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + '...';
    },

    canEditReport(report) {
      return report.staff_id === this.user.id;
    },

    async submitReport() {
      if (!this.canSubmit) return;

      this.submitting = true;
      try {
        if (this.editingReport) {
          await this.updateDoctorReport({
            id: this.editingReport.id,
            data: { report_content: this.formData.report_content },
          });

          this.$bvToast.toast('Doctor report updated successfully', {
            title: 'Success',
            variant: 'success',
            solid: true,
          });
        } else {
          await this.createDoctorReport({
            visit_id: parseInt(this.visitId, 10),
            patient_id: this.visit.patient_id,
            report_content: this.formData.report_content,
          });

          this.$bvToast.toast('Doctor report created successfully', {
            title: 'Success',
            variant: 'success',
            solid: true,
          });
        }

        this.resetForm();
      } catch (error) {
        this.$bvToast.toast(error.response?.data?.message || 'Failed to save doctor report', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      } finally {
        this.submitting = false;
      }
    },

    editReport(report) {
      this.editingReport = report;
      this.formData.report_content = report.report_content;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    cancelEdit() {
      this.resetForm();
    },

    resetForm() {
      this.formData.report_content = '';
      this.editingReport = null;
    },

    confirmDelete(report) {
      this.$bvModal
        .msgBoxConfirm(
          'Are you sure you want to delete this report? This action cannot be undone.',
          {
            title: 'Confirm Delete',
            okVariant: 'danger',
            okTitle: 'Delete',
            cancelTitle: 'Cancel',
            centered: true,
          }
        )
        .then((confirmed) => {
          if (confirmed) {
            this.deleteReport(report);
          }
        });
    },

    async deleteReport(report) {
      try {
        await this.deleteDoctorReport(report.id);

        this.$bvToast.toast('Doctor report deleted successfully', {
          title: 'Success',
          variant: 'success',
          solid: true,
        });

        if (this.editingReport?.id === report.id) {
          this.resetForm();
        }
      } catch (error) {
        this.$bvToast.toast(error.response?.data?.message || 'Failed to delete doctor report', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      }
    },

    async loadReports() {
      try {
        await this.fetchVisitDoctorReports(this.visitId);
      } catch (error) {
        this.$bvToast.toast(error.response?.data?.message || 'Failed to load doctor reports', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      }
    },
  },
  async created() {
    await this.loadReports();
  },
};
</script>

<style scoped>
.card-custom {
  box-shadow: 0 0 13px 0 rgba(82, 63, 105, 0.05);
  border-radius: 0.42rem;
}

.card-header {
  background-color: #f3f6f9;
  border-bottom: 1px solid #eff2f5;
}

textarea.form-control {
  resize: vertical;
  min-height: 100px;
}

.btn-icon {
  width: 32px;
  height: 32px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.accord {
  background: #f1f1f1 !important;
  padding: 0.75rem 1.25rem !important;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.accord:hover {
  background: #e8e8e8 !important;
}

.accord-header {
  background: #f1f1f1 !important;
}

.report-content-display {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 0.42rem;
}

.report-text {
  white-space: pre-wrap;
  line-height: 1.6;
  color: #3f4254;
}

.gutter-b {
  margin-bottom: 1.5rem;
}

.label-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  display: inline-block;
}
</style>
