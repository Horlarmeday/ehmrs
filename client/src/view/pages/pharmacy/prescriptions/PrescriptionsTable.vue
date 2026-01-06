<template>
  <div>
    <div v-if="prescriptions">
      <div class="mt-3">
        <div class="card-body py-1 px-0">
          <div class="d-flex align-items-center justify-content-between flex-wrap">
            <div class="col-lg-3 col-md-6 mb-3 mb-md-0">
              <div ref="spin">
                <input
                  type="text"
                  class="form-control"
                  placeholder="Search"
                  data-col-index="0"
                  :value="$route.query.search || ''"
                  @keyup="onSearch"
                />
              </div>
            </div>
            <div class="col-lg-2 col-md-6 mb-3 mb-md-0">
              <select v-model="selectedStatus" @change="onFilterChange" class="form-control">
                <option value="">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Partial Dispense">Partial Dispense</option>
                <option value="Complete Dispense">Complete Dispense</option>
              </select>
            </div>
            <div class="col-lg-2 col-md-6 mb-3 mb-md-0">
              <select v-model="selectedSource" @change="onFilterChange" class="form-control">
                <option value="">All Source</option>
                <option value="Antenatal">Antenatal</option>
                <option value="Consultation">Consultation</option>
                <option value="Theater">Theater</option>
                <option value="Immunization">Immunization</option>
              </select>
            </div>
            <div class="col-lg-auto">
              <date-range @searchByDate="searchByDate" />
            </div>
          </div>
        </div>
      </div>
      <div class="table-responsive">
        <table class="table table-head-custom table-head-bg table-vertical-center">
          <thead>
            <tr class="text-uppercase">
              <th style="min-width: 120px" class="pl-2">
                <span class="text-dark-75">Patient ID</span>
              </th>
              <th style="min-width: 250px">Patient Name</th>
              <th style="min-width: 100px">Drugs</th>
              <th style="min-width: 100px">Items</th>
              <th style="min-width: 70px">Dispensed Drugs</th>
              <th style="min-width: 70px">Dispensed Items</th>
              <th style="min-width: 100px">Source</th>
              <th style="min-width: 100px">Status</th>
              <th style="min-width: 100px">Date Prescribed</th>
              <th class="text-right" style="min-width: 50px">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="prescriptions.length === 0">
              <td colspan="9" align="center" class="text-muted">No Data</td>
            </tr>
            <tr v-for="prescription in prescriptions" :key="prescription.id">
              <td class="pl-2 py-8">
                <div class="d-flex align-items-center">
                  <div>
                    <span
                      v-b-tooltip.hover
                      :title="prescription?.patient?.insurances?.[0]?.insurance?.name"
                      class="label label-dot label-lg mr-2"
                      :class="
                        getPatientDotStatus(prescription?.patient?.insurances?.[0]?.insurance?.name)
                      "
                    ></span>
                    <router-link
                      :to="`/patient/profile/${prescription.patient_id}`"
                      class="text-dark-75 font-weight-bolder text-hover-primary mb-1 font-size-lg"
                      >{{ prescription.patient.hospital_id }}</router-link
                    >
                  </div>
                </div>
              </td>
              <td>
                <router-link :to="`/patient/profile/${prescription.patient_id}`">
                  <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                    {{ prescription.patient.fullname }}
                  </span>
                </router-link>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg pl-7">
                  {{ prescription.total }}
                </span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg pl-7">
                  {{ prescription.items_count }}
                </span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg pl-7">
                  {{ prescription.dispensed_drugs_count }}
                </span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg pl-7">
                  {{ prescription.dispensed_items_count }}
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
                  class="label label-sm label-inline"
                  >{{ prescription.status }}</span
                >
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg">{{
                  prescription.date_prescribed | dayjs('DD/MM/YYYY, h:mma')
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
        @changepagecount="handlePageCount"
      />
    </div>
    <table-skeleton v-else :columns="7" />
  </div>
</template>

<script>
import ArrowRightIcon from '@/assets/icons/ArrowRightIcon.vue';
import {
  debounce,
  getPatientDotStatus,
  removeSpinner,
  setUrlQueryParams,
  addSpinner,
} from '@/common/common';
import DateRange from '@/utils/DateRange.vue';
import Pagination from '@/utils/Pagination.vue';
import dayjs from 'dayjs';
import TableSkeleton from '@/view/pages/nhis/components/TableSkeleton.vue';

