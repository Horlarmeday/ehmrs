<template>
  <!--begin::Advance Table Widget 1-->
  <div class="card card-custom gutter-b">
    <create-vendor :displayPrompt="displayPrompt" @closeModal="hideModal" :data="vendorToEdit" />
    <!--begin::Header-->
    <div class="card-header border-0 py-5">
      <h3 class="card-title align-items-start flex-column">
        <span class="card-label font-weight-bolder text-dark">Vendors</span>
      </h3>
      <div class="card-toolbar">
        <a href="#" class="btn btn-primary font-weight-bolder font-size-sm" @click="addNewData">
          <add-icon /> Add New
        </a>
      </div>
    </div>
    <!--end::Header-->

    <!--begin::Body-->
    <div class="card-body py-0">
      <!--begin::Table-->
      <div class="table-responsive">
        <table class="table table-head-custom table-vertical-center" id="kt_advance_table_widget_1">
          <thead>
            <tr class="text-left">
              <th class="pr-0" style="width: 250px">Name</th>
              <th style="min-width: 250px">Phone</th>
              <th style="min-width: 250px">Email</th>
              <th style="min-width: 250px">Address</th>
              <th style="min-width: 150px">Date Created</th>
              <th class="pr-0 text-right" style="min-width: 150px">action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="vendors.length === 0">
              <td colspan="9" align="center" class="text-muted">No Data</td>
            </tr>
            <tr v-for="vendor in vendors" :key="vendor.id">
              <td class="pr-0">
                <a
                  href="#"
                  class="text-dark-75 font-weight-bolder text-hover-primary mb-1 font-size-lg"
                  >{{ vendor.name }}</a
                >
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                  {{ vendor.phone || '-' }}
                </span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                  {{ vendor.email || '-' }}
                </span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                  {{ vendor.address || '-' }}
                </span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                  {{ vendor.createdAt | dayjs('ddd, MMM D, YYYY, h:mma') }}
                </span>
              </td>
              <td class="pr-0 text-right">
                <a
                  href="#"
                  class="btn btn-icon btn-light btn-hover-primary btn-sm mx-3"
                  @click.stop="editData(vendor)"
                >
                  <edit-icon />
                </a>
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
import CreateVendor from '@/view/pages/store/pharmacy/create/CreateVendor.vue';
export default {
  data() {
    return {
      displayPrompt: false,
      vendorToEdit: {},
      currentPage: 1,
      itemsPerPage: 10,
    };
  },
  components: {
    CreateVendor,
    Pagination,
    EditIcon,
    AddIcon,
  },
  computed: {
    vendors() {
      return this.$store.state.store.vendors;
    },
    queriedItems() {
      return this.$store.state.store.totalVendors;
    },
    pages() {
      return this.$store.state.store.vendorPages;
    },
    perPage() {
      return this.vendors.length;
    },
  },
  methods: {
    addNewData() {
      this.vendorToEdit = {};
      this.displayPrompt = true;
    },

    hideModal() {
      this.displayPrompt = false;
    },

    editData(vendor) {
      this.vendorToEdit = vendor;
      this.displayPrompt = true;
    },

    handlePageChange() {
      this.$store.dispatch('store/fetchVendors', {
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
      });
    },

    onPageChange(page) {
      this.currentPage = page;
      this.handlePageChange();
    },
  },
  created() {
    this.$store.dispatch('store/fetchVendors', {
      currentPage: this.currentPage,
      itemsPerPage: this.itemsPerPage,
    });
  },
};
</script>

<style></style>
