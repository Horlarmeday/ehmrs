<template>
  <div>
    <!--begin::Card-->
    <div class="card card-custom gutter-b example example-compact">
      <create-service
        :displayPrompt="displayPrompt"
        @closeModal="hideModal"
        :data="serviceToEdit"
      />
      <div class="card-header" style="min-height: 50px !important">
        <h3 class="card-title">
          Service List
        </h3>
      </div>
      <!--begin::Header-->
      <div class="card-header border-0">
        <div class="card-toolbar">
          <a
            href="#"
            class="btn btn-primary font-weight-bolder font-size-sm"
            @click="addNewData"
          >
            <add-icon /> Add New
          </a>
        </div>
      </div>
      <!--end::Header-->

      <!--begin::Body-->
      <div class="card-body pt-0 pb-3">
        <!--begin::Table-->
        <div class="table-responsive">
          <table
            class="table table-head-custom table-vertical-center table-head-bg"
          >
            <thead>
              <tr class="text-uppercase">
                <th class="pl-5" style="min-width: 150px">Name</th>
                <th style="min-width: 100px">Price</th>
                <th style="min-width: 100px">Code</th>
                <th style="min-width: 160px">Date</th>
                <th class="pr-0 " style="min-width: 150px">action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="service in services" :key="service.id">
                <td class="pl-5">
                  <p>
                    <span
                      class="text-dark-75 font-weight-bolder d-block font-size-lg"
                    >
                      {{ service.name }}
                    </span>
                  </p>
                </td>
                <td>
                  <span
                    class="text-dark-75 font-weight-bolder d-block font-size-lg"
                  >
                    {{ service.price || "None" }}
                  </span>
                </td>
                <td>
                  <span
                    class="text-dark-75 font-weight-bolder d-block font-size-lg"
                  >
                    {{ service.code || "None" }}
                  </span>
                </td>
                <td class="">
                  <span
                    class="text-dark-75 font-weight-bolder d-block font-size-lg"
                    >{{ service.createdAt | moment("ddd, MMM Do YYYY") }}</span
                  >
                </td>
                <td class="pr-0">
                  <a
                    href="#"
                    class="btn btn-icon btn-light btn-hover-primary btn-sm mx-3"
                    @click.stop="editData(service)"
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
    <!--end::Card-->
  </div>
</template>

<script>
import Pagination from "@/utils/Pagination.vue";
import CreateService from "./CreateService.vue";
import EditIcon from "../../../../assets/icons/EditIcon.vue";
import AddIcon from "../../../../assets/icons/AddIcon.vue";
export default {
  data() {
    return {
      search: "",
      currentPage: 1,
      itemsPerPage: 10,
      displayPrompt: false,
      serviceToEdit: {}
    };
  },
  components: {
    Pagination,
    CreateService,
    EditIcon,
    AddIcon
  },

  computed: {
    services() {
      return this.$store.state.model.services;
    },
    queriedItems() {
      return this.$store.state.model.total;
    },
    pages() {
      return this.$store.state.model.pages;
    },
    perPage() {
      return this.departments.length;
    }
  },

  methods: {
    addNewData() {
      this.serviceToEdit = {};
      this.displayPrompt = true;
    },

    hideModal() {
      this.displayPrompt = false;
    },

    editData(department) {
      this.serviceToEdit = department;
      this.displayPrompt = true;
    },

    handlePageChange() {
      this.$store.dispatch("model/fetchServices", {
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage
      });
    },

    onPageChange(page) {
      this.currentPage = page;
      this.handlePageChange();
    }
  },
  created() {
    this.$store.dispatch("model/fetchServices", {
      currentPage: this.currentPage,
      itemsPerPage: this.itemsPerPage
    });
  }
};
</script>

<style></style>
