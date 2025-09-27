<template>
  <span class="badge bed-status-badge" :class="badgeClass">
    <i :class="statusIcon" class="mr-1"></i>
    {{ statusText }}
  </span>
</template>

<script>
export default {
  name: 'BedStatusBadge',
  props: {
    status: {
      type: String,
      required: true,
      validator: (value) => ['Taken', 'Untaken'].includes(value),
    },
  },
  computed: {
    badgeClass() {
      switch (this.status) {
        case 'Taken':
          return 'badge-danger';
        case 'Untaken':
          return 'badge-success';
        default:
          return 'badge-secondary';
      }
    },

    statusIcon() {
      switch (this.status) {
        case 'Taken':
          return 'fas fa-user';
        case 'Untaken':
          return 'fas fa-bed';
        default:
          return 'fas fa-question';
      }
    },

    statusText() {
      switch (this.status) {
        case 'Taken':
          return 'Occupied';
        case 'Untaken':
          return 'Available';
        default:
          return 'Unknown';
      }
    },
  },
};
</script>

<style scoped>
.bed-status-badge {
  font-size: 0.75rem;
  padding: 0.375rem 0.75rem;
  border-radius: 12px;
  font-weight: 500;
}

.badge-success {
  background-color: #28a745;
  color: white;
}

.badge-danger {
  background-color: #dc3545;
  color: white;
}

.badge-secondary {
  background-color: #6c757d;
  color: white;
}
</style>
