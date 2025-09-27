<template>
  <div class="bill-items-page">
    <!-- Header Section -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <div class="breadcrumb">
            <b-button variant="link" @click="$router.go(-1)" class="back-btn">
              <i class="fas fa-arrow-left mr-2"></i>Back to Bills
            </b-button>
          </div>
          <h1 class="page-title">
            <i class="fas fa-list-alt text-primary mr-3"></i>
            Bill Items Management
          </h1>
          <div class="bill-summary">
            <div class="summary-item">
              <span class="text-dark-50 font-size-md font-weight-bold">Bill #:</span>
              <span class="value">{{ bill?.bill_number }}</span>
            </div>
            <div class="summary-item">
              <span class="text-dark-50 font-size-md font-weight-bold">Patient:</span>
              <span class="value"
                >{{ bill?.patient?.firstname }} {{ bill?.patient?.lastname }}</span
              >
            </div>
            <div class="summary-item">
              <span class="text-dark-50 font-size-md font-weight-bold">Total Amount:</span>
              <span class="value amount">{{ formatCurrency(bill?.final_amount) }}</span>
            </div>
            <div class="summary-item">
              <span class="text-dark-50 font-size-md font-weight-bold">Outstanding:</span>
              <span class="value outstanding">{{ formatCurrency(outstandingAmount) }}</span>
            </div>
          </div>
        </div>
        <div class="header-actions">
          <b-button variant="success" @click="processSelectedItems" :disabled="!hasSelectedItems">
            <i class="fas fa-credit-card mr-2"></i>
            Pay Selected ({{ selectedItems.length }})
          </b-button>
          <b-button
            variant="outline-primary"
            @click="selectAllItems"
            :title="`Select all unpaid items (${
              billItems.filter((item) => !isItemPaid(item)).length
            } available)`"
          >
            <i class="fas fa-check-square mr-2"></i>
            Select All Unpaid
          </b-button>
          <b-button variant="outline-secondary" @click="clearSelection">
            <i class="fas fa-times mr-2"></i>
            Clear Selection
          </b-button>
        </div>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="quick-stats mb-4">
      <div class="row">
        <div class="col-lg-3 col-md-6 mb-3">
          <div class="stat-card bg-gradient-primary">
            <div class="stat-icon">
              <i class="fas fa-list text-white"></i>
            </div>
            <div class="stat-content text-white">
              <h3 class="text-white">{{ billItems.length }}</h3>
              <p class="text-white">Total Items</p>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6 mb-3">
          <div class="stat-card bg-gradient-success">
            <div class="stat-icon">
              <i class="fas fa-check-circle text-white"></i>
            </div>
            <div class="stat-content">
              <h3 class="text-white">{{ paidItemsCount }}</h3>
              <p class="text-white">Paid Items</p>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6 mb-3">
          <div class="stat-card bg-gradient-warning">
            <div class="stat-icon">
              <i class="fas fa-clock text-white"></i>
            </div>
            <div class="stat-content">
              <h3 class="text-white">{{ pendingItemsCount }}</h3>
              <p class="text-white">Pending Items</p>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6 mb-3">
          <div class="stat-card bg-gradient-info">
            <div class="stat-icon">
              <i class="fas fa-percentage text-white"></i>
            </div>
            <div class="stat-content">
              <h3 class="text-white">{{ paymentProgress }}%</h3>
              <p class="text-white">Payment Progress</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Advanced Filters -->
    <div class="filters-section mb-4">
      <div class="card">
        <div class="card-body">
          <div class="filters-header">
            <h6 class="mb-0">
              <i class="fas fa-filter text-primary mr-2"></i>
              Advanced Item Filters
            </h6>
            <b-button
              variant="link"
              @click="showAdvancedFilters = !showAdvancedFilters"
              class="p-0"
            >
              <i :class="showAdvancedFilters ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
              {{ showAdvancedFilters ? 'Hide' : 'Show' }} Filters
            </b-button>
          </div>

          <div v-if="showAdvancedFilters" class="filters-content">
            <div class="row">
              <div class="col-md-3">
                <b-form-group label="Item Type">
                  <b-form-select
                    v-model="filters.itemType"
                    :options="itemTypeOptions"
                    @change="applyFilters"
                  ></b-form-select>
                </b-form-group>
              </div>
              <div class="col-md-3">
                <b-form-group label="Payment Status">
                  <b-form-select
                    v-model="filters.paymentStatus"
                    :options="paymentStatusOptions"
                    @change="applyFilters"
                  ></b-form-select>
                </b-form-group>
              </div>
              <div class="col-md-3">
                <b-form-group label="Amount Range">
                  <b-form-input
                    v-model="filters.amountRange"
                    placeholder="Min - Max"
                    @change="applyFilters"
                  ></b-form-input>
                </b-form-group>
              </div>
              <div class="col-md-3">
                <b-form-group label="Search Items">
                  <b-form-input
                    v-model="filters.searchTerm"
                    placeholder="Search item names..."
                    @input="debounceSearch"
                  >
                    <template #prepend>
                      <i class="fas fa-search"></i>
                    </template>
                  </b-form-input>
                </b-form-group>
              </div>
            </div>
            <div class="row mt-3">
              <div class="col-md-3">
                <b-form-group label="Date Added">
                  <b-form-input
                    v-model="filters.dateAdded"
                    type="date"
                    @change="applyFilters"
                  ></b-form-input>
                </b-form-group>
              </div>
              <div class="col-md-3">
                <b-form-group label="Category">
                  <b-form-select
                    v-model="filters.category"
                    :options="categoryOptions"
                    @change="applyFilters"
                  ></b-form-select>
                </b-form-group>
              </div>
              <div class="col-md-3">
                <b-form-group label="Sort By">
                  <b-form-select
                    v-model="filters.sortBy"
                    :options="sortOptions"
                    @change="applyFilters"
                  ></b-form-select>
                </b-form-group>
              </div>
              <div class="col-md-3">
                <div class="d-flex gap-2 mt-4">
                  <b-button variant="outline-secondary" @click="clearFilters">
                    <i class="fas fa-times mr-2"></i>Clear
                  </b-button>
                  <b-button variant="primary" @click="applyFilters">
                    <i class="fas fa-filter mr-2"></i>Apply
                  </b-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Items Grid -->
    <div class="items-grid-section">
      <div class="card">
        <div class="card-body">
          <div class="items-header mb-3">
            <div class="d-flex justify-content-between align-items-center">
              <h6 class="mb-0">
                <i class="fas fa-th-large text-primary mr-2"></i>
                Bill Items ({{ filteredItems.length }} of {{ billItems.length }})
              </h6>

              <div class="view-controls">
                <b-button-group size="sm">
                  <b-button
                    variant="outline-primary"
                    :pressed="viewMode === 'grid'"
                    @click="viewMode = 'grid'"
                  >
                    <i class="fas fa-th-large"></i>
                  </b-button>
                  <b-button
                    variant="outline-primary"
                    :pressed="viewMode === 'list'"
                    @click="viewMode = 'list'"
                  >
                    <i class="fas fa-list"></i>
                  </b-button>
                </b-button-group>
              </div>
            </div>
          </div>

          <!-- Main Content with Conditional Bill Summary -->
          <div
            class="main-content-with-sidebar"
            :class="{ 'with-summary': selectedItems.length > 0 }"
          >
            <!-- Left Panel: Items Grid -->
            <div class="items-panel">
              <!-- Grid View -->
              <div v-if="viewMode === 'grid'" class="items-grid">
                <!-- Item Type Legend -->
                <div class="item-type-legend mb-3">
                  <div class="legend-title">Item Types:</div>
                  <div class="legend-items">
                    <span class="legend-item">
                      <span class="legend-color tag-drug">drug</span>
                      <span class="legend-label">Medications</span>
                    </span>
                    <span class="legend-item">
                      <span class="legend-color tag-test">test</span>
                      <span class="legend-label">Laboratory Tests</span>
                    </span>
                    <span class="legend-item">
                      <span class="legend-color tag-investigation">investigation</span>
                      <span class="legend-label">Investigations</span>
                    </span>
                    <span class="legend-item">
                      <span class="legend-color tag-service">service</span>
                      <span class="legend-label">Medical Services</span>
                    </span>
                    <span class="legend-item">
                      <span class="legend-color tag-additional">additional</span>
                      <span class="legend-label">Additional Items</span>
                    </span>
                  </div>
                </div>

                <div class="row">
                  <div v-for="item in paginatedItems" :key="item.id" :class="getGridColumnClass()">
                    <div
                      class="item-card-compact"
                      :class="{
                        selected: selectedItems.includes(item.id),
                        paid: isItemPaid(item),
                        partial: item.payment_status === 'PARTIAL' && !isItemPaid(item),
                        disabled: isItemPaid(item),
                      }"
                      @click="!isItemPaid(item) && toggleItemSelection(item.id)"
                    >
                      <!-- Service Tag -->
                      <div class="service-tag">
                        <span class="tag-text" :class="getItemTypeClass(item.item_type)">
                          {{ item.item_type?.toLowerCase() || 'item' }}
                        </span>
                      </div>

                      <!-- Selection Checkbox -->
                      <div class="selection-checkbox">
                        <b-form-checkbox
                          :value="selectedItems.includes(item.id)"
                          :disabled="isItemPaid(item)"
                          @change="toggleItemSelection(item.id)"
                          @click.stop
                        ></b-form-checkbox>
                      </div>

                      <!-- Item Content -->
                      <div class="item-content-compact">
                        <h6 class="item-name-compact">{{ item.item_name || `Item ${item.id}` }}</h6>
                        <div class="item-id">{{ item.item_code || `ID: ${item.id}` }}</div>
                      </div>

                      <!-- Price -->
                      <div class="item-price">
                        {{ formatCurrency(item.total_price) }}
                      </div>

                      <!-- Payment Status Badge -->
                      <div class="payment-status-badge">
                        <b-badge :variant="getPaymentStatusVariant(item.payment_status)" size="sm">
                          {{ item.payment_status }}
                        </b-badge>
                        <div v-if="isItemPaid(item)" class="paid-indicator">
                          <i class="fas fa-check-circle text-success"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Panel: Bill Summary (Only when items are selected) -->
            <div v-if="selectedItems.length > 0" class="bill-summary-sidebar">
              <div class="bill-summary-card">
                <div class="bill-summary-header">
                  <i class="fas fa-file-invoice-dollar"></i>
                  <h5>Bill Summary</h5>
                </div>

                <!-- Patient Information -->
                <div class="summary-section">
                  <h6>Patient Information</h6>
                  <div class="patient-info">
                    <div class="info-row">
                      <span class="text-dark-50 font-size-sm">Name:</span>
                      <span class="value">{{
                        bill.patient?.fullname ||
                        bill.patient?.firstname + ' ' + bill.patient?.lastname ||
                        'N/A'
                      }}</span>
                    </div>
                    <div class="info-row">
                      <span class="text-dark-50 font-size-sm">Hospital ID:</span>
                      <span class="value">{{
                        bill.patient?.hospital_id || bill.patient?.id || 'N/A'
                      }}</span>
                    </div>
                    <div class="info-row" v-if="bill.patient?.email">
                      <span class="text-dark-50 font-size-sm">Email:</span>
                      <span class="value">{{ bill.patient?.email || 'N/A' }}</span>
                    </div>
                    <div class="info-row" v-if="bill.patient?.phone || bill.patient?.phone_number">
                      <span class="text-dark-50 font-size-sm">Phone:</span>
                      <span class="value">{{
                        bill.patient?.phone || bill.patient?.phone_number || 'N/A'
                      }}</span>
                    </div>
                    <div
                      class="info-row"
                      v-if="bill.patient?.insurance_provider || bill.patient?.insurance"
                    >
                      <span class="text-dark-50 font-size-sm">Insurance:</span>
                      <span class="value">
                        <b-badge variant="success">{{
                          bill.patient.insurance_provider || bill.patient.insurance || 'N/A'
                        }}</b-badge>
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Selected Items Summary -->
                <div class="summary-section">
                  <h6>Selected Items ({{ selectedItems.length }})</h6>
                  <div class="selected-items-list">
                    <div v-for="item in selectedBillItems" :key="item.id" class="selected-item">
                      <div class="item-details">
                        <div class="item-name">{{ item.item_name || `Item ${item.id}` }}</div>
                        <div class="item-meta">
                          <span class="item-type" :class="getItemTypeClass(item.item_type)">
                            {{ item.item_type?.toLowerCase() || 'item' }}
                          </span>
                          <span class="item-quantity"
                            >1 × {{ formatCurrency(item.total_price) }}</span
                          >
                        </div>
                      </div>
                      <div class="item-total">{{ formatCurrency(item.total_price) }}</div>
                    </div>
                  </div>
                </div>

                <!-- Financial Summary -->
                <div class="summary-section">
                  <h6>Financial Summary</h6>
                  <div class="financial-summary">
                    <div class="summary-row">
                      <span class="text-dark-50 font-size-sm font-weight-bold">Subtotal:</span>
                      <span class="value">{{ formatCurrency(subtotal) }}</span>
                    </div>
                    <div class="summary-row" v-if="copay > 0">
                      <span class="text-dark-50 font-size-sm">Copay:</span>
                      <span class="value text-success">+{{ formatCurrency(copay) }}</span>
                    </div>
                    <div class="summary-row total-row">
                      <span class="text-dark-50 font-size-sm font-weight-bold">Total Due:</span>
                      <span class="value total-amount">{{ formatCurrency(totalDue) }}</span>
                    </div>
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="summary-actions">
                  <b-button
                    variant="primary"
                    size="lg"
                    block
                    @click="proceedToPayment"
                    class="proceed-payment-btn"
                  >
                    <i class="fas fa-credit-card"></i>
                    Proceed to Payment
                  </b-button>

                  <div class="secondary-actions">
                    <b-button variant="outline-secondary" size="sm" @click="printInvoice">
                      <i class="fas fa-print"></i>
                      Print Invoice
                    </b-button>
                    <b-button variant="outline-secondary" size="sm" @click="downloadInvoice">
                      <i class="fas fa-download"></i>
                      Download
                    </b-button>
                    <b-button variant="outline-secondary" size="sm" @click="emailInvoice">
                      <i class="fas fa-envelope"></i>
                      Email
                    </b-button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- List View -->
          <div v-if="viewMode === 'list'" class="items-list">
            <div class="table-responsive">
              <table class="table table-hover">
                <thead class="thead-light">
                  <tr>
                    <th width="50">
                      <b-form-checkbox
                        :value="isAllSelected"
                        @change="toggleAllItems"
                      ></b-form-checkbox>
                    </th>
                    <th>Item</th>
                    <th>Type</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="item in paginatedItems"
                    :key="item.id"
                    :class="{
                      'table-success': selectedItems.includes(item.id),
                      'table-light': isItemPaid(item),
                      'table-muted': isItemPaid(item),
                    }"
                  >
                    <td>
                      <b-form-checkbox
                        :value="selectedItems.includes(item.id)"
                        :disabled="isItemPaid(item)"
                        @change="toggleItemSelection(item.id)"
                      ></b-form-checkbox>
                    </td>
                    <td>
                      <div class="item-info">
                        <strong>{{ item.item_name || `Item ${item.id}` }}</strong>
                        <small class="text-muted d-block">{{
                          item.description || 'No description'
                        }}</small>
                      </div>
                    </td>
                    <td>
                      <b-badge variant="secondary">{{ item.item_type }}</b-badge>
                    </td>
                    <td>{{ item.quantity }}</td>
                    <td>{{ formatCurrency(item.unit_price) }}</td>
                    <td>
                      <strong>{{ formatCurrency(item.total_price) }}</strong>
                    </td>
                    <td>
                      <b-badge :variant="getPaymentStatusVariant(item.payment_status)">
                        {{ item.payment_status }}
                      </b-badge>
                    </td>
                    <td>
                      <div class="action-buttons">
                        <b-button
                          variant="outline-primary"
                          size="sm"
                          @click="viewItemDetails(item)"
                          title="View Details"
                        >
                          <i class="fas fa-eye"></i>
                        </b-button>
                        <b-button
                          v-if="!isItemPaid(item)"
                          variant="outline-success"
                          size="sm"
                          @click="paySingleItem(item)"
                          title="Pay This Item"
                        >
                          <i class="fas fa-credit-card"></i>
                        </b-button>
                        <b-button
                          v-else
                          variant="outline-secondary"
                          size="sm"
                          disabled
                          title="Item Already Paid"
                        >
                          <i class="fas fa-check"></i>
                        </b-button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Pagination -->
          <div class="pagination-section">
            <b-pagination
              v-model="currentPage"
              :total-rows="filteredItems.length"
              :per-page="itemsPerPage"
              @change="onPageChange"
              align="center"
            ></b-pagination>
          </div>
        </div>
      </div>
    </div>

    <!-- Item Details Modal -->
    <b-modal
      v-model="showItemDetailsModal"
      :title="`Item Details - ${selectedItem?.name || 'Item'}`"
      size="lg"
    >
      <div v-if="selectedItem" class="item-details-modal">
        <div class="row">
          <div class="col-md-6">
            <h6 class="text-primary">Item Information</h6>
            <table class="table table-borderless">
              <tr>
                <td><strong>Name:</strong></td>
                <td>{{ selectedItem.item_name || 'N/A' }}</td>
              </tr>
              <tr>
                <td><strong>Type:</strong></td>
                <td>{{ selectedItem.item_type }}</td>
              </tr>
              <tr>
                <td><strong>Description:</strong></td>
                <td>{{ selectedItem.description || 'No description' }}</td>
              </tr>
              <tr>
                <td><strong>Quantity:</strong></td>
                <td>{{ selectedItem.quantity }}</td>
              </tr>
            </table>
          </div>
          <div class="col-md-6">
            <h6 class="text-primary">Financial Details</h6>
            <table class="table table-borderless">
              <tr>
                <td><strong>Unit Price:</strong></td>
                <td>{{ formatCurrency(selectedItem.unit_price) }}</td>
              </tr>
              <tr>
                <td><strong>Total Price:</strong></td>
                <td>{{ formatCurrency(selectedItem.total_price) }}</td>
              </tr>
              <tr>
                <td><strong>Payment Status:</strong></td>
                <td>
                  <b-badge :variant="getPaymentStatusVariant(selectedItem.payment_status)">
                    {{ selectedItem.payment_status }}
                  </b-badge>
                </td>
              </tr>
              <tr>
                <td><strong>Date Added:</strong></td>
                <td>{{ formatDate(selectedItem.created_at) }}</td>
              </tr>
            </table>
          </div>
        </div>
      </div>
    </b-modal>
  </div>
</template>

<script>
export default {
  name: 'BillItemsPage',
  props: {
    // billId is now received from route params, not as a prop
  },
  data() {
    return {
      bill: null,
      billItems: [],
      selectedItems: [],
      viewMode: 'list',
      showAdvancedFilters: false,
      currentPage: 1,
      itemsPerPage: 12,
      showItemDetailsModal: false,
      selectedItem: null,
      filters: {
        itemType: '',
        paymentStatus: '',
        amountRange: '',
        searchTerm: '',
        dateAdded: '',
        category: '',
        sortBy: 'name',
      },
      itemTypeOptions: [
        { value: '', text: 'All Types' },
        { value: 'DRUG', text: 'Drug' },
        { value: 'TEST', text: 'Test' },
        { value: 'INVESTIGATION', text: 'Investigation' },
        { value: 'SERVICE', text: 'Service' },
        { value: 'ADDITIONAL_ITEM', text: 'Additional Item' },
      ],
      paymentStatusOptions: [
        { value: '', text: 'All Statuses' },
        { value: 'PENDING', text: 'Pending' },
        { value: 'PARTIAL', text: 'Partial' },
        { value: 'PAID', text: 'Paid' },
      ],
      categoryOptions: [
        { value: '', text: 'All Categories' },
        { value: 'MEDICATION', text: 'Medication' },
        { value: 'DIAGNOSTIC', text: 'Diagnostic' },
        { value: 'TREATMENT', text: 'Treatment' },
        { value: 'ADMINISTRATIVE', text: 'Administrative' },
      ],
      sortOptions: [
        { value: 'name', text: 'Name' },
        { value: 'type', text: 'Type' },
        { value: 'amount', text: 'Amount' },
        { value: 'status', text: 'Status' },
        { value: 'date', text: 'Date Added' },
      ],
    };
  },
  computed: {
    outstandingAmount() {
      if (!this.bill) return 0;
      return this.bill.final_amount - (this.bill.paid_amount || 0);
    },
    paidItemsCount() {
      return this.billItems.filter((item) => item.payment_status === 'PAID').length;
    },
    pendingItemsCount() {
      return this.billItems.filter((item) => item.payment_status === 'PENDING').length;
    },
    paymentProgress() {
      if (this.billItems.length === 0) return 0;
      return Math.round((this.paidItemsCount / this.billItems.length) * 100);
    },
    hasSelectedItems() {
      return this.selectedItems.length > 0;
    },
    isAllSelected() {
      const unpaidItems = this.billItems.filter((item) => !this.isItemPaid(item));
      return unpaidItems.length > 0 && this.selectedItems.length === unpaidItems.length;
    },
    filteredItems() {
      let items = [...this.billItems];

      // Apply filters
      if (this.filters.itemType) {
        items = items.filter((item) => item.item_type === this.filters.itemType);
      }
      if (this.filters.paymentStatus) {
        items = items.filter((item) => item.payment_status === this.filters.paymentStatus);
      }
      if (this.filters.searchTerm) {
        const term = this.filters.searchTerm.toLowerCase();
        items = items.filter(
          (item) =>
            (item.name && item.name.toLowerCase().includes(term)) ||
            (item.description && item.description.toLowerCase().includes(term))
        );
      }
      if (this.filters.amountRange) {
        const parts = this.filters.amountRange.split('-').map((s) => parseFloat(s.trim()));
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
          items = items.filter(
            (item) => item.total_price >= parts[0] && item.total_price <= parts[1]
          );
        }
      }

      // Apply sorting
      items.sort((a, b) => {
        switch (this.filters.sortBy) {
          case 'name':
            return (a.name || '').localeCompare(b.name || '');
          case 'type':
            return (a.item_type || '').localeCompare(b.item_type || '');
          case 'amount':
            return (b.total_price || 0) - (a.total_price || 0);
          case 'status':
            return (a.payment_status || '').localeCompare(b.payment_status || '');
          case 'date':
            return new Date(b.created_at || 0) - new Date(a.created_at || 0);
          default:
            return 0;
        }
      });

      return items;
    },
    paginatedItems() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredItems.slice(start, end);
    },

    // Bill Summary Computed Properties
    selectedBillItems() {
      return this.billItems.filter((item) => this.selectedItems.includes(item.id));
    },

    subtotal() {
      return this.selectedBillItems.reduce((sum, item) => +sum + (+item.total_price || 0), 0) || 0;
    },

    copay() {
      // This could be fetched from patient insurance or set manually
      return this.bill.patient_co_pay_amount || 0;
    },

    totalDue() {
      return +this.subtotal + (+this.copay || 0);
    },
  },
  async mounted() {
    await this.loadBillData();
  },
  methods: {
    async loadBillData() {
      try {
        // Get billId from route params
        const billId = this.$route.params.billId;

        if (!billId) {
          throw new Error('Bill ID is required');
        }

        console.log('Loading bill data for ID:', billId);

        // Load bill with items using the correct backend method
        const billResponse = await this.$store.dispatch(
          'accounting/getClinicalBillWithItems',
          billId
        );

        if (billResponse.success) {
          this.bill = billResponse.data.bill;
          this.billItems = billResponse.data.items || [];

          console.log('Loaded bill:', this.bill);
          console.log('Loaded bill.patient:', this.bill?.patient);
          console.log('Loaded items:', this.billItems);
        } else {
          throw new Error(billResponse.error || 'Failed to load bill data');
        }
      } catch (error) {
        console.error('Failed to load bill data:', error);
        this.$bvToast.toast('Failed to load bill data', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      }
    },

    toggleItemSelection(itemId) {
      // Check if item is already paid
      const item = this.billItems.find((item) => item.id === itemId);
      if (item && this.isItemPaid(item)) {
        this.$bvToast.toast('Cannot select already paid items', {
          title: 'Item Already Paid',
          variant: 'warning',
          solid: true,
        });
        return;
      }

      const index = this.selectedItems.indexOf(itemId);
      if (index > -1) {
        this.selectedItems.splice(index, 1);
      } else {
        this.selectedItems.push(itemId);
      }
    },

    selectAllItems() {
      // Only select unpaid items
      this.selectedItems = this.billItems
        .filter((item) => !this.isItemPaid(item))
        .map((item) => item.id);

      if (this.selectedItems.length === 0) {
        this.$bvToast.toast('No unpaid items available for selection', {
          title: 'No Items Available',
          variant: 'info',
          solid: true,
        });
      } else {
        this.$bvToast.toast(`Selected ${this.selectedItems.length} unpaid items`, {
          title: 'Items Selected',
          variant: 'success',
          solid: true,
        });
      }
    },

    clearSelection() {
      this.selectedItems = [];
    },

    toggleAllItems() {
      if (this.isAllSelected) {
        this.clearSelection();
      } else {
        this.selectAllItems();
      }
    },

    processSelectedItems() {
      // Navigate to payment processing with selected items using query params
      this.$router.push({
        name: 'payment-processing',
        params: {
          billId: this.$route.params.billId,
        },
        query: {
          selectedItems: this.selectedItems.join(','),
        },
      });
    },

    paySingleItem(item) {
      this.selectedItems = [item.id];
      this.processSelectedItems();
    },

    viewItemDetails(item) {
      this.selectedItem = item;
      this.showItemDetailsModal = true;
    },

    applyFilters() {
      this.currentPage = 1;
    },

    clearFilters() {
      this.filters = {
        itemType: '',
        paymentStatus: '',
        amountRange: '',
        searchTerm: '',
        dateAdded: '',
        category: '',
        sortBy: 'name',
      };
      this.currentPage = 1;
    },

    debounceSearch: debounce(function () {
      this.applyFilters();
    }, 500),

    onPageChange(page) {
      this.currentPage = page;
    },

    formatCurrency(amount) {
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
      }).format(amount || 0);
    },

    formatDate(dateString) {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleDateString('en-NG');
    },

    getPaymentStatusVariant(status) {
      const variants = {
        PENDING: 'warning',
        PARTIAL: 'info',
        PAID: 'success',
        CANCELLED: 'danger',
      };
      return variants[status] || 'secondary';
    },

    getItemTypeClass(itemType) {
      const typeClasses = {
        DRUG: 'tag-drug',
        TEST: 'tag-test',
        INVESTIGATION: 'tag-investigation',
        SERVICE: 'tag-service',
        ADDITIONAL_ITEM: 'tag-additional',
      };
      return typeClasses[itemType] || 'tag-default';
    },

    // Payment and Invoice Methods
    proceedToPayment() {
      if (this.selectedItems.length === 0) {
        this.$bvToast.toast('Please select items to pay for', {
          title: 'No Items Selected',
          variant: 'warning',
          solid: true,
        });
        return;
      }

      // Navigate to payment processing with selected items using query params
      this.$router.push({
        name: 'payment-processing',
        params: {
          billId: this.$route.params.billId,
        },
        query: {
          selectedItems: this.selectedItems.join(','),
        },
      });
    },

    printInvoice() {
      // Implementation for printing invoice
      this.$bvToast.toast('Print functionality will be implemented', {
        title: 'Print Invoice',
        variant: 'info',
        solid: true,
      });
    },

    downloadInvoice() {
      // Implementation for downloading invoice
      this.$bvToast.toast('Download functionality will be implemented', {
        title: 'Download Invoice',
        variant: 'info',
        solid: true,
      });
    },

    emailInvoice() {
      // Implementation for emailing invoice
      this.$bvToast.toast('Email functionality will be implemented', {
        title: 'Email Invoice',
        variant: 'info',
        solid: true,
      });
    },

    getGridColumnClass() {
      // When summary is visible, reduce columns for better readability
      if (this.selectedItems.length > 0) {
        return 'col-lg-3 col-md-4 col-sm-6 col-6 mb-2'; // 4 items per row on large screens
      } else {
        return 'col-lg-2 col-md-3 col-sm-4 col-6 mb-2'; // 6 items per row on large screens
      }
    },

    isItemPaid(item) {
      // Check if item is already fully paid
      return (
        item.payment_status === 'PAID' || (item.paid_amount && item.paid_amount >= item.total_price)
      );
    },
  },
};

// Debounce utility function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
</script>

<style scoped>
.bill-items-page {
  padding: 2rem;
  background: #f8f9fa;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.header-left {
  flex: 1;
}

.breadcrumb {
  margin-bottom: 1rem;
}

.back-btn {
  color: #6c757d;
  text-decoration: none;
  padding: 0;
}

.back-btn:hover {
  color: #007bff;
}

.page-title {
  font-size: 2rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 1rem 0;
}

.bill-summary {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.summary-item {
  display: flex;
  flex-direction: column;
}

.summary-item .label {
  font-size: 0.8rem;
  color: #6c757d;
  text-transform: uppercase;
  font-weight: 600;
}

.summary-item .value {
  font-size: 1rem;
  color: #2c3e50;
  font-weight: 600;
}

.summary-item .amount {
  color: #28a745;
}

.summary-item .outstanding {
  color: #ffc107;
}

.header-actions {
  display: flex;
  gap: 1rem;
  flex-shrink: 0;
}

/* Quick Stats */
.quick-stats {
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  flex-shrink: 0;
}

.stat-content h3 {
  margin: 0 0 0.5rem 0;
  font-weight: 600;
  color: #2c3e50;
  font-size: 1.5rem;
}

.stat-content p {
  margin: 0;
  color: #6c757d;
  font-size: 0.9rem;
}

/* Filters Section */
.filters-section .card {
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.filters-header h6 {
  color: #2c3e50;
  font-weight: 600;
}

.filters-content {
  border-top: 1px solid #e9ecef;
  padding-top: 1rem;
}

/* Items Grid */
.items-grid-section .card {
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.items-header {
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 1rem;
}

.items-header h6 {
  color: #2c3e50;
  font-weight: 600;
}

.view-controls .btn-group .btn {
  border-radius: 0;
}

.view-controls .btn-group .btn:first-child {
  border-top-left-radius: 0.375rem;
  border-bottom-left-radius: 0.375rem;
}

.view-controls .btn-group .btn:last-child {
  border-top-right-radius: 0.375rem;
  border-bottom-right-radius: 0.375rem;
}

/* Grid View */
.items-grid {
  min-height: 400px;
}

/* Compact Card Design - Matching the image style */
.item-card-compact {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.item-card-compact:hover {
  border-color: #007bff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}

.item-card-compact.selected {
  border-color: #28a745;
  background: #f8fff9;
}

.item-card-compact.paid {
  border-color: #28a745;
  background: #f8fff9;
  opacity: 0.8;
}

.item-card-compact.disabled {
  cursor: not-allowed;
  opacity: 0.6;
  background: #f8f9fa;
  border-color: #dee2e6;
}

.item-card-compact.disabled:hover {
  transform: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-color: #dee2e6;
}

.item-card-compact.disabled .item-content-compact {
  opacity: 0.7;
}

.item-card-compact.disabled .item-price {
  color: #6c757d;
}

.item-card-compact.disabled .payment-status-badge .badge {
  opacity: 0.8;
}

.item-card-compact.partial {
  border-color: #ffc107;
  background: #fffdf8;
}

/* Enhanced readability when fewer items per row */
.main-content-with-sidebar.with-summary .item-card-compact {
  height: 140px; /* Slightly taller for better readability */
  padding: 1rem;
}

.main-content-with-sidebar.with-summary .item-name-compact {
  font-size: 0.9rem; /* Larger font when summary is visible */
  line-height: 1.3;
}

.main-content-with-sidebar.with-summary .item-id {
  font-size: 0.75rem; /* Larger ID text */
}

.main-content-with-sidebar.with-summary .item-price {
  font-size: 1rem; /* Larger price text */
}

/* Service Tag */
.service-tag {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  z-index: 2;
}

.tag-text {
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 500;
  text-transform: capitalize;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  color: white;
}

/* Item Type Color Variants */
.tag-drug {
  background: linear-gradient(135deg, #28a745, #20c997); /* Green gradient for drugs/medications */
  border: 1px solid #1e7e34;
}

.tag-test {
  background: linear-gradient(
    135deg,
    #17a2b8,
    #20c997
  ); /* Blue-green gradient for laboratory tests */
  border: 1px solid #138496;
}

.tag-investigation {
  background: linear-gradient(
    135deg,
    #6f42c1,
    #e83e8c
  ); /* Purple-pink gradient for investigations/imaging */
  border: 1px solid #5a2d91;
}

.tag-service {
  background: linear-gradient(
    135deg,
    #fd7e14,
    #ffc107
  ); /* Orange-yellow gradient for medical services */
  border: 1px solid #e8690b;
}

.tag-additional {
  background: linear-gradient(135deg, #6c757d, #495057); /* Gray gradient for additional items */
  border: 1px solid #545b62;
}

.tag-default {
  background: linear-gradient(
    135deg,
    #007bff,
    #6610f2
  ); /* Blue-purple gradient for unknown types */
  border: 1px solid #0056b3;
}

/* Hover effects for tags */
.item-card-compact:hover .tag-text {
  transform: scale(1.05);
  transition: transform 0.2s ease;
}

/* Item Type Legend */
.item-type-legend {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.legend-title {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
}

.legend-items {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.legend-color {
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 500;
  text-transform: capitalize;
  color: white;
  min-width: 60px;
  text-align: center;
}

.legend-label {
  font-size: 0.8rem;
  color: #6c757d;
  font-weight: 500;
}

/* Selection Checkbox */
.selection-checkbox {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
}

/* Item Content */
.item-content-compact {
  margin-top: 1.5rem;
  text-align: center;
  flex: 1;
}

.item-name-compact {
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 0.25rem 0;
  font-size: 0.85rem;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-id {
  color: #6c757d;
  font-size: 0.7rem;
  margin: 0;
}

/* Price */
.item-price {
  text-align: center;
  font-weight: 600;
  color: #007bff;
  font-size: 0.9rem;
  margin: 0.25rem 0;
}

/* Payment Status Badge */
.payment-status-badge {
  text-align: center;
  margin-top: auto;
}

.payment-status-badge .badge {
  font-size: 0.65rem;
  padding: 0.2rem 0.4rem;
}

.paid-indicator {
  margin-top: 0.25rem;
  text-align: center;
}

.paid-indicator i {
  font-size: 0.8rem;
}

/* Original item-card styles for list view compatibility */
.item-card {
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.item-card:hover {
  border-color: #007bff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}

.item-card.selected {
  border-color: #28a745;
  background: #f8fff9;
}

.item-card.paid {
  border-color: #28a745;
  background: #f8fff9;
  opacity: 0.8;
}

.item-card.partial {
  border-color: #ffc107;
  background: #fffdf8;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.selection-checkbox {
  flex-shrink: 0;
}

.item-status {
  flex-shrink: 0;
}

.item-content {
  margin-bottom: 0.75rem;
}

.item-name {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
}

.item-description {
  color: #6c757d;
  font-size: 0.8rem;
  margin-bottom: 0.75rem;
  line-height: 1.3;
}

.item-details {
  margin-bottom: 0.75rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.25rem;
  font-size: 0.8rem;
}

.detail-row .label {
  color: #6c757d;
  font-weight: 500;
}

.detail-row .value {
  color: #2c3e50;
  font-weight: 600;
}

.detail-row.total {
  border-top: 1px solid #e9ecef;
  padding-top: 0.25rem;
  margin-top: 0.25rem;
  font-weight: 600;
}

.detail-row.total .value {
  color: #28a745;
  font-size: 0.9rem;
}

.item-actions {
  display: flex;
  gap: 0.25rem;
  justify-content: flex-end;
}

/* List View */
.items-list .table {
  margin-bottom: 0;
}

.items-list .table-muted {
  background-color: #f8f9fa;
  opacity: 0.7;
}

.items-list .table-muted td {
  color: #6c757d;
}

.items-list .table-muted .badge {
  opacity: 0.8;
}

.items-list .table th {
  border-top: none;
  font-weight: 600;
  color: #2c3e50;
  background: #f8f9fa;
}

.item-info strong {
  color: #2c3e50;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

/* Pagination */
.pagination-section {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
}

/* Gradient Backgrounds */
.bg-gradient-primary {
  background: linear-gradient(135deg, #007bff, #0056b3);
}

.bg-gradient-success {
  background: linear-gradient(135deg, #28a745, #1e7e34);
}

.bg-gradient-warning {
  background: linear-gradient(135deg, #ffc107, #e0a800);
}

.bg-gradient-info {
  background: linear-gradient(135deg, #17a2b8, #138496);
}

/* Responsive Design */
@media (max-width: 768px) {
  .bill-items-page {
    padding: 1rem;
  }

  .header-content {
    flex-direction: column;
    gap: 1rem;
  }

  .header-actions {
    flex-wrap: wrap;
    justify-content: center;
  }

  .bill-summary {
    flex-direction: column;
    gap: 1rem;
  }

  .stat-card {
    padding: 1rem;
  }

  .stat-icon {
    width: 40px;
    height: 40px;
    font-size: 1.25rem;
  }

  .stat-content h3 {
    font-size: 1.25rem;
  }

  .item-card {
    padding: 0.75rem;
  }

  .filters-content .row .col-md-3 {
    margin-bottom: 1rem;
  }

  /* Legend responsive */
  .legend-items {
    gap: 0.5rem;
  }

  .legend-item {
    gap: 0.25rem;
  }

  .legend-color {
    min-width: 50px;
    font-size: 0.65rem;
  }

  .legend-label {
    font-size: 0.75rem;
  }
}

/* Main Content Layout with Sidebar */
.main-content-with-sidebar {
  display: flex;
  gap: 2rem;
  margin-top: 1rem;
}

.main-content-with-sidebar.with-summary {
  gap: 2rem;
}

.main-content-with-sidebar:not(.with-summary) .items-panel {
  width: 100%;
}

.items-panel {
  flex: 1;
  min-width: 0; /* Prevent flex item from overflowing */
  transition: all 0.3s ease;
}

.bill-summary-sidebar {
  width: 400px;
  flex-shrink: 0;
  animation: slideIn 0.3s ease;
}

.bill-summary-card {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 2rem;
}

.bill-summary-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f8f9fa;
}

.bill-summary-header i {
  font-size: 1.5rem;
  color: #007bff;
}

.bill-summary-header h5 {
  margin: 0;
  color: #2c3e50;
  font-weight: 600;
}

/* Summary Sections */
.summary-section {
  margin-bottom: 1.5rem;
}

.summary-section h6 {
  color: #495057;
  font-weight: 600;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Patient Information */
.patient-info {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-row .label {
  font-weight: 500;
  color: #6c757d;
  font-size: 0.85rem;
}

.info-row .value {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.85rem;
}

/* Selected Items List */
.selected-items-list {
  max-height: 200px;
  overflow-y: auto;
}

.selected-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 6px;
  margin-bottom: 0.5rem;
}

.selected-item:last-child {
  margin-bottom: 0;
}

.item-details {
  flex: 1;
}

.item-name {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.85rem;
  margin-bottom: 0.25rem;
}

.item-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.item-type {
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.65rem;
  font-weight: 500;
  text-transform: capitalize;
  color: white;
  min-width: 50px;
  text-align: center;
}

.item-quantity {
  color: #6c757d;
  font-size: 0.75rem;
}

.item-total {
  font-weight: 600;
  color: #007bff;
  font-size: 0.9rem;
}

/* No Items Selected State */
.no-items-selected {
  text-align: center;
  padding: 2rem 1rem;
  color: #6c757d;
}

.no-items-selected i {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #dee2e6;
}

.no-items-selected p {
  margin: 0 0 0.5rem 0;
  font-size: 0.8rem;
}

.no-items-selected small {
  font-size: 0.8rem;
}

/* Financial Summary */
.financial-summary {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.summary-row:last-child {
  margin-bottom: 0;
}

.summary-row .label {
  font-weight: 500;
  color: #6c757d;
  font-size: 0.85rem;
}

.summary-row .value {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.85rem;
}

.total-row {
  border-top: 1px solid #dee2e6;
  padding-top: 0.75rem;
  margin-top: 0.75rem;
}

.total-amount {
  color: #007bff !important;
  font-size: 1.1rem !important;
}

/* Action Buttons */
.summary-actions {
  margin-top: 2rem;
}

.proceed-payment-btn {
  margin-bottom: 1rem;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
}

.secondary-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.secondary-actions .btn {
  flex: 1;
  min-width: 80px;
}

/* No Selection State */
.no-selection-state {
  text-align: center;
  padding: 2rem 1rem;
  color: #6c757d;
}

.empty-state {
  padding: 1rem;
}

.empty-state i {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #dee2e6;
}

.empty-state h6 {
  color: #495057;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.empty-state p {
  margin: 0;
  font-size: 0.85rem;
  line-height: 1.4;
}

/* Slide In Animation */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Selection Help Text */
.selection-help-text .alert {
  border-left: 4px solid #17a2b8;
  background-color: #f8f9fa;
}

.selection-help-text ul {
  padding-left: 1.5rem;
}

.selection-help-text li {
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
  color: #495057;
}

/* Responsive Design for Sidebar */
@media (max-width: 1200px) {
  .main-content-with-sidebar {
    flex-direction: column;
  }

  .main-content-with-sidebar.with-summary .items-panel {
    width: 100%;
  }

  .bill-summary-sidebar {
    width: 100%;
    order: -1; /* Show summary above items on smaller screens */
  }

  .bill-summary-card {
    position: static;
  }
}

@media (max-width: 576px) {
  .items-grid .col-lg-2,
  .items-grid .col-md-3,
  .items-grid .col-sm-4,
  .items-grid .col-6 {
    width: 50%;
  }

  .item-card-compact {
    margin-bottom: 0.5rem;
    padding: 0.5rem;
    height: 100px;
  }

  .item-name-compact {
    font-size: 0.75rem;
  }

  .item-id {
    font-size: 0.65rem;
  }

  .item-price {
    font-size: 0.8rem;
  }

  .tag-text {
    font-size: 0.6rem;
    padding: 0.15rem 0.4rem;
  }
}
</style>
