<template>
  <div class="row mb-4">
    <div class="col-md-12">
      <div class="card card-custom gutter-b">
        <div class="card-header">
          <h6 class="card-title mb-0">Summary</h6>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-3">
              <div class="text-center">
                <h2 class="text-primary">{{ summary?.totalEncounters || 0 }}</h2>
                <p class="text-muted">Total Encounters</p>
              </div>
            </div>
            <div class="col-md-3">
              <div class="text-center">
                <h2 class="text-success">{{ summary?.uniquePatients || 0 }}</h2>
                <p class="text-muted">Unique Patients</p>
              </div>
            </div>
            <div class="col-md-3">
              <div class="text-center">
                <h2 class="text-info">{{ summary?.uniqueVisits || 0 }}</h2>
                <p class="text-muted">Unique Visits</p>
              </div>
            </div>
            <div class="col-md-3">
              <div class="text-center">
                <h2 class="text-warning">{{ summary?.encountersByType?.length || 0 }}</h2>
                <p class="text-muted">Encounter Types</p>
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
  name: 'EncounterSummary',
  props: {
    summary: {
      type: Object,
      default: () => ({}),
    },
  },
};
</script>

<style scoped>
.card-custom {
  border: 1px solid #e4e6ea;
  border-radius: 0.42rem;
}

.card-header {
  background-color: #f3f6f9;
  border-bottom: 1px solid #e4e6ea;
}
</style>
