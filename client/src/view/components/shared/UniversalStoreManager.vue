<template>
  <div class="universal-store-manager">
    <div class="row">
      <div class="col-12">
        <div class="card card-custom gutter-b">
          <div class="card-header border-0 py-5">
            <h3 class="card-title align-items-start flex-column">
              <span class="card-label font-weight-bolder text-dark">{{ title }}</span>
              <span class="text-muted mt-3 font-weight-bold font-size-sm">{{ subtitle }}</span>
            </h3>
            <div class="card-toolbar">
              <button
                v-if="allowNewItem"
                type="button"
                class="btn btn-primary font-weight-bolder mr-3"
                @click="$emit('create-new')"
              >
                <i class="ki ki-plus icon-sm"></i>
                New {{ itemType }}
              </button>
            </div>
          </div>

          <div class="card-body py-0">
            <!-- Filters Section -->
            <div class="row mb-5" v-if="showFilters">
              <div class="col-lg-3 col-md-4 mb-3">
                <select v-model="filters.category_id" class="form-control" @change="applyFilters">
                  <option value="">All Categories</option>
                  <option v-for="category in categories" :key="category.id" :value="category.id">
                    {{ category.name }}
                  </option>
                </select>
              </div>

              <div
                class="col-lg-3 col-md-4 mb-3"
                v-if="filters.category_id && subcategories.length"
              >
                <select
                  v-model="filters.subcategory_id"
                  class="form-control"
                  @change="applyFilters"
                >
                  <option value="">All Subcategories</option>
                  <option
                    v-for="subcategory in subcategories"
                    :key="subcategory.id"
                    :value="subcategory.id"
                  >
                    {{ subcategory.name }}
                  </option>
                </select>
              </div>

              <div class="col-lg-3 col-md-4 mb-3">
                <select v-model="filters.status" class="form-control" @change="applyFilters">
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="low_stock">Low Stock</option>
                </select>
              </div>

              <div class="col-lg-3 col-md-4 mb-3">
                <div class="input-group">
                  <input
                    v-model="filters.search"
                    type="text"
                    class="form-control"
                    placeholder="Search items..."
                    @keyup.enter="applyFilters"
                  />
                  <div class="input-group-append">
                    <button class="btn btn-primary" type="button" @click="applyFilters">
                      <i class="ki ki-search"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Dispensary Section -->
            <div v-if="showDispensaries && dispensaries.length" class="mb-5">
              <h5 class="font-weight-bolder text-dark mb-3">Dispensaries</h5>
              <div class="row">
                <div
                  v-for="dispensary in dispensaries"
                  :key="dispensary.id"
                  class="col-lg-4 col-md-6 mb-4"
                >
                  <DispensaryCard
                    :dispensary="dispensary"
                    @view-stock="viewDispensaryStock"
                    @transfer-stock="showTransferModal"
                    @dispense-item="showDispenseModal"
                  />
                </div>
              </div>
            </div>

            <!-- Items Table -->
            <UniversalItemsTable
              :items="items"
              :loading="loading"
              :store-type="storeType"
              @view-item="$emit('view-item', $event)"
              @edit-item="$emit('edit-item', $event)"
              @delete-item="$emit('delete-item', $event)"
              @dispense-item="showDispenseModal"
            />

            <!-- Pagination -->
            <div class="row" v-if="totalPages > 1">
              <div class="col-12">
                <b-pagination
                  v-model="currentPage"
                  :total-rows="totalItems"
                  :per-page="pageSize"
                  align="center"
                  class="my-4"
                  @input="changePage"
                ></b-pagination>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Transfer Modal -->
    <TransferModal ref="transferModal" @transfer-completed="$emit('transfer-completed')" />

    <!-- Dispense Modal -->
    <DispenseModal ref="dispenseModal" @dispense-completed="$emit('dispense-completed')" />
  </div>
</template>

<script>
import UniversalItemsTable from './UniversalItemsTable.vue';
import DispensaryCard from './DispensaryCard.vue';
import TransferModal from './TransferModal.vue';
import DispenseModal from './DispenseModal.vue';

export default {
  name: 'UniversalStoreManager',
  components: {
    UniversalItemsTable,
    DispensaryCard,
    TransferModal,
    DispenseModal,
  },
  props: {
    title: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String,
      default: '',
    },
    storeType: {
      type: String,
      required: true,
      validator: (value) => ['pharmacy', 'general_store', 'laboratory'].includes(value),
    },
    items: {
      type: Array,
      default: () => [],
    },
    dispensaries: {
      type: Array,
      default: () => [],
    },
    categories: {
      type: Array,
      default: () => [],
    },
    subcategories: {
      type: Array,
      default: () => [],
    },
    loading: {
      type: Boolean,
      default: false,
    },
    totalItems: {
      type: Number,
      default: 0,
    },
    totalPages: {
      type: Number,
      default: 0,
    },
    currentPage: {
      type: Number,
      default: 1,
    },
    pageSize: {
      type: Number,
      default: 20,
    },
    itemType: {
      type: String,
      default: 'Item',
    },
    allowNewItem: {
      type: Boolean,
      default: true,
    },
    showFilters: {
      type: Boolean,
      default: true,
    },
    showDispensaries: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      filters: {
        category_id: '',
        subcategory_id: '',
        status: '',
        search: '',
      },
    };
  },
  watch: {
    'filters.category_id'(newVal) {
      if (!newVal) {
        this.filters.subcategory_id = '';
      }
      this.$emit('category-changed', newVal);
    },
  },
  methods: {
    applyFilters() {
      this.$emit('filters-changed', { ...this.filters });
    },
    changePage(page) {
      this.$emit('page-changed', page);
    },
    viewDispensaryStock(dispensary) {
      this.$emit('view-dispensary-stock', dispensary);
    },
    showTransferModal(dispensary) {
      this.$refs.transferModal.show(dispensary, this.items);
    },
    showDispenseModal(item, dispensary = null) {
      this.$refs.dispenseModal.show(item, dispensary);
    },
    clearFilters() {
      this.filters = {
        category_id: '',
        subcategory_id: '',
        status: '',
        search: '',
      };
      this.applyFilters();
    },
  },
};
</script>

<style scoped>
.universal-store-manager {
  .card-custom {
    box-shadow: 0px 0px 30px 0px rgba(82, 63, 105, 0.05);
  }

  .btn {
    font-size: 0.9rem;
  }

  .input-group-append .btn {
    border-left: none;
  }
}
</style>
