<template>
  <div>
    <h3 class="card-title align-items-start">
      <span class="card-label font-weight-bolder text-dark">Admitted Patients</span>
    </h3>
    <div class="card">
      <div class="card-body">
        <admitted-patients-samples-table />
      </div>
    </div>
  </div>
</template>
<script>
import AdmittedPatientsSamplesTable from './admittedPatientsSamples/AdmittedPatientsSamplesTable.vue';

export default {
  components: { AdmittedPatientsSamplesTable },
};
</script>
