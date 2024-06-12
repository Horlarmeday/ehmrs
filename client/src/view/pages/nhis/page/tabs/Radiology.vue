<template>
  <div class="card card-custom card-stretch gutter-b card-shadowless">
    <auth-code-modal
      @closeModal="hideModal"
      :dispatch-type="dispatchType"
      :display-prompt="displayPrompt"
      :data="investigation"
    />

    <div class="card-body pr-5 pl-5 pt-2">
      <div class="table-responsive">
        <table class="table table-head-custom table-vertical-center">
          <thead>
            <tr class="text-left">
              <th class="pr-0" style="width: 250px">Investigation</th>
              <th style="min-width: 100px">Type</th>
              <th style="min-width: 50px">Imaging</th>
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
                  >{{ investigation.investigation.name }}</a
                >
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                  {{ investigation.investigation.type }}
                </span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                  {{ investigation.imaging.name }}
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
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                  {{ investigation.source }}
                </span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                  {{ investigation.auth_code || '-' }}
                </span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg">{{
                  investigation?.examiner?.fullname
                }}</span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                  {{ investigation.date_requested | dayjs('ddd, MMM Do YYYY, h:mma') }}
                </span>
              </td>
              <td class="pr-0 text-right">
                <a
                  title="Add Authorization Code"
                  v-b-tooltip.hover
                  href="#"
                  class="btn btn-icon btn-light btn-hover-primary btn-sm mr-2"
                  @click="addAuthCode(investigation)"
                >
                  <edit-icon />
                </a>
                <a
                  title="Approve"
                  v-b-tooltip.hover
                  href="#"
                  class="btn btn-icon btn-light btn-hover-success btn-sm mr-2"
                  @click="showDischargeAlert('Approved', investigation.id)"
                >
                  <approve-icon />
                </a>
                <a
                  title="Decline"
                  v-b-tooltip.hover
                  href="#"
                  class="btn btn-icon btn-light btn-hover-danger btn-sm"
                  @click="showDischargeAlert('Declined', investigation.id)"
                >
                  <cancel-icon />
                </a>
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

export default {
  components: { AuthCodeModal, Pagination, CancelIcon, ApproveIcon, EditIcon },
  data: () => ({
    PENDING: 'Pending',
    PRIMARY: 'Primary',
    DISABLED: 'disabled',
    CLEARED: 'Cleared',
    APPROVED: 'Approved',
    SECONDARY: 'Secondary',
    currentPage: 1,
    itemsPerPage: 15,
    investigation: {},
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
  },
  methods: {
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
  },
  created() {
    this.fetchPrescribedInvestigations();
  },
};
</script>

<style scoped></style>
