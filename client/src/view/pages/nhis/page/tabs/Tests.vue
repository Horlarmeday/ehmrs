<template>
  <div class="card card-custom card-stretch gutter-b card-shadowless">
    <auth-code-modal
      @closeModal="hideModal"
      :dispatch-type="dispatchType"
      :display-prompt="displayPrompt"
      :data="test"
    />

    <change-test-group
      :test="testGroupData"
      :display-prompt="displayTestGroupPrompt"
      @closeModal="hideTestGroupModal"
    />
    <div class="card-body pr-5 pl-5 pt-2">
      <div class="table-responsive">
        <table class="table table-head-custom table-vertical-center">
          <thead>
            <tr class="text-left">
              <th class="pr-0" style="width: 250px">Test</th>
              <th style="min-width: 100px">Type</th>
              <th style="min-width: 100px">Status</th>
              <th style="min-width: 50px">Price(₦)</th>
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
                <span
                  :class="getItemType(test?.test_type)"
                  class="label label-sm label-inline ml-2"
                  >{{ test.test_type }}</span
                >
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-md">
                  {{ test.test_group || '-' }}
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
                <span class="text-dark-75 font-weight-bolder d-block font-size-md">
                  {{ test.price || '-' }}
                </span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-md">
                  {{ test.source }}
                </span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-md">
                  {{ test.auth_code || '-' }}
                </span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-md">{{
                  test?.examiner?.fullname
                }}</span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-md">
                  {{ test.date_requested | dayjs('MMM Do YYYY, h:mma') }}
                </span>
              </td>
              <td class="pr-0 text-right">
                <div v-if="!isTestProcessed(test)">
                  <button
                    :disabled="test.nhis_status === APPROVED || test.nhis_status === DECLINED"
                    title="Change Test Type"
                    v-b-tooltip.hover
                    href="#"
                    class="btn btn-icon btn-light btn-hover-primary btn-sm mr-2"
                    @click="openTestGroupModal(test)"
                  >
                    <open-icon />
                  </button>
                  <button
                    :disabled="disableAddAuthCode(test)"
                    title="Add Authorization Code"
                    v-b-tooltip.hover
                    href="#"
                    class="btn btn-icon btn-light btn-hover-primary btn-sm mr-2"
                    @click="addAuthCode(test)"
                  >
                    <edit-icon />
                  </button>
                  <button
                    :disabled="disableStatusChange(test)"
                    title="Approve"
                    v-b-tooltip.hover
                    href="#"
                    class="btn btn-icon btn-light btn-hover-success btn-sm mr-2"
                    @click="showStatusChangeAlert('Approved', test)"
                  >
                    <approve-icon />
                  </button>
                  <button
                    :disabled="disableStatusChange(test)"
                    title="Decline"
                    v-b-tooltip.hover
                    href="#"
                    class="btn btn-icon btn-light btn-hover-danger btn-sm"
                    @click="showStatusChangeAlert('Declined', test)"
                  >
                    <cancel-icon />
                  </button>
                </div>
                <div v-else>
                  <span class="text-dark-50 mr-2">Processed By: </span>
                  <span class="text-dark-75 font-weight-bolder d-block font-size-md">{{
                    test?.nhis_test_processor?.fullname || '-'
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
import EditIcon from '@/assets/icons/EditIcon.vue';
import ApproveIcon from '@/assets/icons/ApproveIcon.vue';
import CancelIcon from '@/assets/icons/CancelIcon.vue';
import Pagination from '@/utils/Pagination.vue';
import AuthCodeModal from '@/view/pages/nhis/components/AuthCodeModal.vue';
import Swal from 'sweetalert2';
import { getItemType, parseJwt } from '@/common/common';
import OpenIcon from '@/assets/icons/OpenIcon.vue';
import ChangeTestGroup from '@/view/pages/nhis/components/ChangeTestGroup.vue';

export default {
  components: {
    ChangeTestGroup,
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
    ACCEPTED: 'Accepted',
    DECLINED: 'Declined',
    NHIS: 'NHIS',
    test: {},
    testGroupData: {},
    displayPrompt: false,
    displayTestGroupPrompt: false,
    dispatchType: 'order/updatePrescribedTest',
    currentUser: parseJwt(localStorage.getItem('user_token')),
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
    visit() {
      return this.$store.state.visit.visit;
    },
  },
  methods: {
    getItemType,
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

    openTestGroupModal(test) {
      this.testGroupData = {
        id: test.id,
        name: test?.test?.name,
      };
      this.displayTestGroupPrompt = true;
    },

    hideTestGroupModal() {
      this.displayTestGroupPrompt = false;
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

    showStatusChangeAlert(nhis_status, test) {
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
          self.changeTestNhisStatus({ nhis_status, test });
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

    processTestValidations(nhis_status, test) {
      return (
        nhis_status === this.APPROVED &&
        test?.test_group === this.SECONDARY &&
        test.test_type === this.NHIS &&
        !test.auth_code
      );
    },

    changeTestNhisStatus({ nhis_status, test }) {
      if (this.processTestValidations(nhis_status, test)) {
        return this.$notify({
          group: 'foo',
          title: 'Error message',
          text: 'Secondary tests cannot be processed without authorization code!',
          type: 'error',
        });
      }
      this.$store
        .dispatch('order/updatePrescribedTest', {
          data: {
            nhis_status,
            id: test.id,
            payment_status: nhis_status === this.APPROVED ? this.CLEARED : this.PENDING,
            nhis_test_processed_by: this.currentUser.sub,
            date_nhis_test_processed: new Date(),
          },
        })
        .then(() => this.handleSuccess(nhis_status));
    },

    getTextStatus(status) {
      if (status === 'Approved') return 'text-success';
      if (status === 'Declined') return 'text-danger';
      return 'text-dark-75';
    },

    disableStatusChange(test) {
      if (test.test_group === this.SECONDARY && !test.auth_code && test.test_type === this.NHIS) {
        return true;
      }
      if (test.nhis_status === this.APPROVED || test.nhis_status === this.DECLINED) return true;
    },

    disableAddAuthCode(test) {
      if (test.test_group === this.PRIMARY) return true;
      if (test.nhis_status === this.APPROVED || test.nhis_status === this.DECLINED) return true;
    },

    isTestProcessed(test) {
      return test.nhis_status === this.APPROVED || test.nhis_status === this.DECLINED;
    },
  },
  created() {
    this.fetchPrescribedTests();
  },
};
</script>

<style scoped></style>
