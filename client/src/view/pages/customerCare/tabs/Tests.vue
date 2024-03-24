<template>
  <div class="card card-custom gutter-b">
    <div class="card-body">
      <div v-if="!loading">
        <div class="table-responsive">
          <table
            class="table table-head-custom table-head-bg table-borderless table-vertical-center"
          >
            <thead>
              <tr>
                <th>Lab No</th>
                <th>Test Name</th>
                <th>Status</th>
                <th>Payment Status</th>
                <th>Date Sample Collected</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!prescription?.tests?.length">
                <td colspan="9" align="center" class="text-muted">No Data</td>
              </tr>
              <tr v-for="(test, i) in prescription?.tests" :key="i">
                <td>
                  <span class="text-dark-75 font-weight-bolder d-block font-size-md">
                    {{ prescription.accession_number }}
                  </span>
                </td>
                <td>
                  <span class="text-dark-75 font-weight-bolder d-block font-size-md">{{
                    test.test.name
                  }}</span>
                </td>
                <td>
                  <label :class="getLabelStatus(test.status)" class="label label-inline">
                    {{ getStatusText(test.status) }}
                  </label>
                </td>
                <td>
                  <span
                    :class="getPaymentStatus(test.payment_status)"
                    class="label label-dot mr-2"
                  ></span>
                  <span
                    :class="getPaymentTextColor(test.payment_status)"
                    class="font-size-sm font-weight-bold"
                    >{{ test.payment_status }}</span
                  >
                </td>
                <td>
                  <span class="text-dark-75 font-weight-bolder d-block font-size-md">{{
                    prescription.date_sample_received | dayjs('MMM D, YYYY, h:mma')
                  }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="separator separator-solid mb-6"></div>
        <div v-if="prescription?.tests">
          <div>
            <span class="font-size-lg">
              <span class="text-dark-75 font-weight-boldest font-size-h4">
                {{ approvedTestsCount }}
              </span>
              out of
              <span class="text-dark-75 font-weight-boldest font-size-h4"
                >{{ prescription?.tests?.length }}
              </span>

              tests are ready for review
            </span>
          </div>
        </div>
      </div>
      <table-skeleton v-else :columns="5" />
    </div>
  </div>
</template>

<script>
import TableSkeleton from '@/view/pages/nhis/components/TableSkeleton.vue';

export default {
  name: 'OneTestPrescription',
  components: { TableSkeleton },
  data() {
    return {
      isDisabled: false,
      loading: false,
      APPROVED: 'Approved',
    };
  },
  computed: {
    prescription() {
      return this.$store.state.laboratory.testPrescription;
    },
    approvedTestsCount() {
      const approvedTest = this.prescription?.tests?.filter(test => test.status === this.APPROVED);
      return approvedTest?.length;
    },
  },
  methods: {
    getLabelStatus(type) {
      if (type === 'Approved') return 'label-light-success';
      return 'label-light-danger';
    },

    getStatusText(status) {
      if (status === 'Approved') return 'Ready';
      return 'Not ready';
    },

    getPaymentStatus(status) {
      if (status === 'Pending') return 'label-warning ';
      if (status === 'Paid') return 'label-success ';
      if (status === 'Cleared') return 'label-primary ';
      return 'label-danger ';
    },

    getPaymentTextColor(type) {
      if (type === 'Pending') return 'text-warning';
      if (type === 'Paid') return 'text-success';
      if (type === 'Cleared') return 'text-primary';
      return 'text-danger';
    },
  },
  watch: {
    approvedTestsCount: {
      handler(value) {
        this.$emit('approvedTests', value);
      },
      immediate: true,
    },
  },
  created() {
    this.loading = true;
    this.$store
      .dispatch('laboratory/fetchTestPrescription', { id: this.$route.params.id })
      .then(() => (this.loading = false));
  },
};
</script>

<style scoped></style>
