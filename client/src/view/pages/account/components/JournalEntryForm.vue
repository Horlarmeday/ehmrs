<template>
  <b-modal
    v-model="show"
    :title="isEditing ? 'Edit Journal Entry' : 'New Journal Entry'"
    size="lg"
    @hide="$emit('close')"
  >
    <form @submit.prevent="save">
      <div class="row">
        <div class="col-md-6">
          <div class="form-group">
            <label>Transaction Date <span class="text-danger">*</span></label>
            <input type="date" class="form-control" v-model="form.transaction_date" required />
          </div>
        </div>
        <div class="col-md-6">
          <div class="form-group">
            <label>Reference <span class="text-danger">*</span></label>
            <input type="text" class="form-control" v-model="form.reference" required />
          </div>
        </div>
      </div>
      <div class="form-group">
        <label>Description</label>
        <textarea class="form-control" v-model="form.description" rows="3"></textarea>
      </div>

      <div class="card card-custom">
        <div class="card-header">
          <h3 class="card-title">Entry Lines</h3>
          <div class="card-toolbar">
            <button type="button" class="btn btn-sm btn-primary" @click="addLine">Add Line</button>
          </div>
        </div>
        <div class="card-body">
          <div v-for="(line, index) in form.lines" :key="index" class="row mb-3">
            <div class="col-md-3">
              <select class="form-control" v-model="line.account_id" required>
                <option value="">Select Account</option>
                <option v-for="account in accounts" :key="account.id" :value="account.id">
                  {{ account.name }}
                </option>
              </select>
            </div>
            <div class="col-md-3">
              <input
                type="number"
                class="form-control"
                v-model.number="line.debit"
                placeholder="Debit"
                min="0"
                step="0.01"
              />
            </div>
            <div class="col-md-3">
              <input
                type="number"
                class="form-control"
                v-model.number="line.credit"
                placeholder="Credit"
                min="0"
                step="0.01"
              />
            </div>
            <div class="col-md-2">
              <select class="form-control" v-model="line.cost_center_id">
                <option value="">Select Cost Center</option>
                <option v-for="center in costCenters" :key="center.id" :value="center.id">
                  {{ center.name }}
                </option>
              </select>
            </div>
            <div class="col-md-1">
              <button
                type="button"
                class="btn btn-icon btn-light btn-hover-danger btn-sm"
                @click="removeLine(index)"
              >
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
    <template #modal-footer>
      <button type="button" class="btn btn-secondary" @click="$emit('close')">Cancel</button>
      <button type="button" class="btn btn-primary" @click="save">Save</button>
    </template>
  </b-modal>
</template>

<script>
import dayjs from 'dayjs';

export default {
  name: 'JournalEntryForm',
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    entry: {
      type: Object,
      default: () => ({
        transaction_date: dayjs().format('YYYY-MM-DD'),
        reference: '',
        description: '',
        lines: [],
      }),
    },
    accounts: {
      type: Array,
      default: () => [],
    },
    costCenters: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      form: { ...this.entry },
    };
  },
  computed: {
    isEditing() {
      return !!this.entry.id;
    },
  },
  watch: {
    entry: {
      handler(val) {
        this.form = { ...val };
      },
      deep: true,
    },
  },
  methods: {
    addLine() {
      this.form.lines.push({
        account_id: null,
        debit: 0,
        credit: 0,
        cost_center_id: null,
      });
    },
    removeLine(index) {
      this.form.lines.splice(index, 1);
    },
    save() {
      this.$emit('save', this.form);
    },
  },
};
</script>
