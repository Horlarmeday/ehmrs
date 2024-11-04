<template>
  <div class="card card-custom card-stretch gutter-b card-shadowless">
    <auth-code-modal
      @closeModal="hideModal"
      :dispatch-type="dispatchType"
      :display-prompt="displayPrompt"
      :data="item"
    />

    <div class="card-body pr-5 pl-5 pt-2">
      <div class="table-responsive">
        <table class="table table-head-custom table-vertical-center">
          <thead>
            <tr class="text-left">
              <th class="pr-0" style="width: 250px">Item</th>
              <th style="min-width: 100px">Item Type</th>
              <th style="min-width: 100px">Quantity</th>
              <th style="min-width: 50px">Price(₦)</th>
              <th style="min-width: 100px">Status</th>
              <th style="min-width: 50px">Source</th>
              <th style="min-width: 100px">Requester</th>
              <th style="min-width: 150px">Date</th>
              <th class="pr-0 text-right" style="min-width: 150px">action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!items.length">
              <td colspan="9" align="center" class="text-muted">No Data</td>
            </tr>
            <tr v-for="item in items" :key="item.id">
              <td class="pr-0">
                <span title="Dispensed" v-b-tooltip.hover v-if="item.dispense_status === DISPENSED"
                  ><i class="fas fa-check-circle text-success mr-1"></i
                ></span>
                <a
                  class="font-weight-bolder text-hover-primary mb-1 font-size-lg"
                  :class="getDrugTextStatus(item.nhis_status)"
                  href="#"
                  :id="popOverId"
                  >{{ item?.drug?.name }}</a
                >
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-md">
                  <label :class="getItemType(item.drug_type)" class="label label-inline">{{
                    item.drug_type
                  }}</label>
                </span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-md">
                  {{ item.quantity_to_dispense }} {{ item?.unit?.name || '-' }}
                </span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-md">
                  {{ item.total_price }}
                </span>
              </td>
              <td>
                <span
                  :class="getPaymentStatus(item.payment_status)"
                  class="label label-lg label-inline"
                  >{{ item.payment_status }}</span
                >
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-md">
                  {{ item.source }}
                </span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-md">{{
                  item?.requester?.fullname
                }}</span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-md">
                  {{ item.date_prescribed | dayjs('MMM D, YYYY, h:mma') }}
                </span>
              </td>
              <td class="pr-0 text-right">
                <div v-if="!isItemProcessed(item)">
                  <button
                    :disabled="disableStatusChange(item)"
                    title="Approve"
                    v-b-tooltip.hover
                    class="btn btn-icon btn-light btn-hover-success btn-sm mr-2"
                    @click="showStatusChangeAlert('Approved', item.id)"
                  >
                    <approve-icon />
                  </button>
                  <button
                    :disabled="disableStatusChange(item)"
                    title="Decline"
                    v-b-tooltip.hover
                    class="btn btn-icon btn-light btn-hover-danger btn-sm"
                    @click="showStatusChangeAlert('Declined', item.id)"
                  >
                    <cancel-icon />
                  </button>
                </div>
                <div v-else>
                  <span class="text-dark-50 mr-2">Processed By: </span>
                  <span class="text-dark-75 font-weight-bolder d-block font-size-md">{{
                    item?.nhis_item_processor?.fullname || '-'
                  }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <pagination
        :total-pages="pages"
        :total="queriedItems"
        :per-page="perPage"
        :current-page="currentPage"
        @pagechanged="onPageChange"
      />
    </div>
  </div>
</template>
<script>
import ApproveIcon from '@/assets/icons/ApproveIcon.vue';
import CancelIcon from '@/assets/icons/CancelIcon.vue';
import Pagination from '@/utils/Pagination.vue';
import Swal from 'sweetalert2';
import AuthCodeModal from '@/view/pages/nhis/components/AuthCodeModal.vue';
import { getItemType, parseJwt } from '@/common/common';

export default {
  components: { AuthCodeModal, Pagination, CancelIcon, ApproveIcon },
  data: () => ({
    PENDING: 'Pending',
    PRIMARY: 'Primary',
    SECONDARY: 'Secondary',
    DISABLED: 'disabled',
    APPROVED: 'Approved',
    CLEARED: 'Cleared',
    DISPENSED: 'Dispensed',
    DECLINED: 'Declined',
    NHIS: 'NHIS',
    currentPage: 1,
    itemsPerPage: 15,
    displayPrompt: false,
    item: {},
    dispatchType: 'order/updatePrescribedDrug',
    showPopover: false,
    popOverId: 'popover-reactive-90',
    currentUser: parseJwt(localStorage.getItem('user_token')),
  }),
  computed: {
    items() {
      return this.$store.state.order.additional_items_orders;
    },
    queriedItems() {
      return this.$store.state.order.totalAdditionalItemsOrders || 0;
    },
    pages() {
      return this.$store.state.order.additionalItemsOrdersPages;
    },
    perPage() {
      return this.items.length;
    },
    visit() {
      return this.$store.state.visit.visit;
    },
  },
  methods: {
    getItemType,
    hideModal() {
      this.displayPrompt = false;
    },

    fetchPrescribedDrugs() {
      this.$store.dispatch('order/fetchPrescribedAdditionalItems', {
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        filter: { visit_id: this.$route.params.id },
      });
    },

    onPageChange(page) {
      this.currentPage = page;
      this.fetchPrescribedDrugs();
    },

    showStatusChangeAlert(nhis_status, itemId) {
      const self = this;
      Swal.fire({
        title: 'Are you sure?',
        text: 'You wont be able to revert this!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: `Yes, ${nhis_status
          ?.substring(-1, nhis_status.length - 1)
          ?.toLowerCase()} it!`,
        cancelButtonText: 'No, cancel!',
        reverseButtons: true,
      }).then(function(result) {
        if (result.value) {
          self.changeDrugNhisStatus({ nhis_status, itemId });
        }
      });
    },

    handleSuccess(status) {
      Swal.fire({
        title: `${status}!`,
        html: `Drug has been ${status?.toLowerCase()}`,
        icon: 'success',
        confirmButtonClass: 'btn btn-primary',
        heightAuto: false,
      });
    },

    changeDrugNhisStatus({ nhis_status, itemId }) {
      this.$store
        .dispatch('order/updateAdditionalItem', {
          data: {
            nhis_status,
            id: itemId,
            payment_status: nhis_status === this.APPROVED ? this.CLEARED : this.PENDING,
            nhis_item_processed_by: this.currentUser.sub,
            date_nhis_item_processed: new Date(),
          },
        })
        .then(() => this.handleSuccess(nhis_status));
    },

    getPaymentStatus(status) {
      if (status === 'Paid') return 'label-light-success ';
      if (status === 'Pending') return 'label-light-warning ';
      if (status === 'Permitted') return 'label-light-primary ';
      if (status === 'Cleared') return 'label-light-info ';
      return 'label-light-dark ';
    },

    getDrugTextStatus(status) {
      if (status === 'Approved') return 'text-success';
      if (status === 'Declined') return 'text-danger';
      return 'text-dark-75';
    },

    viewPopover(item) {
      this.item = item;
      this.showPopover = true;
    },

    hidePopover() {
      this.showPopover = false;
    },

    disableStatusChange(item) {
      if (item.test_group === this.SECONDARY && !item.auth_code && item.drug_type === this.NHIS) {
        return true;
      }
      if (item.nhis_status === this.APPROVED || item.nhis_status === this.DECLINED) return true;
    },

    isItemProcessed(item) {
      return item.nhis_status === this.APPROVED || item.nhis_status === this.DECLINED;
    },
  },
  created() {
    this.fetchPrescribedDrugs();
  },
};
</script>

<style scoped></style>
