<template>
  <div class="card card-custom card-stretch gutter-b card-shadowless">
    <auth-code-modal
      @closeModal="hideModal"
      :dispatch-type="dispatchType"
      :display-prompt="displayPrompt"
      :data="drug"
    />

    <div class="card-body pr-5 pl-5 pt-2">
      <div class="table-responsive">
        <table class="table table-head-custom table-vertical-center">
          <thead>
            <tr class="text-left">
              <th class="pr-0" style="width: 250px">Drug</th>
              <th style="min-width: 100px">Type</th>
              <th style="min-width: 50px">Dose</th>
              <th style="min-width: 100px">Status</th>
              <th style="min-width: 50px">Source</th>
              <th style="min-width: 50px">Code</th>
              <th style="min-width: 100px">Requester</th>
              <th style="min-width: 150px">Date</th>
              <th class="pr-0 text-right" style="min-width: 150px">action</th>
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
                  class="font-weight-bolder text-hover-primary mb-1 font-size-lg"
                  :class="getDrugTextStatus(drug.nhis_status)"
                  href="#"
                  :id="popOverId"
                  >{{ drug.drug.name }}</a
                >
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                  {{ drug.drug_group }}
                </span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
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
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                  {{ drug.source }}
                </span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                  {{ drug.auth_code || '-' }}
                </span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg">{{
                  drug?.requester?.fullname
                }}</span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                  {{ drug.date_prescribed | dayjs('MMM D, YYYY, h:mma') }}
                </span>
              </td>
              <td class="pr-0 text-right">
                <a
                  title="Add Authorization Code"
                  v-b-tooltip.hover
                  :class="drug.drug_group === PRIMARY || drug.auth_code ? DISABLED : ''"
                  href="#"
                  class="btn btn-icon btn-light btn-hover-primary btn-sm mr-2"
                  @click="addAuthCode(drug)"
                >
                  <edit-icon />
                </a>
                <a
                  title="Approve"
                  v-b-tooltip.hover
                  :class="drug.nhis_status !== PENDING && DISABLED"
                  href="#"
                  class="btn btn-icon btn-light btn-hover-success btn-sm mr-2"
                  @click="showDischargeAlert('Approved', drug.id)"
                >
                  <approve-icon />
                </a>
                <a
                  title="Decline"
                  v-b-tooltip.hover
                  :class="drug.nhis_status !== PENDING && DISABLED"
                  href="#"
                  class="btn btn-icon btn-light btn-hover-danger btn-sm"
                  @click="showDischargeAlert('Declined', drug.id)"
                >
                  <cancel-icon />
                </a>
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

export default {
  components: { DrugPopover, AuthCodeModal, Pagination, CancelIcon, ApproveIcon, EditIcon },
  data: () => ({
    PENDING: 'Pending',
    PRIMARY: 'Primary',
    SECONDARY: 'Secondary',
    DISABLED: 'disabled',
    APPROVED: 'Approved',
    CLEARED: 'Cleared',
    DISPENSED: 'Dispensed',
    currentPage: 1,
    itemsPerPage: 15,
    displayPrompt: false,
    item: {},
    drug: {},
    dispatchType: 'order/updatePrescribedDrug',
    showPopover: false,
    popOverId: 'popover-reactive-90',
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
  },
  methods: {
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

    showDischargeAlert(nhis_status, drugId) {
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
          self.changeDrugNhisStatus({ nhis_status, drugId });
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

    changeDrugNhisStatus({ nhis_status, drugId }) {
      this.$store
        .dispatch('order/updatePrescribedDrug', {
          data: {
            nhis_status,
            id: drugId,
            payment_status: nhis_status === this.APPROVED ? this.CLEARED : this.PENDING,
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
  },
  created() {
    this.fetchPrescribedDrugs();
  },
};
</script>

<style scoped></style>
