<template>
  <div>
    <div v-if="prescriptions">
      <div class="mt-3">
        <search
          @search="onHandleSearch"
          @filterByDateRange="searchByDate"
          :show-date-filter="true"
        />
      </div>
      <div class="table-responsive">
        <table class="table table-head-custom table-head-bg table-vertical-center">
          <thead>
            <tr class="text-uppercase">
              <th style="min-width: 120px" class="pl-4">
                <span class="text-dark-75">Patient ID</span>
              </th>
              <th style="min-width: 220px">Patient Name</th>
              <th style="min-width: 120px">Drugs</th>
              <th style="min-width: 120px">Dispensed Drugs</th>
              <th style="min-width: 120px">Items</th>
              <th style="min-width: 120px">Source</th>
              <th style="min-width: 120px">Status</th>
              <th v-if="period !== TODAY" style="min-width: 100px">Date Collected</th>
              <th class="text-right" style="min-width: 50px">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="prescriptions.length === 0">
              <td colspan="9" align="center" class="text-muted">No Data</td>
            </tr>
            <tr v-for="prescription in prescriptions" :key="prescription.id">
              <td class="pl-4 py-8">
                <div class="d-flex align-items-center">
                  <div>
                    <a
                      href="#"
                      class="text-dark-75 font-weight-bolder text-hover-primary mb-1 font-size-lg"
                      >{{ prescription.patient.hospital_id }}</a
                    >
                  </div>
                </div>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                  {{ prescription.patient.fullname }}
                </span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg pl-7">
                  {{ prescription.total }}
                </span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg pl-7">
                  {{ prescription.dispensed_drugs_count }}
                </span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg pl-7">
                  {{ prescription.items_count }}
                </span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                  {{ prescription.source }}
                </span>
              </td>
              <td>
                <span
                  :class="getSampleStatus(prescription.status)"
                  class="label label-md label-inline"
                  >{{ prescription.status }}</span
                >
              </td>
              <td v-if="period !== 'Today'">
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg">{{
                  prescription.date_prescribed | dayjs('YYYY/MM/DD, h:mma')
                }}</span>
              </td>
              <td class="text-right pr-0">
                <router-link
                  v-b-tooltip.hover
                  title="Dispense drug"
                  :to="`/pharmacy/prescriptions/${prescription.id}`"
                  class="btn btn-icon btn-light btn-hover-primary btn-sm"
                >
                  <ArrowRightIcon />
                </router-link>
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
    <table-skeleton v-else :columns="7" />
  </div>
</template>

<script>
import ArrowRightIcon from '@/assets/icons/ArrowRightIcon.vue';
import { debounce, removeSpinner, setUrlQueryParams } from '@/common/common';
import Search from '../../../../utils/Search.vue';
import Pagination from '@/utils/Pagination.vue';
import dayjs from 'dayjs';
import TableSkeleton from '@/view/pages/nhis/components/TableSkeleton.vue';

export default {
  components: { TableSkeleton, Pagination, ArrowRightIcon, Search },
  props: {
    period: {
      type: String,
      required: true,
    },
  },
  data: () => ({
    currentPage: 1,
    itemsPerPage: 10,
    start: null,
    end: null,
    TODAY: 'Today',
  }),
  computed: {
    prescriptions() {
      return this.$store.state.pharmacy.prescriptions;
    },
    queriedItems() {
      return this.$store.state.pharmacy.totalPrescription;
    },
    pages() {
      return this.$store.state.pharmacy.prescriptionPages;
    },
    perPage() {
      return this.prescriptions.length;
    },
  },
  methods: {
    getSampleStatus(status) {
      if (status === 'Pending') return 'label-light-warning ';
      if (status === 'Complete Dispense') return 'label-light-success ';
      return 'label-light-danger ';
    },

    fetchPrescriptions({ currentPage, itemsPerPage, search = null, start = null, end = null }) {
      return this.$store.dispatch('pharmacy/fetchPrescriptions', {
        currentPage,
        itemsPerPage,
        period: this.period,
        ...(search && { search }),
        ...(start && end && { start, end }),
      });
    },

    handlePageChange() {
      setUrlQueryParams({
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
      });
      this.fetchPrescriptions({
        currentPage: this.$route.query.currentPage || this.currentPage,
        itemsPerPage: this.$route.query.itemsPerPage || this.itemsPerPage,
        search: this.$route.query.search || null,
        start: this.$route.query.startDate,
        end: this.$route.query.endDate,
      });
    },

    onPageChange(page) {
      this.currentPage = page;
      this.handlePageChange();
    },

    onHandleSearch(prop) {
      const { search, spinDiv } = prop;
      setUrlQueryParams({
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        search,
      });
      this.debounceSearch(search, this, spinDiv);
    },

    debounceSearch: debounce((search, vm, spinDiv) => {
      vm.fetchPrescriptions({
        currentPage: 1,
        itemsPerPage: vm.itemsPerPage,
        search,
      })
        .then(() => removeSpinner(spinDiv))
        .catch(() => removeSpinner(spinDiv));
    }, 500),

    searchByDate(range) {
      const { start, end, dateSpin } = range;
      this.currentPage = 1;
      setUrlQueryParams({
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        startDate: dayjs(start).format('YYYY-MM-DD'),
        endDate: dayjs(end).format('YYYY-MM-DD'),
      });
      this.fetchPrescriptions({
        currentPage: this.$route.query.currentPage,
        itemsPerPage: this.$route.query.itemsPerPage,
        start: this.$route.query.startDate,
        end: this.$route.query.endDate,
      })
        .then(() => removeSpinner(dateSpin))
        .catch(() => removeSpinner(dateSpin));
    },
  },

  watch: {
    period: {
      handler() {
        this.fetchPrescriptions({
          currentPage: this.$route.query.currentPage || this.currentPage,
          itemsPerPage: this.$route.query.itemsPerPage || this.itemsPerPage,
          start: this.$route.query.startDate || null,
          end: this.$route.query.endDate || null,
        });
      },
      immediate: true,
    },
  },
};
</script>

<style scoped>
.card-body {
  padding: 0;
}
</style>
