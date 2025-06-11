<template>
  <div>
    <button-payment-options
      v-if="selectedTests?.length"
      :type="TESTS"
      :count="selectedTests?.length"
      :selected-items="selectedTests"
      @endBillRequest="endBillingRequest"
      :disable-billing="disableBilling"
    />
    <div class="table-responsive">
      <table class="table">
        <thead class="thead-light">
          <tr class="text-uppercase">
            <th scope="col"></th>
            <th scope="col">Test</th>
            <th scope="col">Billing Status</th>
            <th scope="col">Requested By</th>
            <th scope="col">Payment Status</th>
            <th scope="col">Date Requested</th>
            <th scope="col"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!tests?.length">
            <td colspan="9" align="center" class="text-muted">No Data</td>
          </tr>
          <tr v-for="(test, i) in tests" :key="i">
            <td>
              <label class="checkbox checkbox-md checkbox-inline">
                <input
                  :disabled="test.payment_status !== PENDING"
                  type="checkbox"
                  :checked="isSelected(test)"
                  @change="toggleItem(test)"
                />
                <span></span>
              </label>
            </td>
            <td>
              <span
                :title="`${test.test_type}`"
                v-b-tooltip.hover
                :class="getLabelDotStatus(test.test_type)"
                class="label label-dot label-lg mr-2"
              ></span>
              {{ test.test.name }}
            </td>
            <td>
              <span>
                <span
                  :class="getBillingColor(test.billing_status)"
                  class="label label-dot mr-2"
                ></span
                ><span :class="getBillingTextColor(test.billing_status)" class="font-weight-bold">{{
                  test.billing_status
                }}</span>
              </span>
            </td>
            <td>{{ test.examiner.fullname }}</td>
            <td>
              <span :class="getPaymentColor(test.payment_status)">{{ test.payment_status }}</span>
            </td>
            <td>{{ test.createdAt | dayjs('DD/MM/YYYY, h:mma') }}</td>
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
  name: 'PrescribedTestsTable',
  components: { ButtonPaymentOptions },
  data: () => ({
    ACCEPTED: 'Accepted',
    loading: false,
    PENDING: 'Pending',
    UNBILLED: 'Unbilled',
    TESTS: 'Tests',
    selectedTests: [],
  }),
  computed: {
    tests() {
      return this.$store.state.order.testOrders;
    },

    disableBilling() {
      return this.tests.every(test => test.billing_status === 'Billed');
    },
  },
  created() {
    this.fetchPrescribedTests();
  },
  methods: {
    getLabelDotStatus,
    viewPopover(item) {
      this.item = item;
      this.showPopover = true;
    },

    hidePopover() {
      this.showPopover = false;
    },

    getResultColor(status) {
      if (status === 'Pending') return 'label label-inline label-light-warning font-weight-bold';
      if (status === 'Accepted') return 'label label-inline label-light-success font-weight-bold';
      return 'label label-inline label-light-danger font-weight-bold';
    },

    getPaymentColor(status) {
      if (status === 'Pending') return 'label label-inline label-light-warning font-weight-bold';
      if (status === 'Paid') return 'label label-inline label-light-success font-weight-bold';
      if (status === 'Cleared') return 'label label-inline label-light-info font-weight-bold';
      return 'label label-inline label-light-danger font-weight-bold';
    },

    endBillingRequest() {
      this.selectedTests = [];
    },

    getBillingColor(status) {
      if (status === 'Unbilled') return 'label-warning';
      return 'label-success';
    },

    getBillingTextColor(status) {
      if (status === 'Unbilled') return 'text-warning';
      return 'text-success';
    },

    fetchPrescribedTests() {
      this.loading = false;
      this.$store.dispatch('order/fetchPrescribedTestsPerVisit', { id: this.$route.params.id });
    },

    isSelected(test) {
      return this.selectedTests.some(d => d.id === test.id);
    },

    toggleItem(test) {
      if (this.isSelected(test)) {
        // If the item is already selected, remove it from selectedItems
        const itemIndex = this.selectedTests.findIndex(d => d.id === test.id);
        this.selectedTests.splice(itemIndex, 1);
      } else {
        // If the item is not selected, add it to selectedItems
        this.selectedTests.push({
          id: test.id,
          name: test.test.name,
          quantity: 1,
          price: test.price,
          date: test.createdAt,
        });
      }
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
