<template>
  <div class="bed-stats">
    <div class="row">
      <!-- Total Beds -->
      <div class="col-lg-3 col-md-6 mb-3">
        <div class="card stats-card border-primary">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="stats-icon bg-primary text-white">
                <i class="fas fa-bed"></i>
              </div>
              <div class="stats-content ml-3">
                <h4 class="stats-number mb-0">{{ stats.total }}</h4>
                <p class="stats-label mb-0">Total Beds</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Available Beds -->
      <div class="col-lg-3 col-md-6 mb-3">
        <div class="card stats-card border-success">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="stats-icon bg-success text-white">
                <i class="fas fa-check-circle"></i>
              </div>
              <div class="stats-content ml-3">
                <h4 class="stats-number mb-0">{{ stats.available }}</h4>
                <p class="stats-label mb-0">Available</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Occupied Beds -->
      <div class="col-lg-3 col-md-6 mb-3">
        <div class="card stats-card border-danger">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="stats-icon bg-danger text-white">
                <i class="fas fa-user"></i>
              </div>
              <div class="stats-content ml-3">
                <h4 class="stats-number mb-0">{{ stats.occupied }}</h4>
                <p class="stats-label mb-0">Occupied</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Utilization Rate -->
      <div class="col-lg-3 col-md-6 mb-3">
        <div class="card stats-card border-info">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="stats-icon bg-info text-white">
                <i class="fas fa-chart-pie"></i>
              </div>
              <div class="stats-content ml-3">
                <h4 class="stats-number mb-0">{{ stats.utilization }}%</h4>
                <p class="stats-label mb-0">Utilization</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Utilization Progress Bar -->
    <div class="row mt-3" v-if="stats.total > 0">
      <div class="col-12">
        <div class="card">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <h6 class="mb-0">Bed Utilization Overview</h6>
              <span class="text-muted"
                >{{ stats.occupied }} of {{ stats.total }} beds occupied</span
              >
            </div>
            <div class="progress" style="height: 8px">
              <div
                class="progress-bar bg-success"
                :style="{ width: availablePercentage + '%' }"
                :title="stats.available + ' available beds'"
              ></div>
              <div
                class="progress-bar bg-danger"
                :style="{ width: occupiedPercentage + '%' }"
                :title="stats.occupied + ' occupied beds'"
              ></div>
            </div>
            <div class="d-flex justify-content-between mt-2">
              <small class="text-success">
                <i class="fas fa-circle mr-1"></i>
                Available ({{ stats.available }})
              </small>
              <small class="text-danger">
                <i class="fas fa-circle mr-1"></i>
                Occupied ({{ stats.occupied }})
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BedStats',
  props: {
    stats: {
      type: Object,
      required: true,
      default: () => ({
        total: 0,
        available: 0,
        occupied: 0,
        utilization: 0,
      }),
    },
  },
  computed: {
    availablePercentage() {
      if (this.stats.total === 0) return 0;
      return Math.round((this.stats.available / this.stats.total) * 100);
    },

    occupiedPercentage() {
      if (this.stats.total === 0) return 0;
      return Math.round((this.stats.occupied / this.stats.total) * 100);
    },
  },
};
</script>

<style scoped>
.bed-stats {
  margin-bottom: 1.5rem;
}

.stats-card {
  border-radius: 8px;
  transition: transform 0.2s ease;
}

.stats-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stats-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.stats-number {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2c3e50;
}

.stats-label {
  font-size: 0.9rem;
  color: #6c757d;
  font-weight: 500;
}

.progress {
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar {
  transition: width 0.3s ease;
}

.card {
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
