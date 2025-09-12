<template>
  <div class="card card-custom card-stretch gutter-b">
    <div class="card-body">
      <div class="d-flex align-items-center justify-content-between">
        <div class="d-flex flex-column">
          <span class="text-muted font-weight-bold font-size-sm mb-2">{{ title }}</span>
          <div class="d-flex align-items-center">
            <span class="text-dark font-weight-bolder font-size-h2 mr-2">
              <template v-if="loading">
                <div class="spinner spinner-sm spinner-primary"></div>
              </template>
              <template v-else>
                {{ value }}
              </template>
            </span>
            <span 
              v-if="change && !loading" 
              :class="changeClass"
              class="font-weight-bold font-size-sm"
            >
              {{ change }}
            </span>
          </div>
        </div>
        <div class="ml-6">
          <div 
            :class="`symbol symbol-50 symbol-light-${color}`"
          >
            <div class="symbol-label">
              <i 
                :class="icon" 
                :style="{ color: iconColor, fontSize: '24px' }"
              ></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ReportCard',
  props: {
    title: {
      type: String,
      required: true,
    },
    value: {
      type: [String, Number],
      required: true,
    },
    change: {
      type: String,
      default: null,
    },
    icon: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      default: 'primary',
      validator: (value) => ['primary', 'success', 'warning', 'danger', 'info'].includes(value),
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    changeClass() {
      if (!this.change) return '';
      
      if (this.change.startsWith('+')) {
        return 'text-success';
      } else if (this.change.startsWith('-')) {
        return 'text-danger';
      }
      return 'text-muted';
    },
    iconColor() {
      const colors = {
        primary: '#3699FF',
        success: '#1BC5BD',
        warning: '#FFA800',
        danger: '#F64E60',
        info: '#8950FC',
      };
      return colors[this.color] || colors.primary;
    },
  },
};
</script>

<style scoped>
.spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #3699FF;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>