<template>
  <div class="row mb-4" v-if="encountersByType?.length">
    <div class="col-md-12">
      <div class="card card-custom gutter-b">
        <div class="card-header">
          <h6 class="card-title mb-0">Encounters by Type</h6>
        </div>
        <div class="card-body">
          <div class="row">
            <div v-for="type in encountersByType" :key="type.type" class="col-md-4 mb-2">
              <div class="d-flex justify-content-between align-items-center p-2 border rounded">
                <span class="font-weight-bold">{{ type.type }}</span>
                <span class="badge badge-primary">{{ type.count }}</span>
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
  name: 'EncounterTypesChart',
  props: {
    encountersByType: {
      type: Array,
      default: () => [],
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
