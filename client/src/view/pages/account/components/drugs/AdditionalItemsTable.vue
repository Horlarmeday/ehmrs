<template>
  <div>
    <button-payment-options
      v-if="selectedItems?.length"
      :type="ITEMS"
      :count="selectedItems?.length"
      :selected-items="selectedItems"
      @endBillRequest="endBillingRequest"
      :disable-billing="disableBilling"
    />
    <div class="table-responsive">
      <table class="table">
        <thead class="thead-light">
          <tr class="text-uppercase">
            <th scope="col"></th>
            <th scope="col">Item</th>
            <th scope="col">Quantity</th>
            <th scope="col">Unit Price(₦)</th>
            <th scope="col">Total Price(₦)</th>
            <th scope="col">Billing Status</th>
            <th scope="col">Payment Status</th>
            <th scope="col">Date Prescribed.</th>
            <th scope="col"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="items.length === 0">
            <td colspan="9" align="center" class="text-muted">No Data</td>
          </tr>
          <tr v-for="item in items" :key="item.id">
            <td>
              <label class="checkbox checkbox-md checkbox-inline">
                <input type="checkbox" :checked="isSelected(item)" @change="toggleItem(item)" />
                <span></span>
              </label>
            </td>
            <th>
              <span
                :title="`${item.drug_type}`"
                v-b-tooltip.hover
                :class="getLabelDotStatus(item.drug_type)"
                class="label label-dot label-lg mr-2"
              ></span>
              <a href="#">{{ item?.drug?.name || '-' }}</a>
            </th>
            <td>
              <span> {{ item.quantity_to_dispense }} {{ item?.unit?.name }} </span>
            </td>
            <td>
              <span>{{ getUnitPrice(item.total_price, item.quantity_to_dispense) }} </span>
            </td>
            <td>
              <span>{{ item.total_price }} </span>
            </td>
            <td>
              <span>
                <span
                  :class="getBillingColor(item.billing_status)"
                  class="label label-dot mr-2"
                ></span
                ><span :class="getBillingTextColor(item.billing_status)" class="font-weight-bold">{{
                  item.billing_status
                }}</span>
              </span>
            </td>
            <td>
              <span :class="getPaymentColor(item.payment_status)">{{ item.payment_status }}</span>
            </td>
            <td>
              <span>{{ item.date_prescribed | dayjs('ddd, MMM Do YYYY, h:mma') }}</span>
            </td>
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
    selectedItems: [],
    ITEMS: 'Items',
  }),
  computed: {
    items() {
      return this.$store.state.order.additionalItemOrders;
    },

    disableBilling() {
      return this.items.every(drug => drug.billing_status === 'Billed');
    },
  },
  created() {
    this.fetchAdditionalItems();
  },
  methods: {
    getLabelDotStatus,
    fetchAdditionalItems() {
      this.loading = false;
      this.$store.dispatch('order/fetchAdditionalItemsPerVisit', { id: this.$route.params.id });
    },

    getUnitPrice(totalPrice, quantity) {
      return totalPrice / quantity || 0;
    },

    isSelected(item) {
      return this.selectedItems.includes(item.id);
    },

    toggleItem(item) {
      if (this.isSelected(item)) {
        // If the item is already selected, remove it from selectedItems
        const itemIndex = this.selectedItems.findIndex(id => id === item.id);
        this.selectedItems.splice(itemIndex, 1);
      } else {
        // If the item is not selected, add it to selectedItems
        this.selectedItems.push(item.id);
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

    endBillingRequest() {
      this.selectedItems = [];
    },
  },
};
</script>

<style scoped></style>
