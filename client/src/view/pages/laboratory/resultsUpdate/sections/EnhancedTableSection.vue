<template>
  <div class="enhanced-table-section">
    <!-- Section Header -->
    <div v-if="section.title" class="section-header">
      <div class="header-content">
        <div class="header-icon">
          <i class="fas fa-flask"></i>
        </div>
        <h5 class="section-title">{{ section.title }}</h5>
      </div>
      <div class="section-meta">
        <span class="field-count">{{ section.fields.length }} parameters</span>
      </div>
    </div>

    <!-- Table Container -->
    <div class="table-wrapper">
      <div class="table-scroll">
        <table class="enhanced-table table-bordered">
          <thead>
            <tr>
              <th v-for="(header, idx) in tableHeaders" :key="idx" :class="`col-header-${idx}`">
                {{ header }}
              </th>
            </tr>
          </thead>
          <tbody>
            <component
              v-for="field in section.fields"
              :key="field.id"
              :is="getFieldComponent(field)"
              :field="field"
              :value="result[field.id]"
              :disabled="disabled"
              render-as="table-row"
              @input="handleFieldChange(field.id, $event)"
            />
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import EnhancedNumberField from '../fields/EnhancedNumberField.vue';
import EnhancedTextField from '../fields/EnhancedTextField.vue';
import EnhancedTextareaField from '../fields/EnhancedTextareaField.vue';
import EnhancedSelectField from '../fields/EnhancedSelectField.vue';
import EnhancedRadioField from '../fields/EnhancedRadioField.vue';
import EnhancedCheckboxField from '../fields/EnhancedCheckboxField.vue';
import EnhancedDateField from '../fields/EnhancedDateField.vue';

export default {
  name: 'EnhancedTableSection',
  components: {
    EnhancedNumberField,
    EnhancedTextField,
    EnhancedTextareaField,
    EnhancedSelectField,
    EnhancedRadioField,
    EnhancedCheckboxField,
    EnhancedDateField,
  },
  props: {
    section: {
      type: Object,
      required: true,
    },
    result: {
      type: Object,
      default: () => ({}),
    },
    sectionIndex: {
      type: Number,
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    tableHeaders() {
      const headers = ['#', 'Result'];
      const firstField = this.section.fields[0];
      if (firstField?.referenceRanges) {
        const rangeKeys = Object.keys(firstField.referenceRanges);
        if (rangeKeys.includes('child')) headers.push('Children Range');
        if (rangeKeys.includes('adultMale')) headers.push('Adult Male');
        if (rangeKeys.includes('adultFemale')) headers.push('Adult Female');
        if (rangeKeys.includes('normal')) headers.push('Range');
        if (firstField.unit) headers.push('Unit');
      } else if (firstField?.unit) {
        headers.push('Range', 'Unit');
      }
      return headers;
    },
  },
  methods: {
    getFieldComponent(field) {
      const componentMap = {
        number: 'EnhancedNumberField',
        text: 'EnhancedTextField',
        textarea: 'EnhancedTextareaField',
        select: 'EnhancedSelectField',
        date: 'EnhancedDateField',
        radio: 'EnhancedRadioField',
        checkbox: 'EnhancedCheckboxField',
      };
      return componentMap[field.type] || 'EnhancedTextField';
    },

    handleFieldChange(fieldId, value) {
      this.$emit('field-change', fieldId, value);
    },
  },
};
</script>

<style scoped>
.enhanced-table-section {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin-bottom: 24px;
  overflow: hidden;
  transition: box-shadow 0.15s ease;
}

.enhanced-table-section:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.section-header {
  background: linear-gradient(135deg, #8b0000 0%, #a0522d 100%);
  padding: 18px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 14px;
}

.header-icon {
  width: 42px;
  height: 42px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
}

.header-icon i {
  color: #fff;
  font-size: 20px;
}

.section-title {
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  letter-spacing: 0.2px;
}

.section-meta {
  color: rgba(255, 255, 255, 0.85);
  font-size: 13px;
  font-weight: 500;
}

.table-wrapper {
  padding: 24px;
}

.table-scroll {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.enhanced-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  border: 1px solid #e4e6ef;
  border-radius: 8px;
  overflow: hidden;
}

.enhanced-table thead {
  background: #f3f6f9;
}

.enhanced-table thead th {
  padding: 14px 16px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #3f4254;
  border-bottom: 2px solid #e4e6ef;
  white-space: nowrap;
}

.enhanced-table tbody tr {
  border-bottom: 1px solid #ebedf3;
  transition: background-color 0.15s ease;
}

.enhanced-table tbody tr:nth-child(even) {
  background-color: #fafbfc;
}

.enhanced-table tbody tr:hover {
  background-color: #f3f6f9;
}

.enhanced-table tbody th,
.enhanced-table tbody td {
  padding: 14px 16px;
  vertical-align: middle;
  color: #3f4254;
}

.enhanced-table tbody th {
  font-weight: 500;
  color: #181c32;
}

/* Responsive */
@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    padding: 16px 20px;
  }

  .enhanced-table {
    font-size: 13px;
  }

  .enhanced-table thead th,
  .enhanced-table tbody td {
    padding: 10px 12px;
  }

  .table-wrapper {
    padding: 16px;
  }
}
</style>
