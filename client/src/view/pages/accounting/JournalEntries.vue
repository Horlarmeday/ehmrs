<template>
  <div class="journal-entries">
    <!-- Header Section -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <i class="fas fa-journal-whills text-success mr-3"></i>
          Journal Entries
        </h1>
        <p class="page-subtitle">
          Create and manage journal entries with approval workflows, auto-balancing, and
          comprehensive audit trails
        </p>
      </div>
      <div class="header-actions">
        <b-button variant="outline-primary" @click="exportEntries">
          <i class="fas fa-download mr-2"></i>Export
        </b-button>
        <b-button variant="success" @click="showCreateModal">
          <i class="fas fa-plus mr-2"></i>New Entry
        </b-button>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="summary-section">
      <div class="row">
        <div class="col-lg-3 col-md-6 mb-4">
          <div class="summary-card bg-success text-white">
            <div class="summary-icon">
              <i class="fas fa-check-circle"></i>
            </div>
            <div class="summary-content">
              <h3 class="summary-value">{{ summaryData.postedEntries }}</h3>
              <p class="summary-label">Posted Entries</p>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6 mb-4">
          <div class="summary-card bg-warning text-white">
            <div class="summary-icon">
              <i class="fas fa-clock"></i>
            </div>
            <div class="summary-content">
              <h3 class="summary-value">{{ summaryData.pendingApproval }}</h3>
              <p class="summary-label">Pending Approval</p>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6 mb-4">
          <div class="summary-card bg-info text-white">
            <div class="summary-icon">
              <i class="fas fa-balance-scale"></i>
            </div>
            <div class="summary-content">
              <h3 class="summary-value">{{ formatCurrency(summaryData.totalDebits) }}</h3>
              <p class="summary-label">Total Debits</p>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6 mb-4">
          <div class="summary-card bg-primary text-white">
            <div class="summary-icon">
              <i class="fas fa-balance-scale"></i>
            </div>
            <div class="summary-content">
              <h3 class="summary-value">{{ formatCurrency(summaryData.totalCredits) }}</h3>
              <p class="summary-label">Total Credits</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="filters-section">
      <div class="card">
        <div class="card-body">
          <div class="row">
            <div class="col-md-3">
              <b-form-group label="Search" label-for="search-input">
                <b-form-input
                  id="search-input"
                  v-model="filters.search"
                  placeholder="Search entries..."
                  @input="debounceSearch"
                ></b-form-input>
              </b-form-group>
            </div>
            <div class="col-md-2">
              <b-form-group label="Status" label-for="status-filter">
                <b-form-select
                  id="status-filter"
                  v-model="filters.status"
                  :options="statusOptions"
                  @change="loadEntries"
                ></b-form-select>
              </b-form-group>
            </div>
            <div class="col-md-2">
              <date-filter
                v-model="filters.startDate"
                @change="loadEntries"
              />
              <b-form-group label="Date Range" label-for="date-filter">
                <b-form-input
                  id="date-filter"
                  v-model="filters.startDate"
                  type="date"
                  @change="loadEntries"
                ></b-form-input>
              </b-form-group>
            </div>
            <div class="col-md-2">
              <b-form-group label="End Date" label-for="end-date">
                <b-form-input
                  id="end-date"
                  v-model="filters.endDate"
                  type="date"
                  @change="loadEntries"
                ></b-form-input>
              </b-form-group>
            </div>
            <div class="col-md-2">
              <b-form-group label="Type" label-for="type-filter">
                <b-form-select
                  id="type-filter"
                  v-model="filters.type"
                  :options="typeOptions"
                  @change="loadEntries"
                ></b-form-select>
              </b-form-group>
            </div>
            <div class="col-md-3">
              <label>&nbsp;</label>
              <div class="d-flex gap-2">
                <b-button variant="outline-secondary" @click="clearFilters">
                  Clear
                </b-button>
                <b-button variant="primary" @click="loadEntries">
                  <i class="fas fa-search mr-2"></i>Search
                </b-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Journal Entries Table -->
    <div class="entries-table-section">
      <div class="card">
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-hover">
              <thead class="thead-light">
                <tr>
                  <th>Date</th>
                  <th>Reference</th>
                  <th>Description</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Debits</th>
                  <th>Credits</th>
                  <th>Created By</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="entry in entries" :key="entry.id" :class="getEntryRowClass(entry)">
                  <td>{{ formatDate(entry.transaction_date) }}</td>
                  <td>
                    <strong>{{ entry.reference }}</strong>
                  </td>
                  <td>{{ entry.description }}</td>
                  <td>
                    <b-badge :variant="getTypeVariant(entry.entry_type)">
                      {{ entry.entry_type }}
                    </b-badge>
                  </td>
                  <td>
                    <b-badge :variant="getStatusVariant(entry.status)">
                      {{ entry.status }}
                    </b-badge>
                  </td>
                  <td>
                    <span class="debit-amount">{{ formatCurrency(entry.total_debits) }}</span>
                  </td>
                  <td>
                    <span class="credit-amount">{{ formatCurrency(entry.total_credits) }}</span>
                  </td>
                  <td>{{ entry.createdBy?.fullname || 'System' }}</td>
                  <td>
                    <div class="action-buttons">
                      <b-button variant="outline-info" size="sm" @click="viewEntry(entry.id)">
                        <i class="fas fa-eye"></i>
                      </b-button>
                      <b-button
                        v-if="entry.status === 'DRAFT'"
                        variant="outline-warning"
                        size="sm"
                        @click="editEntry(entry.id)"
                      >
                        <i class="fas fa-edit"></i>
                      </b-button>
                      <b-button
                        v-if="entry.status === 'DRAFT'"
                        variant="outline-success"
                        size="sm"
                        @click="submitForApproval(entry.id)"
                      >
                        <i class="fas fa-paper-plane"></i>
                      </b-button>
                      <b-button
                        v-if="entry.status === 'PENDING_APPROVAL' && canApprove"
                        variant="outline-success"
                        size="sm"
                        @click="approveEntry(entry.id)"
                      >
                        <i class="fas fa-check"></i>
                      </b-button>
                      <b-button
                        v-if="entry.status === 'DRAFT'"
                        variant="outline-danger"
                        size="sm"
                        @click="deleteEntry(entry.id)"
                      >
                        <i class="fas fa-trash"></i>
                      </b-button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="pagination-section">
            <b-pagination
              v-model="currentPage"
              :total-rows="totalRows"
              :per-page="perPage"
              @change="onPageChange"
              align="center"
            ></b-pagination>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Entry Modal -->
    <b-modal
      v-model="showEntryModal"
      :title="isEditing ? 'Edit Journal Entry' : 'Create New Journal Entry'"
      size="xl"
      @ok="saveEntry"
      @hidden="resetForm"
    >
      <b-form @submit.prevent="saveEntry">
        <!-- Entry Header -->
        <div class="entry-header mb-4">
          <div class="row">
            <div class="col-md-4">
              <b-form-group label="Transaction Date" label-for="transaction-date">
                <b-form-input
                  id="transaction-date"
                  v-model="entryForm.transaction_date"
                  type="date"
                  required
                ></b-form-input>
              </b-form-group>
            </div>
            <div class="col-md-4">
              <b-form-group label="Reference" label-for="reference">
                <b-form-input
                  id="reference"
                  v-model="entryForm.reference"
                  placeholder="e.g., JE-2024-001"
                  required
                ></b-form-input>
              </b-form-group>
            </div>
            <div class="col-md-4">
              <b-form-group label="Entry Type" label-for="entry-type">
                <b-form-select
                  id="entry-type"
                  v-model="entryForm.entry_type"
                  :options="entryTypeOptions"
                  required
                ></b-form-select>
              </b-form-group>
            </div>
          </div>
          <div class="row">
            <div class="col-12">
              <b-form-group label="Description" label-for="description">
                <b-form-textarea
                  id="description"
                  v-model="entryForm.description"
                  rows="2"
                  placeholder="Brief description of this journal entry..."
                  required
                ></b-form-textarea>
              </b-form-group>
            </div>
          </div>
        </div>

        <!-- Entry Lines -->
        <div class="entry-lines-section">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h6>Entry Lines</h6>
            <div class="line-controls">
              <b-button variant="outline-primary" size="sm" @click="addLine">
                <i class="fas fa-plus mr-2"></i>Add Line
              </b-button>
              <b-button variant="outline-info" size="sm" @click="autoBalance">
                <i class="fas fa-balance-scale mr-2"></i>Auto Balance
              </b-button>
            </div>
          </div>

          <div v-for="(line, index) in entryForm.lines" :key="index" class="entry-line-row">
            <div class="row">
              <div class="col-md-3">
                <b-form-group label="Account" label-for="account-select">
                  <b-form-select
                    :id="`account-${index}`"
                    v-model="line.account_id"
                    :options="accountOptions"
                    @change="onAccountChange(index)"
                    required
                  ></b-form-select>
                </b-form-group>
              </div>
              <div class="col-md-2">
                <b-form-group label="Debit" label-for="debit-amount">
                  <b-form-input
                    :id="`debit-${index}`"
                    v-model.number="line.debit"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    @input="calculateLineTotal(index)"
                  ></b-form-input>
                </b-form-group>
              </div>
              <div class="col-md-2">
                <b-form-group label="Credit" label-for="credit-amount">
                  <b-form-input
                    :id="`credit-${index}`"
                    v-model.number="line.credit"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    @input="calculateLineTotal(index)"
                  ></b-form-input>
                </b-form-group>
              </div>
              <div class="col-md-2">
                <b-form-group label="Cost Center" label-for="cost-center">
                  <b-form-select
                    :id="`cost-center-${index}`"
                    v-model="line.cost_center_id"
                    :options="costCenterOptions"
                  ></b-form-select>
                </b-form-group>
              </div>
              <div class="col-md-2">
                <b-form-group label="Total" label-for="line-total">
                  <b-form-input
                    :id="`total-${index}`"
                    v-model="line.total"
                    readonly
                    class="text-right"
                  ></b-form-input>
                </b-form-group>
              </div>
              <div class="col-md-1">
                <div class="line-actions">
                  <b-button
                    variant="outline-danger"
                    size="sm"
                    @click="removeLine(index)"
                    :disabled="entryForm.lines.length <= 2"
                  >
                    <i class="fas fa-trash"></i>
                  </b-button>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-12">
                <b-form-group label="Line Description" label-for="line-description">
                  <b-form-input
                    :id="`line-desc-${index}`"
                    v-model="line.description"
                    placeholder="Description for this line item..."
                  ></b-form-input>
                </b-form-group>
              </div>
            </div>
          </div>
        </div>

        <!-- Entry Summary -->
        <div class="entry-summary">
          <div class="row">
            <div class="col-md-6 offset-md-6">
              <table class="table table-borderless">
                <tr>
                  <td>Total Debits:</td>
                  <td class="text-right">
                    <strong>{{ formatCurrency(totalDebits) }}</strong>
                  </td>
                </tr>
                <tr>
                  <td>Total Credits:</td>
                  <td class="text-right">
                    <strong>{{ formatCurrency(totalCredits) }}</strong>
                  </td>
                </tr>
                <tr class="border-top">
                  <td>Difference:</td>
                  <td class="text-right">
                    <strong :class="getDifferenceClass()">{{ formatCurrency(difference) }}</strong>
                  </td>
                </tr>
              </table>
            </div>
          </div>
        </div>

        <!-- Additional Fields -->
        <div class="row">
          <div class="col-md-6">
            <b-form-group label="Due Date" label-for="due-date">
              <b-form-input id="due-date" v-model="entryForm.due_date" type="date"></b-form-input>
            </b-form-group>
          </div>
          <div class="col-md-6">
            <b-form-group label="Priority" label-for="priority">
              <b-form-select
                id="priority"
                v-model="entryForm.priority"
                :options="priorityOptions"
              ></b-form-select>
            </b-form-group>
          </div>
        </div>

        <div class="row">
          <div class="col-12">
            <b-form-group label="Notes" label-for="notes">
              <b-form-textarea
                id="notes"
                v-model="entryForm.notes"
                rows="3"
                placeholder="Additional notes or comments..."
              ></b-form-textarea>
            </b-form-group>
          </div>
        </div>
      </b-form>

      <template #modal-footer>
        <b-button variant="secondary" @click="showEntryModal = false">
          Cancel
        </b-button>
        <b-button variant="primary" @click="saveEntry" :disabled="saving || !isBalanced">
          <span v-if="saving"> <i class="fas fa-spinner fa-spin mr-2"></i>Saving... </span>
          <span v-else>
            {{ isEditing ? 'Update Entry' : 'Create Entry' }}
          </span>
        </b-button>
      </template>
    </b-modal>
  </div>
