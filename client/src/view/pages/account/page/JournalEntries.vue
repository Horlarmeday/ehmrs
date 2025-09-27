<template>
  <div class="card card-custom gutter-b">
    <div class="card-header py-5">
      <h3 class="card-title align-items-start flex-column">
        <span class="card-label font-weight-bolder text-dark">Journal Entries</span>
      </h3>
      <div class="card-toolbar">
        <div class="d-flex align-items-center">
          <div class="mr-3">
            <input
              type="text"
              class="form-control"
              v-model="search"
              placeholder="Search entries..."
            />
          </div>
          <button class="btn btn-primary" @click="openDialog()">New Entry</button>
        </div>
      </div>
    </div>
    <div class="card-body">
      <div v-if="loading" class="text-center py-10">
        <div class="spinner-border text-primary" role="status">
          <span class="sr-only">Loading...</span>
        </div>
      </div>
      <div v-else>
        <div class="table-responsive">
          <table class="table table-head-custom table-head-bg table-vertical-center">
            <thead>
              <tr class="text-uppercase">
                <th>Date</th>
                <th>Reference</th>
                <th>Description</th>
                <th>Status</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredEntries.length === 0">
                <td colspan="5" align="center" class="text-muted">No Data</td>
              </tr>
              <tr v-for="item in filteredEntries" :key="item.id">
                <td>{{ formatDate(item.transaction_date) }}</td>
                <td>{{ item.reference }}</td>
                <td>{{ item.description }}</td>
                <td>
                  <span :class="getStatusClass(item.status)" class="label label-lg label-inline">
                    {{ item.status }}
                  </span>
                </td>
                <td class="text-right">
                  <button
                    class="btn btn-icon btn-light btn-hover-primary btn-sm mr-2"
                    @click="viewItem(item)"
                  >
                    <i class="fas fa-eye"></i>
                  </button>
                  <button
                    v-if="item.status === 'DRAFT'"
                    class="btn btn-icon btn-light btn-hover-primary btn-sm mr-2"
                    @click="editItem(item)"
                  >
                    <i class="fas fa-pencil-alt"></i>
                  </button>
                  <button
                    v-if="item.status === 'DRAFT'"
                    class="btn btn-icon btn-light btn-hover-danger btn-sm"
                    @click="deleteItem(item)"
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

    <journal-entry-form
      :show="showModal"
      :entry="editedItem"
      :accounts="accounts"
      :cost-centers="costCenters"
      @close="closeModal"
      @save="save"
    />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import JournalEntryForm from '@/view/pages/account/components/JournalEntryForm.vue';
import dayjs from 'dayjs';

export default {
  name: 'JournalEntries',
  components: {
    JournalEntryForm,
  },
  data: () => ({
    search: '',
    currentPage: 1,
    showModal: false,
    editedIndex: -1,
    editedItem: {
      transaction_date: dayjs().format('YYYY-MM-DD'),
      reference: '',
      description: '',
      lines: [],
    },
    defaultItem: {
      transaction_date: dayjs().format('YYYY-MM-DD'),
      reference: '',
      description: '',
      lines: [],
    },
  }),

  computed: {
    ...mapGetters('account', ['journalEntries', 'accounts', 'costCenters', 'loading']),
    filteredEntries() {
      if (!this.search) return this.journalEntries;
      const search = this.search.toLowerCase();
      return this.journalEntries.filter(
        (entry) =>
          entry.reference.toLowerCase().includes(search) ||
          entry.description.toLowerCase().includes(search) ||
          entry.status.toLowerCase().includes(search)
      );
    },
  },

  created() {
    this.initialize();
  },

  methods: {
    ...mapActions('account', [
      'fetchJournalEntries',
      'createJournalEntry',
      'updateJournalEntry',
      'deleteJournalEntry',
      'fetchAccounts',
      'fetchCostCenters',
    ]),

    async initialize() {
      await Promise.all([
        this.fetchJournalEntries(),
        this.fetchAccounts(),
        this.fetchCostCenters({ currentPage: this.currentPage }),
      ]);
    },

    formatDate(date) {
      return dayjs(date).format('YYYY-MM-DD');
    },

    getStatusClass(status) {
      const classes = {
        DRAFT: 'label-light-warning',
        POSTED: 'label-light-success',
        VOID: 'label-light-danger',
      };
      return classes[status] || 'label-light-dark';
    },

    viewItem(item) {
      this.editedIndex = this.journalEntries.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.showModal = true;
    },

    editItem(item) {
      this.editedIndex = this.journalEntries.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.showModal = true;
    },

    async deleteItem(item) {
      if (confirm('Are you sure you want to delete this entry?')) {
        try {
          await this.deleteJournalEntry(item.id);
          this.$notify({
            group: 'foo',
            title: 'Success',
            text: 'Entry deleted successfully',
            type: 'success',
          });
        } catch (error) {
          this.$notify({
            group: 'foo',
            title: 'Error',
            text: 'Failed to delete entry',
            type: 'error',
          });
        }
      }
    },

    openDialog() {
      this.editedIndex = -1;
      this.editedItem = Object.assign({}, this.defaultItem);
      this.editedItem.lines = [
        {
          account_id: null,
          debit: 0,
          credit: 0,
          cost_center_id: null,
        },
      ];
      this.showModal = true;
    },

    closeModal() {
      this.showModal = false;
      this.editedItem = Object.assign({}, this.defaultItem);
    },

    async save(form) {
      try {
        if (this.editedIndex > -1) {
          await this.updateJournalEntry({
            id: this.editedItem.id,
            entry: form,
          });
        } else {
          await this.createJournalEntry(form);
        }
        this.$notify({
          group: 'foo',
          title: 'Success',
          text: 'Entry saved successfully',
          type: 'success',
        });
        this.closeModal();
      } catch (error) {
        this.$notify({
          group: 'foo',
          title: 'Error',
          text: 'Failed to save entry',
          type: 'error',
        });
      }
    },
  },
};
</script>
