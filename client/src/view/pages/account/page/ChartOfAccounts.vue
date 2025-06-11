<template>
  <div class="card card-custom gutter-b">
    <div class="card-header py-5">
      <h3 class="card-title align-items-start flex-column">
        <span class="card-label font-weight-bolder text-dark">Chart of Accounts</span>
      </h3>
      <div class="card-toolbar">
        <div class="d-flex align-items-center">
          <div class="mr-3">
            <input
              type="text"
              class="form-control"
              v-model="search"
              placeholder="Search accounts..."
            />
          </div>
          <button class="btn btn-primary" @click="openDialog()">
            Add Account
          </button>
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
                <th>Code</th>
                <th>Name</th>
                <th>Type</th>
                <th>Description</th>
                <th>Parent</th>
                <th>Balance</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="accounts.length === 0">
                <td colspan="7" align="center" class="text-muted">No Data</td>
              </tr>
              <tr v-for="item in filteredAccounts" :key="item.id">
                <td>{{ item.code }}</td>
                <td>{{ item.name }}</td>
                <td>
                  <span :class="getTypeClass(item.type)" class="label label-lg label-inline">
                    {{ item.type }}
                  </span>
                </td>
                <td>{{ item.description }}</td>
                <td>{{ item.parent?.name || 'N/A' }}</td>
                <td>{{ formatCurrency(item.balance) }}</td>
                <td class="text-right">
                  <button
                    class="btn btn-icon btn-light btn-hover-primary btn-sm mr-2"
                    @click="editItem(item)"
                  >
                    <i class="fas fa-pencil-alt"></i>
                  </button>
                  <button
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

    <account-form
      :show="showModal"
      :account="editedItem"
      :parent-accounts="accounts"
      @close="closeModal"
      @save="save"
    />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import AccountForm from '@/view/pages/account/components/AccountForm.vue';

const AccountType = {
  ASSET: 'ASSET',
  LIABILITY: 'LIABILITY',
  INCOME: 'INCOME',
  EXPENSE: 'EXPENSE',
  EQUITY: 'EQUITY',
};

export default {
  name: 'ChartOfAccounts',
  components: {
    AccountForm,
  },
  data: () => ({
    search: '',
    showModal: false,
    editedIndex: -1,
    editedItem: {
      code: '',
      name: '',
      type: '',
      description: '',
      parent_id: null,
    },
    defaultItem: {
      code: '',
      name: '',
      type: '',
      description: '',
      parent_id: null,
    },
  }),

  computed: {
    ...mapGetters('account', ['accounts', 'loading']),
    filteredAccounts() {
      if (!this.search) return this.accounts;
      const search = this.search.toLowerCase();
      return this.accounts.filter(
        account =>
          account.code.toLowerCase().includes(search) ||
          account.name.toLowerCase().includes(search) ||
          account.type.toLowerCase().includes(search)
      );
    },
  },

  created() {
    this.fetchAccounts();
  },

  methods: {
    ...mapActions('account', ['fetchAccounts', 'createAccount', 'updateAccount', 'deleteAccount']),

    getTypeClass(type) {
      const classes = {
        [AccountType.ASSET]: 'label-light-success',
        [AccountType.LIABILITY]: 'label-light-danger',
        [AccountType.INCOME]: 'label-light-info',
        [AccountType.EXPENSE]: 'label-light-warning',
        [AccountType.EQUITY]: 'label-light-primary',
      };
      return classes[type] || 'label-light-dark';
    },

    formatCurrency(value) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'NGN',
      }).format(value || 0);
    },

    editItem(item) {
      this.editedIndex = this.accounts.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.showModal = true;
    },

    async deleteItem(item) {
      if (confirm('Are you sure you want to delete this account?')) {
        await this.deleteAccount(item.id);
      }
    },

    openDialog() {
      this.editedIndex = -1;
      this.editedItem = Object.assign({}, this.defaultItem);
      this.showModal = true;
    },

    closeModal() {
      this.showModal = false;
      this.editedItem = Object.assign({}, this.defaultItem);
    },

    async save(form) {
      if (this.editedIndex > -1) {
        await this.updateAccount({
          id: this.editedItem.id,
          account: form,
        });
        await this.fetchAccounts();
      } else {
        await this.createAccount(form);
        await this.fetchAccounts();
      }
      this.closeModal();
    },
  },
};
</script>
