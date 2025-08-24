<template>
  <div class="row">
    <div class="col-md-12">
      <div class="card card-custom gutter-b">
        <div class="card-header">
          <h6 class="card-title mb-0">Recent Encounters</h6>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-md">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Patient</th>
                  <th>Visit</th>
                  <th>Type</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="encounter in encounters?.slice(0, 10)" :key="encounter.id">
                  <td>{{ formatDate(encounter.time_of_encounter) }}</td>
                  <td>{{ encounter.patient?.fullname }}</td>
                  <td>{{ encounter.visit?.id }}</td>
                  <td>
                    <span class="badge badge-info">{{
                      encounter.encounter_type || 'Unknown'
                    }}</span>
                  </td>
                  <td>
                    <button class="btn btn-sm btn-outline-primary" @click="showModal(encounter.id)">
                      View Actions
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs';

export default {
  name: 'EncountersList',
  props: {
    encounters: {
      type: Array,
      default: () => [],
    },
  },
  methods: {
    formatDate(date) {
      if (!date) return 'N/A';
      return dayjs(date).format('dddd, MMMM D, HH:mma');
    },
    showModal(encounterId) {
      this.$emit('viewActions', encounterId);
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
