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
                <th>Investigation Name</th>
                <th>Status</th>
                <th>Payment Status</th>
                <th>Date Sample Collected</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!prescription?.investigations?.length">
                <td colspan="9" align="center" class="text-muted">No Data</td>
              </tr>
              <tr v-for="(investigation, i) in prescription?.investigations" :key="i">
                <td>
                  <span class="text-dark-75 font-weight-bolder d-block font-size-md">{{
                    investigation.investigation.name
                  }}</span>
                </td>
                <td>
                  <label :class="getLabelStatus(investigation.status)" class="label label-inline">
                    {{ getStatusText(investigation.status) }}
                  </label>
                </td>
                <td>
                  <span
                    :class="getPaymentStatus(investigation.payment_status)"
                    class="label label-dot mr-2"
                  ></span>
                  <span
                    :class="getPaymentTextColor(investigation.payment_status)"
                    class="font-size-sm font-weight-bold"
                    >{{ investigation.payment_status }}</span
                  >
                </td>
                <td>
                  <span class="text-dark-75 font-weight-bolder d-block font-size-md">{{
                    prescription.date_requested | dayjs('MMM D, YYYY, h:mma')
                  }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="separator separator-solid mb-6"></div>
        <div v-if="prescription?.investigations">
          <div>
            <span class="font-size-lg">
              <span class="text-dark-75 font-weight-boldest font-size-h4">
                {{ approvedInvestigationsCount }}
              </span>
              out of
              <span class="text-dark-75 font-weight-boldest font-size-h4"
                >{{ prescription?.investigations?.length }}
              </span>

              investigations are ready for review
            </span>
          </div>
          <div class="text-center">
            <button
              @click="approveTests"
              ref="kt-approveResult-submit"
              class="text-center btn btn-lg btn-primary"
            >
              Send for Review
            </button>
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
  name: 'OneInvestigationPrescription',
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
      return this.$store.state.laboratory.investigationPrescription;
    },
    approvedInvestigationsCount() {
      const approvedInvestigations = this.prescription?.investigations?.filter(
        investigation => investigation.status === this.APPROVED
      );
      return approvedInvestigations?.length;
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
    approvedInvestigationsCount: {
      handler(value) {
        this.$emit('approvedInvestigations', value);
      },
      immediate: true,
    },
  },

  created() {
    this.loading = true;
    this.$store
      .dispatch('radiology/fetchOneInvestigationPrescription', {
        id: this.$route.params.id,
      })
      .then(() => (this.loading = false));
  },
};
</script>

<style scoped></style>
