<template>
  <div class="table-responsive">
    <table class="table table-sm">
      <thead class="thead-light">
        <tr class="text-uppercase">
          <th scope="col">Nursing Diagnosis</th>
          <th scope="col">Objectives</th>
          <th scope="col">Action</th>
          <th scope="col">Scientific Principle</th>
          <th scope="col">Evaluation</th>
          <th scope="col">Added By</th>
          <th scope="col">Date Added</th>
          <th scope="col">Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="!plans?.length">
          <td colspan="9" align="center" class="text-muted">No Data</td>
        </tr>
        <tr v-for="(plan, i) in plans" :key="i">
          <td>{{ plan.nursing_diagnosis }}</td>
          <td>{{ plan.nursing_objective }}</td>
          <td>{{ plan.nursing_action }}</td>
          <td>{{ plan.scientific_principle }}</td>
          <td>{{ plan.evaluation }}</td>
          <td>{{ plan.staff.fullname }}</td>
          <td>{{ plan.createdAt | dayjs('DD/MM/YYYY, h:mma') }}</td>
          <td>
            <a href="#"><i class="icon-xl text-primary flaticon-edit-1"></i></a>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
export default {
  name: 'CarePlanTable',
  props: {
    plans: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
};
</script>

<style scoped></style>
