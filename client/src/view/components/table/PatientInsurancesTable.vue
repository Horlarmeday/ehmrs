<template>
  <div>
    <div class="table-responsive">
      <table class="table table-sm">
        <thead class="thead-light">
          <tr class="text-uppercase">
            <th scope="col">Insurance Name</th>
            <th scope="col">HMO Name</th>
            <th scope="col">Organization</th>
            <th scope="col">Plan</th>
            <th scope="col">Enrollee Code</th>
            <th scope="col">Default</th>
            <th scope="col">Date Created</th>
            <th scope="col"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!insurances?.length">
            <td colspan="9" align="center" class="text-muted">No Data</td>
          </tr>
          <tr v-for="(insurance, i) in insurances" :key="i">
            <td>{{ insurance?.insurance?.name }}</td>
            <td>{{ insurance?.hmo?.name }}</td>
            <td>{{ insurance?.organization }}</td>
            <td>{{ insurance?.plan }}</td>
            <td>{{ insurance?.enrollee_code }}</td>
            <td>
              <a v-b-tooltip.hover :title="getDefaultInsuranceTitle(insurance.is_default)" href="#"
                ><i
                  class="flaticon2-correct font-size-h5"
                  :class="getDefaultInsurance(insurance.is_default)"
                ></i
              ></a>
            </td>
            <td>{{ insurance.createdAt | dayjs('DD/MM/YYYY, h:mma') }}</td>
            <td>
              <span v-b-tooltip.hover title="Click to edit">
                <a href="#" @click="editInsurance(insurance)"
                  ><i class="flaticon-edit-1 text-primary"></i
                ></a>
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script>
export default {
  name: 'PatientInsurancesTable',
  data: () => ({
    loading: false,
  }),
  props: {
    insurances: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
  methods: {
    editInsurance(insurance) {
      this.$emit('editInsurance', insurance);
    },

    getDefaultInsurance(is_default) {
      if (is_default) return 'text-success';
      return 'text-danger';
    },

    getDefaultInsuranceTitle(is_default) {
      if (is_default) return 'Default';
    },
  },
};
</script>

<style scoped>
.disabled {
  opacity: 0.5;
  pointer-events: none;
}
</style>
