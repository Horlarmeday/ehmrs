<template>
  <div>
    <div v-if="samples">
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
              <th style="min-width: 80px" class="pl-2">
                <span class="text-dark-75">Lab number</span>
              </th>
              <th style="min-width: 100px">Patient ID</th>
              <th style="min-width: 200px">Patient Name</th>
              <th style="min-width: 70px">Pending</th>
              <th style="min-width: 70px">Result</th>
              <th style="min-width: 70px">Verified</th>
              <th style="min-width: 70px">Approved</th>
              <th style="min-width: 70px">Total</th>
              <!-- <th style="min-width: 80px">Status</th> -->
              <th style="min-width: 100px">Date Collected</th>
              <th class="text-right" style="min-width: 100px">Action</th>
            </tr>
          </thead>
          <tbody v-if="samples.length === 0">
            <tr>
              <td colspan="9" align="center" class="text-muted">No Data</td>
            </tr>
          </tbody>
          <tbody v-for="sample in samples" :key="sample.id">
            <tr :class="{ disabled: sample.total === sample.total_pending_payments }">
              <td class="pl-2 py-8">
                <div class="d-flex align-items-center">
                  <div>
                    <span
                      v-b-tooltip.hover
                      :title="sample?.patient?.insurances?.[0]?.insurance?.name"
                      class="label label-dot label-lg mr-2"
                      :class="
                        getPatientDotStatus(sample?.patient?.insurances?.[0]?.insurance?.name)
                      "
                    ></span>
                    <a
                      href="#"
                      class="text-dark-75 font-weight-bolder text-hover-primary mb-1 font-size-md"
                      >{{ sample.accession_number }}</a
                    >
                  </div>
                </div>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-md">
                  {{ sample.patient.hospital_id }}
                </span>
              </td>
              <td>
                <router-link :to="`/patient/profile/${sample.patient_id}`">
                  <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                    {{ sample.patient.fullname }}
                  </span>
                </router-link>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-md">
                  {{ sample.pending_tests_count }}
                </span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-md">{{
                  sample.pending_validations_count
                }}</span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-md">{{
                  sample.verified_tests_count
                }}</span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-md">{{
                  sample.approved_tests_count
                }}</span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-md">{{
                  sample.total
                }}</span>
              </td>
              <!-- <td>
                <span :class="getSampleStatus(sample.status)" class="label label-dot mr-2"></span>
                <span
                  :class="getSampleTextColor(sample.status)"
                  class="font-size-sm font-weight-bold"
                  >{{ sample.status }}</span
                >
              </td> -->
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-md">{{
                  sample.date_sample_received | dayjs('DD/MM/YYYY, h:mma')
                }}</span>
              </td>
              <td class="text-right pr-0">
                <!-- Primary Action: Add Result (most common action) -->
                <router-link
                  :class="{ disabled: sample.pending_tests_count === 0 }"
                  v-b-tooltip.hover
                  title="Add Test Result"
                  :to="`/laboratory/add-test-result/${sample.id}`"
                  class="btn btn-icon btn-light btn-hover-primary btn-sm mr-2"
                >
                  <ArrowRightIcon />
                </router-link>

                <!-- Secondary Actions Dropdown -->
                <b-dropdown
                  size="sm"
                  variant="link"
                  toggle-class="btn btn-icon btn-light btn-hover-primary btn-sm"
                  no-caret
                  right
                  no-flip
                >
                  <template v-slot:button-content>
                    <i class="ki ki-bold-more-hor"></i>
                  </template>

                  <!-- Validate Results -->
                  <b-dropdown-item
                    :disabled="sample.pending_validations_count === 0"
                    @click="$router.push(`/laboratory/result-validation/${sample.id}`)"
                  >
                    <ValidateIcon class="mr-2" />
                    Validate Results
                    <span v-if="sample.pending_validations_count === 0" class="text-muted ml-1"
                      >(No pending)</span
                    >
                  </b-dropdown-item>

                  <!-- Approve Results -->
                  <b-dropdown-item
                    :disabled="sample.verified_tests_count === 0"
                    @click="$router.push(`/laboratory/result-approval/${sample.id}`)"
                  >
                    <ApproveIcon class="mr-2" />
                    Approve Results
                    <span v-if="sample.verified_tests_count === 0" class="text-muted ml-1"
                      >(No verified)</span
                    >
                  </b-dropdown-item>
                </b-dropdown>
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
    <table-skeleton v-else :columns="9" />
  </div>
