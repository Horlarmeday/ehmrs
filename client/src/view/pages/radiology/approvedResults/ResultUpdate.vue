<template>
  <div class="card card-custom gutter-b">
    <div class="card-header py-5">
      <h3 class="card-title align-items-start flex-column">
        <span class="card-label font-weight-bolder text-dark"
          >{{ $route.query.patient }} Investigations</span
        >
      </h3>
    </div>
    <div class="card-body">
      <b-button-group v-if="selectedInvestigations?.length" size="sm" class="mt-2 mb-2">
        <b-button variant="outline-secondary">
          <span class="font-weight-boldest">{{ selectedInvestigations?.length }} </span>
          <span>Selected</span>
        </b-button>
        <b-button @click="showChangeResultStatusAlert" variant="outline-secondary"
          >Change Result Status</b-button
        >
      </b-button-group>
      <div class="table-responsive">
        <table class="table table-sm">
          <thead class="thead-light">
            <tr class="text-uppercase">
              <th></th>
              <th scope="col">Investigation</th>
              <th scope="col">Price (₦)</th>
              <th scope="col">Payment Status</th>
              <th scope="col">Result Status</th>
              <th scope="col">Requested By</th>
              <th scope="col">Date Requested</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!investigations?.length">
              <td colspan="9" align="center" class="text-muted">No Data</td>
            </tr>
            <tr v-for="(investigation, i) in investigations" :key="i">
              <td class="pl-0">
                <label class="checkbox checkbox-md checkbox-inline">
                  <input
                    :disabled="investigation.status === PENDING"
                    type="checkbox"
                    :checked="isSelected(investigation)"
                    @change="toggleItem(investigation)"
                  />
                  <span></span>
                </label>
              </td>
              <td>
                <span
                  :title="`${investigation.investigation_type}`"
                  v-b-tooltip.hover
                  :class="getLabelDotStatus(investigation.investigation_type)"
                  class="label label-dot label-lg mr-2"
                ></span>
                {{ investigation.investigation.name }}
              </td>
              <td>
                <span class="font-weight-boldest">
                  {{ investigation?.price || '-' }}
                </span>
              </td>
              <td>
                <span :class="getPaymentColor(investigation.payment_status)">{{
                  investigation.payment_status
                }}</span>
              </td>
              <td>
                <span :class="getResultColor(investigation.status)">{{
                  investigation.status
                }}</span>
              </td>
              <td>{{ investigation.examiner.fullname }}</td>
              <td>{{ investigation.createdAt | dayjs('DD/MM/YYYY, h:mma') }}</td>
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
        @changepagecount="handlePageCount"
      />
    </div>
  </div>
</template>
<script>
import { getLabelDotStatus } from '@/common/common';
import Pagination from '@/utils/Pagination.vue';
import Swal from 'sweetalert2';

export default {
  name: 'ResultUpdate',
  components: { Pagination },
  data: () => ({
    currentPage: 1,
    itemsPerPage: 10,
    PENDING: 'Pending',
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
    selectedInvestigations() {
      return this.$store.state.radiology.selectedInvestigations;
    },
  },
  methods: {
    getLabelDotStatus,
    getResultColor(status) {
      if (status === 'Pending') return 'label label-inline label-light-warning font-weight-bold';
      if (status === 'Approved') return 'label label-inline label-light-success font-weight-bold';
      if (status === 'Verified') return 'label label-inline label-light-primary font-weight-bold';
      return 'label label-inline label-light-danger font-weight-bold';
    },

    getPaymentColor(status) {
      if (status === 'Pending') return 'label label-inline label-light-warning font-weight-bold';
      if (status === 'Paid') return 'label label-inline label-light-success font-weight-bold';
      if (status === 'Cleared') return 'label label-inline label-light-info font-weight-bold';
      return 'label label-inline label-light-danger font-weight-bold';
    },

    handlePageCount(count) {
      this.itemsPerPage = count;
      this.fetchInvestigations({
        itemsPerPage: count,
      });
    },

    onPageChange(page) {
      this.currentPage = page;
      this.fetchInvestigations({ itemsPerPage: this.itemsPerPage });
    },

    fetchInvestigations({ itemsPerPage = 10 }) {
      this.$store.dispatch('order/fetchRadiologyOrders', {
        currentPage: this.currentPage,
        itemsPerPage,
        filter: { investigation_prescription_id: this.$route.params.id },
      });
    },

    endRequest() {
      this.$store.dispatch('radiology/removeAllSelectedInvestigations');
      this.fetchInvestigations({ itemsPerPage: this.itemsPerPage });
    },

    isSelected(investigation) {
      return this.selectedInvestigations.includes(investigation);
    },

    toggleItem(investigation) {
      if (this.isSelected(investigation)) {
        // If the item is already selected, remove it from selectedItems
        this.$store.dispatch('radiology/removeSelectedInvestigation', investigation);
      } else {
        // If the item is not selected, add it to selectedItems
        this.$store.dispatch('radiology/addSelectedInvestigations', investigation);
      }
    },

    updateTestResultsStatus() {
      const selectedInvestigationIds = this.selectedInvestigations.map(
        investigation => investigation.id
      );
      this.$store
        .dispatch('radiology/changeBulkInvestigationResultsStatus', {
          selectedInvestigations: selectedInvestigationIds,
          id: this.$route.params.id,
        })
        .then(() => {
          this.endRequest();
        });
    },

    showChangeResultStatusAlert() {
      const self = this;
      Swal.fire({
        title: 'Are you sure?',
        text: `You want to change these investigation results status to ${self.PENDING}`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Change!',
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-default',
        },
      }).then(function(result) {
        if (result.value) {
          self.updateTestResultsStatus();
        }
      });
    },
  },
  created() {
    this.fetchInvestigations({ itemsPerPage: this.itemsPerPage });
  },
};
</script>

<style scoped>
.disabled {
  opacity: 0.5;
  pointer-events: none;
}
</style>
