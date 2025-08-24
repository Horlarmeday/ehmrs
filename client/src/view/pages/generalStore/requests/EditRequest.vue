<template>
  <div class="edit-request">
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-header">
            <div class="row align-items-center">
              <div class="col">
                <h3 class="card-title">Edit Request</h3>
                <p class="card-text">Update request information</p>
              </div>
              <div class="col-auto">
                <router-link
                  :to="{ name: 'general-store-request-details', params: { id: request.id } }"
                  class="btn btn-secondary"
                >
                  <i class="fas fa-arrow-left"></i> Back to Details
                </router-link>
              </div>
            </div>
          </div>
          <div class="card-body">
            <div v-if="loading" class="text-center py-5">
              <div class="spinner-border text-primary" role="status">
                <span class="sr-only">Loading...</span>
              </div>
              <p class="mt-3">Loading request...</p>
            </div>

            <form v-else @submit.prevent="handleSubmit">
              <!-- Request Items -->
              <div class="form-group">
                <label>Request Items</label>
                <div class="table-responsive">
                  <table class="table table-bordered">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Quantity</th>
                        <th>Priority</th>
                        <th>Notes</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(item, index) in form.items" :key="index">
                        <td>
                          <select
                            v-model="item.item_id"
                            class="form-control"
                            :class="{ 'is-invalid': getItemError(index, 'item_id') }"
                            required
                          >
                            <option value="">Select an item</option>
                            <option
                              v-for="storeItem in items"
                              :key="storeItem.id"
                              :value="storeItem.id"
                            >
                              {{ storeItem.name }} ({{ storeItem.code }}) - Stock:
                              {{ storeItem.current_stock }}
                            </option>
                          </select>
                        </td>
                        <td>
                          <input
                            v-model.number="item.quantity"
                            type="number"
                            class="form-control"
                            :class="{ 'is-invalid': getItemError(index, 'quantity') }"
                            placeholder="Quantity"
                            min="1"
                            required
                          />
                        </td>
                        <td>
                          <select
                            v-model="item.priority"
                            class="form-control"
                            :class="{ 'is-invalid': getItemError(index, 'priority') }"
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                          </select>
                        </td>
                        <td>
                          <input
                            v-model="item.notes"
                            type="text"
                            class="form-control"
                            placeholder="Item notes"
                          />
                        </td>
                        <td>
                          <button
                            type="button"
                            @click="removeItem(index)"
                            class="btn btn-danger btn-sm"
                            :disabled="form.items.length === 1"
                          >
                            <i class="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <button type="button" @click="addItem" class="btn btn-success btn-sm">
                  <i class="fas fa-plus"></i> Add Item
                </button>
              </div>

              <!-- Request Details -->
              <div class="row">
                <div class="col-md-6">
                  <div class="form-group">
                    <label for="department">Department *</label>
                    <select
                      id="department"
                      v-model="form.department_id"
                      class="form-control"
                      :class="{ 'is-invalid': errors.department_id }"
                      required
                    >
                      <option value="">Select department</option>
                      <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                        {{ dept.name }}
                      </option>
                    </select>
                    <div v-if="errors.department_id" class="invalid-feedback">
                      {{ errors.department_id }}
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-group">
                    <label for="requested_by">Requested By *</label>
                    <input
                      id="requested_by"
                      v-model="form.requested_by"
                      type="text"
                      class="form-control"
                      :class="{ 'is-invalid': errors.requested_by }"
                      placeholder="Enter requester name"
                      required
                    />
                    <div v-if="errors.requested_by" class="invalid-feedback">
                      {{ errors.requested_by }}
                    </div>
                  </div>
                </div>
              </div>

              <div class="row">
                <div class="col-md-6">
                  <div class="form-group">
                    <label for="priority">Overall Priority</label>
                    <select
                      id="priority"
                      v-model="form.priority"
                      class="form-control"
                      :class="{ 'is-invalid': errors.priority }"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                    <div v-if="errors.priority" class="invalid-feedback">
                      {{ errors.priority }}
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-group">
                    <label for="expected_date">Expected Date</label>
                    <input
                      id="expected_date"
                      v-model="form.expected_date"
                      type="date"
                      class="form-control"
                      :class="{ 'is-invalid': errors.expected_date }"
                    />
                    <div v-if="errors.expected_date" class="invalid-feedback">
                      {{ errors.expected_date }}
                    </div>
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label for="purpose">Purpose/Justification</label>
                <textarea
                  id="purpose"
                  v-model="form.purpose"
                  class="form-control"
                  :class="{ 'is-invalid': errors.purpose }"
                  rows="3"
                  placeholder="Explain the purpose of this request"
                ></textarea>
                <div v-if="errors.purpose" class="invalid-feedback">
                  {{ errors.purpose }}
                </div>
              </div>

              <div class="form-group">
                <label for="notes">Additional Notes</label>
                <textarea
                  id="notes"
                  v-model="form.notes"
                  class="form-control"
                  :class="{ 'is-invalid': errors.notes }"
                  rows="3"
                  placeholder="Any additional notes or comments"
                ></textarea>
                <div v-if="errors.notes" class="invalid-feedback">
                  {{ errors.notes }}
                </div>
              </div>

              <hr />

              <div class="form-actions">
                <button type="submit" class="btn btn-primary" :disabled="submitting">
                  <span v-if="submitting" class="spinner-border spinner-border-sm mr-2"></span>
                  <i v-else class="fas fa-save mr-2"></i>
                  {{ submitting ? 'Updating...' : 'Update Request' }}
                </button>
                <router-link
                  :to="{ name: 'general-store-request-details', params: { id: request.id } }"
                  class="btn btn-secondary ml-2"
                >
                  Cancel
                </router-link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'EditRequest',
  data() {
    return {
      request: {},
      items: [],
      departments: [],
      form: {
        items: [
          {
            item_id: '',
            quantity: 1,
            priority: 'medium',
            notes: '',
          },
        ],
        department_id: '',
        requested_by: '',
        priority: 'medium',
        expected_date: '',
        purpose: '',
        notes: '',
      },
      loading: true,
      submitting: false,
      errors: {},
    };
  },
  async mounted() {
    await this.loadItems();
    await this.loadDepartments();
    await this.loadRequest();
  },
  methods: {
    async loadItems() {
      try {
        const response = await axios.get('/api/general-store/items', { params: { limit: 200 } });
        this.items = response.data.data || [];
      } catch (error) {
        console.error('Error loading items:', error);
        this.$toast.error('Failed to load items');
      }
    },
    async loadDepartments() {
      try {
        const response = await axios.get('/api/departments');
        this.departments = response.data.data || [];
      } catch (error) {
        console.error('Error loading departments:', error);
        this.$toast.error('Failed to load departments');
      }
    },
    async loadRequest() {
      try {
        const response = await axios.get(`/api/general-store/requests/${this.$route.params.id}`);
        this.request = response.data.data || {};

        // Populate form with existing data
        this.form = {
          items: this.request.items || [
            {
              item_id: '',
              quantity: 1,
              priority: 'medium',
              notes: '',
            },
          ],
          department_id: this.request.department_id || '',
          requested_by: this.request.requested_by || '',
          priority: this.request.priority || 'medium',
          expected_date: this.request.expected_date || '',
          purpose: this.request.purpose || '',
          notes: this.request.notes || '',
        };
      } catch (error) {
        console.error('Error loading request:', error);
        this.$toast.error('Failed to load request');
        this.error = 'Failed to load request';
      } finally {
        this.loading = false;
      }
    },
    addItem() {
      this.form.items.push({
        item_id: '',
        quantity: 1,
        priority: 'medium',
        notes: '',
      });
    },
    removeItem(index) {
      if (this.form.items.length > 1) {
        this.form.items.splice(index, 1);
      }
    },
    getItemError(index, field) {
      return this.errors[`items.${index}.${field}`];
    },
    async handleSubmit() {
      this.submitting = true;
      this.errors = {};

      try {
        await axios.put(`/api/general-store/requests/${this.$route.params.id}`, this.form);

        this.$toast.success('Request updated successfully!');

        // Redirect to the request details
        this.$router.push({
          name: 'general-store-request-details',
          params: { id: this.$route.params.id },
        });
      } catch (error) {
        console.error('Error updating request:', error);

        if (error.response?.data?.errors) {
          this.errors = error.response.data.errors;
        } else {
          this.$toast.error('Failed to update request. Please try again.');
        }
      } finally {
        this.submitting = false;
      }
    },
  },
};
</script>

<style scoped>
.edit-request {
  padding: 20px;
}

.card {
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  border: none;
}

.card-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-bottom: none;
}

.form-actions {
  padding-top: 20px;
}

.form-text {
  font-size: 0.875em;
}

.invalid-feedback {
  display: block;
}

.table th {
  background-color: #f8f9fa;
  border-color: #dee2e6;
}
</style>
