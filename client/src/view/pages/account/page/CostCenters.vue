<template>
  <div class="card card-custom gutter-b">
    <div class="card-header py-5">
      <h3 class="card-title align-items-start flex-column">
        <span class="card-label font-weight-bolder text-dark">Cost Centers</span>
      </h3>
      <div class="card-toolbar">
        <button class="btn btn-primary" @click="openDialog()">Add Cost Center</button>
      </div>
    </div>
    <div class="card-body">
      <div class="mt-3">
        <search @search="onHandleSearch" :show-date-filter="false" />
      </div>
      <div class="table-responsive">
        <table class="table table-head-custom table-head-bg table-vertical-center">
          <thead>
            <tr class="text-uppercase">
              <th>Code</th>
              <th>Name</th>
              <th>Department</th>
              <th>Description</th>
              <th>Status</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="costCenters.length === 0">
              <td colspan="6" align="center" class="text-muted">No Data</td>
            </tr>
            <tr v-for="item in costCenters" :key="item.id">
              <td>{{ item.code }}</td>
              <td>{{ item.name }}</td>
              <td>{{ item.department?.name || 'N/A' }}</td>
              <td>{{ item.description }}</td>
              <td>
                <span :class="getStatusClass(item.is_active)" class="label label-lg label-inline">
                  {{ item.is_active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="text-right">
                <button
                  class="btn btn-icon btn-light btn-hover-primary btn-sm mr-2"
                  @click="editItem(item)"
                >
                  <i class="fas fa-pencil-alt"></i>
                </button>
                <button
                  class="btn btn-icon btn-light btn-hover-danger btn-sm"
                  @click="deleteItem(item)"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <pagination
        :total-pages="totalPages"
        :total="totalItems"
        :per-page="itemsPerPage"
        :current-page="currentPage"
        @pagechanged="onPageChange"
        @changepagecount="onChangePageCount"
      />
    </div>
    <cost-center-form
      ref="costCenterForm"
      modal-id="costCenterModal"
      :title="formTitle"
      :initial-data="editedItem"
      @submit="save"
    />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import Search from '@/utils/Search.vue';
import Pagination from '@/utils/Pagination.vue';
import CostCenterForm from '../components/CostCenterForm.vue';
import { setUrlQueryParams } from '@/common/common';

export default {
  name: 'CostCenters',
  components: {
    Search,
    Pagination,
    CostCenterForm,
  },
  data: () => ({
    currentPage: 1,
    itemsPerPage: 10,
    editedIndex: -1,
    editedItem: {
      code: '',
      name: '',
      department_id: '',
      description: '',
      is_active: true,
    },
  }),
  computed: {
    ...mapGetters('account', ['costCenters', 'loading', 'totalItems', 'totalPages']),
    formTitle() {
      return this.editedIndex === -1 ? 'New Cost Center' : 'Edit Cost Center';
    },
  },
  created() {
    this.initialize();
  },
  methods: {
    ...mapActions('account', [
      'fetchCostCenters',
      'fetchDepartments',
      'createCostCenter',
      'updateCostCenter',
      'deleteCostCenter',
    ]),
    async initialize() {
      await Promise.all([
        this.fetchCostCenters({
          currentPage: this.currentPage,
          itemsPerPage: this.itemsPerPage,
        }),
        this.fetchDepartments(),
      ]);
    },
    onHandleSearch({ search }) {
      setUrlQueryParams({
        currentPage: 1,
        itemsPerPage: this.itemsPerPage,
        search,
      });
      this.fetchCostCenters({
        currentPage: 1,
        itemsPerPage: this.itemsPerPage,
        search,
      });
    },
    onPageChange(page) {
      this.currentPage = page;
      this.handlePageChange();
    },
    onChangePageCount(pagecount) {
      setUrlQueryParams({
        currentPage: this.currentPage,
        itemsPerPage: pagecount,
      });
      this.fetchCostCenters({
        currentPage: this.currentPage,
        itemsPerPage: pagecount,
      });
    },
    handlePageChange() {
      setUrlQueryParams({
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
      });
      this.fetchCostCenters({
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
      });
    },
    openDialog() {
      this.editedIndex = -1;
      this.editedItem = {
        code: '',
        name: '',
        department_id: '',
        description: '',
        is_active: true,
      };
      this.$refs.costCenterForm.$el.querySelector('.modal').classList.add('show');
      this.$refs.costCenterForm.$el.querySelector('.modal').style.display = 'block';
    },
    editItem(item) {
      this.editedIndex = this.costCenters.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.$refs.costCenterForm.$el.querySelector('.modal').classList.add('show');
      this.$refs.costCenterForm.$el.querySelector('.modal').style.display = 'block';
    },
    async deleteItem(item) {
      if (confirm('Are you sure you want to delete this cost center?')) {
        await this.deleteCostCenter(item.id);
      }
    },
    async save(formData) {
      if (this.editedIndex > -1) {
        await this.updateCostCenter({
          id: this.editedItem.id,
          data: formData,
        });
      } else {
        await this.createCostCenter(formData);
      }
      this.$refs.costCenterForm.$el.querySelector('.modal').classList.remove('show');
      this.$refs.costCenterForm.$el.querySelector('.modal').style.display = 'none';
    },
    getStatusClass(isActive) {
      return isActive ? 'label-light-success' : 'label-light-danger';
    },
  },
};
</script>
