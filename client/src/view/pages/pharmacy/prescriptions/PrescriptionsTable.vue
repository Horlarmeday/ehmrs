<template>
  <div>
    <div v-if="!loading">
      <div class="mt-3">
        <search
          @search="onHandleSearch"
          @filterByDateRange="searchByDate"
          :show-date-filter="true"
        />
      </div>
      <div class="table-responsive">
        <table class="table table-head-custom table-head-bg table-borderless table-vertical-center">
          <thead>
            <tr class="text-uppercase">
              <th style="min-width: 150px" class="pl-7">
                <span class="text-dark-75">Patient ID</span>
              </th>
              <th style="min-width: 200px">Patient Name</th>
              <th style="min-width: 150px">Total Drugs</th>
              <th style="min-width: 150px">Dispensed Drugs</th>
              <th style="min-width: 150px">Status</th>
              <th v-if="period !== 'Today'" style="min-width: 100px">Date Collected</th>
              <th class="text-right" style="min-width: 130px">Action</th>
              <th style="min-width: 120px"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="prescriptions.length === 0">
              <td colspan="9" align="center" class="text-muted">No Data</td>
            </tr>
            <tr v-for="prescription in prescriptions" :key="prescription.id">
              <td class="pl-7 py-8">
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
                <span
                  :class="getSampleStatus(prescription.status)"
                  class="label label-lg label-inline"
                  >{{ prescription.status }}</span
                >
              </td>
              <td v-if="period !== 'Today'">
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg">{{
                  prescription.date_prescribed | moment('DD/MM/YYYY, h:mma')
                }}</span>
              </td>
              <td class="text-right pr-0">
                <router-link
                  v-b-tooltip.hover
                  title="Collect Sample"
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
    <div v-else>
      <b-progress :value="count" variant="primary" show-progress animated :max="200" />
    </div>
  </div>
</template>

<script>
import ArrowRightIcon from '@/assets/icons/ArrowRightIcon.vue';
import { debounce, removeSpinner } from '@/common/common';
import Search from '../../../../utils/Search.vue';
import Pagination from '@/utils/Pagination.vue';

export default {
  components: { Pagination, ArrowRightIcon, Search },
  props: {
    period: {
      type: String,
      required: true,
    },
  },
  data: () => ({
    currentPage: 1,
    itemsPerPage: 10,
    loading: false,
    count: 0,
    start: null,
    end: null,
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

    fetchPrescriptions({
      currentPage,
      itemsPerPage,
      search = null,
      period = 'Today',
      start = null,
      end = null,
    }) {
      return this.$store.dispatch('pharmacy/fetchPrescriptions', {
        currentPage,
        itemsPerPage,
        period,
        ...(search && { search }),
        ...(start && { start }),
        ...(end && { end }),
      });
    },

    handlePageChange() {
      this.fetchPrescriptions({
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        period: this.period,
      });
    },

    onPageChange(page) {
      this.currentPage = page;
      this.handlePageChange();
    },

    onHandleSearch(prop) {
      const { search, spinDiv } = prop;
      this.debounceSearch(search, this, spinDiv);
    },

    debounceSearch: debounce((search, vm, spinDiv) => {
      vm.$store
        .dispatch('pharmacy/fetchPrescriptions', {
          currentPage: 1,
          itemsPerPage: vm.itemsPerPage,
          search,
          period: this.period,
        })
        .then(() => removeSpinner(spinDiv))
        .catch(() => removeSpinner(spinDiv));
    }, 500),

    searchByDate(range) {
      const { start, end, dateSpin } = range;
      this.end = end;
      this.start = start;
      this.currentPage = 1;
      this.fetchPrescriptions({
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        period: this.period,
        start: new Date(this.start).toISOString(),
        end: new Date(this.end).toISOString(),
      })
        .then(() => removeSpinner(dateSpin))
        .catch(() => removeSpinner(dateSpin));
    },

    countToHundred() {
      for (let i = 1; i <= 100; i++) {
        this.count = i;
        if (this.prescriptions.length) break;
      }
    },
  },
  created() {
    this.loading = true;
    this.countToHundred();
    this.fetchPrescriptions({
      currentPage: this.currentPage,
      itemsPerPage: this.itemsPerPage,
      period: this.period,
    }).then(() => (this.loading = false));
  },
};
</script>

<style scoped>
.card-body {
  padding: 0;
}
</style>
