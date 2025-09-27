<template>
  <div class="bed-card card h-100" @click="handleCardClick">
    <div class="card-body d-flex flex-column">
      <!-- Bed Header -->
      <div class="d-flex justify-content-between align-items-start mb-3">
        <div class="bed-icon">
          <i class="fas fa-bed" :class="statusIconClass"></i>
        </div>
        <BedStatusBadge :status="bed.status" />
      </div>

      <!-- Bed Information -->
      <div class="bed-info flex-grow-1">
        <h5 class="bed-code mb-2">{{ bed.code }}</h5>
        <p class="bed-type text-muted mb-2">
          <i class="fas fa-tag mr-1"></i>
          {{ bed.bed_type }}
        </p>
        <p class="ward-name text-muted mb-3">
          <i class="fas fa-building mr-1"></i>
          {{ ward.name }}
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="bed-actions mt-auto">
        <button class="btn btn-sm btn-outline-primary w-100" @click.stop="editBed">
          <i class="fas fa-edit mr-1"></i>
          Edit
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import BedStatusBadge from './BedStatusBadge.vue';

export default {
  name: 'BedCard',
  components: {
    BedStatusBadge,
  },
  props: {
    bed: {
      type: Object,
      required: true,
    },
    ward: {
      type: Object,
      required: true,
    },
  },
  computed: {
    statusIconClass() {
      switch (this.bed.status) {
        case 'Taken':
          return 'text-danger';
        case 'Untaken':
          return 'text-success';
        default:
          return 'text-secondary';
      }
    },
  },
  methods: {
    handleCardClick() {
      // Could be used for future features like quick view
      this.$emit('bed-selected', this.bed);
    },

    editBed() {
      this.$emit('edit', this.bed);
    },
  },
};
</script>

<style scoped>
.bed-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #e4e6ea;
  border-radius: 8px;
}

.bed-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-color: #007bff;
}

.bed-icon {
  font-size: 1.5rem;
}

.bed-code {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.bed-type,
.ward-name {
  font-size: 0.9rem;
  margin: 0;
}

.bed-actions {
  margin-top: auto;
}

.card-body {
  padding: 1.25rem;
  min-height: 180px;
}

.btn-outline-primary:hover {
  background-color: #007bff;
  border-color: #007bff;
  color: white;
}
</style>
