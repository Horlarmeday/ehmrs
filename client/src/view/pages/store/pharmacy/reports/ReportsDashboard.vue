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
        <div class="card card-custom card-stretch gutter-b">
          <div class="card-body">
            <div class="d-flex align-items-center justify-content-between">
              <div class="d-flex flex-column">
                <h4 class="text-dark font-weight-bold mb-3">{{ action.title }}</h4>
                <p class="text-muted mb-0">{{ action.description }}</p>
              </div>
              <div class="ml-6">
                <router-link :to="action.route" class="btn btn-light-primary font-weight-bold">
                  View Report
                </router-link>
              </div>
            </div>
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
            <div class="timeline timeline-3">
              <div class="timeline-item" v-for="(activity, index) in recentActivity" :key="index">
                <div class="timeline-media">
                  <i :class="activity.icon" :style="{ color: activity.color }"></i>
                </div>
                <div class="timeline-content">
                  <div class="d-flex align-items-center justify-content-between mb-2">
                    <span class="text-dark font-weight-bold">{{ activity.title }}</span>
                    <span class="text-muted font-size-sm">{{
                      formatDate(activity.timestamp)
                    }}</span>
                  </div>
                  <p class="text-muted mb-0">{{ activity.description }}</p>
                </div>
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
import OverviewCard from '@/components/OverviewCard.vue';
import QuickActionCard from '@/components/QuickActionCard.vue';
import RecentActivityItem from '@/components/RecentActivityItem.vue';

export default {
  name: 'ReportsDashboard',
  components: {
    OverviewCard,
    QuickActionCard,
    RecentActivityItem,
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
    };
  },
  computed: {
    ...mapState('store', ['dashboardOverview']),
    overviewCards() {
      if (!this.dashboardOverview) {
        return [
          {
            title: 'Total Revenue',
            value: '₦0',
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
        return {
          todayRevenue: '₦0',
          todayDispensed: 0,
          pendingOrders: 0,
          criticalStock: 0,
        };
      }
      return {
        todayRevenue: `₦${this.dashboardOverview.todayRevenue?.toLocaleString() || '0'}`,
        todayDispensed: this.dashboardOverview.todayDispensed || 0,
        pendingOrders: this.dashboardOverview.pendingOrders || 0,
        criticalStock: this.dashboardOverview.criticalStock || 0,
      };
    },
    recentActivity() {
      return this.dashboardOverview?.recentActivity || [];
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
