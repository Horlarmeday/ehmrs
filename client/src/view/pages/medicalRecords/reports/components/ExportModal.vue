<template>
  <b-modal
    id="export-modal"
    ref="exportModal"
    title="Export Report"
    @ok="handleExport"
    @hidden="resetModal"
  >
    <div class="export-options">
      <b-form-group label="Export Format">
        <b-form-radio-group v-model="selectedFormat" :options="formatOptions"></b-form-radio-group>
      </b-form-group>

      <b-form-group label="Include Summary Statistics">
        <b-form-checkbox v-model="includeStats">Include summary statistics</b-form-checkbox>
      </b-form-group>

      <div class="alert alert-info">
        <i class="flaticon2-information mr-2"></i>
        <strong>Note:</strong> Large datasets may take a few moments to export.
      </div>
    </div>

    <template #modal-footer="{ ok, cancel }">
      <b-button variant="secondary" @click="cancel">Cancel</b-button>
      <b-button variant="primary" @click="handleExport">
        <i class="flaticon2-download mr-2"></i>
        Export
      </b-button>
    </template>
  </b-modal>
</template>

<script>
export default {
  name: 'ExportModal',
  props: {
    reportType: {
      type: String,
      required: true,
    },
    domain: {
      type: String,
      default: 'medical-records',
    },
    filters: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      selectedFormat: 'xlsx',
      includeStats: true,
      formatOptions: [
        { text: 'Excel (.xlsx)', value: 'xlsx' },
        { text: 'CSV (.csv)', value: 'csv' },
      ],
    };
  },
  methods: {
    show() {
      this.$refs.exportModal.show();
    },
    hide() {
      this.$refs.exportModal.hide();
    },
    handleExport() {
      this.$emit('export', {
        format: this.selectedFormat,
        includeStats: this.includeStats,
        domain: this.domain,
        reportType: this.reportType,
        filters: this.filters,
      });
      this.hide();
    },
    resetModal() {
      this.selectedFormat = 'xlsx';
      this.includeStats = true;
    },
  },
};
</script>

<style scoped>
.export-options {
  padding: 1rem 0;
}
</style>
