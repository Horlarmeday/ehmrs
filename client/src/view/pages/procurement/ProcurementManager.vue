<template>
  <div class="procurement-manager">
    <!-- Header Section -->
    <div class="card card-custom gutter-b mb-8">
      <div class="card-header border-0 py-5">
        <div class="card-title align-items-start flex-column">
          <span class="card-label font-weight-bolder text-dark font-size-h3">
            <i class="fas fa-shopping-cart text-primary mr-3"></i>
            Procurement Management
          </span>
          <span class="text-muted mt-2 font-weight-normal">
            Manage purchase orders, supplier relationships, and inventory procurement
          </span>
        </div>
        <div class="card-toolbar">
          <div class="btn-group" role="group">
            <button
              class="btn btn-light-primary btn-sm font-weight-bold"
              :class="{ active: activeView === 'orders' }"
              @click="setActiveView('orders')"
            >
              <i class="fas fa-list mr-2"></i>Orders
            </button>
            <button
              class="btn btn-light-primary btn-sm font-weight-bold"
              :class="{ active: activeView === 'vendors' }"
              @click="setActiveView('vendors')"
            >
              <i class="fas fa-building mr-2"></i>Vendors
            </button>
            <button
              class="btn btn-light-primary btn-sm font-weight-bold"
              :class="{ active: activeView === 'reports' }"
              @click="setActiveView('reports')"
            >
              <i class="fas fa-chart-bar mr-2"></i>Reports
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="row mb-8">
      <div class="col-lg-3 col-md-6">
        <div class="card card-custom bg-light-primary">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="symbol symbol-50 symbol-light-primary mr-4">
                <span class="symbol-label">
                  <i class="fas fa-clock text-primary"></i>
                </span>
              </div>
              <div>
                <div class="text-dark-75 font-weight-bolder font-size-h4">
                  {{ stats.pending || 0 }}
                </div>
                <div class="text-muted font-size-sm">Pending Orders</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-lg-3 col-md-6">
        <div class="card card-custom bg-light-success">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="symbol symbol-50 symbol-light-success mr-4">
                <span class="symbol-label">
                  <i class="fas fa-check text-success"></i>
                </span>
              </div>
              <div>
                <div class="text-dark-75 font-weight-bolder font-size-h4">
                  {{ stats.approved || 0 }}
                </div>
                <div class="text-muted font-size-sm">Approved Orders</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-lg-3 col-md-6">
        <div class="card card-custom bg-light-info">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="symbol symbol-50 symbol-light-info mr-4">
                <span class="symbol-label">
                  <i class="fas fa-truck text-info"></i>
                </span>
              </div>
              <div>
                <div class="text-dark-75 font-weight-bolder font-size-h4">
                  {{ stats.sent || 0 }}
                </div>
                <div class="text-muted font-size-sm">Sent Orders</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-lg-3 col-md-6">
        <div class="card card-custom bg-light-warning">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="symbol symbol-50 symbol-light-warning mr-4">
                <span class="symbol-label">
                  <i class="fas fa-boxes text-warning"></i>
                </span>
              </div>
              <div>
                <div class="text-dark-75 font-weight-bolder font-size-h4">
                  {{ stats.received || 0 }}
                </div>
                <div class="text-muted font-size-sm">Received Orders</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Content Views -->
    <div class="view-content">
      <!-- Orders View -->
      <div v-show="activeView === 'orders'" class="view-pane fade show active">
        <div class="card card-custom gutter-b">
          <div class="card-header border-0 py-4">
            <h4 class="card-title font-weight-bolder text-dark">
              <i class="fas fa-list text-primary mr-2"></i>
              Purchase Orders
            </h4>
            <div class="card-toolbar">
              <button class="btn btn-primary btn-sm font-weight-bold" @click="openCreateModal()">
                <i class="fas fa-plus mr-2"></i>Create Order
              </button>
            </div>
          </div>
          <div class="card-body py-0">
            <!-- Filters -->
            <div class="row mb-4">
              <div class="col-md-3">
                <select v-model="filters.status" class="form-control" @change="loadOrders">
                  <option value="">All Status</option>
                  <option value="DRAFT">Draft</option>
                  <option value="APPROVED">Approved</option>
                  <option value="SENT">Sent</option>
                  <option value="RECEIVED">Received</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
              <div class="col-md-3">
                <input
                  type="date"
                  v-model="filters.dateFrom"
                  class="form-control"
                  placeholder="From Date"
                  @change="loadOrders"
                />
              </div>
              <div class="col-md-3">
                <input
                  type="date"
                  v-model="filters.dateTo"
                  class="form-control"
                  placeholder="To Date"
                  @change="loadOrders"
                />
              </div>
              <div class="col-md-3">
                <input
                  type="text"
                  v-model="filters.search"
                  class="form-control"
                  placeholder="Search orders..."
                  @input="loadOrders"
                />
              </div>
            </div>

            <!-- Orders Table -->
            <div class="table-responsive">
              <table class="table table-head-custom table-vertical-center">
                <thead>
                  <tr class="text-left">
                    <th class="pl-4" style="min-width: 120px">
                      <span class="text-dark-75 font-weight-bolder">Order #</span>
                    </th>
                    <th style="min-width: 150px">
                      <span class="text-dark-75 font-weight-bolder">Vendor</span>
                    </th>
                    <th style="min-width: 120px">
                      <span class="text-dark-75 font-weight-bolder">Order Date</span>
                    </th>
                    <th style="min-width: 120px">
                      <span class="text-dark-75 font-weight-bolder">Total Amount</span>
                    </th>
                    <th style="min-width: 100px">
                      <span class="text-dark-75 font-weight-bolder">Status</span>
                    </th>
                    <th style="min-width: 120px">
                      <span class="text-dark-75 font-weight-bolder">Expected Delivery</span>
                    </th>
                    <th class="pr-0 text-right" style="min-width: 150px">
                      <span class="text-dark-75 font-weight-bolder">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="orders.length === 0">
                    <td colspan="7" class="text-center py-8">
                      <div class="text-muted">
                        <i class="fas fa-inbox fa-3x mb-3"></i>
                        <p class="font-size-lg">No purchase orders found</p>
                        <p class="font-size-sm">Click "Create Order" to get started</p>
                      </div>
                    </td>
                  </tr>
                  <tr v-for="order in orders" :key="order.id" class="order-row">
                    <td class="pl-4">
                      <span class="text-dark-75 font-weight-bolder font-size-lg">
                        PO-{{ order.order_number }}
                      </span>
                    </td>
                    <td>
                      <div class="d-flex align-items-center">
                        <div class="symbol symbol-40 symbol-light-info mr-4">
                          <span class="symbol-label">
                            <i class="fas fa-building text-info"></i>
                          </span>
                        </div>
                        <div>
                          <span
                            class="text-dark-75 font-weight-bolder text-hover-primary mb-1 font-size-lg"
                          >
                            {{ order.vendor_name }}
                          </span>
                          <span class="text-muted d-block font-size-sm">{{
                            order.vendor_contact
                          }}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                        {{ formatDate(order.order_date) }}
                      </span>
                    </td>
                    <td>
                      <span class="text-dark-75 font-weight-bolder font-size-lg">
                        ₦{{ formatPrice(order.total_amount) }}
                      </span>
                    </td>
                    <td>
                      <span :class="getStatusClass(order.status)">
                        {{ order.status }}
                      </span>
                    </td>
                    <td>
                      <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                        {{ formatDate(order.expected_delivery_date) }}
                      </span>
                    </td>
                    <td class="pr-0 text-right">
                      <div class="btn-group" role="group">
                        <button
                          class="btn btn-icon btn-light btn-hover-primary btn-sm mx-1"
                          @click="viewOrder(order)"
                          title="View"
                        >
                          <i class="fas fa-eye"></i>
                        </button>
                        <button
                          v-if="order.status === 'DRAFT'"
                          class="btn btn-icon btn-light btn-hover-success btn-sm mx-1"
                          @click="approveOrder(order)"
                          title="Approve"
                        >
                          <i class="fas fa-check"></i>
                        </button>
                        <button
                          v-if="order.status === 'APPROVED'"
                          class="btn btn-icon btn-light btn-hover-info btn-sm mx-1"
                          @click="sendOrder(order)"
                          title="Send"
                        >
                          <i class="fas fa-paper-plane"></i>
                        </button>
                        <button
                          v-if="order.status === 'SENT'"
                          class="btn btn-icon btn-light btn-hover-warning btn-sm mx-1"
                          @click="receiveOrder(order)"
                          title="Receive"
                        >
                          <i class="fas fa-boxes"></i>
                        </button>
                        <button
                          v-if="order.status === 'DRAFT'"
                          class="btn btn-icon btn-light btn-hover-danger btn-sm mx-1"
                          @click="cancelOrder(order)"
                          title="Cancel"
                        >
                          <i class="fas fa-times"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Vendors View -->
      <div v-show="activeView === 'vendors'" class="view-pane fade">
        <div class="card card-custom gutter-b">
          <div class="card-header border-0 py-4">
            <h4 class="card-title font-weight-bolder text-dark">
              <i class="fas fa-building text-info mr-2"></i>
              Vendor Management
            </h4>
            <div class="card-toolbar">
              <button class="btn btn-info btn-sm font-weight-bold" @click="openVendorModal()">
                <i class="fas fa-plus mr-2"></i>Add Vendor
              </button>
            </div>
          </div>
          <div class="card-body py-0">
            <!-- Vendors Table -->
            <div class="table-responsive">
              <table class="table table-head-custom table-vertical-center">
                <thead>
                  <tr class="text-left">
                    <th class="pl-4" style="min-width: 200px">
                      <span class="text-dark-75 font-weight-bolder">Vendor Name</span>
                    </th>
                    <th style="min-width: 150px">
                      <span class="text-dark-75 font-weight-bolder">Email</span>
                    </th>
                    <th style="min-width: 120px">
                      <span class="text-dark-75 font-weight-bolder">Phone</span>
                    </th>
                    <th style="min-width: 200px">
                      <span class="text-dark-75 font-weight-bolder">Address</span>
                    </th>
                    <th class="pr-0 text-right" style="min-width: 100px">
                      <span class="text-dark-75 font-weight-bolder">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="availableVendors.length === 0 && !loadingVendors">
                    <td colspan="5" class="text-center py-8">
                      <div class="text-muted">
                        <i class="fas fa-building fa-3x mb-3"></i>
                        <p class="font-size-lg">No vendors found</p>
                        <p class="font-size-sm">Click "Add Vendor" to get started</p>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="loadingVendors">
                    <td colspan="5" class="text-center py-4">
                      <div class="spinner-border text-primary" role="status">
                        <span class="sr-only">Loading vendors...</span>
                      </div>
                    </td>
                  </tr>
                  <tr v-for="vendor in availableVendors" :key="vendor.id" class="order-row">
                    <td class="pl-4">
                      <div class="d-flex align-items-center">
                        <div class="symbol symbol-40 symbol-light-info mr-4">
                          <span class="symbol-label">
                            <i class="fas fa-building text-info"></i>
                          </span>
                        </div>
                        <div>
                          <span
                            class="text-dark-75 font-weight-bolder text-hover-primary mb-1 font-size-lg"
                          >
                            {{ vendor.name }}
                          </span>
                          <span v-if="vendor.vendor_type" class="text-muted d-block font-size-sm">
                            {{ vendor.vendor_type }}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="text-dark-75">
                        {{ vendor.email || 'N/A' }}
                      </span>
                    </td>
                    <td>
                      <span class="text-dark-75">
                        {{ vendor.phone || 'N/A' }}
                      </span>
                    </td>
                    <td>
                      <span class="text-dark-75">
                        {{ vendor.address || 'N/A' }}
                      </span>
                    </td>
                    <td class="pr-0 text-right">
                      <div class="btn-group" role="group">
                        <button
                          class="btn btn-icon btn-light btn-hover-primary btn-sm mx-1"
                          @click="viewVendor(vendor)"
                          title="View"
                        >
                          <i class="fas fa-eye"></i>
                        </button>
                        <button
                          class="btn btn-icon btn-light btn-hover-success btn-sm mx-1"
                          @click="editVendor(vendor)"
                          title="Edit"
                        >
                          <i class="fas fa-edit"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Reports View -->
      <div v-show="activeView === 'reports'" class="view-pane fade">
        <!-- Report Filters -->
        <div class="card card-custom gutter-b mb-4">
          <div class="card-header border-0 py-4">
            <h4 class="card-title font-weight-bolder text-dark">
              <i class="fas fa-filter text-warning mr-2"></i>
              Report Filters
            </h4>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-3">
                <label class="form-label">From Date</label>
                <input
                  type="date"
                  v-model="reportFilters.dateFrom"
                  class="form-control"
                  @change="loadReportData"
                />
              </div>
              <div class="col-md-3">
                <label class="form-label">To Date</label>
                <input
                  type="date"
                  v-model="reportFilters.dateTo"
                  class="form-control"
                  @change="loadReportData"
                />
              </div>
              <div class="col-md-3">
                <label class="form-label">Status</label>
                <select
                  v-model="reportFilters.status"
                  class="form-control"
                  @change="loadReportData"
                >
                  <option value="">All Status</option>
                  <option value="DRAFT">Draft</option>
                  <option value="APPROVED">Approved</option>
                  <option value="SENT">Sent</option>
                  <option value="RECEIVED">Received</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
              <div class="col-md-3 d-flex align-items-end">
                <button class="btn btn-warning btn-sm font-weight-bold" @click="exportReport()">
                  <i class="fas fa-download mr-2"></i>Export Report
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Report Summary -->
        <div class="card card-custom gutter-b">
          <div class="card-header border-0 py-4">
            <h4 class="card-title font-weight-bolder text-dark">
              <i class="fas fa-chart-bar text-warning mr-2"></i>
              Procurement Summary
            </h4>
          </div>
          <div class="card-body">
            <div class="row">
              <!-- Summary Cards -->
              <div class="col-lg-3 col-md-6 mb-4">
                <div class="card bg-light-primary">
                  <div class="card-body text-center">
                    <div class="text-primary font-weight-bolder font-size-h2">
                      {{ reportData.totalOrders || 0 }}
                    </div>
                    <div class="text-muted font-size-sm">Total Orders</div>
                  </div>
                </div>
              </div>
              <div class="col-lg-3 col-md-6 mb-4">
                <div class="card bg-light-success">
                  <div class="card-body text-center">
                    <div class="text-success font-weight-bolder font-size-h2">
                      ₦{{ formatPrice(reportData.totalValue) }}
                    </div>
                    <div class="text-muted font-size-sm">Total Value</div>
                  </div>
                </div>
              </div>
              <div class="col-lg-3 col-md-6 mb-4">
                <div class="card bg-light-info">
                  <div class="card-body text-center">
                    <div class="text-info font-weight-bolder font-size-h2">
                      {{ reportData.totalVendors || 0 }}
                    </div>
                    <div class="text-muted font-size-sm">Active Vendors</div>
                  </div>
                </div>
              </div>
              <div class="col-lg-3 col-md-6 mb-4">
                <div class="card bg-light-warning">
                  <div class="card-body text-center">
                    <div class="text-warning font-weight-bolder font-size-h2">
                      {{ reportData.averageOrderValue || 0 }}
                    </div>
                    <div class="text-muted font-size-sm">Avg Order Value</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Orders by Status Table -->
            <div class="row mt-6">
              <div class="col-12">
                <h6 class="font-weight-bolder mb-4">Orders by Status</h6>
                <div class="table-responsive">
                  <table class="table table-head-custom table-vertical-center">
                    <thead>
                      <tr class="text-left">
                        <th style="min-width: 150px">
                          <span class="text-dark-75 font-weight-bolder">Status</span>
                        </th>
                        <th style="min-width: 100px">
                          <span class="text-dark-75 font-weight-bolder">Count</span>
                        </th>
                        <th style="min-width: 150px">
                          <span class="text-dark-75 font-weight-bolder">Total Value</span>
                        </th>
                        <th style="min-width: 100px">
                          <span class="text-dark-75 font-weight-bolder">Percentage</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-if="reportData.ordersByStatus?.length === 0">
                        <td colspan="4" class="text-center py-4">
                          <span class="text-muted">No data available</span>
                        </td>
                      </tr>
                      <tr v-for="statusData in reportData.ordersByStatus" :key="statusData.status">
                        <td>
                          <span :class="getStatusClass(statusData.status)">
                            {{ statusData.status }}
                          </span>
                        </td>
                        <td>
                          <span class="text-dark-75 font-weight-bolder">
                            {{ statusData.count }}
                          </span>
                        </td>
                        <td>
                          <span class="text-dark-75 font-weight-bolder">
                            ₦{{ formatPrice(statusData.totalValue) }}
                          </span>
                        </td>
                        <td>
                          <div class="d-flex align-items-center">
                            <span class="text-muted font-weight-bold mr-2">
                              {{ ((statusData.count / reportData.totalOrders) * 100).toFixed(1) }}%
                            </span>
                            <div class="progress" style="width: 60px; height: 6px">
                              <div
                                class="progress-bar bg-primary"
                                :style="`width: ${
                                  (statusData.count / reportData.totalOrders) * 100
                                }%`"
                              ></div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Order Modal -->
    <b-modal
      v-model="showModal"
      :title="modalTitle"
      size="xl"
      hide-footer
      class="procurement-modal procurement-modal-extra-large"
    >
      <div class="p-4">
        <form @submit.prevent="saveOrder">
          <div class="row">
            <div class="col-md-6">
              <div class="form-group">
                <label class="form-label font-weight-bold">
                  <i class="fas fa-building text-primary mr-2"></i>
                  Vendor
                </label>
                <v-select
                  v-model="formData.vendor_id"
                  :options="availableVendors"
                  label="name"
                  :reduce="(vendor) => vendor.id"
                  placeholder="Select vendor..."
                  required
                  :loading="loadingVendors"
                />
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group">
                <label class="form-label font-weight-bold">
                  <i class="fas fa-calendar-alt text-success mr-2"></i>
                  Expected Delivery Date
                </label>
                <input
                  type="date"
                  v-model="formData.expected_delivery_date"
                  class="form-control form-control-lg"
                  required
                />
              </div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label font-weight-bold">
              <i class="fas fa-comment text-muted mr-2"></i>
              Order Notes
            </label>
            <textarea
              v-model="formData.notes"
              class="form-control"
              rows="3"
              placeholder="Additional notes for this order..."
            ></textarea>
          </div>

          <!-- Order Items Section -->
          <div class="form-group">
            <label class="form-label font-weight-bold">
              <i class="fas fa-list text-info mr-2"></i>
              Order Items
            </label>
            <div class="table-responsive">
              <table class="table table-bordered">
                <thead>
                  <tr>
                    <th style="min-width: 280px; width: 30%">Item</th>
                    <th style="min-width: 100px; width: 12%">Item Type</th>
                    <th style="min-width: 100px; width: 12%">Unit</th>
                    <th style="min-width: 80px; width: 10%">Quantity</th>
                    <th style="min-width: 100px; width: 12%">Unit Price</th>
                    <th style="min-width: 100px; width: 12%">Total</th>
                    <th style="min-width: 80px; width: 12%">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in formData.items" :key="index">
                    <td class="pl-6">
                      <v-select
                        v-model="item.item_id"
                        :options="itemOptions"
                        label="name"
                        name="item_id"
                        :reduce="
                          (drugs) => ({
                            id: drugs.id,
                            name: drugs.name,
                            drug_id: drugs.drug_id,
                            unit_id: drugs.unit_id,
                            strength: drugs?.strength,
                            strength_input: drugs.strength_input,
                            price: drugs.price,
                            quantity_remaining: drugs.quantity_remaining,
                            unit_name: drugs?.unit_name,
                            dosage_form: drugs?.dosage_form,
                            drug_type: drugs?.drug_type,
                            drug_form: drugs?.drug_form,
                            brand: drugs?.brand,
                          })
                        "
                        placeholder="Select pharmacy item..."
                        :loading="loadingItems"
                        @search="onPharmacyItemSearch(index, $event, loadingItems)"
                        @input="onItemSelected(index)"
                      >
                        <template #option="{ name, brand }">
                          <div>
                            <strong>{{ name }}</strong>
                            <small class="d-block text-muted">{{ brand }}</small>
                          </div>
                        </template>
                      </v-select>
                    </td>
                    <td>
                      <select v-model="item.item_type" class="form-control" required>
                        <option value="">Select type</option>
                        <option value="PHARMACY">Pharmacy</option>
                        <option value="LABORATORY">Laboratory</option>
                      </select>
                    </td>
                    <td>
                      <select v-model="item.unit_id" class="form-control" required>
                        <option value="">Select unit</option>
                        <option v-for="unit in availableUnits" :key="unit.id" :value="unit.id">
                          {{ unit.name }}
                        </option>
                      </select>
                    </td>
                    <td>
                      <input
                        type="number"
                        v-model="item.quantity"
                        class="form-control"
                        min="1"
                        @input="calculateItemTotal(index)"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        v-model="item.unit_price"
                        class="form-control"
                        step="0.01"
                        min="0"
                        @input="calculateItemTotal(index)"
                      />
                    </td>
                    <td>
                      <span class="font-weight-bold">₦{{ formatPrice(item.total || 0) }}</span>
                    </td>
                    <td>
                      <button
                        type="button"
                        class="btn btn-sm btn-danger"
                        @click="removeItem(index)"
                      >
                        <i class="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <button type="button" class="btn btn-sm btn-success mt-2" @click="addItem">
              <i class="fas fa-plus mr-2"></i>Add Item
            </button>
          </div>

          <div class="row">
            <div class="col-md-6 offset-md-6">
              <div class="form-group">
                <label class="form-label font-weight-bold">Total Amount</label>
                <div class="input-group">
                  <div class="input-group-prepend">
                    <span class="input-group-text">₦</span>
                  </div>
                  <input
                    type="text"
                    :value="formatPrice(totalAmount)"
                    class="form-control form-control-lg"
                    readonly
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="text-right mt-4">
            <button
              type="button"
              class="btn btn-light-secondary btn-lg mr-3"
              @click="showModal = false"
            >
              Cancel
            </button>
            <button type="submit" class="btn btn-primary btn-lg" :disabled="isSubmitting">
              <i class="fas fa-save mr-2"></i>
              {{ isSubmitting ? 'Saving...' : 'Save Order' }}
            </button>
          </div>
        </form>
      </div>
    </b-modal>

    <!-- Receive Order Modal -->
    <b-modal
      v-model="showReceiveModal"
      title="Receive Order Items"
      size="xl"
      hide-footer
      class="procurement-modal procurement-modal-extra-large"
    >
      <div class="p-4" v-if="receivingOrder">
        <div class="alert alert-info">
          <h6><i class="fas fa-info-circle mr-2"></i>Receiving Items for Order</h6>
          <p class="mb-0">
            <strong>{{ receivingOrder.po_number }}</strong> from
            <strong>{{ receivingOrder.vendor_name }}</strong>
          </p>
        </div>

        <form @submit.prevent="submitReceiveOrder">
          <div class="row mb-4">
            <div class="col-md-6">
              <label class="form-label">Received Date</label>
              <input
                type="date"
                v-model="receiveFormData.received_date"
                class="form-control"
                required
              />
            </div>
            <div class="col-md-6">
              <label class="form-label">Received By</label>
              <input
                type="text"
                :value="`${$store.state.auth.user?.firstname} ${$store.state.auth.user?.lastname}`"
                class="form-control"
                readonly
              />
            </div>
          </div>

          <div class="card mb-4">
            <div class="card-header">
              <h6 class="mb-0">
                <i class="fas fa-list mr-2"></i>
                Items to Receive ({{ receiveFormData.received_items.length }})
              </h6>
            </div>
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table table-head-custom table-vertical-center">
                  <thead>
                    <tr class="text-left">
                      <th style="width: 25%">Item</th>
                      <th style="width: 10%">Unit</th>
                      <th style="width: 12%">Ordered Qty</th>
                      <th style="width: 12%">Received Qty</th>
                      <th style="width: 15%">Batch Number</th>
                      <th style="width: 13%">Expiry Date</th>
                      <th style="width: 13%">Unit Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, index) in receiveFormData.received_items" :key="index">
                      <td>
                        <div>
                          <strong>{{ item.item_name }}</strong>
                          <div v-if="item.item_strength" class="text-muted small">
                            {{ item.item_strength }}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span class="text-muted">{{ item.unit_name }}</span>
                      </td>
                      <td>
                        <span class="badge badge-light-info">{{ item.quantity_ordered }}</span>
                      </td>
                      <td>
                        <input
                          type="number"
                          v-model="item.quantity_received"
                          :max="item.quantity_ordered"
                          min="0"
                          step="1"
                          class="form-control"
                          style="width: 80px"
                          required
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          v-model="item.batch"
                          class="form-control"
                          placeholder="Batch #"
                        />
                      </td>
                      <td>
                        <input type="date" v-model="item.expiration" class="form-control" />
                      </td>
                      <td>
                        <input
                          type="number"
                          v-model="item.unit_price"
                          min="0"
                          step="0.01"
                          class="form-control"
                          style="width: 100px"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div class="d-flex justify-content-end">
            <button type="button" class="btn btn-light mr-3" @click="closeReceiveModal">
              <i class="fas fa-times mr-2"></i>
              Cancel
            </button>
            <button type="submit" class="btn btn-success" :disabled="isSubmittingReceive">
              <i class="fas fa-boxes mr-2"></i>
              <span v-if="isSubmittingReceive">Processing...</span>
              <span v-else>Receive Items</span>
            </button>
          </div>
        </form>
      </div>
    </b-modal>
  </div>
</template>

<script>
import vSelect from 'vue-select';
import 'vue-select/dist/vue-select.css';
import { debounce } from '@/common/common';

export default {
  name: 'ProcurementManager',
  components: { vSelect },
  data() {
    return {
      activeView: 'orders',
      showModal: false,
      showReceiveModal: false,
      isSubmitting: false,
      isSubmittingReceive: false,
      editingOrder: null,
      receivingOrder: null,
      stats: {},
      orders: [],
      filters: {
        status: '',
        dateFrom: '',
        dateTo: '',
        search: '',
      },
      formData: {
        vendor_id: null,
        expected_delivery_date: null,
        notes: '',
        items: [],
      },
      receiveFormData: {
        received_date: '',
        received_by: null,
        received_items: [],
      },
      reportFilters: {
        dateFrom: '',
        dateTo: '',
        status: '',
      },
      reportData: {
        totalOrders: 0,
        totalValue: 0,
        totalVendors: 0,
        averageOrderValue: 0,
        ordersByStatus: [],
      },
      loadingVendors: false,
      loadingItems: false,
    };
  },
  computed: {
    modalTitle() {
      if (this.editingOrder) {
        return 'Edit Purchase Order';
      }
      return 'Create New Purchase Order';
    },
    totalAmount() {
      return this.formData.items.reduce((total, item) => total + (item.total || 0), 0);
    },

    availableVendors() {
      return this.$store.state.store.vendors;
    },

    availableItems() {
      return this.$store.state.store.items;
    },
    itemOptions() {
      return this.availableItems.map((item) => ({
        name: item?.drug?.name,
        id: item?.id,
        drug_id: item?.drug_id,
        strength: item?.strength,
        strength_input: item.strength_input,
        price: item.selling_price,
        quantity_remaining: item.quantity_remaining,
        unit_name: item?.unit?.name,
        unit_id: item?.unit?.id,
        dosage_form: item?.dosage_form,
        drug_type: item?.drug_type,
        drug_form: item?.drug_form,
      }));
    },
    availableUnits() {
      return this.$store.state.model.units;
    },
  },
  methods: {
    setActiveView(view) {
      this.activeView = view;
      if (view === 'orders') {
        this.loadOrders();
      } else if (view === 'vendors') {
        this.loadVendors();
      }
    },

    getStatusClass(status) {
      const classes = {
        DRAFT: 'label label-lg label-light-warning label-inline',
        APPROVED: 'label label-lg label-light-success label-inline',
        SENT: 'label label-lg label-light-info label-inline',
        RECEIVED: 'label label-lg label-light-primary label-inline',
        CANCELLED: 'label label-lg label-light-danger label-inline',
      };
      return classes[status] || 'label label-lg label-light-dark label-inline';
    },

    formatPrice(price) {
      return parseFloat(price).toLocaleString('en-NG', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    },

    formatDate(date) {
      return new Date(date).toLocaleDateString('en-NG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    },

    fetchUnits() {
      this.$store.dispatch('model/fetchUnits', {
        currentPage: 1,
        itemsPerPage: 50,
      });
    },

    openCreateModal() {
      this.editingOrder = null;
      this.resetForm();
      this.showModal = true;
    },

    resetForm() {
      this.formData = {
        vendor_id: null,
        expected_delivery_date: null,
        notes: '',
        items: [],
      };
      this.addItem(); // Add one empty item
    },

    addItem() {
      this.formData.items.push({
        item_id: null,
        item_type: 'PHARMACY', // Default to pharmacy for this procurement
        unit_id: null,
        quantity: 1,
        unit_price: 0,
        total: 0,
      });
    },

    onPharmacyItemSearch(index, search, loading) {
      this.debounceSearch(search, this, loading);
    },

    debounceSearch: debounce((search, vm, loading) => {
      vm.$store
        .dispatch('store/fetchPharmacyItems', {
          currentPage: 1,
          itemsPerPage: 50,
          search,
        })
        .then(() => loading(false))
        .catch(() => loading(false));
    }, 500),

    onItemSelected(index) {
      const item = this.formData.items[index];
      const selectedItem = this.itemOptions.find((i) => i.id === item.item_id?.id);
      if (selectedItem) {
        // Pre-fill unit price and unit_id if available
        item.unit_price = selectedItem.price || 0;
        item.unit_id = selectedItem.unit_id || null;
        this.calculateItemTotal(index);
      }
    },

    removeItem(index) {
      this.formData.items.splice(index, 1);
    },

    calculateItemTotal(index) {
      const item = this.formData.items[index];
      if (item.quantity && item.unit_price) {
        item.total = item.quantity * item.unit_price;
      } else {
        item.total = 0;
      }
    },

    async saveOrder() {
      this.isSubmitting = true;
      try {
        const payload = {
          ...this.formData,
          items: this.formData.items.map((item) => ({
            item_type: item.item_type,
            quantity: item.quantity,
            unit_price: item.unit_price,
            unit_id: item.unit_id,
            total: item.total,
            drug_id: item.item_id?.drug_id || item.item_id,
          })),
          total_amount: this.totalAmount,
        };

        if (this.editingOrder) {
          await this.$store.dispatch('procurement/updateProcurementOrder', {
            id: this.editingOrder.id,
            ...payload,
          });
        } else {
          await this.$store.dispatch('procurement/createProcurementOrder', payload);
        }

        this.showModal = false;
        this.loadOrders();
      } catch (error) {
        this.$notify({
          group: 'foo',
          title: 'Error',
          text: error.message || 'Failed to save order',
          type: 'error',
        });
      } finally {
        this.isSubmitting = false;
      }
    },

    async loadOrders() {
      try {
        await this.$store.dispatch('procurement/getProcurementOrders', this.filters);
        this.orders = this.$store.getters['procurement/getProcurementOrders'];
      } catch (error) {
        this.$notify({
          group: 'foo',
          title: 'Error',
          text: error.message || 'Failed to load orders',
          type: 'error',
        });
      }
    },

    async loadVendors() {
      this.loadingVendors = true;
      try {
        await this.$store.dispatch('store/fetchVendors', {
          currentPage: 1,
          itemsPerPage: 50,
        });
      } catch (error) {
        this.$notify({
          group: 'foo',
          title: 'Error',
          text: error.message || 'Failed to load vendors',
          type: 'error',
        });
      } finally {
        this.loadingVendors = false;
      }
    },

    async loadPharmacyItems() {
      this.loadingItems = true;
      try {
        await this.$store.dispatch('store/fetchPharmacyItems', {
          currentPage: 1,
          itemsPerPage: 50,
        });
      } catch (error) {
        this.$notify({
          group: 'foo',
          title: 'Error',
          text: error.message || 'Failed to load pharmacy items',
          type: 'error',
        });
      } finally {
        this.loadingItems = false;
      }
    },

    async loadStatistics() {
      try {
        await this.$store.dispatch('procurement/getProcurementStatistics');
        this.stats = this.$store.getters['procurement/getProcurementStatistics'];
      } catch (error) {
        console.warn('Statistics not available:', error.message);
        // Don't show error notification for statistics as it's not critical
      }
    },

    async approveOrder(order) {
      if (confirm('Are you sure you want to approve this order?')) {
        try {
          await this.$store.dispatch('procurement/approveProcurementOrder', {
            id: order.id,
            approvalData: { approved_by: this.$store.state.auth.user?.id },
          });
          this.loadOrders();
          this.$notify({
            group: 'foo',
            title: 'Success',
            text: 'Order approved successfully',
            type: 'success',
          });
        } catch (error) {
          this.$notify({
            group: 'foo',
            title: 'Error',
            text: error.message || 'Failed to approve order',
            type: 'error',
          });
        }
      }
    },

    async sendOrder(order) {
      const currentDate = new Date().toISOString().split('T')[0];
      const expectedDeliveryDate = prompt(
        'Expected delivery date (YYYY-MM-DD):',
        order.expected_delivery_date || currentDate
      );

      if (
        expectedDeliveryDate &&
        confirm('Are you sure you want to send this order to the vendor?')
      ) {
        try {
          await this.$store.dispatch('procurement/sendProcurementOrder', {
            id: order.id,
            sendData: {
              sent_by: this.$store.state.auth.user?.id,
              sent_date: new Date().toISOString(),
              expected_delivery_date: new Date(expectedDeliveryDate).toISOString(),
            },
          });
          this.loadOrders();
          this.$notify({
            group: 'foo',
            title: 'Success',
            text: 'Order sent successfully',
            type: 'success',
          });
        } catch (error) {
          this.$notify({
            group: 'foo',
            title: 'Error',
            text: error.message || 'Failed to send order',
            type: 'error',
          });
        }
      }
    },

    async receiveOrder(order) {
      try {
        // First get the full order details with items
        const fullOrder = await this.$store.dispatch('procurement/getProcurementOrder', order.id);
        if (!fullOrder || !fullOrder.ProcurementOrderItems?.length) {
          throw new Error('Order details not found or no items to receive');
        }

        this.receivingOrder = fullOrder;
        this.receiveFormData = {
          received_date: new Date().toISOString().split('T')[0],
          received_by: this.$store.state.auth.user?.id,
          received_items: fullOrder.ProcurementOrderItems.map((item) => ({
            order_item_id: item.id,
            item_name: item.Drug?.name || 'Unknown Item',
            item_strength: item.Drug?.strength,
            unit_name: `${item.Unit?.name} (${item.Unit?.abbreviation})`,
            quantity_ordered: item.quantity_ordered,
            quantity_received: item.quantity_ordered, // Default to full quantity
            unit_price: item.unit_price,
            batch: '',
            expiration: null,
          })),
        };
        this.showReceiveModal = true;
      } catch (error) {
        this.$notify({
          group: 'foo',
          title: 'Error',
          text: error.message || 'Failed to load order details for receiving',
          type: 'error',
        });
      }
    },

    closeReceiveModal() {
      this.showReceiveModal = false;
      this.receivingOrder = null;
      this.receiveFormData = {
        received_date: '',
        received_by: null,
        received_items: [],
      };
    },

    async submitReceiveOrder() {
      this.isSubmittingReceive = true;
      try {
        const payload = {
          received_by: this.receiveFormData.received_by,
          received_date: new Date(this.receiveFormData.received_date).toISOString(),
          received_items: this.receiveFormData.received_items.map((item) => ({
            order_item_id: item.order_item_id,
            quantity_received: parseInt(item.quantity_received) || 0,
            unit_price: parseFloat(item.unit_price) || 0,
            batch: item.batch || '',
            expiration: item.expiration ? new Date(item.expiration).toISOString() : null,
          })),
        };

        await this.$store.dispatch('procurement/receiveProcurementOrderItems', {
          id: this.receivingOrder.id,
          receiveData: payload,
        });

        this.closeReceiveModal();
        this.loadOrders();
        this.$notify({
          group: 'foo',
          title: 'Success',
          text: 'Order items received successfully',
          type: 'success',
        });
      } catch (error) {
        this.$notify({
          group: 'foo',
          title: 'Error',
          text: error.message || 'Failed to receive order items',
          type: 'error',
        });
      } finally {
        this.isSubmittingReceive = false;
      }
    },

    async cancelOrder(order) {
      const cancellationReason = prompt('Please provide a reason for cancellation:');

      if (
        cancellationReason &&
        cancellationReason.trim() &&
        confirm('Are you sure you want to cancel this order?')
      ) {
        try {
          await this.$store.dispatch('procurement/cancelProcurementOrder', {
            id: order.id,
            cancelData: {
              cancelled_by: this.$store.state.auth.user?.id,
              cancellation_reason: cancellationReason.trim(),
            },
          });
          this.loadOrders();
          this.$notify({
            group: 'foo',
            title: 'Success',
            text: 'Order cancelled successfully',
            type: 'success',
          });
        } catch (error) {
          this.$notify({
            group: 'foo',
            title: 'Error',
            text: error.message || 'Failed to cancel order',
            type: 'error',
          });
        }
      } else if (cancellationReason !== null) {
        this.$notify({
          group: 'foo',
          title: 'Error',
          text: 'Cancellation reason is required',
          type: 'error',
        });
      }
    },

    viewOrder(order) {
      // Navigate to order details
      this.$router.push(`/store/pharmacy/procurement/order/${order.id}`);
    },

    openVendorModal() {
      // Placeholder for vendor creation modal
      // This would ideally open a vendor creation modal
      this.$notify({
        group: 'foo',
        title: 'Info',
        text: 'Vendor creation modal can be added here. For now, vendors are managed through the main store module.',
        type: 'info',
      });
    },

    viewVendor(vendor) {
      // Placeholder for vendor details view
      this.$notify({
        group: 'foo',
        title: 'Info',
        text: `Viewing vendor: ${vendor.name}`,
        type: 'info',
      });
    },

    editVendor(vendor) {
      // Placeholder for vendor edit modal
      this.$notify({
        group: 'foo',
        title: 'Info',
        text: `Edit vendor: ${vendor.name}`,
        type: 'info',
      });
    },

    loadReportData() {
      // Calculate report data from current orders
      const filteredOrders = this.orders.filter((order) => {
        let matchesFilter = true;

        if (this.reportFilters.dateFrom) {
          matchesFilter =
            matchesFilter && new Date(order.order_date) >= new Date(this.reportFilters.dateFrom);
        }

        if (this.reportFilters.dateTo) {
          matchesFilter =
            matchesFilter && new Date(order.order_date) <= new Date(this.reportFilters.dateTo);
        }

        if (this.reportFilters.status) {
          matchesFilter = matchesFilter && order.status === this.reportFilters.status;
        }

        return matchesFilter;
      });

      // Calculate totals
      this.reportData.totalOrders = filteredOrders.length;
      this.reportData.totalValue = filteredOrders.reduce(
        (sum, order) => sum + (order.total_amount || 0),
        0
      );

      // Calculate unique vendors
      const uniqueVendors = [...new Set(filteredOrders.map((order) => order.vendor_id))];
      this.reportData.totalVendors = uniqueVendors.length;

      // Calculate average
      this.reportData.averageOrderValue =
        this.reportData.totalOrders > 0
          ? Math.round(this.reportData.totalValue / this.reportData.totalOrders)
          : 0;

      // Group by status
      const statusGroups = filteredOrders.reduce((groups, order) => {
        const status = order.status || 'DRAFT';
        if (!groups[status]) {
          groups[status] = { status, count: 0, totalValue: 0 };
        }
        groups[status].count += 1;
        groups[status].totalValue += order.total_amount || 0;
        return groups;
      }, {});

      this.reportData.ordersByStatus = Object.values(statusGroups);
    },

    async exportReport() {
      try {
        await this.$store.dispatch('procurement/exportProcurementReport', this.reportFilters);
        this.$notify({
          group: 'foo',
          title: 'Success',
          text: 'Report exported successfully',
          type: 'success',
        });
      } catch (error) {
        this.$notify({
          group: 'foo',
          title: 'Error',
          text: error.message || 'Failed to export report',
          type: 'error',
        });
      }
    },
  },

  async created() {
    await Promise.all([
      this.loadOrders(),
      this.loadVendors(),
      this.loadPharmacyItems(),
      this.loadStatistics(),
      this.fetchUnits(),
    ]);

    // Load initial report data
    this.loadReportData();

    // Check if we should open receive modal from query param
    if (this.$route.query.receiveOrder) {
      const orderId = parseInt(this.$route.query.receiveOrder);
      const order = this.orders.find((o) => o.id === orderId);
      if (order && order.status === 'SENT') {
        await this.receiveOrder(order);
      }
      // Clear the query param
      this.$router.replace({ query: {} });
    }
  },
};
</script>

<style scoped>
.procurement-manager {
  background: #f8f9fa;
  min-height: 100vh;
  padding: 1.5rem;
}

.view-content {
  margin-top: 1rem;
}

.view-pane {
  animation: fadeIn 0.3s ease-in-out;
}

.order-row {
  transition: all 0.2s ease;
}

.order-row:hover {
  background-color: #f8f9fa;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.btn-group .btn.active {
  background-color: #00acc1;
  border-color: #00acc1;
  color: white;
}

.procurement-modal .modal-content {
  border-radius: 0.75rem;
  border: none;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.form-label {
  color: #3f4254;
  margin-bottom: 0.5rem;
}

.form-control {
  border-radius: 0.5rem;
  border: 1px solid #e1e3ea;
  transition: all 0.2s ease;
}

.form-control:focus {
  border-color: #00acc1;
  box-shadow: 0 0 0 0.2rem rgba(0, 172, 193, 0.25);
}

.v-select {
  border: 1px solid #e1e3ea;
  border-radius: 0.5rem;
}

.v-select:focus-within {
  border-color: #00acc1;
  box-shadow: 0 0 0 0.2rem rgba(0, 172, 193, 0.25);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.symbol {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
}

.symbol-40 {
  width: 2.5rem;
  height: 2.5rem;
}

.symbol-50 {
  width: 3rem;
  height: 3rem;
}

.symbol-light-primary {
  background-color: #e0f7fa;
}

.symbol-light-success {
  background-color: #e8f5e8;
}

.symbol-light-info {
  background-color: #e1f7ff;
}

.symbol-light-warning {
  background-color: #fff4de;
}

.symbol-label {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.label {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: 0.375rem;
}

.label-light-warning {
  background-color: #fff4de;
  color: #ffc107;
}

.label-light-success {
  background-color: #e8f5e8;
  color: #28a745;
}

.label-light-info {
  background-color: #e1f7ff;
  color: #0dcaf0;
}

.label-light-primary {
  background-color: #e0f7fa;
  color: #00acc1;
}

.label-light-danger {
  background-color: #ffeaea;
  color: #dc3545;
}

.bg-light-primary {
  background-color: #e0f7fa !important;
}

.bg-light-success {
  background-color: #e8f5e8 !important;
}

.bg-light-info {
  background-color: #e1f7ff !important;
}

.bg-light-warning {
  background-color: #fff4de !important;
}

.procurement-modal-extra-large .modal-dialog {
  max-width: 90vw !important;
  width: 90vw !important;
}

.procurement-modal-extra-large .modal-content {
  min-height: 70vh;
}
</style>
