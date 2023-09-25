<template>
  <!--begin::Advance Table Widget 1-->
  <div class="card card-custom gutter-b">
    <div class="card-header border-0 py-5">
      <h3 class="card-title align-items-start flex-column">
        <span class="card-label font-weight-bolder text-dark">Ante-Natal Patients</span>
      </h3>
      <div class="card-toolbar">
        <router-link
          to="/program/ante-natal/enrol"
          class="btn btn-success font-weight-bolder font-size-sm"
        >
          <add-icon /> Enrol Patient
        </router-link>
      </div>
    </div>
    <!--end::Header-->

    <search @search="onHandleSearch" />

    <!--begin::Body-->
    <div class="card-body py-0">
      <!--begin::Table-->
      <div class="table-responsive">
        <table class="table table-head-custom table-vertical-center" id="kt_advance_table_widget_1">
          <thead>
            <tr class="text-left">
              <th class="pr-0" style="width: 150px">Patient ID</th>
              <th style="width: 250px">Patient Name</th>
              <th style="width: 150px">Antenatal No.</th>
              <th style="width: 150px">Status</th>
              <th style="min-width: 200px">Date Created</th>
              <th style="min-width: 150px">Created By</th>
              <th class="pr-0 text-right" style="min-width: 100px">action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="accounts.length === 0">
              <td colspan="9" align="center" class="text-muted">No Data</td>
            </tr>
            <tr v-for="account in accounts" :key="account.id">
              <td class="pr-0">
                <span
                  class="text-dark-75 font-weight-bolder text-hover-primary mb-1 font-size-lg"
                  >{{ account?.patient?.hospital_id }}</span
                >
              </td>

              <td class="pr-0">
                <router-link
                  :to="`/program/ante-natal/profile/${account.id}`"
                  class="text-dark-75 font-weight-bolder text-hover-primary mb-1 font-size-lg"
                  >{{ account?.patient?.fullname }}</router-link
                >
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                  {{ account.antenatal_number }}
                </span>
              </td>
              <td>
                <span :class="getStatusColor(account.account_status)" class="label label-dot mr-2"></span>
                <span :class="getTextColor(account.account_status)" class="font-weight-bold">{{
                  account.account_status
                }}</span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                  {{ account.createdAt | moment('ddd, MMM Do YYYY, h:mma') }}
                </span>
              </td>
              <td class="pr-0">
                <span
                  class="text-dark-75 font-weight-bolder text-hover-primary mb-1 font-size-lg"
                  >{{ account?.staff?.fullname }}</span
                >
              </td>
              <td class="pr-0 text-right">
                <router-link
                  :to="`/program/ante-natal/profile/${account.id}`"
                  class="btn btn-icon btn-light btn-hover-primary btn-sm mx-3"
                >
                  <edit-icon />
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
  <!--end::Advance Table Widget 1-->
</template>

<script>
import Pagination from '@/utils/Pagination.vue';
import EditIcon from '@/assets/icons/EditIcon.vue';
import AddIcon from '@/assets/icons/AddIcon.vue';
import { debounce, removeSpinner, setUrlQueryParams } from '@/common/common';
import Search from '@/utils/Search.vue';
export default {
  data() {
    return {
      currentPage: 1,
      itemsPerPage: 10,
    };
  },
  components: {
    Search,
    Pagination,
    EditIcon,
    AddIcon,
  },
  computed: {
    accounts() {
      return this.$store.state.antenatal.antenatalAccounts;
    },
    queriedItems() {
      return this.$store.state.antenatal.total || 0;
    },
    pages() {
      return this.$store.state.antenatal.pages;
    },
    perPage() {
      return this.accounts.length;
    },
  },
  methods: {
    handlePageChange() {
      this.$store.dispatch('antenatal/fetchAntenatalAccounts', {
        currentPage: this.$route.query.currentPage || this.currentPage,
        itemsPerPage: this.$route.query.itemsPerPage || this.itemsPerPage,
        search: this.$route.query.search,
      });
    },

    onPageChange(page) {
      this.currentPage = page;
      this.handlePageChange();
    },

    onHandleSearch(prop) {
      const { search, spinDiv } = prop;
      setUrlQueryParams({
        currentPage: 1,
        itemsPerPage: this.itemsPerPage,
        search,
      });
      this.debounceSearch(search, this, spinDiv);
    },

    debounceSearch: debounce((search, vm, spinDiv) => {
      vm.$store
        .dispatch('antenatal/fetchAntenatalAccounts', {
          currentPage: 1,
          itemsPerPage: vm.itemsPerPage,
          search,
          inventory: this.$route.params.id,
        })
        .then(() => removeSpinner(spinDiv))
        .catch(() => removeSpinner(spinDiv));
    }, 500),

    getStatusColor(status) {
      if (status === 'Active') return 'label-success';
      if (status === 'Expired') return 'label-danger';
      return 'label-warning';
    },

    getTextColor(status) {
      if (status === 'Active') return 'text-success';
      if (status === 'Expired') return 'text-danger';
      return 'text-warning';
    },
  },
  created() {
    this.$store.dispatch('antenatal/fetchAntenatalAccounts', {
      currentPage: this.$route.query.currentPage || this.currentPage,
      itemsPerPage: this.$route.query.itemsPerPage || this.itemsPerPage,
    });
  },
};
</script>

<style></style>
