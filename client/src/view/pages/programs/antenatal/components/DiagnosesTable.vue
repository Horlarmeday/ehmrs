<template>
  <div class="table-responsive">
    <table class="table table-sm">
      <thead class="thead-light">
        <tr class="text-uppercase">
          <th scope="col">Diagnosis</th>
          <th scope="col">Code</th>
          <th scope="col">Type</th>
          <th scope="col">Certainty</th>
          <th scope="col">Notes</th>
          <th scope="col">Added By</th>
          <th scope="col">Date Added</th>
          <th scope="col"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="!diagnoses?.length">
          <td colspan="9" align="center" class="text-muted">No Data</td>
        </tr>
        <tr v-for="(diagnosis, i) in diagnoses" :key="i">
          <td>{{ diagnosis.diagnosis.diagnosis }}</td>
          <td>{{ diagnosis.diagnosis.code }}</td>
          <td>
            <span :class="getDiagnosisTypeColor(diagnosis.type)">{{ diagnosis.type }}</span>
          </td>
          <td>{{ diagnosis.certainty }}</td>
          <td>{{ diagnosis.notes || '-' }}</td>
          <td>{{ diagnosis.staff.fullname }}</td>
          <td>{{ diagnosis.createdAt | moment('DD/MM/YYYY, h:mma') }}</td>
          <td>
            <a href="#"><i class="flaticon-delete mr-2"></i></a>
            <a href="#"><i class="flaticon-edit-1"></i></a>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
export default {
  props: {
    diagnoses: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
  methods: {
    getDiagnosisTypeColor(type) {
      if (type === 'ICD10') return 'label label-inline label-light-primary font-weight-bold';
      return 'label label-inline label-light-danger font-weight-bold';
    },
  },
};
</script>

<style scoped></style>
