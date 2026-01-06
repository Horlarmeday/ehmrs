<template>
  <div class="row mb-5">
    <div v-for="card in cards" :key="card.filterType" class="col-lg-3 col-md-6 col-sm-12 mb-4">
      <div
        class="card card-custom card-stretch gutter-b statistics-card"
        :class="{ 'statistics-card-active': activeFilter === card.filterType }"
        @click="handleCardClick(card.filterType)"
        style="cursor: pointer"
      >
        <div class="card-body">
          <div class="d-flex align-items-center justify-content-between">
            <div class="d-flex flex-column">
              <span class="text-muted font-weight-bold font-size-sm mb-2">{{ card.label }}</span>
              <div class="d-flex align-items-center">
                <span class="text-dark font-weight-bolder font-size-h2 mr-2">
                  <template v-if="loading">
                    <div class="spinner spinner-sm spinner-primary"></div>
                  </template>
                  <template v-else>
                    {{ formatValue(card.value, card) }}
                  </template>
                </span>
              </div>
            </div>
            <div class="ml-6">
              <div :class="`symbol symbol-50 symbol-light-${card.color}`">
                <div class="symbol-label">
                  <i :class="card.icon" :style="{ color: card.iconColor, fontSize: '24px' }"></i>
                </div>
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
  name: 'StatisticsCards',
  props: {
    statistics: {
      type: Object,
      default: () => null,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    activeFilter: {
      type: String,
      default: null,
    },
  },
  computed: {
    cards() {
      if (!this.statistics) {
        return this.getDefaultCards();
      }

      return [
        {
          label: 'Total Items',
          value: this.statistics.totalItems || 0,
          filterType: null,
          icon: 'fas fa-boxes',
          color: 'primary',
          iconColor: '#3699FF',
        },
        {
          label: 'Expiring Soon',
          value: this.statistics.expiringSoon || 0,
          filterType: 'expiring_soon',
          icon: 'fas fa-clock',
          color: 'warning',
          iconColor: '#FFA800',
        },
        {
          label: 'Low Stock',
          value: this.statistics.lowStock || 0,
          filterType: 'low_stock',
          icon: 'fas fa-exclamation-triangle',
          color: 'warning',
          iconColor: '#FFA800',
        },
        {
          label: 'Critical Stock',
          value: this.statistics.criticalStock || 0,
          filterType: 'critical_stock',
          icon: 'fas fa-exclamation-circle',
          color: 'danger',
          iconColor: '#F64E60',
        },
        {
          label: 'Total Valuations',
          value: this.statistics.totalValuations || 0,
          filterType: null,
          icon: 'fas fa-dollar-sign',
          color: 'success',
          iconColor: '#1BC5BD',
          isCurrency: true,
        },
        {
          label: 'Expired Items',
          value: this.statistics.expiredItems || 0,
          filterType: 'expired',
          icon: 'fas fa-ban',
          color: 'danger',
          iconColor: '#F64E60',
        },
        {
          label: 'Most Dispensed Item',
          value: this.statistics.mostDispensedItem?.drug_name || 'N/A',
          filterType: 'most_dispensed',
          icon: 'fas fa-star',
          color: 'info',
          iconColor: '#8950FC',
        },
        {
          label: 'Total Quantities',
          value: this.statistics.totalQuantities || 0,
          filterType: null,
          icon: 'fas fa-cubes',
          color: 'primary',
          iconColor: '#3699FF',
        },
      ];
    },
  },
  methods: {
    handleCardClick(filterType) {
      if (filterType) {
        this.$emit('card-clicked', filterType);
      }
    },
    formatValue(value, card) {
      // Handle currency values (Total Valuations)
      if (card.label === 'Total Valuations' && typeof value === 'number') {
        return `₦${Number(value).toLocaleString('en-NG', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;
      }

      // Handle most dispensed item (string value)
      if (typeof value === 'string') {
        return value;
      }

      // Handle numeric values
      return Number(value).toLocaleString('en-NG');
    },
    getDefaultCards() {
      return [
        {
          label: 'Total Items',
          value: 0,
          filterType: null,
          icon: 'fas fa-boxes',
          color: 'primary',
          iconColor: '#3699FF',
        },
        {
          label: 'Expiring Soon',
          value: 0,
          filterType: 'expiring_soon',
          icon: 'fas fa-clock',
          color: 'warning',
          iconColor: '#FFA800',
        },
        {
          label: 'Low Stock',
          value: 0,
          filterType: 'low_stock',
          icon: 'fas fa-exclamation-triangle',
          color: 'warning',
          iconColor: '#FFA800',
        },
        {
          label: 'Critical Stock',
          value: 0,
          filterType: 'critical_stock',
          icon: 'fas fa-exclamation-circle',
          color: 'danger',
          iconColor: '#F64E60',
        },
        {
          label: 'Total Valuations',
          value: 0,
          filterType: null,
          icon: 'fas fa-dollar-sign',
          color: 'success',
          iconColor: '#1BC5BD',
        },
        {
          label: 'Expired Items',
          value: 0,
          filterType: 'expired',
          icon: 'fas fa-ban',
          color: 'danger',
          iconColor: '#F64E60',
        },
        {
          label: 'Most Dispensed Item',
          value: 'N/A',
          filterType: 'most_dispensed',
          icon: 'fas fa-star',
          color: 'info',
          iconColor: '#8950FC',
        },
        {
          label: 'Total Quantities',
          value: 0,
          filterType: null,
          icon: 'fas fa-cubes',
          color: 'primary',
          iconColor: '#3699FF',
        },
      ];
    },
  },
};
</script>

<style scoped>
.statistics-card {
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.statistics-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
}

.statistics-card-active {
  border-color: #3699ff;
  box-shadow: 0 4px 12px rgba(54, 153, 255, 0.2);
}

.spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #3699ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
