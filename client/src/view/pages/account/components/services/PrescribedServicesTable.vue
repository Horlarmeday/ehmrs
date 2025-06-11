<template>
  <div>
    <button-payment-options
      v-if="selectedServices?.length"
      :type="SERVICES"
      :count="selectedServices?.length"
      :selected-items="selectedServices"
      @endBillRequest="endBillingRequest"
      :disable-billing="disableBilling"
    />
    <div class="table-responsive">
      <table class="table table-sm">
        <thead class="thead-light">
          <tr class="text-uppercase">
            <th scope="col"></th>
            <th scope="col">Service</th>
            <th scope="col">Type</th>
            <th scope="col">Quantity</th>
            <th scope="col">Billing Status</th>
            <th scope="col">Price(₦)</th>
            <th scope="col">Payment Status</th>
            <th scope="col">Requested By</th>
            <th scope="col">Date Requested</th>
            <th scope="col"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!services?.length">
            <td colspan="9" align="center" class="text-muted">No Data</td>
          </tr>
          <tr v-for="(service, i) in services" :key="i">
            <td>
              <label class="checkbox checkbox-md checkbox-inline">
                <input
                  type="checkbox"
                  :checked="isSelected(service)"
                  @change="toggleItem(service)"
                  :disabled="service.payment_status !== PENDING"
                />
                <span></span>
              </label>
            </td>
            <td>{{ service?.service?.name }}</td>
            <td>
              <span :class="getServiceTypeColor(service.service_type)">{{
                service.service_type
              }}</span>
            </td>
            <td>{{ service.quantity }}</td>
            <td>
              <span>
                <span
                  :class="getBillingColor(service.billing_status)"
                  class="label label-dot mr-2"
                ></span
                ><span
                  :class="getBillingTextColor(service.billing_status)"
                  class="font-weight-bold"
                  >{{ service.billing_status }}</span
                >
              </span>
            </td>
            <td>
              {{ service.price }}
            </td>
            <td>
              <span :class="getPaymentColor(service.payment_status)">{{
                service.payment_status
              }}</span>
            </td>
            <td>{{ service?.examiner?.fullname }}</td>
            <td>{{ service.createdAt | dayjs('DD/MM/YYYY, h:mma') }}</td>
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
  components: { ButtonPaymentOptions },
  data: () => ({
    loading: false,
    UNBILLED: 'Unbilled',
    PENDING: 'Pending',
    selectedServices: [],
    SERVICES: 'Services',
  }),
  computed: {
    services() {
      return this.$store.state.order.serviceOrders;
    },

    disableBilling() {
      return this.services.every(service => service.billing_status === 'Billed');
    },
  },
  created() {
    this.fetchAdditionalItems();
  },
  methods: {
    getLabelDotStatus,
    fetchAdditionalItems() {
      this.loading = false;
      this.$store.dispatch('order/fetchServicesPerVisit', { id: this.$route.params.id });
    },

    getUnitPrice(totalPrice, quantity) {
      return totalPrice / quantity || 0;
    },

    isSelected(service) {
      return this.selectedServices.some(d => d.id === service.id);
    },

    toggleItem(service) {
      if (this.isSelected(service)) {
        // If the item is already selected, remove it from selectedItems
        const itemIndex = this.selectedServices.findIndex(d => d.id === service.id);
        this.selectedServices.splice(itemIndex, 1);
      } else {
        // If the item is not selected, add it to selectedItems
        this.selectedServices.push({
          id: service.id,
          name: service.service.name,
          quantity: service.quantity,
          price: service.price,
          date: service.createdAt,
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
      this.selectedServices = [];
    },
  },
};
</script>

<style scoped></style>
