<template>
  <div class="reports-dashboard">
    <!-- Header Section -->
    <div class="d-flex justify-content-between align-items-center mb-8">
      <div>
        <h1 class="text-dark font-weight-bold mb-3">Pharmacy Reports Dashboard</h1>
        <p class="text-muted">Comprehensive analytics and insights for pharmacy operations</p>
      </div>
      <div class="d-flex">
        <button class="btn btn-light-primary mr-3" @click="refreshData">
          <i class="fas fa-sync-alt"></i> Refresh
        </button>
        <ExportButton :reports="availableReports" />
      </div>
    </div>

    <!-- Overview Cards -->
    <div class="row mb-8">
      <div
        class="col-xl-3 col-lg-6 col-md-6 mb-6"
        v-for="(card, index) in overviewCards"
        :key="index"
      >
        <ReportCard
          :title="card.title"
          :value="card.value"
          :change="card.change"
          :icon="card.icon"
          :color="card.color"
          :loading="loading"
        />
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="row mb-8">
      <div class="col-lg-6 col-xl-4 mb-6" v-for="(action, i) in quickActions" :key="i">
        <div class="card h-100 shadow-sm">
          <div class="card-body text-center">
            <i :class="`fas fa-${action.icon} fa-2x text-primary mb-3`"></i>
            <h5 class="card-title">{{ action.title }}</h5>
            <p class="card-text text-muted">{{ action.description }}</p>
            <router-link :to="action.route" class="btn btn-primary btn-sm">
              View Report
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="row">
      <div class="col-lg-8">
        <div class="card card-custom card-stretch gutter-b">
          <div class="card-header border-0 pt-5">
            <h3 class="card-title align-items-start flex-column">
              <span class="card-label font-weight-bolder text-dark">Recent Activity</span>
              <span class="text-muted mt-3 font-weight-bold font-size-sm"
                >Latest pharmacy operations</span
              >
            </h3>
          </div>
          <div class="card-body pt-2">
            <div class="list-group">
              <div
                v-for="activity in recentActivity"
                :key="activity.id"
                class="list-group-item d-flex justify-content-between align-items-center"
              >
                <div>
                  <h6 class="mb-1">{{ activity.title }}</h6>
                  <p class="mb-1 text-muted">{{ activity.description }}</p>
                  <small class="text-muted">{{ formatDate(activity.timestamp) }}</small>
                </div>
                <span class="badge badge-primary badge-pill">{{ activity.type }}</span>
              </div>
              <div v-if="recentActivity.length === 0" class="text-center py-4 text-muted">
                No recent activity
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-lg-4">
        <div class="card card-custom card-stretch gutter-b">
          <div class="card-header border-0 pt-5">
            <h3 class="card-title align-items-start flex-column">
              <span class="card-label font-weight-bolder text-dark">Quick Stats</span>
              <span class="text-muted mt-3 font-weight-bold font-size-sm">Key metrics</span>
            </h3>
          </div>
          <div class="card-body pt-2">
            <div
              class="d-flex align-items-center mb-6"
              v-for="(stat, index) in quickStats"
              :key="index"
            >
              <div class="symbol symbol-40 symbol-light mr-5">
                <span class="symbol-label">
                  <i :class="stat.icon" :style="{ color: stat.color }"></i>
                </span>
              </div>
              <div class="d-flex flex-column flex-grow-1">
                <span class="text-dark font-weight-bold font-size-lg">{{ stat.value }}</span>
                <span class="text-muted font-weight-bold">{{ stat.label }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import ReportCard from './components/ReportCard.vue';
import ExportButton from './components/ExportButton.vue';

export default {
  name: 'ReportsDashboard',
  components: {
    ReportCard,
    ExportButton,
  },
  data() {
    return {
      quickActions: [
        {
          title: 'Generate Sales Report',
          description: 'Create detailed sales analytics',
          icon: 'bar-chart-3',
          route: '/store/pharmacy/reports/sales',
        },
        {
          title: 'Stock Level Report',
          description: 'Monitor inventory levels',
          icon: 'package',
          route: '/store/pharmacy/reports/stock-level',
        },
        {
          title: 'Expiry Report',
          description: 'Track expiring medications',
          icon: 'clock',
          route: '/store/pharmacy/reports/expiry',
        },
        {
          title: 'Vendor Performance',
          description: 'Analyze supplier metrics',
          icon: 'users',
          route: '/store/pharmacy/reports/vendor-performance',
        },
      ],
      isLoading: false,
      availableReports: [
        { id: 'sales', name: 'Sales Report', type: 'sales' },
        { id: 'inventory', name: 'Inventory Report', type: 'inventory' },
        { id: 'stock-levels', name: 'Stock Levels Report', type: 'stock-levels' },
        { id: 'expiry', name: 'Expiry Report', type: 'expiry' },
        { id: 'vendor-performance', name: 'Vendor Performance Report', type: 'vendor-performance' },
      ],
    };
  },
  computed: {
    ...mapState('store', ['dashboardOverview']),
    overviewCards() {
      if (!this.dashboardOverview) {
        return [
          {
            title: 'Total Revenue',
            value: '₦10',
            change: '+0%',
            changeType: 'positive',
            icon: 'trending-up',
          },
          {
            title: 'Items Dispensed',
            value: '0',
            change: '+0%',
            changeType: 'positive',
            icon: 'package',
          },
          {
            title: 'Low Stock Items',
            value: '0',
            change: '0%',
            changeType: 'neutral',
            icon: 'alert-triangle',
          },
          {
            title: 'Expired Items',
            value: '0',
            change: '-0%',
            changeType: 'negative',
            icon: 'clock',
          },
        ];
      }
      return [
        {
          title: 'Total Revenue',
          value: `₦${this.dashboardOverview.totalRevenue?.toLocaleString() || '0'}`,
          change: `${this.dashboardOverview.revenueChange || 0}%`,
          changeType: this.dashboardOverview.revenueChange >= 0 ? 'positive' : 'negative',
          icon: 'trending-up',
        },
        {
          title: 'Items Dispensed',
          value: this.dashboardOverview.itemsDispensed?.toLocaleString() || '0',
          change: `${this.dashboardOverview.dispensedChange || 0}%`,
          changeType: this.dashboardOverview.dispensedChange >= 0 ? 'positive' : 'negative',
          icon: 'package',
        },
        {
          title: 'Low Stock Items',
          value: this.dashboardOverview.lowStockItems?.toLocaleString() || '0',
          change: `${this.dashboardOverview.lowStockChange || 0}%`,
          changeType: this.dashboardOverview.lowStockChange <= 0 ? 'positive' : 'negative',
          icon: 'alert-triangle',
        },
        {
          title: 'Expired Items',
          value: this.dashboardOverview.expiredItems?.toLocaleString() || '0',
          change: `${this.dashboardOverview.expiredChange || 0}%`,
          changeType: this.dashboardOverview.expiredChange <= 0 ? 'positive' : 'negative',
          icon: 'clock',
        },
      ];
    },
    quickStats() {
      if (!this.dashboardOverview) {
        return [
          { label: 'Today Revenue', value: '₦0', icon: 'fas fa-chart-line', color: '#1BC5BD' },
          { label: 'Items Dispensed', value: '0', icon: 'fas fa-pills', color: '#8950FC' },
          { label: 'Pending Orders', value: '0', icon: 'fas fa-clock', color: '#FFA800' },
          {
            label: 'Critical Stock',
            value: '0',
            icon: 'fas fa-exclamation-triangle',
            color: '#F64E60',
          },
        ];
      }
      return [
        {
          label: 'Today Revenue',
          value: `₦${this.dashboardOverview.todayRevenue?.toLocaleString() || '0'}`,
          icon: 'fas fa-chart-line',
          color: '#1BC5BD',
        },
        {
          label: 'Items Dispensed',
          value: this.dashboardOverview.todayDispensed?.toLocaleString() || '0',
          icon: 'fas fa-pills',
          color: '#8950FC',
        },
        {
          label: 'Pending Orders',
          value: this.dashboardOverview.pendingOrders?.toLocaleString() || '0',
          icon: 'fas fa-clock',
          color: '#FFA800',
        },
        {
          label: 'Critical Stock',
          value: this.dashboardOverview.criticalStock?.toLocaleString() || '0',
          icon: 'fas fa-exclamation-triangle',
          color: '#F64E60',
        },
      ];
    },
    recentActivity() {
      return this.dashboardOverview?.recentActivity || [];
    },
    loading() {
      return this.isLoading;
    },
  },
  methods: {
    ...mapActions('store', ['fetchDashboardOverview']),
    async loadDashboardData() {
      this.isLoading = true;
      try {
        await this.fetchDashboardOverview({
          period: 'today',
        });
      } catch (error) {
        this.$toast.error('Error loading dashboard data');
        console.error('Error loading dashboard data:', error);
      } finally {
        this.isLoading = false;
      }
    },
    async refreshData() {
      await this.loadDashboardData();
    },
    formatDate(timestamp) {
      if (!timestamp) return '';
      return new Date(timestamp).toLocaleString();
    },
  },
  async mounted() {
    await this.loadDashboardData();
  },
};
</script>

<style scoped>
.reports-dashboard {
  padding: 0;
}

.timeline-3 .timeline-item {
  display: flex;
  margin-bottom: 1.5rem;
}

.timeline-3 .timeline-media {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f3f6f9;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  flex-shrink: 0;
}

.timeline-3 .timeline-content {
  flex: 1;
}
</style>
