<template>
  <div class="card card-custom card-stretch gutter-b card-shadowless">
    <auth-code-modal
      @closeModal="hideModal"
      :dispatch-type="dispatchType"
      :display-prompt="displayPrompt"
      :data="service"
    />

    <change-service-group
      :service="serviceGroupData"
      :display-prompt="displayServiceGroupPrompt"
      @closeModal="hideServiceGroupModal"
    />

    <div class="card-body pr-5 pl-5 pt-2">
      <div class="table-responsive">
        <table class="table table-head-custom table-vertical-center">
          <thead>
            <tr class="text-left">
              <th class="pr-0" style="width: 300px">Service</th>
              <th style="min-width: 100px">Type</th>
              <th style="min-width: 100px">Status</th>
              <th style="min-width: 50px">Price(₦)</th>
              <th style="min-width: 50px">Code</th>
              <th style="min-width: 100px">Requester</th>
              <th style="min-width: 150px">Date Requested</th>
              <th class="pr-0 text-right" style="min-width: 150px">action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!services.length">
              <td colspan="9" align="center" class="text-muted">No Data</td>
            </tr>
            <tr v-for="service in services" :key="service.id">
              <td class="pr-0">
                <router-link
                  class="font-weight-bolder text-hover-primary mb-1 font-size-lg"
                  :class="getTextStatus(service.nhis_status)"
                  to="#"
                  >{{ service.service.name }}</router-link
                >
                <span
                  :class="getItemType(service?.service_type)"
                  class="label label-sm label-inline ml-2"
                  >{{ service.service_type }}</span
                >
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-md">
                  {{ service.service_group || '-' }}
                </span>
              </td>
              <td>
                <span
                  :class="getPaymentStatus(service.payment_status)"
                  class="label label-lg label-inline"
                  >{{ service.payment_status }}</span
                >
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-md">
                  {{ service.price }}
                </span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-md">
                  {{ service.auth_code || '-' }}
                </span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-md">{{
                  service?.examiner?.fullname
                }}</span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-md">
                  {{ service.date_requested | dayjs('MMM Do YYYY, h:mma') }}
                </span>
              </td>
              <td class="pr-0 text-right">
                <button
                  :disabled="service.nhis_status === APPROVED || service.nhis_status === DECLINED"
                  title="Change service Type"
                  v-b-tooltip.hover
                  href="#"
                  class="btn btn-icon btn-light btn-hover-primary btn-sm mr-2"
                  @click="openServiceGroupModal(service)"
                >
                  <open-icon />
                </button>
                <button
                  :disabled="disableAddAuthCode(service)"
                  title="Add Authorization Code"
                  v-b-tooltip.hover
                  href="#"
                  class="btn btn-icon btn-light btn-hover-primary btn-sm mr-2"
                  @click="addAuthCode(service)"
                >
                  <edit-icon />
                </button>
                <button
                  :disabled="disableStatusChange(service)"
                  title="Approve"
                  v-b-tooltip.hover
                  href="#"
                  class="btn btn-icon btn-light btn-hover-success btn-sm mr-2"
                  @click="showDischargeAlert('Approved', service.id)"
                >
                  <approve-icon />
                </button>
                <button
                  :disabled="disableStatusChange(service)"
                  title="Decline"
                  v-b-tooltip.hover
                  href="#"
                  class="btn btn-icon btn-light btn-hover-danger btn-sm"
                  @click="showDischargeAlert('Declined', service.id)"
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
import AuthCodeModal from '@/view/pages/nhis/components/AuthCodeModal.vue';
import Swal from 'sweetalert2';
import { getItemType } from '@/common/common';
import OpenIcon from '@/assets/icons/OpenIcon.vue';
import ChangeServiceGroup from '@/view/pages/nhis/components/ChangeServiceGroup.vue';

export default {
  components: {
    ChangeServiceGroup,
    OpenIcon,
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
    currentPage: 1,
    itemsPerPage: 15,
    CLEARED: 'Cleared',
    APPROVED: 'Approved',
    SECONDARY: 'Secondary',
    DECLINED: 'Declined',
    service: {},
    displayPrompt: false,
    dispatchType: 'order/updatePrescribedService',
    serviceGroupData: {},
    displayServiceGroupPrompt: false,
  }),
  computed: {
    services() {
      return this.$store.state.order.service_orders;
    },
    queriedItems() {
      return this.$store.state.order.totalServices || 0;
    },
    pages() {
      return this.$store.state.order.servicePages;
    },
    perPage() {
      return this.services.length;
    },
    visit() {
      return this.$store.state.visit.visit;
    },
  },
  methods: {
    getItemType,
    addAuthCode(service) {
      this.service = {
        id: service.id,
        name: service?.service?.name,
      };
      this.displayPrompt = true;
    },

    hideModal() {
      this.displayPrompt = false;
    },

    openServiceGroupModal(service) {
      this.serviceGroupData = {
        id: service.id,
        name: service?.service?.name,
      };
      this.displayServiceGroupPrompt = true;
    },

    hideServiceGroupModal() {
      this.displayServiceGroupPrompt = false;
    },

    fetchPrescribedServices() {
      this.$store.dispatch('order/fetchPrescribedServices', {
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        filter: { visit_id: this.$route.params.id },
      });
    },

    onPageChange(page) {
      this.currentPage = page;
      this.fetchPrescribedServices();
    },

    handlePageCount(count) {
      this.fetchPrescribedServices({
        currentPage: this.currentPage,
        itemsPerPage: count,
      });
    },

    getPaymentStatus(status) {
      if (status === 'Paid') return 'label-light-success ';
      if (status === 'Pending') return 'label-light-warning ';
      if (status === 'Permitted') return 'label-light-primary ';
      if (status === 'Cleared') return 'label-light-info ';
      return 'label-light-dark ';
    },

    showDischargeAlert(nhis_status, serviceId) {
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
          self.changeServiceNhisStatus({ nhis_status, serviceId });
        }
      });
    },

    handleSuccess(status) {
      Swal.fire({
        title: `${status}!`,
        html: `Service has been ${status?.toLowerCase()}`,
        icon: 'success',
        confirmButtonClass: 'btn btn-primary',
        heightAuto: false,
      });
    },

    changeServiceNhisStatus({ nhis_status, serviceId }) {
      this.$store
        .dispatch('order/updatePrescribedService', {
          data: {
            nhis_status,
            id: serviceId,
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

    disableStatusChange(service) {
      const INCLUDED_INSURANCE = ['NHIS', 'FHSS'];
      if (
        service.service_group === this.SECONDARY &&
        !service.auth_code &&
        INCLUDED_INSURANCE.includes(this.visit?.insurance?.insurance?.name)
      ) {
        return true;
      }
      if (service.nhis_status === this.APPROVED || service.nhis_status === this.DECLINED)
        return true;
    },

    disableAddAuthCode(service) {
      if (service.service_group === this.PRIMARY) return true;
      if (service.nhis_status === this.APPROVED || service.nhis_status === this.DECLINED)
        return true;
    },
  },
  created() {
    this.fetchPrescribedServices();
  },
};
</script>

<style scoped></style>
