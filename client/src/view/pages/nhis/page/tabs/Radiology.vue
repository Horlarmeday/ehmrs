<template>
  <div class="card card-custom card-stretch gutter-b card-shadowless">
    <auth-code-modal
      @closeModal="hideModal"
      :dispatch-type="dispatchType"
      :display-prompt="displayPrompt"
      :data="investigation"
    />

    <change-investigation-group
      :investigation="investigationGroupData"
      :display-prompt="displayInvestigationGroupPrompt"
      @closeModal="hideInvestigationGroupModal"
    />

    <div class="card-body pr-5 pl-5 pt-2">
      <div class="table-responsive">
        <table class="table table-head-custom table-vertical-center">
          <thead>
            <tr class="text-left">
              <th class="pr-0" style="width: 250px">Investigation</th>
              <th style="min-width: 100px">Type</th>
              <th style="min-width: 50px">Imaging</th>
              <th style="min-width: 50px">Price(₦)</th>
              <th style="min-width: 100px">Status</th>
              <th style="min-width: 50px">Source</th>
              <th style="min-width: 50px">Code</th>
              <th style="min-width: 100px">Requester</th>
              <th style="min-width: 150px">Date</th>
              <th class="pr-0 text-right" style="min-width: 150px">action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!investigations.length">
              <td colspan="9" align="center" class="text-muted">No Data</td>
            </tr>
            <tr v-for="investigation in investigations" :key="investigation.id">
              <td class="pr-0">
                <span title="Approved" v-b-tooltip.hover v-if="investigation.status === APPROVED"
                  ><i class="fas fa-check-circle text-success mr-1"></i
                ></span>
                <a
                  class="font-weight-bolder text-hover-primary mb-1 font-size-lg"
                  :class="getTextStatus(investigation.nhis_status)"
                  href="#"
                  >{{ investigation?.investigation?.name }}</a
                >
                <span
                  :class="getItemType(investigation?.investigation_type)"
                  class="label label-sm label-inline ml-2"
                  >{{ investigation.investigation_type }}</span
                >
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-md">
                  {{ investigation?.investigation_group || '-' }}
                </span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-md">
                  {{ investigation?.imaging?.name }}
                </span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-md">
                  {{ investigation.price }}
                </span>
              </td>
              <td>
                <span
                  :class="getPaymentStatus(investigation.payment_status)"
                  class="label label-lg label-inline"
                  >{{ investigation.payment_status }}</span
                >
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-md">
                  {{ investigation.source }}
                </span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-md">
                  {{ investigation.auth_code || '-' }}
                </span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-md">{{
                  investigation?.examiner?.fullname
                }}</span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-md">
                  {{ investigation.date_requested | dayjs('MMM Do YYYY, h:mma') }}
                </span>
              </td>
              <td class="pr-0 text-right">
                <button
                  :disabled="
                    investigation.nhis_status === APPROVED || investigation.nhis_status === DECLINED
                  "
                  title="Change Investigation Type"
                  v-b-tooltip.hover
                  href="#"
                  class="btn btn-icon btn-light btn-hover-primary btn-sm mr-2"
                  @click="openInvestigationGroupModal(investigation)"
                >
                  <open-icon />
                </button>
                <button
                  :disabled="disableAddAuthCode(investigation)"
                  title="Add Authorization Code"
                  v-b-tooltip.hover
                  href="#"
                  class="btn btn-icon btn-light btn-hover-primary btn-sm mr-2"
                  @click="addAuthCode(investigation)"
                >
                  <edit-icon />
                </button>
                <button
                  :disabled="disableStatusChange(investigation)"
                  title="Approve"
                  v-b-tooltip.hover
                  href="#"
                  class="btn btn-icon btn-light btn-hover-success btn-sm mr-2"
                  @click="showDischargeAlert('Approved', investigation.id)"
                >
                  <approve-icon />
                </button>
                <button
                  :disabled="disableStatusChange(investigation)"
                  title="Decline"
                  v-b-tooltip.hover
                  href="#"
                  class="btn btn-icon btn-light btn-hover-danger btn-sm"
                  @click="showDischargeAlert('Declined', investigation.id)"
                >
                  <cancel-icon />
                </button>
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
import EditIcon from '@/assets/icons/EditIcon.vue';
import ApproveIcon from '@/assets/icons/ApproveIcon.vue';
import CancelIcon from '@/assets/icons/CancelIcon.vue';
import Pagination from '@/utils/Pagination.vue';
import Swal from 'sweetalert2';
import AuthCodeModal from '@/view/pages/nhis/components/AuthCodeModal.vue';
import ChangeInvestigationGroup from '@/view/pages/nhis/components/ChangeInvestigationGroup.vue';
import { getItemType } from '@/common/common';
import OpenIcon from '@/assets/icons/OpenIcon.vue';

