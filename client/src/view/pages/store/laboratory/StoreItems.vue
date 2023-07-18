<template>
  <!--begin::Advance Table Widget 1-->
  <div class="card card-custom gutter-b">
    <update-lab-item
      :displayPrompt="displayPrompt"
      @closeModal="hideModal"
      :data="itemToEdit"
    />
    <!--begin::Header-->
    <div class="card-header border-0 py-5">
      <h3 class="card-title align-items-start flex-column">
        <span class="card-label font-weight-bolder text-dark">Store Items</span>
      </h3>
      <div class="card-toolbar">
        <router-link
          to="/store/laboratory/add-item"
          class="btn btn-success font-weight-bolder font-size-sm"
        >
          <add-icon /> Add New
        </router-link>
      </div>
    </div>
    <!--end::Header-->
    <search @search="onHandleSearch" />

    <!--begin::Body-->
    <div class="card-body py-0">
      <!--begin::Table-->
      <div class="table-responsive">
        <table
          class="table table-head-custom table-vertical-center"
          id="kt_advance_table_widget_1"
        >
          <thead>
            <tr class="text-left">
              <th class="pl-0" style="width: 20px">
                <label class="checkbox checkbox-lg checkbox-inline">
                  <input type="checkbox" value="1" />
                  <span></span>
                </label>
              </th>
              <th class="pr-0" style="width: 300px">Name</th>
              <th style="min-width: 150px">Quantity</th>
              <th style="min-width: 50px">Shelf</th>
              <th style="min-width: 100px">Total Price</th>
              <th style="min-width: 50px">Expiration</th>
              <th style="min-width: 150px">Date Created</th>
              <th class="pr-0 text-right" style="min-width: 150px">action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="items.length == 0">
              <td colspan="9" align="center" class="text-muted">No Data</td>
            </tr>
            <tr v-for="item in items" :key="item.id">
              <td class="pl-0">
                <label class="checkbox checkbox-lg checkbox-inline">
                  <input type="checkbox" value="1" />
                  <span></span>
                </label>
              </td>
              <td class="pr-0">
                <a
                  href="#"
                  class="text-dark-75 font-weight-bolder text-hover-primary mb-1 font-size-lg"
                  >{{ item.name }}</a
                >
              </td>
              <td>
                <span
                  class="text-dark-75 font-weight-bolder d-block font-size-lg"
                >
                  {{ item.quantity_remaining }} {{ item.unit.name }}
                </span>
              </td>
              <td>
                <span
                  class="text-dark-75 font-weight-bolder d-block font-size-lg"
                >
                  {{ item.shelf || "None" }}
                </span>
              </td>
              <td>
                <span
                  class="text-dark-75 font-weight-bolder d-block font-size-lg"
                >
                  {{ item.total_price || "None" }}
                </span>
              </td>
              <td>
                <span
                  class="text-dark-75 font-weight-bolder d-block font-size-lg"
                >
                  {{ item.expiration | moment("ddd, MMM Do YYYY") }}
                </span>
              </td>
              <td>
                <span
                  class="text-dark-75 font-weight-bolder d-block font-size-lg"
                >
                  {{ item.createdAt | moment("ddd, MMM Do YYYY, h:mma") }}
                </span>
              </td>
              <td class="pr-0 text-right">
                <a
                  href="#"
                  class="btn btn-icon btn-light btn-hover-primary btn-sm mx-3"
                  @click.stop="dispenseData(item)"
                >
                  <send-icon />
                </a>
                <a
                  href="#"
                  class="btn btn-icon btn-light btn-hover-primary btn-sm mx-3"
                  @click.stop="editData(item)"
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
        @changepagecount="onChangePageCount"
      />
    </div>
    <!--end::Body-->
  </div>
  <!--end::Advance Table Widget 1-->
</template>

<script>
import UpdateLabItem from "./update/UpdateStoreItem.vue";
import Pagination from "@/utils/Pagination.vue";
import EditIcon from "../../../../assets/icons/EditIcon.vue";
import AddIcon from "../../../../assets/icons/AddIcon.vue";
import SendIcon from "../../../../assets/icons/SendIcon.vue";
import Search from "../../../../utils/Search.vue";
export default {
  data() {
    return {
      displayPrompt: false,
      itemToEdit: {},
      currentPage: 1,
      itemsPerPage: 10
    };
  },
  components: {
    UpdateLabItem,
    Pagination,
    EditIcon,
    AddIcon,
    SendIcon,
    Search
  },
  computed: {
    items() {
      return this.$store.state.store.labItems;
    },
    queriedItems() {
      return this.$store.state.store.totalLabItems;
    },
    pages() {
      return this.$store.state.store.labItemPages;
    },
    perPage() {
      return this.items.length;
    }
  },
  methods: {
    addNewData() {
      this.itemToEdit = {};
      this.displayPrompt = true;
    },

    hideModal() {
      this.displayPrompt = false;
    },

    editData(item) {
      this.itemToEdit = item;
      this.displayPrompt = true;
    },

    handlePageChange() {
      this.$store.dispatch("store/fetchLaboratoryItems", {
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage
      });
    },

    onPageChange(page) {
      this.currentPage = page;
      this.handlePageChange();
    },

    onHandleSearch(search) {
      this.$store.dispatch("store/fetchLaboratoryItems", {
        currentPage: 1,
        itemsPerPage: this.itemsPerPage,
        search
      });
    },

    onChangePageCount(pagecount) {
      this.$store.dispatch("store/fetchLaboratoryItems", {
        currentPage: this.currentPage,
        itemsPerPage: pagecount
      });
    }
  },
  created() {
    this.$store.dispatch("store/fetchLaboratoryItems", {
      currentPage: this.currentPage,
      itemsPerPage: this.itemsPerPage
    });
  }
};
</script>

<style></style>
