<template>
  <div>
    <h3 class="card-title align-items-start">
      <span class="card-label font-weight-bolder text-dark">Drug Prescriptions</span>
    </h3>

    <!-- Statistics Cards -->
    <div class="row mb-6" v-if="!loadingStats">
      <div
        class="col-xl-3 col-lg-6 col-md-6 mb-4"
        v-for="(stat, index) in statisticsCards"
        :key="index"
      >
        <div class="statistics-card" :class="`statistics-card-${stat.color}`">
          <div class="statistics-card-body">
            <div class="d-flex align-items-center justify-content-between">
              <div class="d-flex flex-column flex-grow-1">
                <span class="statistics-card-label">{{ stat.label }}</span>
                <span class="statistics-card-value">{{ stat.value }}</span>
              </div>
              <div class="statistics-card-icon">
                <i :class="stat.icon"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading Skeleton for Statistics -->
    <div class="row mb-6" v-else>
      <div class="col-xl-3 col-lg-6 col-md-6 mb-4" v-for="n in 4" :key="n">
        <div class="statistics-card statistics-card-skeleton">
          <div class="statistics-card-body">
            <div class="d-flex align-items-center justify-content-between">
              <div class="d-flex flex-column flex-grow-1">
                <div class="skeleton-line skeleton-line-sm mb-2"></div>
                <div class="skeleton-line skeleton-line-lg"></div>
              </div>
              <div class="skeleton-circle"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="header-top mb-6">
      <div class="container white">
        <div class="d-none d-lg-flex align-items-center mr-3">
          <ul class="header-tabs nav align-self-end font-size-lg" role="tablist">
            <li class="nav-item mr-1" v-for="(tab, index) in tabs" :key="index">
              <a
                class="nav-link text-dark py-4 px-6"
                :class="{
                  active: tabIndex === index,
                  disabled: tabIndex === index,
                }"
                @click="setActiveTab($event, tab.period)"
                :data-tab="index"
                data-toggle="tab"
                href="#"
                role="tab"
                aria-selected="true"
                >{{ tab.name }}</a
              >
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="card-body">
        <prescriptions-table :period="period" />
      </div>
    </div>
  </div>
</template>
<script>
import PrescriptionsTable from '@/view/pages/pharmacy/prescriptions/PrescriptionsTable.vue';
import { mapState, mapActions } from 'vuex';

export default {
  components: { PrescriptionsTable },
  data: () => ({
    tabIndex: 0,
    period: 'Today',
    loadingStats: false,
    tabs: [
      {
        name: 'Today',
        period: 'Today',
        showComponent: true,
      },
      {
        name: 'Backlog',
        period: 'Backlog',
        showComponent: true,
      },
    ],
  }),
  computed: {
    ...mapState('pharmacy', ['prescriptionStatistics']),
    statisticsCards() {
      const stats = this.prescriptionStatistics;
      return [
        {
          label: 'Total Prescriptions',
          value: stats.total || 0,
          icon: 'flaticon2-list-2',
          color: 'primary',
        },
        {
          label: 'Pending',
          value: stats.pending || 0,
          icon: 'flaticon2-hourglass',
          color: 'warning',
        },
        {
          label: 'Partial Dispense',
          value: stats.partialDispense || 0,
          icon: 'flaticon2-pie-chart',
          color: 'info',
        },
        {
          label: 'Complete Dispense',
          value: stats.completeDispense || 0,
          icon: 'flaticon2-check-mark',
          color: 'success',
        },
      ];
    },
  },
  methods: {
    ...mapActions('pharmacy', ['fetchPrescriptionStatistics']),
    async loadStatistics() {
      this.loadingStats = true;
      try {
        await this.fetchPrescriptionStatistics({ period: this.period });
      } catch (error) {
        console.error('Failed to fetch prescription statistics:', error);
      } finally {
        this.loadingStats = false;
      }
    },
    setActiveTab(event, period) {
      let target = event.target;
      if (!event.target.classList.contains('nav-link')) {
        target = event.target.closest('.nav-link');
      }

      const tab = target.closest('[role="tablist"]');
      const links = tab.querySelectorAll('.nav-link');
      // remove active tab links
      for (let i = 0; i < links.length; i++) {
        links[i].classList.remove('active');
        links[i].removeAttribute('disabled');
      }

      // set clicked tab index to bootstrap tab
      this.tabIndex = parseInt(target.getAttribute('data-tab'));

      // set current active tab
      target.classList.add('active');
      target.setAttribute('disabled', true);

      this.period = period;

      this.$router.push({
        query: {
          period,
          tabIndex: this.tabIndex,
        },
      });

      // Reload statistics when period changes
      this.loadStatistics();
    },

    getActiveTab() {
      const storedPeriod = this.$route.query.period;
      const storedTabIndex = this.$route.query.tabIndex;
      if (storedPeriod && storedTabIndex) {
        this.period = storedPeriod;
        this.tabIndex = parseInt(storedTabIndex);
      } else {
        this.period = 'Today';
        this.tabIndex = 0;
      }
    },
  },
  watch: {
    period() {
      this.loadStatistics();
    },
  },
  created() {
    this.getActiveTab();
    this.loadStatistics();
  },
};
</script>
<style scoped>
.white {
  background-color: white;
}
.nav-item .nav-link.active {
  background-color: #a9a9a961 !important;
}

/* Statistics Cards */
.statistics-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  overflow: hidden;
  height: 100%;
}

.statistics-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
}

.statistics-card-body {
  padding: 24px;
  position: relative;
}

.statistics-card-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.statistics-card-warning {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.statistics-card-info {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.statistics-card-success {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: white;
}

.statistics-card-label {
  font-size: 14px;
  font-weight: 500;
  opacity: 0.9;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.statistics-card-value {
  font-size: 32px;
  font-weight: 700;
  line-height: 1.2;
}

.statistics-card-icon {
  font-size: 48px;
  opacity: 0.3;
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
}

.statistics-card-icon i {
  font-size: 48px;
}

/* Loading Skeleton */
.statistics-card-skeleton {
  background: #f5f8fa;
  border: 1px solid #e1e8ed;
}

.skeleton-line {
  background: linear-gradient(90deg, #e1e8ed 25%, #f5f8fa 50%, #e1e8ed 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
  border-radius: 4px;
}

.skeleton-line-sm {
  height: 14px;
  width: 60%;
}

.skeleton-line-lg {
  height: 32px;
  width: 80%;
}

.skeleton-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(90deg, #e1e8ed 25%, #f5f8fa 50%, #e1e8ed 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