export default {
  components: {
    OpenIcon,
    ChangeInvestigationGroup,
    AuthCodeModal,
    Pagination,
    CancelIcon,
    ApproveIcon,
    EditIcon,
  },
  data: () => ({
    PENDING: 'Pending',
    PRIMARY: 'Primary',
    DISABLED: 'disabled',
    CLEARED: 'Cleared',
    APPROVED: 'Approved',
    SECONDARY: 'Secondary',
    DECLINED: 'Declined',
    currentPage: 1,
    itemsPerPage: 15,
    investigation: {},
    investigationGroupData: {},
    displayInvestigationGroupPrompt: false,
    displayPrompt: false,
    dispatchType: 'order/updatePrescribedInvestigation',
  }),
  computed: {
    investigations() {
      return this.$store.state.order.radiology_orders;
    },
    queriedItems() {
      return this.$store.state.order.totalInvestigations || 0;
    },
    pages() {
      return this.$store.state.order.investigationPages;
    },
    perPage() {
      return this.investigations.length;
    },
    visit() {
      return this.$store.state.visit.visit;
    },
  },
  methods: {
    getItemType,
    addAuthCode(investigation) {
      this.investigation = {
        id: investigation.id,
        name: investigation?.investigation?.name,
      };
      this.displayPrompt = true;
    },

    hideModal() {
      this.displayPrompt = false;
    },

    openInvestigationGroupModal(investigation) {
      this.investigationGroupData = {
        id: investigation.id,
        name: investigation?.investigation?.name,
      };
      this.displayInvestigationGroupPrompt = true;
    },

    hideInvestigationGroupModal() {
      this.displayInvestigationGroupPrompt = false;
    },

    fetchPrescribedInvestigations() {
      this.$store.dispatch('order/fetchRadiologyOrders', {
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        filter: { visit_id: this.$route.params.id },
      });
    },

    onPageChange(page) {
      this.currentPage = page;
      this.fetchPrescribedInvestigations();
    },

    getPaymentStatus(status) {
      if (status === 'Paid') return 'label-light-success ';
      if (status === 'Pending') return 'label-light-warning ';
      if (status === 'Permitted') return 'label-light-primary ';
      if (status === 'Cleared') return 'label-light-info ';
      return 'label-light-dark ';
    },

    showDischargeAlert(nhis_status, investigationId) {
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
          self.changeInvestigationNhisStatus({ nhis_status, investigationId });
        }
      });
    },

    handleSuccess(status) {
      Swal.fire({
        title: `${status}!`,
        html: `Investigation has been ${status?.toLowerCase()}`,
        icon: 'success',
        confirmButtonClass: 'btn btn-primary',
        heightAuto: false,
      });
    },

    changeInvestigationNhisStatus({ nhis_status, investigationId }) {
      this.$store
        .dispatch('order/updatePrescribedInvestigation', {
          data: {
            nhis_status,
            id: investigationId,
            payment_status: nhis_status === this.APPROVED ? this.CLEARED : this.PENDING,
          },
        })
        .then(() => this.handleSuccess(nhis_status));
    },

    getTextStatus(status) {
      if (status === 'Approved') return 'text-success';
      if (status === 'Declined') return 'text-danger';
      return 'text-dark-75';
    },

    disableStatusChange(investigation) {
      const INCLUDED_INSURANCE = ['NHIS', 'FHSS'];
      if (
        investigation.investigation_group === this.SECONDARY &&
        !investigation.auth_code &&
        INCLUDED_INSURANCE.includes(this.visit?.insurance?.insurance?.name)
      ) {
        return true;
      }
      if (
        investigation.nhis_status === this.APPROVED ||
        investigation.nhis_status === this.DECLINED
      )
        return true;
    },

    disableAddAuthCode(investigation) {
      if (investigation.investigation_group === this.PRIMARY) return true;
      if (
        investigation.nhis_status === this.APPROVED ||
        investigation.nhis_status === this.DECLINED
      )
        return true;
    },
  },
  created() {
    this.fetchPrescribedInvestigations();
  },
};
</script>

<style scoped></style>
