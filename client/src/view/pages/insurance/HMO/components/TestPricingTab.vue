<template>
  <div class="test-pricing-tab">
    <div class="card card-custom gutter-b">
      <div class="card-header border-0 py-4">
        <h4 class="card-title font-weight-bolder text-dark">
          <i class="fas fa-flask text-info mr-2"></i>
          Laboratory Test Pricing
        </h4>
        <div class="card-toolbar">
          <button
            class="btn btn-info btn-sm font-weight-bold"
            @click="$emit('open-create-modal', 'tests')"
          >
            <i class="fas fa-plus mr-2"></i>Add Test Pricing
          </button>
        </div>
      </div>
      <div class="card-body py-0">
        <div class="table-responsive">
          <table class="table table-head-custom table-vertical-center">
            <thead>
              <tr class="text-left">
                <th class="pl-4" style="min-width: 200px">
                  <span class="text-dark-75 font-weight-bolder">Test Name</span>
                </th>
                <th style="min-width: 120px">
                  <span class="text-dark-75 font-weight-bolder">Insurance Provider</span>
                </th>
                <th style="min-width: 100px">
                  <span class="text-dark-75 font-weight-bolder">HMO Price (₦)</span>
                </th>
                <th style="min-width: 100px">
                  <span class="text-dark-75 font-weight-bolder">Patient %</span>
                </th>
                <th style="min-width: 100px">
                  <span class="text-dark-75 font-weight-bolder">HMO %</span>
                </th>
                <th style="min-width: 120px">
                  <span class="text-dark-75 font-weight-bolder">Effective From</span>
                </th>
                <th style="min-width: 120px">
                  <span class="text-dark-75 font-weight-bolder">Effective To</span>
                </th>
                <th style="min-width: 80px">
                  <span class="text-dark-75 font-weight-bolder">Status</span>
                </th>
                <th class="pr-0 text-right" style="min-width: 120px">
                  <span class="text-dark-75 font-weight-bolder">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="pricing.length === 0">
                <td colspan="9" class="text-center py-8">
                  <div class="text-muted">
                    <i class="fas fa-flask fa-3x mb-3"></i>
                    <p class="font-size-lg">No test pricing found</p>
                    <p class="font-size-sm">Click "Add Test Pricing" to get started</p>
                  </div>
                </td>
              </tr>
              <tr v-for="item in pricing" :key="item.id" class="pricing-row">
                <td class="pl-4">
                  <div class="d-flex align-items-center">
                    <div class="symbol symbol-40 symbol-light-info mr-4">
                      <span class="symbol-label">
                        <i class="fas fa-flask text-info"></i>
                      </span>
                    </div>
                    <div>
                      <span
                        class="text-dark-75 font-weight-bolder text-hover-primary mb-1 font-size-lg"
                      >
                        {{ item.test.name }}
                      </span>
                      <span class="text-muted d-block font-size-sm">{{ item.test_code }}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span :class="getHMOStatusClass(getInsuranceName(item.insurance_id))">
                    {{ item.hmo.name }}
                  </span>
                </td>
                <td>
                  <span class="text-dark-75 font-weight-bolder font-size-lg">
                    ₦{{ formatPrice(item.hmo_price) }}
                  </span>
                </td>
                <td>
                  <span class="text-dark-75 font-weight-bolder font-size-lg">
                    {{ item.patient_percentage }}%
                  </span>
                </td>
                <td>
                  <span class="text-dark-75 font-weight-bolder font-size-lg">
                    {{ item.hmo_percentage }}%
                  </span>
                </td>
                <td>
                  <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                    {{ formatDate(item.effective_from) }}
                  </span>
                </td>
                <td>
                  <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                    {{ formatDate(item.effective_to) }}
                  </span>
                </td>
                <td>
                  <span :class="getStatusClass(item.status)">
                    {{ item.status }}
                  </span>
                </td>
                <td class="pr-0 text-right">
                  <div class="btn-group" role="group">
                    <button
                      class="btn btn-icon btn-light btn-hover-primary btn-sm mx-1"
                      @click="$emit('editPricing', item)"
                      title="Edit"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                    <button
                      class="btn btn-icon btn-light btn-hover-danger btn-sm mx-1"
                      @click="$emit('deletePricing', item.id)"
                      title="Delete"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
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
export default {
  name: 'TestPricingTab',
  props: {
    pricing: {
      type: Array,
      default: () => [],
    },
    hmoProviders: {
      type: Array,
      default: () => [],
    },
  },
  methods: {
    getHMOStatusClass(provider) {
      const classes = {
        NHIS: 'label label-lg label-light-primary label-inline',
        FHSS: 'label label-lg label-light-info label-inline',
        PHIS: 'label label-lg label-light-warning label-inline',
        Retainership: 'label label-lg label-light-success label-inline',
      };
      return classes[provider] || 'label label-lg label-light-dark label-inline';
    },

    getInsuranceName(id) {
      const insurance = this.hmoProviders.find(p => p.id === id);
      return insurance ? insurance.name : 'Unknown';
    },

    getStatusClass(status) {
      const classes = {
        Active: 'label label-lg label-light-success label-inline',
        Inactive: 'label label-lg label-light-danger label-inline',
      };
      return classes[status] || 'label label-lg label-light-dark label-inline';
    },

    formatPrice(price) {
      return parseFloat(price).toLocaleString('en-NG', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    },

    formatDate(date) {
      return new Date(date).toLocaleDateString('en-NG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    },
  },
};
</script>

<style scoped>
.pricing-row {
  transition: all 0.2s ease;
}

.pricing-row:hover {
  background-color: #f8f9fa;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.symbol {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
}

.symbol-40 {
  width: 2.5rem;
  height: 2.5rem;
}

.symbol-light-info {
  background-color: #e1f7ff;
}

.symbol-label {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.label {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: 0.375rem;
}

.label-light-primary {
  background-color: #e1f0ff;
  color: #3699ff;
}

.label-light-info {
  background-color: #e1f7ff;
  color: #0dcaf0;
}

.label-light-warning {
  background-color: #fff4de;
  color: #ffc107;
}

.label-light-success {
  background-color: #e8fff3;
  color: #198754;
}

.label-light-dark {
  background-color: #f1f2f6;
  color: #6c757d;
}
</style>
