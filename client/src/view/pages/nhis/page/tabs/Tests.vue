<template>
  <div class="card card-custom card-stretch gutter-b card-shadowless">
    <auth-code-modal
      @closeModal="hideModal"
      :dispatch-type="dispatchType"
      :display-prompt="displayPrompt"
      :data="test"
    />
    <div class="card-body pr-5 pl-5 pt-2">
      <div class="table-responsive">
        <table class="table table-head-custom table-vertical-center">
          <thead>
            <tr class="text-left">
              <th class="pr-0" style="width: 250px">Test</th>
              <th style="min-width: 100px">Type</th>
              <th style="min-width: 100px">Status</th>
              <th style="min-width: 50px">Source</th>
              <th style="min-width: 50px">Code</th>
              <th style="min-width: 100px">Requester</th>
              <th style="min-width: 150px">Date Requested</th>
              <th class="pr-0 text-right" style="min-width: 150px">action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!tests.length">
              <td colspan="9" align="center" class="text-muted">No Data</td>
            </tr>
            <tr v-for="test in tests" :key="test.id">
              <td class="pr-0">
                <span title="Result added" v-b-tooltip.hover v-if="test.result_status === ACCEPTED"
                  ><i class="fas fa-check-circle text-success mr-1"></i
                ></span>
                <router-link
                  class="font-weight-bolder text-hover-primary mb-1 font-size-lg"
                  :class="getTextStatus(test.nhis_status)"
                  to="#"
                  >{{ test.test.name }}</router-link
                >
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                  {{ test.test.type }}
                </span>
              </td>
              <td>
                <span
                  :class="getPaymentStatus(test.payment_status)"
                  class="label label-lg label-inline"
                  >{{ test.payment_status }}</span
                >
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                  {{ test.source }}
                </span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                  {{ test.auth_code || '-' }}
                </span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg">{{
                  test?.examiner?.fullname
                }}</span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                  {{ test.date_requested | dayjs('MMM Do YYYY, h:mma') }}
                </span>
              </td>
              <td class="pr-0 text-right">
                <a
                  title="Add Authorization Code"
                  v-b-tooltip.hover
                  :class="test.test.type === PRIMARY || test.auth_code ? DISABLED : ''"
                  href="#"
                  class="btn btn-icon btn-light btn-hover-primary btn-sm mr-2"
                  @click="addAuthCode(test)"
                >
                  <edit-icon />
                </a>
                <a
                  title="Approve"
                  v-b-tooltip.hover
                  :class="test.nhis_status !== PENDING && DISABLED"
                  href="#"
                  class="btn btn-icon btn-light btn-hover-success btn-sm mr-2"
                  @click="showDischargeAlert('Approved', test.id)"
                >
                  <approve-icon />
                </a>
                <a
                  title="Decline"
                  v-b-tooltip.hover
                  :class="test.nhis_status !== PENDING && DISABLED"
                  href="#"
                  class="btn btn-icon btn-light btn-hover-danger btn-sm"
                  @click="showDischargeAlert('Declined', test.id)"
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
import AuthCodeModal from '@/view/pages/nhis/components/AuthCodeModal.vue';
import Swal from 'sweetalert2';

export default {
  components: { AuthCodeModal, Pagination, CancelIcon, ApproveIcon, EditIcon },
  data: () => ({
    PENDING: 'Pending',
    PRIMARY: 'Primary',
    DISABLED: 'disabled',
    currentPage: 1,
    itemsPerPage: 15,
    CLEARED: 'Cleared',
    APPROVED: 'Approved',
    SECONDARY: 'Secondary',
    ACCEPTED: 'Accepted',
    test: {},
    displayPrompt: false,
    dispatchType: 'order/updatePrescribedTest',
  }),
  computed: {
    tests() {
      return this.$store.state.order.lab_orders;
    },
    queriedItems() {
      return this.$store.state.order.total || 0;
    },
    pages() {
      return this.$store.state.order.pages;
    },
    perPage() {
      return this.tests.length;
    },
  },
  methods: {
    addAuthCode(test) {
      this.test = {
        id: test.id,
        name: test?.test?.name,
      };
      this.displayPrompt = true;
    },

    hideModal() {
      this.displayPrompt = false;
    },

    fetchPrescribedTests() {
      this.$store.dispatch('order/fetchPrescribedTests', {
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        filter: { visit_id: this.$route.params.id },
      });
    },

    onPageChange(page) {
      this.currentPage = page;
      this.fetchPrescribedTests();
    },

    getPaymentStatus(status) {
      if (status === 'Paid') return 'label-light-success ';
      if (status === 'Pending') return 'label-light-warning ';
      if (status === 'Permitted') return 'label-light-primary ';
      if (status === 'Cleared') return 'label-light-info ';
      return 'label-light-dark ';
    },

    showDischargeAlert(nhis_status, testId) {
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
          self.changeTestNhisStatus({ nhis_status, testId });
        }
      });
    },

    handleSuccess(status) {
      Swal.fire({
        title: `${status}!`,
        html: `Test has been ${status?.toLowerCase()}`,
        icon: 'success',
        confirmButtonClass: 'btn btn-primary',
        heightAuto: false,
      });
    },

    changeTestNhisStatus({ nhis_status, testId }) {
      this.$store
        .dispatch('order/updatePrescribedTest', {
          data: {
            nhis_status,
            id: testId,
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
    this.fetchPrescribedTests();
  },
};
</script>

<style scoped></style>
