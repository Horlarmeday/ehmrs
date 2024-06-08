<template>
  <div>
    <button-payment-options
      v-if="selectedDrugs?.length"
      :type="DRUGS"
      :count="selectedDrugs?.length"
      :selected-items="selectedDrugs"
      @endBillRequest="endBillingRequest"
      :disable-billing="disableBilling"
    />
    <div class="table-responsive">
      <table class="table ">
        <thead class="thead-light">
          <tr class="text-uppercase">
            <th scope="col"></th>
            <th scope="col">Drug</th>
            <th scope="col">Dose</th>
            <th scope="col">Unit Price(₦)</th>
            <th scope="col">Total Price(₦)</th>
            <th scope="col">Billing Status</th>
            <th scope="col">Payment Status</th>
            <th scope="col">Date Prescribed</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="drugs.length === 0">
            <td colspan="9" align="center" class="text-muted">No Data</td>
          </tr>
          <tr v-for="drug in drugs" :key="drug.id">
            <td>
              <label class="checkbox checkbox-md checkbox-inline">
                <input type="checkbox" :checked="isSelected(drug)" @change="toggleItem(drug)" />
                <span></span>
              </label>
            </td>
            <th>
              <span
                :title="`${drug.drug_type}`"
                v-b-tooltip.hover
                :class="getLabelDotStatus(drug.drug_type)"
                class="label label-dot label-lg mr-2"
              ></span>
              <a @click="viewPopover(drug)" href="#"> {{ drug.drug.name }}</a>
            </th>
            <td>
              <span>{{ drug.quantity_to_dispense }} {{ drug?.dosage_form?.name || '-' }}</span>
            </td>
            <td>
              <span>{{ getUnitPrice(drug.total_price, drug.quantity_to_dispense) }} </span>
            </td>
            <td>
              <span>{{ drug.total_price }} </span>
            </td>
            <td>
              <span>
                <span
                  :class="getBillingColor(drug.billing_status)"
                  class="label label-dot mr-2"
                ></span
                ><span :class="getBillingTextColor(drug.billing_status)" class="font-weight-bold">{{
                  drug.billing_status
                }}</span>
              </span>
            </td>
            <td>
              <span :class="getPaymentColor(drug.payment_status)">{{ drug.payment_status }}</span>
            </td>
            <td>
              <span>{{ drug.date_prescribed | dayjs('DD/MM/YYYY, h:mma') }}</span>
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
  name: 'PrescribedDrugsTable',
  components: { ButtonPaymentOptions },
  data: () => ({
    selectedDrugs: [],
    loading: false,
    PENDING: 'Pending',
    UNBILLED: 'Unbilled',
    DRUGS: 'Drugs',
  }),
  computed: {
    drugs() {
      return this.$store.state.order.drugOrders;
    },

    disableBilling() {
      return this.drugs.every(drug => drug.billing_status === 'Billed');
    },
  },
  created() {
    this.fetchPrescribedDrugs();
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

    endBillingRequest() {
      this.selectedDrugs = [];
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

    fetchPrescribedDrugs() {
      this.loading = false;
      this.$store.dispatch('order/fetchPrescribedDrugsPerVisit', { id: this.$route.params.id });
    },

    getUnitPrice(totalPrice, quantity) {
      return totalPrice / quantity || 0;
    },

    isSelected(drug) {
      return this.selectedDrugs.includes(drug.id);
    },

    toggleItem(drug) {
      if (this.isSelected(drug)) {
        // If the item is already selected, remove it from selectedItems
        const drugIndex = this.selectedDrugs.findIndex(id => id === drug.id);
        this.selectedDrugs.splice(drugIndex, 1);
      } else {
        // If the item is not selected, add it to selectedItems
        this.selectedDrugs.push(drug.id);
      }
    },
  },
};
</script>

<style scoped></style>
