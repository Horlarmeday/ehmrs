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
              :class="{ active: activeView === 'suppliers' }"
              @click="setActiveView('suppliers')"
            >
              <i class="fas fa-building mr-2"></i>Suppliers
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
                  <option value="Pending Approval">Pending Approval</option>
                  <option value="Approved">Approved</option>
                  <option value="Sent">Sent</option>
                  <option value="Received">Received</option>
                  <option value="Cancelled">Cancelled</option>
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
                      <span class="text-dark-75 font-weight-bolder">Supplier</span>
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
                            {{ order.supplier_name }}
                          </span>
                          <span class="text-muted d-block font-size-sm">{{
                            order.supplier_contact
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
                        {{ formatDate(order.expected_delivery) }}
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
                          v-if="order.status === 'Pending Approval'"
                          class="btn btn-icon btn-light btn-hover-success btn-sm mx-1"
                          @click="approveOrder(order)"
                          title="Approve"
                        >
                          <i class="fas fa-check"></i>
                        </button>
                        <button
                          v-if="order.status === 'Approved'"
                          class="btn btn-icon btn-light btn-hover-info btn-sm mx-1"
                          @click="sendOrder(order)"
                          title="Send"
                        >
                          <i class="fas fa-paper-plane"></i>
                        </button>
                        <button
                          v-if="order.status === 'Sent'"
                          class="btn btn-icon btn-light btn-hover-warning btn-sm mx-1"
                          @click="receiveOrder(order)"
                          title="Receive"
                        >
                          <i class="fas fa-boxes"></i>
                        </button>
                        <button
                          v-if="order.status === 'Pending Approval'"
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

      <!-- Suppliers View -->
      <div v-show="activeView === 'suppliers'" class="view-pane fade">
        <div class="card card-custom gutter-b">
          <div class="card-header border-0 py-4">
            <h4 class="card-title font-weight-bolder text-dark">
              <i class="fas fa-building text-info mr-2"></i>
              Supplier Management
            </h4>
            <div class="card-toolbar">
              <button class="btn btn-info btn-sm font-weight-bold" @click="openSupplierModal()">
                <i class="fas fa-plus mr-2"></i>Add Supplier
              </button>
            </div>
          </div>
          <div class="card-body py-0">
            <!-- Similar table structure for suppliers -->
            <div class="text-center py-8">
              <div class="text-muted">
                <i class="fas fa-building fa-3x mb-3"></i>
                <p class="font-size-lg">Supplier management</p>
                <p class="font-size-sm">Coming soon...</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Reports View -->
      <div v-show="activeView === 'reports'" class="view-pane fade">
        <div class="card card-custom gutter-b">
          <div class="card-header border-0 py-4">
            <h4 class="card-title font-weight-bolder text-dark">
              <i class="fas fa-chart-bar text-warning mr-2"></i>
              Procurement Reports
            </h4>
            <div class="card-toolbar">
              <button class="btn btn-warning btn-sm font-weight-bold" @click="exportReport()">
                <i class="fas fa-download mr-2"></i>Export Report
              </button>
            </div>
          </div>
          <div class="card-body py-0">
            <!-- Report filters and charts -->
            <div class="text-center py-8">
              <div class="text-muted">
                <i class="fas fa-chart-bar fa-3x mb-3"></i>
                <p class="font-size-lg">Procurement analytics</p>
                <p class="font-size-sm">Coming soon...</p>
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
      class="procurement-modal"
    >
      <div class="p-4">
        <form @submit.prevent="saveOrder">
          <div class="row">
            <div class="col-md-6">
              <div class="form-group">
                <label class="form-label font-weight-bold">
                  <i class="fas fa-building text-primary mr-2"></i>
                  Supplier
                </label>
                <v-select
                  v-model="formData.supplier_id"
                  :options="availableSuppliers"
                  label="name"
                  :reduce="supplier => supplier.id"
                  placeholder="Select supplier..."
                  required
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
                  v-model="formData.expected_delivery"
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
                    <th>Item</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in formData.items" :key="index">
                    <td class="pl-6">
                      <v-select
                        v-model="item.item_id"
                        :options="availableItems"
                        label="name"
                        :reduce="item => item.id"
                        placeholder="Select item..."
                        @input="calculateItemTotal(index)"
                      />
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
  </div>
</template>

<script>
import vSelect from 'vue-select';
import 'vue-select/dist/vue-select.css';

export default {
  name: 'ProcurementManager',
  components: { vSelect },
  data() {
    return {
      activeView: 'orders',
      showModal: false,
      isSubmitting: false,
      editingOrder: null,
      stats: {},
      orders: [],
      filters: {
        status: '',
        dateFrom: '',
        dateTo: '',
        search: '',
      },
      formData: {
        supplier_id: null,
        expected_delivery: null,
        notes: '',
        items: [],
      },
      availableSuppliers: [
        { id: 1, name: 'ABC Pharmaceuticals', contact: '+234 801 234 5678' },
        { id: 2, name: 'XYZ Medical Supplies', contact: '+234 802 345 6789' },
        { id: 3, name: 'MediCare Solutions', contact: '+234 803 456 7890' },
      ],
      availableItems: [
        { id: 1, name: 'Paracetamol 500mg', category: 'Drugs' },
        { id: 2, name: 'Amoxicillin 250mg', category: 'Drugs' },
        { id: 3, name: 'Syringes 5ml', category: 'Supplies' },
        { id: 4, name: 'Gauze Bandages', category: 'Supplies' },
      ],
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
  },
  methods: {
    setActiveView(view) {
      this.activeView = view;
      if (view === 'orders') {
        this.loadOrders();
      }
    },

    getStatusClass(status) {
      const classes = {
        'Pending Approval': 'label label-lg label-light-warning label-inline',
        Approved: 'label label-lg label-light-success label-inline',
        Sent: 'label label-lg label-light-info label-inline',
        Received: 'label label-lg label-light-primary label-inline',
        Cancelled: 'label label-lg label-light-danger label-inline',
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

    openCreateModal() {
      this.editingOrder = null;
      this.resetForm();
      this.showModal = true;
    },

    resetForm() {
      this.formData = {
        supplier_id: null,
        expected_delivery: null,
        notes: '',
        items: [],
      };
      this.addItem(); // Add one empty item
    },

    addItem() {
      this.formData.items.push({
        item_id: null,
        quantity: 1,
        unit_price: 0,
        total: 0,
      });
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
      if (confirm('Are you sure you want to send this order to the supplier?')) {
        try {
          await this.$store.dispatch('procurement/sendProcurementOrder', {
            id: order.id,
            sendData: { sent_by: this.$store.state.auth.user?.id },
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
      if (confirm('Are you sure you want to mark this order as received?')) {
        try {
          await this.$store.dispatch('procurement/receiveProcurementOrderItems', {
            id: order.id,
            receiveData: { received_by: this.$store.state.auth.user?.id },
          });
          this.loadOrders();
          this.$notify({
            group: 'foo',
            title: 'Success',
            text: 'Order marked as received',
            type: 'success',
          });
        } catch (error) {
          this.$notify({
            group: 'foo',
            title: 'Error',
            text: error.message || 'Failed to receive order',
            type: 'error',
          });
        }
      }
    },

    async cancelOrder(order) {
      if (confirm('Are you sure you want to cancel this order?')) {
        try {
          await this.$store.dispatch('procurement/cancelProcurementOrder', {
            id: order.id,
            cancelData: { cancelled_by: this.$store.state.auth.user?.id },
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
      }
    },

    viewOrder(order) {
      // Navigate to order details
      this.$router.push(`/procurement/order/${order.id}`);
    },

    async exportReport() {
      try {
        await this.$store.dispatch('procurement/exportProcurementReport', this.filters);
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

  created() {
    this.loadOrders();
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
  background-color: #3699ff;
  border-color: #3699ff;
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
  border-color: #3699ff;
  box-shadow: 0 0 0 0.2rem rgba(54, 153, 255, 0.25);
}

.v-select {
  border: 1px solid #e1e3ea;
  border-radius: 0.5rem;
}

.v-select:focus-within {
  border-color: #3699ff;
  box-shadow: 0 0 0 0.2rem rgba(54, 153, 255, 0.25);
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
  background-color: #e1f0ff;
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
  background-color: #e1f0ff;
  color: #3699ff;
}

.label-light-danger {
  background-color: #ffeaea;
  color: #dc3545;
}

.bg-light-primary {
  background-color: #e1f0ff !important;
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
</style>
