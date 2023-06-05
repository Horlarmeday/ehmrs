<template>
  <div class="card card-custom gutter-b">
    <create-imaging :displayPrompt="displayPrompt" @closeModal="hideModal" :data="imagingToEdit" />
    <!--begin::Header-->
    <div class="card-header border-0 py-5">
      <h3 class="card-title align-items-start flex-column">
        <span class="card-label font-weight-bolder text-dark">Imaging</span>
      </h3>
      <div class="card-toolbar">
        <a href="#" class="btn btn-success font-weight-bolder font-size-sm" @click="addNewData">
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
              <th style="min-width: 250px">Description</th>
              <th style="min-width: 150px">Date Created</th>
              <th class="pr-0 text-right" style="min-width: 150px">action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="imagings.length === 0">
              <td colspan="9" align="center" class="text-muted">No Data</td>
            </tr>
            <tr v-for="imaging in imagings" :key="imaging.id">
              <td class="pr-0">
                <a
                  href="#"
                  class="text-dark-75 font-weight-bolder text-hover-primary mb-1 font-size-lg"
                  >{{ imaging.name }}</a
                >
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                  {{ imaging.description }}
                </span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                  {{ imaging.createdAt | moment('ddd, MMM Do YYYY, h:mma') }}
                </span>
              </td>
              <td class="pr-0 text-right">
                <a
                  href="#"
                  class="btn btn-icon btn-light btn-hover-primary btn-sm mx-3"
                  @click.stop="editData(imaging)"
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
</template>

<script>
import CreateImaging from '@/view/pages/radiology/components/CreateImaging.vue';
import Pagination from '@/utils/Pagination.vue';
import EditIcon from '../../../../assets/icons/EditIcon.vue';
import AddIcon from '../../../../assets/icons/AddIcon.vue';

export default {
  name: 'Imaging',
  components: { CreateImaging, Pagination, AddIcon, EditIcon },
  data() {
    return {
      displayPrompt: false,
      imagingToEdit: {},
      currentPage: 1,
      itemsPerPage: 10,
    };
  },
  computed: {
    imagings() {
      return this.$store.state.radiology.imagings;
    },
    queriedItems() {
      return this.$store.state.radiology.total;
    },
    pages() {
      return this.$store.state.radiology.pages;
    },
    perPage() {
      return this.imagings.length;
    },
  },
  methods: {
    addNewData() {
      this.imagingToEdit = {};
      this.displayPrompt = true;
    },

    hideModal() {
      this.displayPrompt = false;
    },

    editData(insurance) {
      this.imagingToEdit = insurance;
      this.displayPrompt = true;
    },

    handlePageChange() {
      this.$store.dispatch('radiology/fetchImagings', {
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
    this.$store.dispatch('radiology/fetchImagings', {
      currentPage: this.currentPage,
      itemsPerPage: this.itemsPerPage,
    });
  },
};
</script>

<style scoped></style>