</template>

<script>
export default {
  name: 'JournalEntries',
  data() {
    return {
      // Filters
      filters: {
        search: '',
        status: '',
        startDate: '',
        endDate: '',
        type: '',
      },

      // Pagination
      currentPage: 1,
      perPage: 10,

      // Modal and form
      showEntryModal: false,
      isEditing: false,
      saving: false,
      entryForm: {
        transaction_date: new Date().toISOString().split('T')[0],
        reference: '',
        description: '',
        entry_type: 'MANUAL',
        lines: [
          {
            account_id: null,
            debit: 0,
            credit: 0,
            cost_center_id: null,
            description: '',
            total: 0,
          },
          {
            account_id: null,
            debit: 0,
            credit: 0,
            cost_center_id: null,
            description: '',
            total: 0,
          },
        ],
        due_date: '',
        priority: 'NORMAL',
        notes: '',
      },

      // Options
      statusOptions: [
        { value: '', text: 'All Statuses' },
        { value: 'DRAFT', text: 'Draft' },
        { value: 'PENDING_APPROVAL', text: 'Pending Approval' },
        { value: 'APPROVED', text: 'Approved' },
        { value: 'POSTED', text: 'Posted' },
        { value: 'REJECTED', text: 'Rejected' },
      ],
      typeOptions: [
        { value: '', text: 'All Types' },
        { value: 'MANUAL', text: 'Manual Entry' },
        { value: 'AUTOMATED', text: 'Automated Entry' },
        { value: 'RECURRING', text: 'Recurring Entry' },
        { value: 'ADJUSTMENT', text: 'Adjustment Entry' },
      ],
      entryTypeOptions: [
        { value: 'MANUAL', text: 'Manual Entry' },
        { value: 'AUTOMATED', text: 'Automated Entry' },
        { value: 'RECURRING', text: 'Recurring Entry' },
        { value: 'ADJUSTMENT', text: 'Adjustment Entry' },
      ],
      priorityOptions: [
        { value: 'LOW', text: 'Low' },
        { value: 'NORMAL', text: 'Normal' },
        { value: 'HIGH', text: 'High' },
        { value: 'URGENT', text: 'Urgent' },
      ],
      accountOptions: [],
      costCenterOptions: [],
    };
  },
  computed: {
    entries() {
      return this.$store.getters['accounting/getJournalEntries'] || [];
    },
    summaryData() {
      return this.$store.getters['accounting/getJournalEntriesSummary'] || {};
    },
    totalRows() {
      return this.$store.getters['accounting/getJournalEntriesTotal'] || 0;
    },
    isLoading() {
      return this.$store.getters['accounting/loading'];
    },
    totalDebits() {
      return this.entryForm.lines.reduce((sum, line) => sum + (line.debit || 0), 0);
    },
    totalCredits() {
      return this.entryForm.lines.reduce((sum, line) => sum + (line.credit || 0), 0);
    },
    difference() {
      return Math.abs(this.totalDebits - this.totalCredits);
    },
    isBalanced() {
      return Math.abs(this.totalDebits - this.totalCredits) < 0.01;
    },
    canApprove() {
      // Check if current user has approval permissions
      return this.$store.getters['auth/canApproveJournalEntries'];
    },
  },
  async mounted() {
    await this.loadEntries();
    await this.loadOptions();
  },
  methods: {
    async loadEntries() {
      try {
        const params = {
          page: this.currentPage,
          limit: this.perPage,
          ...this.filters,
        };
        await this.$store.dispatch('accounting/fetchJournalEntries', params);
      } catch (error) {
        console.error('Failed to load entries:', error);
      }
    },

    async loadOptions() {
      try {
        // Load accounts
        const accounts = await this.$store.dispatch('accounting/fetchChartOfAccounts', {});
        this.accountOptions = accounts.map(account => ({
          value: account.id,
          text: `${account.code} - ${account.name}`,
        }));

        // Load cost centers
        const costCenters = await this.$store.dispatch('accounting/fetchCostCenters', {});
        this.costCenterOptions = costCenters.map(center => ({
          value: center.id,
          text: center.name,
        }));
      } catch (error) {
        console.error('Failed to load options:', error);
      }
    },

    // Line management
    addLine() {
      this.entryForm.lines.push({
        account_id: null,
        debit: 0,
        credit: 0,
        cost_center_id: null,
        description: '',
        total: 0,
      });
    },

    removeLine(index) {
      if (this.entryForm.lines.length > 2) {
        this.entryForm.lines.splice(index, 1);
        this.calculateTotals();
      }
    },

    calculateLineTotal(index) {
      const line = this.entryForm.lines[index];
      line.total = (line.debit || 0) + (line.credit || 0);
      this.calculateTotals();
    },

    calculateTotals() {
      // This will trigger computed properties
    },

    autoBalance() {
      const lines = this.entryForm.lines.filter(line => line.account_id);
      if (lines.length < 2) return;

      const totalDebits = lines.reduce((sum, line) => sum + (line.debit || 0), 0);
      const totalCredits = lines.reduce((sum, line) => sum + (line.credit || 0), 0);
      const difference = Math.abs(totalDebits - totalCredits);

      if (difference > 0.01) {
        // Find the last line with an account and balance it
        const lastLine = lines[lines.length - 1];
        if (totalDebits > totalCredits) {
          lastLine.credit = difference;
          lastLine.debit = 0;
        } else {
          lastLine.debit = difference;
          lastLine.credit = 0;
        }
        this.calculateLineTotal(lines.length - 1);
      }
    },

    onAccountChange() {
      // Could load account-specific information here
    },

    // Modal actions
    showCreateModal() {
      this.isEditing = false;
      this.showEntryModal = true;
    },

    editEntry(entryId) {
      this.isEditing = true;
      this.loadEntryForEdit(entryId);
      this.showEntryModal = true;
    },

    async loadEntryForEdit(entryId) {
      try {
        const entry = await this.$store.dispatch('accounting/getJournalEntryById', entryId);
        if (entry) {
          this.entryForm = {
            ...entry,
            lines: entry.lines || [
              {
                account_id: null,
                debit: 0,
                credit: 0,
                cost_center_id: null,
                description: '',
                total: 0,
              },
              {
                account_id: null,
                debit: 0,
                credit: 0,
                cost_center_id: null,
                description: '',
                total: 0,
              },
            ],
          };
        }
      } catch (error) {
        console.error('Failed to load entry for edit:', error);
      }
    },

    async saveEntry() {
      if (!this.isBalanced) {
        this.$bvToast.toast('Entry must be balanced before saving', {
          title: 'Validation Error',
          variant: 'warning',
          solid: true,
        });
        return;
      }

      try {
        this.saving = true;

        let result;
        if (this.isEditing) {
          result = await this.$store.dispatch('accounting/updateJournalEntry', {
            id: this.entryForm.id,
            entryData: this.entryForm,
          });
        } else {
          result = await this.$store.dispatch('accounting/createJournalEntry', this.entryForm);
        }

        if (result.success) {
          this.showEntryModal = false;
          this.resetForm();
          await this.loadEntries();
          this.$bvToast.toast(
            `Journal entry ${this.isEditing ? 'updated' : 'created'} successfully`,
            {
              title: 'Success',
              variant: 'success',
              solid: true,
            }
          );
        }
      } catch (error) {
        console.error('Failed to save entry:', error);
        this.$bvToast.toast('Failed to save entry', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      } finally {
        this.saving = false;
      }
    },

    resetForm() {
      this.entryForm = {
        transaction_date: new Date().toISOString().split('T')[0],
        reference: '',
        description: '',
        entry_type: 'MANUAL',
        lines: [
          {
            account_id: null,
            debit: 0,
            credit: 0,
            cost_center_id: null,
            description: '',
            total: 0,
          },
          {
            account_id: null,
            debit: 0,
            credit: 0,
            cost_center_id: null,
            description: '',
            total: 0,
          },
        ],
        due_date: '',
        priority: 'NORMAL',
        notes: '',
      };
      this.isEditing = false;
    },

    // Workflow actions
    async submitForApproval(entryId) {
      try {
        await this.$store.dispatch('accounting/submitForApproval', entryId);
        await this.loadEntries();
        this.$bvToast.toast('Entry submitted for approval', {
          title: 'Success',
          variant: 'success',
          solid: true,
        });
      } catch (error) {
        console.error('Failed to submit for approval:', error);
      }
    },

    async approveEntry(entryId) {
      try {
        await this.$store.dispatch('accounting/approveEntry', entryId);
        await this.loadEntries();
        this.$bvToast.toast('Entry approved successfully', {
          title: 'Success',
          variant: 'success',
          solid: true,
        });
      } catch (error) {
        console.error('Failed to approve entry:', error);
      }
    },

    // Utility methods
    formatCurrency(amount) {
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
      }).format(amount || 0);
    },

    formatDate(dateString) {
      if (!dateString) return '';
      return new Date(dateString).toLocaleDateString('en-NG');
    },

    getEntryRowClass(entry) {
      return {
        'entry-draft': entry.status === 'DRAFT',
        'entry-pending': entry.status === 'PENDING_APPROVAL',
        'entry-approved': entry.status === 'APPROVED',
        'entry-posted': entry.status === 'POSTED',
        'entry-rejected': entry.status === 'REJECTED',
      };
    },

    getTypeVariant(type) {
      const variants = {
        MANUAL: 'primary',
        AUTOMATED: 'info',
        RECURRING: 'warning',
        ADJUSTMENT: 'danger',
      };
      return variants[type] || 'secondary';
    },

    getStatusVariant(status) {
      const variants = {
        DRAFT: 'secondary',
        PENDING_APPROVAL: 'warning',
        APPROVED: 'success',
        POSTED: 'info',
        REJECTED: 'danger',
      };
      return variants[status] || 'secondary';
    },

    getDifferenceClass() {
      if (this.isBalanced) return 'text-success';
      return 'text-danger';
    },

    // Filter methods
    clearFilters() {
      this.filters = {
        search: '',
        status: '',
        dateRange: '',
        type: '',
      };
      this.loadEntries();
    },

    debounceSearch: debounce(function() {
      this.loadEntries();
    }, 500),

    onPageChange(page) {
      this.currentPage = page;
      this.loadEntries();
    },

    // Navigation methods
    viewEntry(entryId) {
      this.$router.push({ name: 'journal-entry-details', params: { id: entryId } });
    },

    async deleteEntry(entryId) {
      if (confirm('Are you sure you want to delete this entry?')) {
        try {
          await this.$store.dispatch('accounting/deleteJournalEntry', entryId);
          await this.loadEntries();
          this.$bvToast.toast('Entry deleted successfully', {
            title: 'Success',
            variant: 'success',
            solid: true,
          });
        } catch (error) {
          console.error('Failed to delete entry:', error);
        }
      }
    },

    exportEntries() {
      // Implement export functionality
      this.$bvToast.toast('Export functionality coming soon', {
        title: 'Info',
        variant: 'info',
        solid: true,
      });
    },
  },
};

