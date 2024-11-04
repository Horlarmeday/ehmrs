<template>
  <div class="card card-custom card-stretch gutter-b card-shadowless">
    <auth-code-modal
      @closeModal="hideModal"
      :dispatch-type="dispatchType"
      :display-prompt="displayPrompt"
      :data="drug"
    />

    <change-drug-group
      :drug="drugGroupData"
      :display-prompt="displayDrugGroupPrompt"
      @closeModal="hideDrugGroupModal"
    />

    <div class="card-body pr-5 pl-5 pt-2">
      <div class="table-responsive">
        <table class="table table-head-custom table-vertical-center">
          <thead>
            <tr class="text-left">
              <th class="pr-0" style="width: 250px">Drug</th>
              <th style="min-width: 100px">Group</th>
              <th style="min-width: 50px">Dose</th>
              <th style="min-width: 50px">Status</th>
              <th style="min-width: 50px">Price(₦)</th>
              <th style="min-width: 50px">Source</th>
              <th style="min-width: 50px">Code</th>
              <th style="min-width: 100px">Requester</th>
              <th style="min-width: 150px">Date</th>
              <th class="pr-0 text-right" style="min-width: 170px">action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!drugs.length">
              <td colspan="9" align="center" class="text-muted">No Data</td>
            </tr>
            <tr v-for="drug in drugs" :key="drug.id">
              <td class="pr-0">
                <span title="Dispensed" v-b-tooltip.hover v-if="drug.dispense_status === DISPENSED"
                  ><i class="fas fa-check-circle text-success mr-1"></i
                ></span>
                <a
                  @click="viewPopover(drug)"
                  class="font-weight-bolder text-hover-primary mb-1 font-size-md"
                  :class="getDrugTextStatus(drug.nhis_status)"
                  href="#"
                  :id="popOverId"
                  >{{ drug.drug.name }}</a
                >
                <span class="text-dark-75 font-weight-bolder d-block font-size-md">
                  <label :class="getItemType(drug.drug_type)" class="label label-inline">{{
                    drug.drug_type
                  }}</label>
                </span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-md">
                  {{ drug.drug_group || '-' }}
                </span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-md">
                  {{ drug.quantity_to_dispense }} {{ drug?.dosage_form?.name || '-' }}
                </span>
              </td>
              <td>
                <span
                  :class="getPaymentStatus(drug.payment_status)"
                  class="label label-lg label-inline"
                  >{{ drug.payment_status }}</span
                >
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-md">
                  {{ drug.total_price }}
                </span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-md">
                  {{ drug.source }}
                </span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-md">
                  {{ drug.auth_code || '-' }}
                </span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-md">{{
                  drug?.requester?.fullname
                }}</span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-md">
                  {{ drug.date_prescribed | dayjs('MMM D, YYYY, h:mma') }}
                </span>
              </td>
              <td class="pr-0 text-right">
                <div v-if="!isDrugProcessed(drug)">
                  <button
                    :disabled="drug.nhis_status === APPROVED || drug.nhis_status === DECLINED"
                    title="Change Drug Group"
                    v-b-tooltip.hover
                    href="#"
                    class="btn btn-icon btn-light btn-hover-primary btn-sm mr-2"
                    @click="openDrugGroupModal(drug)"
                  >
                    <open-icon />
                  </button>
                  <button
                    :disabled="disableAddAuthCode(drug)"
                    title="Add Authorization Code"
                    v-b-tooltip.hover
                    href="#"
                    class="btn btn-icon btn-light btn-hover-primary btn-sm mr-2"
                    @click="addAuthCode(drug)"
                  >
                    <edit-icon />
                  </button>
                  <button
                    :disabled="disableStatusChange(drug)"
                    title="Approve"
                    v-b-tooltip.hover
                    href="#"
                    class="btn btn-icon btn-light btn-hover-success btn-sm mr-2"
                    @click="showStatusChangeAlert('Approved', drug)"
                  >
                    <approve-icon />
                  </button>
                  <button
                    :disabled="disableStatusChange(drug)"
                    title="Decline"
                    v-b-tooltip.hover
                    href="#"
                    class="btn btn-icon btn-light btn-hover-danger btn-sm"
                    @click="showStatusChangeAlert('Declined', drug)"
                  >
                    <cancel-icon />
                  </button>
                </div>
                <div v-else>
                  <span class="text-dark-50 mr-2">Processed By: </span>
                  <span class="text-dark-75 font-weight-bolder d-block font-size-md">{{
                    drug?.nhis_drug_processor?.fullname || '-'
                  }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <drug-popover
        :drug="item"
        :target="popOverId"
        :show="showPopover"
        @closePopover="hidePopover"
      />
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
import EditIcon from '@/assets/icons/EditIcon.vue';
import ApproveIcon from '@/assets/icons/ApproveIcon.vue';
import CancelIcon from '@/assets/icons/CancelIcon.vue';
import Pagination from '@/utils/Pagination.vue';
import Swal from 'sweetalert2';
import AuthCodeModal from '@/view/pages/nhis/components/AuthCodeModal.vue';
import DrugPopover from '@/view/components/popover/DrugPopover.vue';
import { getItemType, parseJwt } from '@/common/common';
import ChangeDrugGroup from '@/view/pages/nhis/components/ChangeDrugGroup.vue';
import OpenIcon from '@/assets/icons/OpenIcon.vue';

export default {
  components: {
    OpenIcon,
    ChangeDrugGroup,
    DrugPopover,
    AuthCodeModal,
    Pagination,
    CancelIcon,
    ApproveIcon,
    EditIcon,
  },
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
    drug: {},
    drugGroupData: {},
    displayDrugGroupPrompt: false,
    dispatchType: 'order/updatePrescribedDrug',
    showPopover: false,
    popOverId: 'popover-reactive-90',
    currentUser: parseJwt(localStorage.getItem('user_token')),
  }),
  computed: {
    drugs() {
      return this.$store.state.order.drug_orders;
    },
    queriedItems() {
      return this.$store.state.order.totalDrugsOrders || 0;
    },
    pages() {
      return this.$store.state.order.drugsPages;
    },
    perPage() {
      return this.drugs.length;
    },
    visit() {
      return this.$store.state.visit.visit;
    },
  },
  methods: {
    getItemType,
    addAuthCode(drug) {
      this.drug = {
        id: drug.id,
        name: drug?.drug?.name,
      };
      this.displayPrompt = true;
    },

    hideModal() {
      this.displayPrompt = false;
    },

    openDrugGroupModal(drug) {
      this.drugGroupData = {
        id: drug.id,
        name: drug?.drug?.name,
      };
      this.displayDrugGroupPrompt = true;
    },

    hideDrugGroupModal() {
      this.displayDrugGroupPrompt = false;
    },

    fetchPrescribedDrugs() {
      this.$store.dispatch('order/fetchPrescribedDrugs', {
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        filter: { visit_id: this.$route.params.id },
      });
    },

    onPageChange(page) {
      this.currentPage = page;
      this.fetchPrescribedDrugs();
    },

    showStatusChangeAlert(nhis_status, drug) {
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
          self.changeDrugNhisStatus({ nhis_status, drug });
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

    processDrugsValidations(nhis_status, drug) {
      return (
        nhis_status === this.APPROVED &&
        drug?.drug_group === this.SECONDARY &&
        drug.drug_type === this.NHIS &&
        !drug.auth_code
      );
    },

    changeDrugNhisStatus({ nhis_status, drug }) {
      if (this.processDrugsValidations(nhis_status, drug)) {
        return this.$notify({
          group: 'foo',
          title: 'Error message',
          text: 'Secondary drugs cannot be processed without authorization code!',
          type: 'error',
        });
      }
      this.$store
        .dispatch('order/updatePrescribedDrug', {
          data: {
            nhis_status,
            id: drug.id,
            payment_status: nhis_status === this.APPROVED ? this.CLEARED : this.PENDING,
            nhis_drug_processed_by: this.currentUser.sub,
            date_nhis_drug_processed: new Date(),
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

    viewPopover(drug) {
      this.item = drug;
      this.showPopover = true;
    },

    hidePopover() {
      this.showPopover = false;
    },

    disableStatusChange(drug) {
      if (drug.drug_group === this.SECONDARY && !drug.auth_code && drug.drug_type === this.NHIS) {
        return true;
      }
      if (drug.nhis_status === this.APPROVED || drug.nhis_status === this.DECLINED) return true;
    },

    disableAddAuthCode(drug) {
      if (drug.drug_group === this.PRIMARY) return true;
      if (drug.nhis_status === this.APPROVED || drug.nhis_status === this.DECLINED) return true;
    },

    isDrugProcessed(drug) {
      return drug.nhis_status === this.APPROVED || drug.nhis_status === this.DECLINED;
    },
  },
  created() {
    this.fetchPrescribedDrugs();
  },
};
</script>

<style scoped></style>
