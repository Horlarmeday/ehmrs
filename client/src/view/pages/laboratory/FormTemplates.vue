<template>
  <div class="form-templates-page">
    <div class="card card-custom">
      <div class="card-header">
        <div class="card-title">
          <h3 class="card-label">Laboratory Form Templates</h3>
        </div>
        <div class="card-toolbar">
          <button class="btn btn-primary btn-sm" @click="navigateToBuilder">
            <i class="fas fa-plus"></i> Create New Template
          </button>
        </div>
      </div>

      <div class="card-body">
        <!-- Filters -->
        <div class="row mb-5">
          <div class="col-md-4">
            <input
              type="text"
              class="form-control form-control-sm"
              placeholder="Search templates..."
              v-model="searchQuery"
              @input="debouncedSearch"
            />
          </div>
          <div class="col-md-3">
            <select
              class="form-control form-control-sm"
              v-model="categoryFilter"
              @change="filterTemplates"
            >
              <option value="">All Categories</option>
              <option value="Hematology">Hematology</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Microbiology">Microbiology</option>
              <option value="Serology">Serology</option>
              <option value="Hormones">Hormones</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div class="col-md-3">
            <select
              class="form-control form-control-sm"
              v-model="statusFilter"
              @change="filterTemplates"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <!-- Templates Table -->
        <div class="table-responsive">
          <table class="table table-head-custom table-vertical-center">
            <thead>
              <tr>
                <th>Name</th>
                <th>Code</th>
                <th>Category</th>
                <th>Version</th>
                <th>Status</th>
                <th>System Template</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody v-if="!loading && templates.length">
              <tr v-for="template in templates" :key="template.id">
                <td>
                  <span class="font-weight-bold">{{ template.name }}</span>
                  <br />
                  <small class="text-muted">{{ template.description }}</small>
                </td>
                <td>
                  <span class="label label-inline label-light-primary">{{ template.code }}</span>
                </td>
                <td>{{ template.category || 'N/A' }}</td>
                <td>{{ template.version }}</td>
                <td>
                  <span
                    :class="
                      template.is_active
                        ? 'label label-success label-inline'
                        : 'label label-danger label-inline'
                    "
                  >
                    {{ template.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td>
                  <span v-if="template.is_system_template" class="text-warning">
                    <i class="fas fa-lock"></i> System
                  </span>
                  <span v-else class="text-muted">Custom</span>
                </td>
                <td>{{ template.updatedAt | dayjs('MMM D, YYYY') }}</td>
                <td>
                  <div class="btn-group">
                    <button
                      class="btn btn-sm btn-icon btn-light btn-hover-primary"
                      @click="viewTemplate(template)"
                      v-b-tooltip.hover
                      title="View/Preview"
                    >
                      <i class="fas fa-eye"></i>
                    </button>
                    <button
                      class="btn btn-sm btn-icon btn-light btn-hover-warning"
                      @click="editTemplate(template)"
                      v-b-tooltip.hover
                      title="Edit"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                    <button
                      class="btn btn-sm btn-icon btn-light btn-hover-info"
                      @click="cloneTemplate(template)"
                      v-b-tooltip.hover
                      title="Clone"
                    >
                      <i class="fas fa-copy"></i>
                    </button>
                    <button
                      class="btn btn-sm btn-icon btn-light btn-hover-success"
                      @click="toggleStatus(template)"
                      v-b-tooltip.hover
                      :title="template.is_active ? 'Deactivate' : 'Activate'"
                    >
                      <i :class="template.is_active ? 'fas fa-toggle-on' : 'fas fa-toggle-off'"></i>
                    </button>
                    <button
                      v-if="!template.is_system_template"
                      class="btn btn-sm btn-icon btn-light btn-hover-danger"
                      @click="deleteTemplate(template)"
                      v-b-tooltip.hover
                      title="Delete"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
            <tbody v-else-if="loading">
              <tr>
                <td colspan="8" class="text-center py-10">
                  <div class="spinner-border text-primary" role="status">
                    <span class="sr-only">Loading...</span>
                  </div>
                </td>
              </tr>
            </tbody>
            <tbody v-else>
              <tr>
                <td colspan="8" class="text-center py-10">
                  <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
                  <p class="text-muted">No form templates found</p>
                  <button class="btn btn-primary btn-sm mt-3" @click="navigateToBuilder">
                    Create Your First Template
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="row mt-5" v-if="totalPages > 1">
          <div class="col-md-12">
            <b-pagination
              v-model="currentPage"
              :total-rows="totalTemplates"
              :per-page="itemsPerPage"
              @change="onPageChange"
              align="center"
            ></b-pagination>
          </div>
        </div>
      </div>
    </div>

    <!-- Clone Modal -->
    <b-modal v-model="showCloneModal" title="Clone Template" hide-footer>
      <div class="form-group">
        <label>New Template Name</label>
        <input
          type="text"
          class="form-control"
          v-model="cloneData.newName"
          placeholder="Enter new template name"
        />
      </div>
      <div class="form-group">
        <label>New Template Code</label>
        <input
          type="text"
          class="form-control"
          v-model="cloneData.newCode"
          placeholder="Enter unique code (e.g., FBC_CUSTOM)"
        />
      </div>
      <div class="mt-5">
        <button class="btn btn-secondary mr-2" @click="showCloneModal = false">Cancel</button>
        <button class="btn btn-primary" @click="confirmClone" :disabled="isCloning">
          <span v-if="isCloning">Cloning...</span>
          <span v-else>Clone Template</span>
        </button>
      </div>
    </b-modal>
  </div>
</template>

<script>
import { debounce } from '@/common/common';

export default {
  name: 'FormTemplates',
  data() {
    return {
      searchQuery: '',
      categoryFilter: '',
      statusFilter: '',
      currentPage: 1,
      itemsPerPage: 20,
      loading: false,
      showCloneModal: false,
      isCloning: false,
      cloneData: {
        templateId: null,
        newName: '',
        newCode: '',
      },
    };
  },
  computed: {
    templates() {
      return this.$store.state.laboratory.formTemplates || [];
    },
    totalTemplates() {
      return this.$store.state.laboratory.formTemplatesTotal || 0;
    },
    totalPages() {
      return Math.ceil(this.totalTemplates / this.itemsPerPage);
    },
  },
  methods: {
    async fetchTemplates() {
      this.loading = true;
      try {
        await this.$store.dispatch('laboratory/fetchFormTemplates', {
          currentPage: this.currentPage,
          pageLimit: this.itemsPerPage,
          search: this.searchQuery,
          category: this.categoryFilter,
          isActive:
            this.statusFilter === 'active'
              ? true
              : this.statusFilter === 'inactive'
              ? false
              : undefined,
        });
      } catch (error) {
        this.$notify({
          title: 'Error',
          message: error.message || 'Failed to load form templates',
          group: 'foo',
          type: 'error',
        });
      } finally {
        this.loading = false;
      }
    },

    debouncedSearch: debounce(function () {
      this.currentPage = 1;
      this.fetchTemplates();
    }, 500),

    filterTemplates() {
      this.currentPage = 1;
      this.fetchTemplates();
    },

    onPageChange(page) {
      this.currentPage = page;
      this.fetchTemplates();
    },

    navigateToBuilder() {
      this.$router.push('/laboratory/form-templates/builder');
    },

    viewTemplate(template) {
      this.$router.push(`/laboratory/form-templates/${template.id}/preview`);
    },

    editTemplate(template) {
      this.$router.push(`/laboratory/form-templates/${template.id}/edit`);
    },

    cloneTemplate(template) {
      this.cloneData = {
        templateId: template.id,
        newName: `${template.name} (Copy)`,
        newCode: `${template.code}_COPY`,
      };
      this.showCloneModal = true;
    },

    async confirmClone() {
      if (!this.cloneData.newName || !this.cloneData.newCode) {
        this.$notify({
          title: 'Error',
          message: 'Please provide both name and code',
          group: 'foo',
          type: 'error',
        });
        return;
      }

      this.isCloning = true;
      try {
        await this.$store.dispatch('laboratory/cloneFormTemplate', {
          id: this.cloneData.templateId,
          newName: this.cloneData.newName,
          newCode: this.cloneData.newCode,
        });
        this.$notify({
          title: 'Success',
          message: 'Template cloned successfully',
          group: 'foo',
          type: 'success',
        });
        this.showCloneModal = false;
        this.fetchTemplates();
      } catch (error) {
        this.$notify({
          title: 'Error',
          message: error.message || 'Failed to clone template',
          group: 'foo',
          type: 'error',
        });
      } finally {
        this.isCloning = false;
      }
    },

    async toggleStatus(template) {
      try {
        await this.$store.dispatch('laboratory/updateFormTemplate', {
          id: template.id,
          is_active: !template.is_active,
        });
        this.$notify({
          title: 'Success',
          message: `Template ${template.is_active ? 'deactivated' : 'activated'} successfully`,
          group: 'foo',
          type: 'success',
        });
        this.fetchTemplates();
      } catch (error) {
        this.$notify({
          title: 'Error',
          message: error.message || 'update template status',
          group: 'foo',
          type: 'error',
        });
      }
    },

    async deleteTemplate(template) {
      const confirmed = window.confirm(
        `Are you sure you want to delete "${template.name}"? This action cannot be undone.`,
        'Confirm Delete',
        'question'
      );

      if (confirmed) {
        try {
          await this.$store.dispatch('laboratory/deleteFormTemplate', template.id);
          this.$notify({
            title: 'Success',
            message: 'Template deleted successfully',
            group: 'foo',
            type: 'success',
          });
          this.fetchTemplates();
        } catch (error) {
          this.$notify({
            title: 'Success',
            message: error.message || 'Failed to delete template',
            group: 'foo',
            type: 'error',
          });
        }
      }
    },
  },
  created() {
    this.fetchTemplates();
  },
};
</script>

<style scoped>
.form-templates-page {
  padding: 20px;
}

.btn-group .btn {
  margin-right: 5px;
}

.table td {
  vertical-align: middle;
}
</style>
