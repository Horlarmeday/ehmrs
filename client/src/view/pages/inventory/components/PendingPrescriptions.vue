<template>
  <div class="pending-prescriptions">
    <div v-if="loading" class="text-center py-5">
      <b-spinner variant="primary"></b-spinner>
      <p class="text-muted mt-3">Loading pending prescriptions...</p>
    </div>

    <div v-else>
      <!-- Prescribed Drugs Section -->
      <div v-if="prescribedDrugs.length > 0" class="mb-6">
        <h4 class="font-weight-bolder mb-4">Prescribed Drugs</h4>
        <div class="table-responsive">
          <table class="table table-head-custom table-vertical-center">
            <thead>
              <tr class="text-left">
                <th>Patient</th>
                <th>Drug</th>
                <th>Quantity to Dispense</th>
                <th>Quantity Dispensed</th>
                <th>Payment Status</th>
                <th>Status</th>
                <th>Date Prescribed</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="prescription in prescribedDrugs" :key="prescription.id">
                <td>
                  <router-link
                    :to="`/patient/profile/${prescription.patient_id}`"
                    class="text-dark-75 font-weight-bolder text-hover-primary"
                  >
                    {{ prescription.patient?.firstname }} {{ prescription.patient?.lastname }}
                    <br />
                    <small class="text-muted">{{ prescription.patient?.hospital_id }}</small>
                  </router-link>
                </td>
                <td>{{ prescription.drug?.name }}</td>
                <td>{{ prescription.quantity_to_dispense }}</td>
                <td>{{ prescription.quantity_dispensed || 0 }}</td>
                <td>
                  <span :class="getPaymentColor(prescription.payment_status)">{{
                    prescription.payment_status
                  }}</span>
                </td>
                <td>
                  <span
                    :class="{
                      'badge badge-warning': prescription.dispense_status === 'Pending',
                      'badge badge-info': prescription.dispense_status === 'Partial Dispense',
                    }"
                  >
                    {{ prescription.dispense_status }}
                  </span>
                </td>
                <td>{{ prescription.date_prescribed | dayjs('MMM DD, YYYY, h:mma') }}</td>
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
        <div v-if="drugsPages > 1" class="mt-4">
          <pagination
            :total-pages="drugsPages"
            :total="totalDrugs"
            :per-page="pageLimit"
            :current-page="currentPage"
            @pagechanged="onPageChange"
          />
        </div>
      </div>

      <!-- Prescribed Additional Items Section -->
      <div v-if="prescribedAdditionalItems.length > 0">
        <h4 class="font-weight-bolder mb-4">Prescribed Additional Items</h4>
        <div class="table-responsive">
          <table class="table table-head-custom table-vertical-center">
            <thead>
              <tr class="text-left">
                <th>Patient</th>
                <th>Item</th>
                <th>Quantity to Dispense</th>
                <th>Quantity Dispensed</th>
                <th>Payment Status</th>
                <th>Status</th>
                <th>Date Prescribed</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in prescribedAdditionalItems" :key="item.id">
                <td>
                  <router-link
                    :to="`/patient/profile/${item.patient_id}`"
                    class="text-dark-75 font-weight-bolder text-hover-primary"
                  >
                    {{ item.patient?.firstname }} {{ item.patient?.lastname }}
                    <br />
                    <small class="text-muted">{{ item.patient?.hospital_id }}</small>
                  </router-link>
                </td>
                <td>{{ item.drug?.name }}</td>
                <td>{{ item.quantity_to_dispense }}</td>
                <td>{{ item.quantity_dispensed || 0 }}</td>
                <td>
                  <span :class="getPaymentColor(item.payment_status)">{{
                    item.payment_status
                  }}</span>
                </td>
                <td>
                  <span
                    :class="{
                      'badge badge-warning': item.dispense_status === 'Pending',
                      'badge badge-info': item.dispense_status === 'Partial Dispense',
                    }"
                  >
                    {{ item.dispense_status }}
                  </span>
                </td>
                <td>{{ item.date_prescribed | dayjs('MMM DD, YYYY, h:mma') }}</td>
                <td>
                  <router-link
                    v-b-tooltip.hover
                    title="Dispense item"
                    :to="`/pharmacy/prescriptions/${item.drug_prescription_id}`"
                    class="btn btn-icon btn-light btn-hover-primary btn-sm"
                  >
                    <ArrowRightIcon />
                  </router-link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="additionalItemsPages > 1" class="mt-4">
          <pagination
            :total-pages="additionalItemsPages"
            :total="totalAdditionalItems"
            :per-page="pageLimit"
            :current-page="currentPage"
            @pagechanged="onPageChange"
          />
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-if="prescribedDrugs.length === 0 && prescribedAdditionalItems.length === 0"
        class="text-center py-5"
      >
        <i class="flaticon2-file text-muted" style="font-size: 4rem"></i>
        <p class="text-muted mt-3 mb-0">No pending prescriptions found</p>
        <small class="text-muted">All prescriptions for this item have been dispensed</small>
      </div>
    </div>
  </div>
</template>

<script>
import Pagination from '@/utils/Pagination.vue';
import { mapState } from 'vuex';
import ArrowRightIcon from '@/assets/icons/ArrowRightIcon.vue';

export default {
  name: 'PendingPrescriptions',
  components: {
    Pagination,
    ArrowRightIcon,
  },
  props: {
    inventoryItemId: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      currentPage: 1,
      pageLimit: 10,
    };
  },
  computed: {
    ...mapState('inventory', ['pendingPrescriptions', 'loadingPendingPrescriptions']),
    prescribedDrugs() {
      return this.pendingPrescriptions.prescribedDrugs || [];
    },
    prescribedAdditionalItems() {
      return this.pendingPrescriptions.prescribedAdditionalItems || [];
    },
    totalDrugs() {
      return this.pendingPrescriptions.totalDrugs || 0;
    },
    totalAdditionalItems() {
      return this.pendingPrescriptions.totalAdditionalItems || 0;
    },
    drugsPages() {
      return this.pendingPrescriptions.drugsPages || 0;
    },
    additionalItemsPages() {
      return this.pendingPrescriptions.additionalItemsPages || 0;
    },
    loading() {
      return this.loadingPendingPrescriptions;
    },
  },
  methods: {
    getPaymentColor(status) {
      if (status === 'Pending') return 'label label-inline label-light-warning font-weight-bold';
      if (status === 'Paid') return 'label label-inline label-light-success font-weight-bold';
      if (status === 'Cleared') return 'label label-inline label-light-info font-weight-bold';
      return 'label label-inline label-light-danger font-weight-bold';
    },

    onPageChange(page) {
      this.currentPage = page;
      this.loadPrescriptions();
    },

    loadPrescriptions() {
      this.$store.dispatch('inventory/fetchPendingPrescriptions', {
        inventoryItemId: this.inventoryItemId,
        currentPage: this.currentPage,
        pageLimit: this.pageLimit,
      });
    },
  },
  created() {
    this.loadPrescriptions();
  },
};
</script>

<style scoped>
.pending-prescriptions {
  padding: 1rem 0;
}
</style>