</template>

<script>
import ArrowRightIcon from '@/assets/icons/ArrowRightIcon.vue';
import { debounce, getPatientDotStatus, removeSpinner, setUrlQueryParams } from '@/common/common';
import Search from '@/utils/Search.vue';
import ValidateIcon from '@/assets/icons/ValidateIcon.vue';
import Pagination from '@/utils/Pagination.vue';
import ApproveIcon from '@/assets/icons/ApproveIcon.vue';
import dayjs from 'dayjs';
import TableSkeleton from '@/view/pages/nhis/components/TableSkeleton.vue';

export default {
  components: { TableSkeleton, ApproveIcon, Pagination, ValidateIcon, ArrowRightIcon, Search },
  props: {
    period: {
      type: String,
      required: true,
    },
  },
  computed: {
    samples() {
      return this.$store.state.laboratory.samplesCollected;
    },
    queriedItems() {
      return this.$store.state.laboratory.totalSamplesCollected;
    },
    pages() {
      return this.$store.state.laboratory.totalSamplesCollectedPages;
    },
    perPage() {
      return this.samples.length;
    },
  },
  data: () => ({
    currentPage: 1,
    itemsPerPage: 10,
    start: null,
    end: null,
    TODAY: 'Today',
  }),
  methods: {
    getPatientDotStatus,
    handlePageChange() {
      setUrlQueryParams({
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        period: this.period,
        tabIndex: this.$route.query.tabIndex,
        search: this.$route.query.search || null,
        startDate: this.$route.query.startDate,
        endDate: this.$route.query.endDate,
      });
      this.fetchSamplesCollected({
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

    handlePageCount(count) {
      setUrlQueryParams({
        currentPage: this.currentPage,
        itemsPerPage: count,
        period: this.period,
        tabIndex: this.$route.query.tabIndex,
        search: this.$route.query.search || null,
        startDate: this.$route.query.startDate,
        endDate: this.$route.query.endDate,
      });
      this.fetchSamplesCollected({
        currentPage: this.$route.query.currentPage,
        itemsPerPage: this.$route.query.itemsPerPage,
        start: this.$route.query.startDate,
        end: this.$route.query.endDate,
        search: this.$route.query.search || null,
      });
    },

    onHandleSearch(prop) {
      const { search, spinDiv } = prop;
      setUrlQueryParams({
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        period: this.period,
        tabIndex: this.$route.query.tabIndex,
        search,
      });
      this.debounceSearch(search, this, spinDiv);
    },

    debounceSearch: debounce((search, vm, spinDiv) => {
      vm.fetchSamplesCollected({
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
        tabIndex: this.$route.query.tabIndex,
        startDate: dayjs(start).format('YYYY-MM-DD'),
        endDate: dayjs(end).format('YYYY-MM-DD'),
        period: this.period,
      });
      this.fetchSamplesCollected({
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        start: this.$route.query.startDate,
        end: this.$route.query.endDate,
      })
        .then(() => removeSpinner(dateSpin))
        .catch(() => removeSpinner(dateSpin));
    },

    getSampleStatus(status) {
      if (status === 'Pending') return 'label-warning ';
      if (status === 'Completed') return 'label-success ';
      return 'label-primary ';
    },

    getSampleTextColor(type) {
      if (type === 'Pending') return 'text-warning';
      if (type === 'Completed') return 'text-success';
      return 'text-primary';
    },

    fetchSamplesCollected({ currentPage, itemsPerPage, search, start, end }) {
      return this.$store.dispatch('laboratory/fetchSamplesCollected', {
        currentPage,
        itemsPerPage,
        ...(search && { search }),
        ...(start && end && { start, end }),
        period: this.period,
      });
    },
  },
  watch: {
    period: {
      handler() {
        this.fetchSamplesCollected({
          currentPage: this.$route.query.currentPage || this.currentPage,
          itemsPerPage: this.$route.query.itemsPerPage || this.itemsPerPage,
          start: this.$route.query.startDate || null,
          end: this.$route.query.endDate || null,
          search: this.$route.query.search || null,
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

.disabled {
  opacity: 0.5;
  pointer-events: none;
}

tr.disabled {
  pointer-events: none; /* Disable pointer events to prevent interaction */
  opacity: 0.5; /* Optionally, reduce the opacity to visually indicate the disabled state */
}
</style>