// Debounce utility function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
</script>

<style scoped>
.journal-entries {
  padding: 2rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
}

.header-content {
  flex: 1;
}

.page-title {
  font-size: 2rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
}

.page-subtitle {
  color: #6c757d;
  margin: 0;
  font-size: 1rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.summary-section {
  margin-bottom: 2rem;
}

.summary-card {
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.summary-card:hover {
  transform: translateY(-2px);
}

.summary-icon {
  font-size: 2.5rem;
  margin-right: 1rem;
  opacity: 0.8;
}

.summary-content {
  flex: 1;
}

.summary-value {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
}

.summary-label {
  font-size: 1rem;
  margin: 0;
  opacity: 0.9;
}

.filters-section {
  margin-bottom: 2rem;
}

.entries-table-section {
  margin-bottom: 2rem;
}

.entry-line-row {
  padding: 1rem;
  margin-bottom: 1rem;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  background-color: #f8f9fa;
}

.line-controls {
  display: flex;
  gap: 0.5rem;
}

.line-actions {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.entry-summary {
  margin: 2rem 0;
  padding: 1rem;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  background-color: #f8f9fa;
}

.debit-amount {
  font-weight: 600;
  color: #dc3545;
}

.credit-amount {
  font-weight: 600;
  color: #28a745;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.pagination-section {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
}

/* Entry row status classes */
.entry-draft {
  background-color: #f8f9fa;
}

.entry-pending {
  background-color: #fff3cd;
}

.entry-approved {
  background-color: #d1ecf1;
}

.entry-posted {
  background-color: #d4edda;
}

.entry-rejected {
  background-color: #f8d7da;
}

@media (max-width: 768px) {
  .journal-entries {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    gap: 1rem;
  }

  .header-actions {
    flex-wrap: wrap;
    justify-content: center;
  }

  .entry-line-row {
    padding: 0.5rem;
  }

  .line-controls {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
