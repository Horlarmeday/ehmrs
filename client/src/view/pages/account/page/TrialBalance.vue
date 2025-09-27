<template>
  <div class="card card-custom gutter-b">
    <div class="card-header py-5">
      <h3 class="card-title align-items-start flex-column">
        <span class="card-label font-weight-bolder text-dark">Trial Balance</span>
      </h3>
      <div class="card-toolbar">
        <div class="d-flex align-items-center">
          <div class="mr-3">
            <date-picker v-model="dateRange" range @change="generateTrialBalance" />
          </div>
          <button class="btn btn-primary mr-2" @click="handleExport('PDF')">
            <i class="fas fa-file-pdf mr-2"></i>
            Export PDF
          </button>
          <button class="btn btn-success" @click="handleExport('EXCEL')">
            <i class="fas fa-file-excel mr-2"></i>
            Export Excel
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
          <table class="table table-bordered">
            <thead>
              <tr>
                <th>Account Code</th>
                <th>Account Name</th>
                <th>Type</th>
                <th class="text-right">Debit</th>
                <th class="text-right">Credit</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="trialBalance.length === 0">
                <td colspan="5" align="center" class="text-muted">No Data</td>
              </tr>
              <tr v-for="item in trialBalance" :key="item.id">
                <td>{{ item.code }}</td>
                <td>{{ item.name }}</td>
                <td>
                  <span :class="getTypeClass(item.type)" class="label label-lg label-inline">
                    {{ item.type }}
                  </span>
                </td>
                <td class="text-right">{{ formatCurrency(item.debit) }}</td>
                <td class="text-right">{{ formatCurrency(item.credit) }}</td>
              </tr>
              <tr class="font-weight-bold">
                <td colspan="3" class="text-right">Total</td>
                <td class="text-right">{{ formatCurrency(totalDebit) }}</td>
                <td class="text-right">{{ formatCurrency(totalCredit) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import DatePicker from '@/components/DatePicker.vue';
import dayjs from 'dayjs';

export default {
  name: 'TrialBalance',
  components: {
    DatePicker,
  },
  data: () => ({
    dateRange: [dayjs().startOf('month').toDate(), dayjs().endOf('month').toDate()],
  }),
  computed: {
    ...mapGetters('account', ['trialBalance', 'loading']),
    totalDebit() {
      return this.trialBalance.reduce((sum, item) => sum + (item.debit || 0), 0);
    },
    totalCredit() {
      return this.trialBalance.reduce((sum, item) => sum + (item.credit || 0), 0);
    },
  },
  methods: {
    ...mapActions('account', ['fetchTrialBalance', 'exportReport']),
    async generateTrialBalance() {
      await this.fetchTrialBalance({
        startDate: dayjs(this.dateRange[0]).format('YYYY-MM-DD'),
        endDate: dayjs(this.dateRange[1]).format('YYYY-MM-DD'),
      });
    },
    formatCurrency(value) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(value || 0);
    },
    getTypeClass(type) {
      const classes = {
        ASSET: 'label-light-success',
        LIABILITY: 'label-light-danger',
        EQUITY: 'label-light-primary',
        INCOME: 'label-light-info',
        EXPENSE: 'label-light-warning',
      };
      return classes[type] || 'label-light-dark';
    },
    async handleExport(format) {
      try {
        await this.exportReport({
          data: this.trialBalance,
          format,
          type: 'trial-balance',
          startDate: dayjs(this.dateRange[0]).format('YYYY-MM-DD'),
          endDate: dayjs(this.dateRange[1]).format('YYYY-MM-DD'),
        });
      } catch (error) {
        this.$toast.error('Failed to export report');
      }
    },
  },
  created() {
    this.generateTrialBalance();
  },
};
</script>
