<template>
  <div class="prescription-stats">
    <div class="row">
      <!-- Total Prescriptions -->
      <div class="col-lg-3 col-md-6 mb-4">
        <div
          class="card card-custom bg-light-primary h-100 clickable-stat-card"
          @click="handleStatClick(null)"
        >
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="flex-grow-1">
                <h3 class="text-dark font-weight-bold mb-1">{{ stats.total || 0 }}</h3>
                <p class="text-muted mb-0">Total Prescriptions</p>
              </div>
              <div class="stat-icon">
                <i class="flaticon2-list text-primary icon-3x"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pending -->
      <div class="col-lg-3 col-md-6 mb-4">
        <div
          class="card card-custom bg-light-warning h-100 clickable-stat-card"
          @click="handleStatClick('Pending')"
        >
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="flex-grow-1">
                <h3 class="text-dark font-weight-bold mb-1">{{ stats.pending || 0 }}</h3>
                <p class="text-muted mb-0">Pending</p>
              </div>
              <div class="stat-icon">
                <i class="flaticon2-hourglass text-warning icon-3x"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Partial Dispense -->
      <div class="col-lg-3 col-md-6 mb-4">
        <div
          class="card card-custom bg-light-info h-100 clickable-stat-card"
          @click="handleStatClick('Partial Dispense')"
        >
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="flex-grow-1">
                <h3 class="text-dark font-weight-bold mb-1">{{ stats.partialDispense || 0 }}</h3>
                <p class="text-muted mb-0">Partial Dispense</p>
              </div>
              <div class="stat-icon">
                <i class="flaticon2-pie-chart text-info icon-3x"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Complete Dispense -->
      <div class="col-lg-3 col-md-6 mb-4">
        <div
          class="card card-custom bg-light-success h-100 clickable-stat-card"
          @click="handleStatClick('Complete Dispense')"
        >
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="flex-grow-1">
                <h3 class="text-dark font-weight-bold mb-1">{{ stats.completeDispense || 0 }}</h3>
                <p class="text-muted mb-0">Complete Dispense</p>
              </div>
              <div class="stat-icon">
                <i class="flaticon2-checkmark text-success icon-3x"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PrescriptionStats',
  props: {
    stats: {
      type: Object,
      default: () => ({
        total: 0,
        pending: 0,
        partialDispense: 0,
        completeDispense: 0,
      }),
    },
  },
  methods: {
    handleStatClick(status) {
      this.$emit('stat-click', status);
    },
  },
};
</script>

<style scoped>
.prescription-stats {
  margin-bottom: 2rem;
}

.clickable-stat-card {
  cursor: pointer;
  transition: all 0.3s ease;
}

.clickable-stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  opacity: 0.7;
}

.icon-3x {
  font-size: 3rem;
}

.card-body {
  padding: 1.5rem;
}
</style>
