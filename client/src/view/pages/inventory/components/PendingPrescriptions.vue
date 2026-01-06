<template>
  <div class="card-custom gutter-b">
    <!--begin::Header-->
    <div class="card-header border-0 py-5">
      <h3 class="card-title align-items-start flex-column">
        <span class="card-label font-weight-bolder text-dark">Pending Prescriptions</span>
      </h3>
    </div>
    <!--end::Header-->

    <!--begin::Body-->
    <div class="card-body py-0">
      <!--begin::Table-->
      <div class="table-responsive">
        <table class="table table-head-custom table-vertical-center" id="kt_advance_table_widget_1">
          <thead>
            <tr class="text-left">
              <th style="min-width: 70px">Patient ID</th>
              <th style="min-width: 200px">Patient Name</th>
              <th style="min-width: 100px">Status</th>
              <th style="min-width: 70px">Qty to Dispense</th>
              <th style="min-width: 70px">Qty Dispensed</th>
              <th style="min-width: 70px">Remaining Qty</th>
              <th style="min-width: 150px">Date Prescribed</th>
              <th style="min-width: 150px">Examiner</th>
              <th style="min-width: 50px"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="prescriptions.length === 0">
              <td colspan="9" align="center" class="text-muted">No Pending Prescriptions</td>
            </tr>
            <tr v-for="prescription in prescriptions" :key="prescription.id">
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                  {{ prescription?.patient?.hospital_id }}
                </span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                  {{ prescription?.patient?.firstname }} {{ prescription?.patient?.lastname }}
                </span>
              </td>
              <td>
                <span
                  :class="getStatusClass(prescription.dispense_status)"
                  class="label label-inline"
                >
                  {{ prescription.dispense_status }}
                </span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                  {{ prescription.quantity_to_dispense }}
                  <span v-if="prescription.unit">{{ prescription.unit.name }}</span>
                </span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                  {{ prescription.quantity_dispensed }}
                  <span v-if="prescription.unit">{{ prescription.unit.name }}</span>
                </span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                  {{ getRemainingQuantity(prescription) }}
                  <span v-if="prescription.unit">{{ prescription.unit.name }}</span>
                </span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                  {{ prescription.date_prescribed | dayjs('DD/MM/YYYY, h:mma') }}
                </span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                  {{ prescription?.requester?.firstname || '' }}
                  {{ prescription?.requester?.lastname || '' }}
                </span>
              </td>
              <td>
                <router-link
                  v-b-tooltip.hover
                  title="Dispense drug"
                  :to="`/pharmacy/prescriptions/${prescription.drug_prescription_id}`"
                  class="btn btn-icon btn-light btn-hover-primary btn-sm"
                >
                  <ArrowRightIcon />
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!--end::Table-->
      <pagination
        :total-pages="pages"
        :total="queriedItems"
        :per-page="perPage"
        :current-page="currentPage"
        @pagechanged="onPageChange"
      />
    </div>
    <!--end::Body-->
  </div>
</template>

<script>
import Pagination from '@/utils/Pagination.vue';
import ArrowRightIcon from '@/assets/icons/ArrowRightIcon.vue';
export default {
  name: 'PendingPrescriptions',
  components: {
    Pagination,
    ArrowRightIcon,
  },
  data: () => ({
    itemsPerPage: 10,
    currentPage: 1,
  }),
  computed: {
    prescriptions() {
      return this.$store.state.inventory.pendingPrescriptions;
    },
    queriedItems() {
      return this.$store.state.inventory.pendingPrescriptionsTotal;
    },
    pages() {
      return this.$store.state.inventory.pendingPrescriptionsPages;
    },
    perPage() {
      return this.prescriptions.length;
    },
  },
  methods: {
    handlePageChange() {
      this.$store.dispatch('inventory/fetchPendingPrescriptions', {
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        inventoryItemId: this.$route.params.id,
      });
    },
    onPageChange(page) {
      this.currentPage = page;
      this.handlePageChange();
    },
    getRemainingQuantity(prescription) {
      return prescription.quantity_to_dispense - prescription.quantity_dispensed;
    },
    getStatusClass(status) {
      if (status === 'Dispensed') return 'label-success';
      if (status === 'Pending') return 'label-warning';
      if (status === 'Partial_Dispensed') return 'label-info';
      return 'label-default';
    },
  },
  created() {
    this.$store.dispatch('inventory/fetchPendingPrescriptions', {
      currentPage: this.currentPage,
      itemsPerPage: this.itemsPerPage,
      inventoryItemId: this.$route.params.id,
    });
  },
};
</script>

<style scoped></style>
