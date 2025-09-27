<template>
  <div>
    <button-payment-options
      v-if="selectedInvestigations?.length"
      :type="INVESTIGATIONS"
      :count="selectedInvestigations?.length"
      :selected-items="selectedInvestigations"
      @endBillRequest="endBillingRequest"
      :disable-billing="disableBilling"
    />
    <div class="table-responsive">
      <table class="table table-sm">
        <thead class="thead-light">
          <tr class="text-uppercase">
            <th scope="col"></th>
            <th scope="col">Test</th>
            <th scope="col">Imaging</th>
            <th scope="col">Billing Status</th>
            <th scope="col">Price (₦)</th>
            <th scope="col">Payment Status</th>
            <th scope="col">Requested By</th>
            <th scope="col">Date Requested</th>
            <th scope="col"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!investigations?.length">
            <td colspan="9" align="center" class="text-muted">No Data</td>
          </tr>
          <tr v-for="(investigation, i) in investigations" :key="i">
            <td>
              <label class="checkbox checkbox-md checkbox-inline">
                <input
                  type="checkbox"
                  :disabled="investigation.payment_status !== PENDING"
                  :checked="isSelected(investigation)"
                  @change="toggleItem(investigation)"
                />
                <span></span>
              </label>
            </td>
            <td>
              <span
                :title="`${investigation.investigation_type}`"
                v-b-tooltip.hover
                :class="getLabelDotStatus(investigation.investigation_type)"
                class="label label-dot label-lg mr-2"
              ></span>
              <span>
                {{ investigation.investigation.name }}
              </span>
            </td>
            <td>{{ investigation.imaging.name }}</td>
            <td>
              <span>
                <span
                  :class="getBillingColor(investigation.billing_status)"
                  class="label label-dot mr-2"
                ></span
                ><span
                  :class="getBillingTextColor(investigation.billing_status)"
                  class="font-weight-bold"
                  >{{ investigation.billing_status }}</span
                >
              </span>
            </td>
            <td>{{ investigation.price }}</td>
            <td>
              <span :class="getPaymentColor(investigation.payment_status)">{{
                investigation.payment_status
              }}</span>
            </td>
            <td>{{ investigation.examiner.fullname }}</td>
            <td>{{ investigation.createdAt | dayjs('DD/MM/YYYY, h:mma') }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script>
import { getLabelDotStatus } from '@/common/common';
import ButtonPaymentOptions from '@/view/pages/account/components/ButtonPaymentOptions.vue';

export default {
  name: 'PrescribedInvestigations',
  components: { ButtonPaymentOptions },
  data: () => ({
    loading: false,
    UNBILLED: 'Unbilled',
    PENDING: 'Pending',
    selectedInvestigations: [],
    INVESTIGATIONS: 'Investigations',
  }),
  computed: {
    investigations() {
      return this.$store.state.order.investigationOrders;
    },

    disableBilling() {
      return this.investigations.every(
        (investigation) => investigation.billing_status === 'Billed'
      );
    },
  },
  created() {
    this.fetchPrescribedInvestigations();
  },
  methods: {
    getLabelDotStatus,
    fetchPrescribedInvestigations() {
      this.loading = false;
      this.$store.dispatch('order/fetchPrescribedInvestigationsPerVisit', {
        id: this.$route.params.id,
      });
    },
    getResultColor(status) {
      if (status === 'Pending') return 'label label-inline label-light-warning font-weight-bold';
      if (status === 'Approved') return 'label label-inline label-light-success font-weight-bold';
      return 'label label-inline label-light-info font-weight-bold';
    },
    isSelected(investigation) {
      return this.selectedInvestigations.some((d) => d.id === investigation.id);
    },

    toggleItem(investigation) {
      if (this.isSelected(investigation)) {
        // If the item is already selected, remove it from selectedItems
        const itemIndex = this.selectedInvestigations.findIndex((d) => d.id === investigation.id);
        this.selectedInvestigations.splice(itemIndex, 1);
      } else {
        // If the item is not selected, add it to selectedItems
        this.selectedInvestigations.push({
          id: investigation.id,
          name: investigation.investigation.name,
          quantity: 1,
          price: investigation.price,
          date: investigation.createdAt,
        });
      }
    },

    getPaymentColor(status) {
      if (status === 'Pending') return 'label label-inline label-light-warning font-weight-bold';
      if (status === 'Paid') return 'label label-inline label-light-success font-weight-bold';
      if (status === 'Cleared') return 'label label-inline label-light-info font-weight-bold';
      return 'label label-inline label-light-danger font-weight-bold';
    },

    getBillingColor(status) {
      if (status === 'Unbilled') return 'label-warning';
      return 'label-success';
    },

    getBillingTextColor(status) {
      if (status === 'Unbilled') return 'text-warning';
      return 'text-success';
    },

    getServiceTypeColor(type) {
      if (type === 'NHIS') return 'label label-inline label-light-warning font-weight-bold';
      if (type === 'Cash') return 'label label-inline label-light-success font-weight-bold';
      return 'label label-inline label-light-danger font-weight-bold';
    },

    endBillingRequest() {
      this.selectedInvestigations = [];
    },
  },
};
</script>

<style scoped></style>