export default {
  components: { TableSkeleton, Pagination, ArrowRightIcon, DateRange },
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
    selectedStatus: '',
    selectedSource: '',
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
    getPatientDotStatus,
    getSampleStatus(status) {
      if (status === 'Pending') return 'label-light-warning ';
      if (status === 'Complete Dispense') return 'label-light-success ';
      return 'label-light-danger ';
    },

    fetchPrescriptions({
      currentPage,
      itemsPerPage,
      search = null,
      start = null,
      end = null,
      status = null,
      source = null,
    }) {
      return this.$store.dispatch('pharmacy/fetchPrescriptions', {
        currentPage,
        itemsPerPage,
        period: this.period,
        ...(search && { search }),
        ...(start && end && { start, end }),
        ...(status && { status }),
        ...(source && { source }),
      });
    },

    handlePageChange() {
      setUrlQueryParams({
        currentPage: this.currentPage,
        itemsPerPage: this.$route.query.itemsPerPage || this.itemsPerPage,
        search: this.$route.query.search,
        startDate: this.$route.query.startDate,
        endDate: this.$route.query.endDate,
        status: this.selectedStatus,
        source: this.selectedSource,
      });
      this.fetchPrescriptions({
        currentPage: this.$route.query.currentPage || this.currentPage,
        itemsPerPage: this.$route.query.itemsPerPage || this.itemsPerPage,
        search: this.$route.query.search || null,
        start: this.$route.query.startDate,
        end: this.$route.query.endDate,
        status: this.selectedStatus || null,
        source: this.selectedSource || null,
      });
    },

    onPageChange(page) {
      this.currentPage = page;
      this.handlePageChange();
    },

    onSearch(event) {
      const search = event.target.value;
      const spinDiv = this.$refs['spin'];
      addSpinner(spinDiv);
      setUrlQueryParams({
        currentPage: 1,
        itemsPerPage: this.itemsPerPage,
        search,
        status: this.selectedStatus,
        source: this.selectedSource,
      });
      this.debounceSearch(search, this, spinDiv);
    },

    debounceSearch: debounce((search, vm, spinDiv) => {
      vm.currentPage = 1;
      vm.fetchPrescriptions({
        currentPage: 1,
        itemsPerPage: vm.itemsPerPage,
        search,
        status: vm.selectedStatus || null,
        source: vm.selectedSource || null,
      })
        .then(() => removeSpinner(spinDiv))
        .catch(() => removeSpinner(spinDiv));
    }, 500),

    onFilterChange() {
      this.currentPage = 1;
      setUrlQueryParams({
        currentPage: 1,
        itemsPerPage: this.itemsPerPage,
        search: this.$route.query.search,
        startDate: this.$route.query.startDate,
        endDate: this.$route.query.endDate,
        status: this.selectedStatus,
        source: this.selectedSource,
      });
      this.fetchPrescriptions({
        currentPage: 1,
        itemsPerPage: this.itemsPerPage,
        search: this.$route.query.search || null,
        start: this.$route.query.startDate || null,
        end: this.$route.query.endDate || null,
        status: this.selectedStatus || null,
        source: this.selectedSource || null,
      });
    },

    handlePageCount(count) {
      setUrlQueryParams({
        currentPage: this.currentPage,
        itemsPerPage: count,
        search: this.$route.query.search,
        startDate: this.$route.query.startDate,
        endDate: this.$route.query.endDate,
        status: this.selectedStatus,
        source: this.selectedSource,
      });
      this.fetchPrescriptions({
        currentPage: this.$route.query.currentPage || this.currentPage,
        itemsPerPage: count,
        start: this.$route.query.startDate || null,
        end: this.$route.query.endDate || null,
        search: this.$route.query.search || null,
        status: this.selectedStatus || null,
        source: this.selectedSource || null,
      });
    },

    searchByDate(range) {
      const { start, end, dateSpin } = range;
      this.currentPage = 1;
      setUrlQueryParams({
        currentPage: 1,
        itemsPerPage: this.$route.query.itemsPerPage || this.itemsPerPage,
        startDate: dayjs(start).format('YYYY-MM-DD'),
        endDate: dayjs(end).format('YYYY-MM-DD'),
        search: this.$route.query.search,
        status: this.selectedStatus,
        source: this.selectedSource,
      });
      this.fetchPrescriptions({
        currentPage: 1,
        itemsPerPage: this.$route.query.itemsPerPage || this.itemsPerPage,
        start: dayjs(start).format('YYYY-MM-DD'),
        end: dayjs(end).format('YYYY-MM-DD'),
        search: this.$route.query.search || null,
        status: this.selectedStatus || null,
        source: this.selectedSource || null,
      })
        .then(() => removeSpinner(dateSpin))
        .catch(() => removeSpinner(dateSpin));
    },
  },

  watch: {
    period: {
      handler() {
        // Initialize filters from URL query params
        this.selectedStatus = this.$route.query.status || '';
        this.selectedSource = this.$route.query.source || '';
        this.fetchPrescriptions({
          currentPage: this.$route.query.currentPage || this.currentPage,
          itemsPerPage: this.$route.query.itemsPerPage || this.itemsPerPage,
          start: this.$route.query.startDate || null,
          end: this.$route.query.endDate || null,
          search: this.$route.query.search || null,
          status: this.selectedStatus || null,
          source: this.selectedSource || null,
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
