<template>
  <div class="modal fade" :id="modalId" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ title }}</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleSubmit">
            <div class="form-group">
              <label>Code <span class="text-danger">*</span></label>
              <input type="text" class="form-control" v-model="formData.code" required />
            </div>
            <div class="form-group">
              <label>Name <span class="text-danger">*</span></label>
              <input type="text" class="form-control" v-model="formData.name" required />
            </div>
            <div class="form-group">
              <label>Department <span class="text-danger">*</span></label>
              <select class="form-control" v-model="formData.department_id" required>
                <option value="">Select Department</option>
                <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                  {{ dept.name }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Description</label>
              <textarea class="form-control" v-model="formData.description" rows="3"></textarea>
            </div>
            <div class="form-group">
              <div class="custom-control custom-switch">
                <input
                  type="checkbox"
                  class="custom-control-input"
                  :id="`active-${modalId}`"
                  v-model="formData.is_active"
                />
                <label class="custom-control-label" :for="`active-${modalId}`">Active</label>
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
          <button type="button" class="btn btn-primary" @click="handleSubmit">Save</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'CostCenterForm',
  props: {
    modalId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    initialData: {
      type: Object,
      default: () => ({
        code: '',
        name: '',
        department_id: '',
        description: '',
        is_active: true,
      }),
    },
  },
  data() {
    return {
      formData: { ...this.initialData },
    };
  },
  computed: {
    ...mapGetters('account', ['departments']),
  },
  watch: {
    initialData: {
      handler(newVal) {
        this.formData = { ...newVal };
      },
      deep: true,
    },
  },
  methods: {
    handleSubmit() {
      this.$emit('submit', this.formData);
    },
  },
};
</script>
