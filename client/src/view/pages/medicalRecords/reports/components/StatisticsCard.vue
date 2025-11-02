<template>
  <div class="statistics-card">
    <b-card :class="cardClass" class="h-100">
      <div class="d-flex align-items-center">
        <div class="stat-icon mr-4">
          <div :class="iconCircleClass">
            <i :class="icon"></i>
          </div>
        </div>
        <div class="stat-content flex-grow-1">
          <h3 class="stat-value mb-1" :class="valueClass">
            {{ formattedValue }}
          </h3>
          <p class="stat-label text-muted mb-0">{{ label }}</p>
          <small v-if="subtitle" class="stat-subtitle" :class="subtitleClass">
            <i :class="subtitleIcon"></i>
            {{ subtitle }}
          </small>
        </div>
      </div>
    </b-card>
  </div>
</template>

<script>
export default {
  name: 'StatisticsCard',
  props: {
    label: {
      type: String,
      required: true,
    },
    value: {
      type: [Number, String],
      required: true,
    },
    icon: {
      type: String,
      default: 'flaticon2-chart',
    },
    variant: {
      type: String,
      default: 'primary',
      validator: (value) => ['primary', 'success', 'warning', 'danger', 'info'].includes(value),
    },
    subtitle: {
      type: String,
      default: null,
    },
    subtitleVariant: {
      type: String,
      default: 'success',
    },
    subtitleIcon: {
      type: String,
      default: 'flaticon2-arrow-up',
    },
    format: {
      type: String,
      default: 'number',
      validator: (value) => ['number', 'currency', 'percentage'].includes(value),
    },
  },
  computed: {
    cardClass() {
      return `card-custom bg-light-${this.variant}`;
    },
    iconCircleClass() {
      return `icon-circle icon-circle-${this.variant}`;
    },
    valueClass() {
      return `text-${this.variant}`;
    },
    subtitleClass() {
      return `text-${this.subtitleVariant}`;
    },
    formattedValue() {
      if (this.format === 'currency') {
        return `$${this.formatNumber(this.value)}`;
      } else if (this.format === 'percentage') {
        return `${this.value}%`;
      }
      return this.formatNumber(this.value);
    },
  },
  methods: {
    formatNumber(num) {
      if (typeof num === 'string') return num;
      return num.toLocaleString();
    },
  },
};
</script>

<style scoped>
.statistics-card {
  height: 100%;
}

.stat-icon {
  flex-shrink: 0;
}

.icon-circle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.icon-circle-primary {
  background-color: rgba(13, 110, 253, 0.1);
  color: #0d6efd;
}

.icon-circle-success {
  background-color: rgba(25, 135, 84, 0.1);
  color: #198754;
}

.icon-circle-warning {
  background-color: rgba(255, 193, 7, 0.1);
  color: #ffc107;
}

.icon-circle-danger {
  background-color: rgba(220, 53, 69, 0.1);
  color: #dc3545;
}

.icon-circle-info {
  background-color: rgba(13, 202, 240, 0.1);
  color: #0dcaf0;
}

.stat-value {
  font-size: 2rem;
  font-weight: 600;
  line-height: 1.2;
}

.stat-label {
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.stat-subtitle {
  font-size: 0.75rem;
  margin-top: 0.25rem;
  display: block;
}
</style>
