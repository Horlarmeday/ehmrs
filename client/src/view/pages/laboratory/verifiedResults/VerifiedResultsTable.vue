<template>
  <div>
    <div v-if="!loading">
      <div class="mt-3">
        <search @search="onHandleSearch" />
      </div>
      <div class="table-responsive">
        <table class="table table-head-custom table-head-bg table-borderless table-vertical-center">
          <thead>
            <tr class="text-uppercase">
              <th style="min-width: 100px" class="pl-7">
                <span class="text-dark-75">Accession number</span>
              </th>
              <th style="min-width: 100px">Patient ID</th>
              <th style="min-width: 150px">Patient Name</th>
              <th style="min-width: 70px">Pending Tests</th>
              <th style="min-width: 70px">Pending Validation</th>
              <th style="min-width: 70px">Verified Tests</th>
              <th style="min-width: 30px">Total</th>
              <th style="min-width: 80px">Status</th>
              <th v-if="period !== 'Today'" style="min-width: 100px">Date Collected</th>
              <th class="text-right" style="min-width: 120px">Action</th>
              <th style="min-width: 20px"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="samples.length === 0">
              <td colspan="9" align="center" class="text-muted">No Data</td>
            </tr>
            <tr v-for="sample in samples" :key="sample.id">
              <td class="pl-7 py-8">
                <div class="d-flex align-items-center">
                  <div>
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
                <span class="text-dark-75 font-weight-bolder d-block font-size-md">
                  {{ sample.patient.fullname }}
                </span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-md">
                  {{ sample.pending_tests_count }}
                </span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-md">{{
                  sample.pending_approved_count
                }}</span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-md">{{
                  sample.pending_validations_count
                }}</span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-md">{{
                  sample.total
                }}</span>
              </td>
              <td>
                <span :class="getSampleStatus(sample.status)" class="label label-dot mr-2"></span>
                <span
                  :class="getSampleTextColor(sample.status)"
                  class="font-size-sm font-weight-bold"
                  >{{ sample.status }}</span
                >
              </td>
              <td v-if="period !== 'Today'">
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg">{{
                  sample.date_sample_received | moment('DD/MM/YYYY, h:mma')
                }}</span>
              </td>
              <td class="text-right pr-0">
                <router-link
                  :class="{ disabled: !sample.pending_approved_count }"
                  v-b-tooltip.hover
                  title="Approve"
                  :to="`/laboratory/result-approval/${sample.id}`"
                  class="btn btn-icon btn-light btn-hover-primary btn-sm"
                >
                  <ApproveIcon />
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
import { debounce, removeSpinner } from '@/common/common';
import Search from '@/utils/Search.vue';
import Pagination from '@/utils/Pagination.vue';
import ApproveIcon from '@/assets/icons/ApproveIcon.vue';

export default {
  components: { ApproveIcon, Pagination, Search },
  props: {
    period: {
      type: String,
      required: true,
    },
  },
  computed: {
    samples() {
      return this.$store.state.laboratory.verifiedTests;
    },
    queriedItems() {
      return this.$store.state.laboratory.totalVerifiedTest;
    },
    pages() {
      return this.$store.state.laboratory.totalVerifiedTestPages;
    },
    perPage() {
      return this.samples.length;
    },
  },
  data: () => ({
    currentPage: 1,
    itemsPerPage: 10,
    loading: false,
    count: 0,
  }),
  methods: {
    handlePageChange() {
      this.$store.dispatch('laboratory/fetchVerifiedResults', {
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
        .dispatch('laboratory/fetchVerifiedResults', {
          currentPage: 1,
          itemsPerPage: vm.itemsPerPage,
          period: this.period,
          search,
        })
        .then(() => removeSpinner(spinDiv))
        .catch(() => removeSpinner(spinDiv));
    }, 500),

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

    countToHundred() {
      for (let i = 1; i <= 100; i++) {
        this.count = i;
        if (this.samples.length) break;
      }
    },
  },
  created() {
    this.loading = true;
    this.countToHundred();
    this.$store
      .dispatch('laboratory/fetchVerifiedResults', {
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        period: this.period,
      })
      .then(() => (this.loading = false));
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
</style>
