<template>
  <div class="report-table">
    <b-card>
      <template #header>
        <div class="d-flex justify-content-between align-items-center">
          <h5 class="mb-0">
            <i class="flaticon2-list-1 text-primary mr-2"></i>
            {{ title }}
          </h5>
          <div>
            <b-button variant="outline-success" size="sm" @click="onExport" class="mr-2">
              <i class="flaticon2-download mr-1"></i>
              Export
            </b-button>
          </div>
        </div>
      </template>

      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="sr-only">Loading...</span>
        </div>
      </div>

      <div v-else-if="!rows || rows.length === 0" class="text-center py-5">
        <i class="flaticon2-file text-muted" style="font-size: 3rem"></i>
        <p class="text-muted mt-3">No data available</p>
      </div>

      <div v-else>
        <b-table
          :items="rows"
          :fields="tableFields"
          striped
          hover
          responsive
          :busy="loading"
          show-empty
        >
          <template #table-busy>
            <div class="text-center text-primary my-2">
              <b-spinner class="align-middle"></b-spinner>
              <strong> Loading...</strong>
            </div>
          </template>

          <template #empty>
            <div class="text-center text-muted my-2">No data available for this page.</div>
          </template>

          <template v-for="field in tableFields" #[`cell(${field.key})`]="data">
            <slot :name="`cell-${field.key}`" :item="data.item" :value="data.value">
              <span :key="field.key" v-if="field.format === 'date'">
                {{ formatDate(data.value) }}
              </span>
              <span :key="`${field.key}-datetime`" v-else-if="field.format === 'datetime'">
                {{ formatDateTime(data.value) }}
              </span>
              <span :key="`${field.key}-currency`" v-else-if="field.format === 'currency'">
                {{ formatCurrency(data.value) }}
              </span>
              <span :key="`${field.key}-default`" v-else>{{ data.value }}</span>
            </slot>
          </template>
        </b-table>

        <div class="d-flex justify-content-between align-items-center mt-3">
          <div>
            <span class="text-muted">
              Showing {{ (currentPage - 1) * pageLimit + 1 }} to
              {{ Math.min(currentPage * pageLimit, count) }} of {{ count }} entries
            </span>
          </div>
          <b-pagination
            :value="currentPage"
            :total-rows="count"
            :per-page="pageLimit"
            :first-number="true"
            :last-number="true"
            @change="onPageChange"
          ></b-pagination>
        </div>
      </div>
    </b-card>
  </div>
</template>

<script>
import dayjs from 'dayjs';

export default {
  name: 'ReportTable',
  props: {
    title: {
      type: String,
      default: 'Report Data',
    },
    rows: {
      type: Array,
      default: () => [],
    },
    fields: {
      type: Array,
      required: true,
      default: () => [],
    },
    count: {
      type: Number,
      default: 0,
    },
    pages: {
      type: Number,
      default: 1,
    },
    currentPage: {
      type: Number,
      default: 1,
    },
    pageLimit: {
      type: Number,
      default: 10,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    tableFields() {
      return this.fields;
    },
  },
  methods: {
    onPageChange(page) {
      this.$emit('page-change', page);
    },
    onExport() {
      this.$emit('export');
    },
    formatDate(date) {
      if (!date) return '-';
      return dayjs(date).format('YYYY-MM-DD');
    },
    formatDateTime(date) {
      if (!date) return '-';
      return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
    },
    formatCurrency(value) {
      if (!value && value !== 0) return '-';
      return `$${parseFloat(value).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    },
  },
};
</script>

<style scoped>
.report-table {
  margin-bottom: 1.5rem;
}
</style>
