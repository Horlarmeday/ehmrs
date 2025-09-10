<template>
  <div class="print-button-container">
    <b-dropdown
      :disabled="disabled"
      variant="outline-secondary"
      :size="size"
      :block="block"
      :split="split"
      :text="buttonText"
      @click="handlePrint"
    >
      <template v-if="!split" #button-content>
        <i :class="iconClass" class="mr-2"></i>
        {{ buttonText }}
      </template>
      
      <b-dropdown-item
        v-for="option in printOptions"
        :key="option.value"
        @click="printWithOption(option.value)"
        :disabled="disabled"
      >
        <i :class="option.icon" class="mr-2"></i>
        {{ option.text }}
      </b-dropdown-item>
      
      <b-dropdown-divider v-if="showAdvancedOptions"></b-dropdown-divider>
      
      <b-dropdown-item
        v-if="showAdvancedOptions"
        @click="showAdvancedPrint = true"
        :disabled="disabled"
      >
        <i class="fas fa-cog mr-2"></i>
        Print Options
      </b-dropdown-item>
    </b-dropdown>
    
    <!-- Advanced Print Modal -->
    <b-modal
      v-model="showAdvancedPrint"
      title="Print Options"
      size="lg"
      @ok="handleAdvancedPrint"
      @cancel="showAdvancedPrint = false"
    >
      <div class="advanced-print-form">
        <div class="row">
          <div class="col-md-6">
            <label class="font-weight-bold">Print Type</label>
            <div class="form-group">
              <b-form-radio-group
                v-model="printType"
                :options="printTypeOptions"
                stacked
              ></b-form-radio-group>
            </div>
          </div>
          
          <div class="col-md-6">
            <label class="font-weight-bold">Page Orientation</label>
            <div class="form-group">
              <b-form-radio-group
                v-model="orientation"
                :options="orientationOptions"
                stacked
              ></b-form-radio-group>
            </div>
          </div>
        </div>
        
        <div class="row">
          <div class="col-md-6">
            <label class="font-weight-bold">Page Size</label>
            <b-form-select v-model="pageSize" :options="pageSizeOptions"></b-form-select>
          </div>
          
          <div class="col-md-6">
            <label class="font-weight-bold">Font Size</label>
            <b-form-select v-model="fontSize" :options="fontSizeOptions"></b-form-select>
          </div>
        </div>
        
        <div class="row">
          <div class="col-md-6">
            <label class="font-weight-bold">Title</label>
            <b-form-input
              v-model="customTitle"
              placeholder="Enter print title"
            ></b-form-input>
          </div>
          
          <div class="col-md-6">
            <label class="font-weight-bold">Subtitle</label>
            <b-form-input
              v-model="customSubtitle"
              placeholder="Enter print subtitle"
            ></b-form-input>
          </div>
        </div>
        
        <div class="row">
          <div class="col-md-6">
            <label class="font-weight-bold">Footer</label>
            <b-form-input
              v-model="customFooter"
              placeholder="Enter print footer"
            ></b-form-input>
          </div>
          
          <div class="col-md-6">
            <label class="font-weight-bold">Margins (mm)</label>
            <b-form-input
              v-model="margin"
              type="number"
              min="5"
              max="50"
            ></b-form-input>
          </div>
        </div>
        
        <div class="row">
          <div class="col-12">
            <div class="form-group">
              <b-form-checkbox v-model="includeDate">
                Include generation date
              </b-form-checkbox>
              <b-form-checkbox v-model="includePageNumbers">
                Include page numbers
              </b-form-checkbox>
              <b-form-checkbox v-model="includeHeader">
                Include header
              </b-form-checkbox>
            </div>
          </div>
        </div>
        
        <div class="row" v-if="printType === 'table' && hasData">
          <div class="col-12">
            <div class="print-preview">
              <h6>Print Preview</h6>
              <p class="text-muted">
                <strong>{{ data.length }}</strong> records will be printed
              </p>
              <div class="table-responsive" style="max-height: 200px;">
                <table class="table table-sm table-striped">
                  <thead>
                    <tr>
                      <th v-for="header in previewHeaders" :key="header">
                        {{ header }}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, index) in previewData" :key="index">
                      <td v-for="header in previewHeaders" :key="header">
                        {{ formatPreviewValue(row[header]) }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </b-modal>
  </div>
</template>

<script>
export default {
  name: 'PrintButton',
  props: {
    data: {
      type: Array,
      default: () => [],
    },
    element: {
      type: [HTMLElement, String],
      default: null,
    },
    buttonText: {
      type: String,
      default: 'Print',
    },
    icon: {
      type: String,
      default: 'fas fa-print',
    },
    size: {
      type: String,
      default: 'md',
    },
    block: {
      type: Boolean,
      default: false,
    },
    split: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    showAdvancedOptions: {
      type: Boolean,
      default: true,
    },
    title: {
      type: String,
      default: '',
    },
    subtitle: {
      type: String,
      default: '',
    },
  },
  
  data() {
    return {
      showAdvancedPrint: false,
      printType: 'element',
      orientation: 'portrait',
      pageSize: 'a4',
      fontSize: 10,
      customTitle: '',
      customSubtitle: '',
      customFooter: '',
      margin: 10,
      includeDate: true,
      includePageNumbers: true,
      includeHeader: true,
    };
  },
  
  computed: {
    hasData() {
      return Array.isArray(this.data) && this.data.length > 0;
    },
    
    printOptions() {
      const options = [
        {
          value: 'element',
          text: 'Print Current View',
          icon: 'fas fa-print',
        },
        {
          value: 'page',
          text: 'Print Page',
          icon: 'fas fa-file-alt',
        },
      ];
      
      if (this.hasData) {
        options.push({
          value: 'table',
          text: 'Print Table',
          icon: 'fas fa-table',
        });
        options.push({
          value: 'report',
          text: 'Print Report',
          icon: 'fas fa-chart-bar',
        });
      }
      
      return options;
    },
    
    printTypeOptions() {
      return [
        { value: 'element', text: 'Print Element' },
        { value: 'table', text: 'Print Table Data' },
        { value: 'report', text: 'Print Report' },
        { value: 'page', text: 'Print Page' },
      ];
    },
    
    orientationOptions() {
      return [
        { value: 'portrait', text: 'Portrait' },
        { value: 'landscape', text: 'Landscape' },
      ];
    },
    
    pageSizeOptions() {
      return [
        { value: 'a4', text: 'A4' },
        { value: 'a3', text: 'A3' },
        { value: 'letter', text: 'Letter' },
        { value: 'legal', text: 'Legal' },
      ];
    },
    
    fontSizeOptions() {
      return [
        { value: 8, text: '8px' },
        { value: 10, text: '10px' },
        { value: 12, text: '12px' },
        { value: 14, text: '14px' },
        { value: 16, text: '16px' },
      ];
    },
    
    iconClass() {
      return this.icon;
    },
    
    previewHeaders() {
      if (!this.hasData) return [];
      return Object.keys(this.data[0]).slice(0, 5); // Show first 5 columns
    },
    
    previewData() {
      if (!this.hasData) return [];
      return this.data.slice(0, 3); // Show first 3 rows
    },
  },
  
  methods: {
    handlePrint() {
      if (this.split) return; // Let dropdown handle it
      
      // Default print
      this.printWithOption('element');
    },
    
    async printWithOption(option) {
      try {
        const options = this.getPrintOptions();
        
        switch (option) {
          case 'element':
            await this.printElement(options);
            break;
          case 'table':
            await this.printTable(options);
            break;
          case 'report':
            await this.printReport(options);
            break;
          case 'page':
            await this.printPage();
            break;
          default:
            throw new Error(`Unknown print option: ${option}`);
        }
        
        this.$logUserAction('Print completed', { option, recordCount: this.data.length });
      } catch (error) {
        this.$logError('Print failed', error, { option });
      }
    },
    
    async handleAdvancedPrint() {
      try {
        const options = this.getAdvancedPrintOptions();
        
        switch (this.printType) {
          case 'element':
            await this.printElement(options);
            break;
          case 'table':
            await this.printTable(options);
            break;
          case 'report':
            await this.printReport(options);
            break;
          case 'page':
            await this.printPage();
            break;
        }
        
        this.showAdvancedPrint = false;
        this.$logUserAction('Advanced print completed', { 
          printType: this.printType,
          recordCount: this.data.length 
        });
      } catch (error) {
        this.$logError('Advanced print failed', error, { printType: this.printType });
      }
    },
    
    async printElement(options) {
      const element = this.getElement();
      if (!element) {
        throw new Error('Element not found for printing');
      }
      
      await this.$printElement(element, options);
    },
    
    async printTable(options) {
      if (!this.hasData) {
        throw new Error('No data available for printing');
      }
      
      await this.$printTable(this.data, options);
    },
    
    async printReport(options) {
      if (!this.hasData) {
        throw new Error('No data available for printing');
      }
      
      await this.$printReport(this.data, options);
    },
    
    async printPage() {
      this.$printCurrentPage();
    },
    
    getElement() {
      if (typeof this.element === 'string') {
        return document.querySelector(this.element);
      }
      return this.element || document.body;
    },
    
    getPrintOptions() {
      return {
        title: this.title || this.$route?.meta?.title || 'Document',
        subtitle: this.subtitle || (this.includeDate ? new Date().toLocaleDateString() : ''),
        orientation: this.orientation,
        format: this.pageSize,
        fontSize: this.fontSize,
        margin: this.margin,
      };
    },
    
    getAdvancedPrintOptions() {
      return {
        title: this.customTitle || this.title || this.$route?.meta?.title || 'Document',
        subtitle: this.customSubtitle || this.subtitle || (this.includeDate ? new Date().toLocaleDateString() : ''),
        footer: this.customFooter || (this.includePageNumbers ? 'Generated by EHMRS System' : ''),
        orientation: this.orientation,
        format: this.pageSize,
        fontSize: this.fontSize,
        margin: this.margin,
        includeHeader: this.includeHeader,
        includePageNumbers: this.includePageNumbers,
      };
    },
    
    formatPreviewValue(value) {
      if (value === null || value === undefined) return '';
      if (typeof value === 'object') return JSON.stringify(value);
      if (typeof value === 'string' && value.length > 20) {
        return value.substring(0, 20) + '...';
      }
      return value;
    },
  },
};
</script>

<style scoped>
.print-button-container {
  display: inline-block;
}

.advanced-print-form {
  padding: 1rem 0;
}

.print-preview {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 0.25rem;
}

.print-preview h6 {
  margin-bottom: 0.5rem;
  color: #495057;
}

.print-preview .table {
  margin-bottom: 0;
}

.print-preview .table th {
  border-top: none;
  font-size: 0.875rem;
  font-weight: 600;
  color: #495057;
}

.print-preview .table td {
  font-size: 0.75rem;
  color: #6c757d;
}
</style>


