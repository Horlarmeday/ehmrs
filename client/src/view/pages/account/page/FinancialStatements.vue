<template>
  <div class="card card-custom gutter-b">
    <div class="card-header py-5">
      <h3 class="card-title align-items-start flex-column">
        <span class="card-label font-weight-bolder text-dark">Financial Statements</span>
      </h3>
      <div class="card-toolbar">
        <div class="d-flex align-items-center">
          <div class="mr-3">
            <select class="form-control" v-model="selectedStatement" @change="generateStatement">
              <option value="income">Income Statement</option>
              <option value="balance">Balance Sheet</option>
              <option value="cashflow">Cash Flow Statement</option>
            </select>
          </div>
          <div class="mr-3">
            <date-picker v-model="dateRange" range @change="generateStatement" />
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
        <!-- Income Statement -->
        <div v-if="selectedStatement === 'income'" class="table-responsive">
          <table class="table table-bordered">
            <thead>
              <tr>
                <th colspan="2" class="text-center">Income Statement</th>
              </tr>
              <tr>
                <th>Description</th>
                <th class="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colspan="2" class="font-weight-bold">Revenue</td>
              </tr>
              <tr v-for="item in financialStatements.revenue" :key="item.id">
                <td>{{ item.name }}</td>
                <td class="text-right">{{ formatCurrency(item.amount) }}</td>
              </tr>
              <tr>
                <td class="font-weight-bold">Total Revenue</td>
                <td class="text-right font-weight-bold">{{ formatCurrency(totalRevenue) }}</td>
              </tr>
              <tr>
                <td colspan="2" class="font-weight-bold">Expenses</td>
              </tr>
              <tr v-for="item in financialStatements.expenses" :key="item.id">
                <td>{{ item.name }}</td>
                <td class="text-right">{{ formatCurrency(item.amount) }}</td>
              </tr>
              <tr>
                <td class="font-weight-bold">Total Expenses</td>
                <td class="text-right font-weight-bold">{{ formatCurrency(totalExpenses) }}</td>
              </tr>
              <tr>
                <td class="font-weight-bold">Net Income</td>
                <td class="text-right font-weight-bold" :class="netIncomeClass">
                  {{ formatCurrency(netIncome) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Balance Sheet -->
        <div v-if="selectedStatement === 'balance'" class="table-responsive">
          <table class="table table-bordered">
            <thead>
              <tr>
                <th colspan="2" class="text-center">Balance Sheet</th>
              </tr>
              <tr>
                <th>Description</th>
                <th class="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colspan="2" class="font-weight-bold">Assets</td>
              </tr>
              <tr v-for="item in financialStatements.assets" :key="item.id">
                <td>{{ item.name }}</td>
                <td class="text-right">{{ formatCurrency(item.amount) }}</td>
              </tr>
              <tr>
                <td class="font-weight-bold">Total Assets</td>
                <td class="text-right font-weight-bold">{{ formatCurrency(totalAssets) }}</td>
              </tr>
              <tr>
                <td colspan="2" class="font-weight-bold">Liabilities</td>
              </tr>
              <tr v-for="item in financialStatements.liabilities" :key="item.id">
                <td>{{ item.name }}</td>
                <td class="text-right">{{ formatCurrency(item.amount) }}</td>
              </tr>
              <tr>
                <td class="font-weight-bold">Total Liabilities</td>
                <td class="text-right font-weight-bold">{{ formatCurrency(totalLiabilities) }}</td>
              </tr>
              <tr>
                <td colspan="2" class="font-weight-bold">Equity</td>
              </tr>
              <tr v-for="item in financialStatements.equity" :key="item.id">
                <td>{{ item.name }}</td>
                <td class="text-right">{{ formatCurrency(item.amount) }}</td>
              </tr>
              <tr>
                <td class="font-weight-bold">Total Equity</td>
                <td class="text-right font-weight-bold">{{ formatCurrency(totalEquity) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Cash Flow Statement -->
        <div v-if="selectedStatement === 'cashflow'" class="table-responsive">
          <table class="table table-bordered">
            <thead>
              <tr>
                <th colspan="2" class="text-center">Cash Flow Statement</th>
              </tr>
              <tr>
                <th>Description</th>
                <th class="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colspan="2" class="font-weight-bold">Operating Activities</td>
              </tr>
              <tr v-for="item in financialStatements.operating" :key="item.id">
                <td>{{ item.name }}</td>
                <td class="text-right">{{ formatCurrency(item.amount) }}</td>
              </tr>
              <tr>
                <td class="font-weight-bold">Net Cash from Operations</td>
                <td class="text-right font-weight-bold">{{ formatCurrency(netOperatingCash) }}</td>
              </tr>
              <tr>
                <td colspan="2" class="font-weight-bold">Investing Activities</td>
              </tr>
              <tr v-for="item in financialStatements.investing" :key="item.id">
                <td>{{ item.name }}</td>
                <td class="text-right">{{ formatCurrency(item.amount) }}</td>
              </tr>
              <tr>
                <td class="font-weight-bold">Net Cash from Investing</td>
                <td class="text-right font-weight-bold">{{ formatCurrency(netInvestingCash) }}</td>
              </tr>
              <tr>
                <td colspan="2" class="font-weight-bold">Financing Activities</td>
              </tr>
              <tr v-for="item in financialStatements.financing" :key="item.id">
                <td>{{ item.name }}</td>
                <td class="text-right">{{ formatCurrency(item.amount) }}</td>
              </tr>
              <tr>
                <td class="font-weight-bold">Net Cash from Financing</td>
                <td class="text-right font-weight-bold">{{ formatCurrency(netFinancingCash) }}</td>
              </tr>
              <tr>
                <td class="font-weight-bold">Net Change in Cash</td>
                <td class="text-right font-weight-bold" :class="netCashChangeClass">
                  {{ formatCurrency(netCashChange) }}
                </td>
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
  name: 'FinancialStatements',
  components: {
    DatePicker,
  },
  data: () => ({
    selectedStatement: 'income',
    dateRange: [dayjs().startOf('month').toDate(), dayjs().endOf('month').toDate()],
  }),
  computed: {
    ...mapGetters('account', ['financialStatements', 'loading']),
    totalRevenue() {
      return this.financialStatements.revenue?.reduce((sum, item) => sum + item.amount, 0) || 0;
    },
    totalExpenses() {
      return this.financialStatements.expenses?.reduce((sum, item) => sum + item.amount, 0) || 0;
    },
    netIncome() {
      return this.totalRevenue - this.totalExpenses;
    },
    netIncomeClass() {
      return this.netIncome >= 0 ? 'text-success' : 'text-danger';
    },
    totalAssets() {
      return this.financialStatements.assets?.reduce((sum, item) => sum + item.amount, 0) || 0;
    },
    totalLiabilities() {
      return this.financialStatements.liabilities?.reduce((sum, item) => sum + item.amount, 0) || 0;
    },
    totalEquity() {
      return this.financialStatements.equity?.reduce((sum, item) => sum + item.amount, 0) || 0;
    },
    netOperatingCash() {
      return this.financialStatements.operating?.reduce((sum, item) => sum + item.amount, 0) || 0;
    },
    netInvestingCash() {
      return this.financialStatements.investing?.reduce((sum, item) => sum + item.amount, 0) || 0;
    },
    netFinancingCash() {
      return this.financialStatements.financing?.reduce((sum, item) => sum + item.amount, 0) || 0;
    },
    netCashChange() {
      return this.netOperatingCash + this.netInvestingCash + this.netFinancingCash;
    },
    netCashChangeClass() {
      return this.netCashChange >= 0 ? 'text-success' : 'text-danger';
    },
  },
  methods: {
    ...mapActions('account', ['generateFinancialStatement', 'exportReport']),
    async generateStatement() {
      try {
        await this.generateFinancialStatement({
          type: this.selectedStatement,
          startDate: dayjs(this.dateRange[0]).format('YYYY-MM-DD'),
          endDate: dayjs(this.dateRange[1]).format('YYYY-MM-DD'),
        });
      } catch (error) {
        this.$notify({
          group: 'foo',
          title: 'Error',
          text: 'Failed to generate statement',
          type: 'error',
        });
      }
    },
    formatCurrency(value) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'NGN',
      }).format(value || 0);
    },
    async handleExport(format) {
      try {
        const data = await this.exportReport({
          data: this.financialStatements,
          format,
          type: this.selectedStatement,
          startDate: dayjs(this.dateRange[0]).format('YYYY-MM-DD'),
          endDate: dayjs(this.dateRange[1]).format('YYYY-MM-DD'),
        });

        const url = window.URL.createObjectURL(new Blob([data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute(
          'download',
          `${this.selectedStatement}-statement.${format.toLowerCase()}`
        );
        document.body.appendChild(link);
        link.click();
        link.remove();
      } catch (error) {
        this.$notify({
          group: 'foo',
          title: 'Error',
          text: 'Failed to export report',
          type: 'error',
        });
      }
    },
  },
  created() {
    this.generateStatement();
  },
};
</script>
