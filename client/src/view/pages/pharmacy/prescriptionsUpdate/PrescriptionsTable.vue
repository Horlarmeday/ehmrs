<template>
  <div class="prescriptions-table">
    <div v-if="prescriptions">
      <div class="table-responsive">
        <table class="table table-head-custom table-head-bg table-vertical-center">
          <thead>
            <tr class="text-uppercase">
              <th style="min-width: 130px" class="pl-4">
                <span class="text-dark-75 font-weight-bold">Patient ID</span>
              </th>
              <th style="min-width: 250px">
                <span class="text-dark-75 font-weight-bold">Patient Name</span>
              </th>
              <th style="min-width: 100px" class="text-center">
                <span class="text-dark-75 font-weight-bold">Drugs</span>
              </th>
              <th style="min-width: 100px" class="text-center">
                <span class="text-dark-75 font-weight-bold">Items</span>
              </th>
              <th style="min-width: 120px" class="text-center">
                <span class="text-dark-75 font-weight-bold">Dispensed Drugs</span>
              </th>
              <th style="min-width: 120px" class="text-center">
                <span class="text-dark-75 font-weight-bold">Dispensed Items</span>
              </th>
              <th style="min-width: 120px">
                <span class="text-dark-75 font-weight-bold">Source</span>
              </th>
              <th style="min-width: 130px">
                <span class="text-dark-75 font-weight-bold">Status</span>
              </th>
              <th style="min-width: 150px">
                <span class="text-dark-75 font-weight-bold">Date Prescribed</span>
              </th>
              <th class="text-right" style="min-width: 50px">
                <span class="text-dark-75 font-weight-bold"></span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="prescriptions.length === 0">
              <td colspan="10" align="center" class="py-10">
                <div class="text-center">
                  <i class="flaticon2-information text-muted" style="font-size: 3rem"></i>
                  <p class="text-muted font-size-lg mt-3">No prescriptions found</p>
                </div>
              </td>
            </tr>
            <tr
              v-for="prescription in prescriptions"
              :key="prescription.id"
              class="table-row-hover"
            >
              <td class="pl-4 py-6">
                <div class="d-flex align-items-center">
                  <div>
                    <span
                      v-b-tooltip.hover
                      :title="
                        prescription?.patient?.insurances?.[0]?.insurance?.name || 'No Insurance'
                      "
                      class="label label-dot mr-2"
                      :class="
                        getPatientDotStatus(prescription?.patient?.insurances?.[0]?.insurance?.name)
                      "
                    ></span>
                    <router-link
                      :to="`/patient/profile/${prescription.patient_id}`"
                      class="text-dark-75 font-weight-bolder text-hover-primary mb-1 font-size-lg"
                    >
                      {{ prescription.patient.hospital_id }}
                    </router-link>
                  </div>
                </div>
              </td>
              <td class="py-6">
                <router-link
                  :to="`/patient/profile/${prescription.patient_id}`"
                  class="text-dark-75 font-weight-bolder d-block font-size-lg text-hover-primary"
                >
                  {{ prescription.patient.fullname }}
                </router-link>
              </td>
              <td class="text-center py-6">
                <span class="badge badge-light-primary font-weight-bold font-size-lg">
                  {{ prescription.total || 0 }}
                </span>
              </td>
              <td class="text-center py-6">
                <span class="badge badge-light-info font-weight-bold font-size-lg">
                  {{ prescription.items_count || 0 }}
                </span>
              </td>
              <td class="text-center py-6">
                <span class="badge badge-light-success font-weight-bold font-size-lg">
                  {{ prescription.dispensed_drugs_count || 0 }}
                </span>
              </td>
              <td class="text-center py-6">
                <span class="badge badge-light-success font-weight-bold font-size-lg">
                  {{ prescription.dispensed_items_count || 0 }}
                </span>
              </td>
              <td class="py-6">
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                  {{ prescription.source }}
                </span>
              </td>
              <td class="py-6">
                <span
                  :class="getStatusBadgeClass(prescription.status)"
                  class="label label-lg label-inline font-weight-bold"
                >
                  {{ prescription.status }}
                </span>
              </td>
              <td class="py-6">
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                  {{ prescription.date_prescribed | dayjs('DD/MM/YYYY, h:mma') }}
                </span>
              </td>
              <td class="text-right pr-4 py-6">
                <router-link
                  v-b-tooltip.hover
                  title="View & Dispense"
                  :to="`/pharmacy/prescriptions/${prescription.id}`"
                  class="btn btn-icon btn-light-primary btn-hover-primary btn-sm"
                >
                  <ArrowRightIcon />
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="card-footer border-0 py-4">
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
    <table-skeleton v-else :columns="10" />
  </div>
</template>

<script>
import ArrowRightIcon from '@/assets/icons/ArrowRightIcon.vue';
import { getPatientDotStatus } from '@/common/common';
import Pagination from '@/utils/Pagination.vue';
import dayjs from 'dayjs';
import TableSkeleton from '@/view/pages/nhis/components/TableSkeleton.vue';

export default {
  name: 'PrescriptionsTable',
  components: { TableSkeleton, Pagination, ArrowRightIcon },
  props: {
    prescriptions: {
      type: Array,
      default: () => [],
    },
    queriedItems: {
      type: Number,
      default: 0,
    },
    pages: {
      type: Number,
      default: 0,
    },
    currentPage: {
      type: Number,
      default: 1,
    },
    perPage: {
      type: Number,
      default: 30,
    },
  },
  filters: {
    dayjs,
  },
  methods: {
    getPatientDotStatus,
    getStatusBadgeClass(status) {
      if (status === 'Pending') return 'label-light-warning';
      if (status === 'Complete Dispense') return 'label-light-success';
      if (status === 'Partial Dispense') return 'label-light-info';
      return 'label-light-secondary';
    },
    onPageChange(page) {
      this.$emit('page-change', page);
    },
    handlePageCount(count) {
      this.$emit('page-count-change', count);
    },
  },
};
</script>

<style scoped>
.prescriptions-table {
  background: #fff;
}

.table-row-hover:hover {
  background-color: #f3f6f9;
  transition: background-color 0.2s ease;
}

.table-head-custom thead th {
  background-color: #f3f6f9;
  border-bottom: 2px solid #e4e6ef;
  padding: 1rem 0.75rem;
}

.table-vertical-center td {
  vertical-align: middle;
}

.text-hover-primary:hover {
  color: #00acc1 !important;
  transition: color 0.2s ease;
}

.badge {
  padding: 0.5rem 0.75rem;
  font-size: 0.9rem;
}

.label-lg {
  padding: 0.5rem 1rem;
  font-size: 0.95rem;
}

.card-footer {
  background: #fff;
}
</style>
