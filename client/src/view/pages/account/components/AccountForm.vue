<template>
  <b-modal
    v-model="show"
    :title="isEditing ? 'Edit Account' : 'New Account'"
    @hide="$emit('close')"
  >
    <form @submit.prevent="save">
      <div class="form-group">
        <label>Code <span class="text-danger">*</span></label>
        <input type="text" class="form-control" v-model="form.code" required />
      </div>
      <div class="form-group">
        <label>Name <span class="text-danger">*</span></label>
        <input type="text" class="form-control" v-model="form.name" required />
      </div>
      <div class="form-group">
        <label>Type <span class="text-danger">*</span></label>
        <select class="form-control" v-model="form.type" required>
          <option value="">Select Type</option>
          <option v-for="type in accountTypes" :key="type" :value="type">
            {{ type }}
          </option>
        </select>
      </div>
      <div class="form-group">
        <label>Description</label>
        <textarea class="form-control" v-model="form.description" rows="3"></textarea>
      </div>
      <div class="form-group">
        <label>Parent Account</label>
        <select class="form-control" v-model="form.parent_id">
          <option value="">Select Parent Account</option>
          <option v-for="account in parentAccounts" :key="account.id" :value="account.id">
            {{ account.name }}
          </option>
        </select>
      </div>
    </form>
    <template #modal-footer>
      <button type="button" class="btn btn-secondary" @click="$emit('close')">Cancel</button>
      <button type="button" class="btn btn-primary" @click="save">Save</button>
    </template>
  </b-modal>
</template>

<script>
const AccountType = {
  ASSET: 'ASSET',
  LIABILITY: 'LIABILITY',
  INCOME: 'INCOME',
  EQUITY: 'EQUITY',
  EXPENSE: 'EXPENSE',
};

export default {
  name: 'AccountForm',
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    account: {
      type: Object,
      default: () => ({
        code: '',
        name: '',
        type: '',
        description: '',
        parent_id: null,
      }),
    },
    parentAccounts: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      form: { ...this.account },
      accountTypes: Object.values(AccountType),
    };
  },
  computed: {
    isEditing() {
      return !!this.account.id;
    },
  },
  watch: {
    account: {
      handler(val) {
        this.form = { ...val };
      },
      deep: true,
    },
  },
  methods: {
    save() {
      this.$emit('save', this.form);
    },
  },
};
</script>
