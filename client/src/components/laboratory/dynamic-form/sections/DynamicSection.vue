<template>
  <div class="dynamic-section" :class="`section-type-${section.type || 'default'}`">
    <!-- Section Title -->
    <div v-if="section.title && shouldShowSection" class="section-title">
      <h5>{{ section.title }}</h5>
    </div>

    <!-- Render fields based on section type -->
    <div v-if="shouldShowSection" class="table-responsive">
      <!-- Table Layout -->
      <table v-if="isTableLayout" class="table table-bordered">
        <thead v-if="hasTableHeaders">
          <tr>
            <th v-for="(header, idx) in tableHeaders" :key="`header-${idx}`">
              {{ header }}
            </th>
          </tr>
        </thead>
        <tbody>
          <DynamicField
            v-for="field in section.fields"
            :key="`field-${field.id}`"
            :field="field"
            :value="result[field.id]"
            :disabled="disabled"
            :render-as="'table-row'"
            @input="handleFieldChange(field.id, $event)"
          />
        </tbody>
      </table>

      <!-- List Layout (Default) -->
      <div v-else class="fields-list">
        <div
          v-for="field in section.fields"
          :key="`field-${field.id}`"
          class="field-wrapper"
          :class="getFieldWrapperClass(field)"
        >
          <DynamicField
            :field="field"
            :value="result[field.id]"
            :disabled="disabled"
            :render-as="'list-item'"
            @input="handleFieldChange(field.id, $event)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DynamicField from '../fields/DynamicField.vue';

export default {
  name: 'DynamicSection',
  components: {
    DynamicField,
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
    isTableLayout() {
      return this.section.type === 'table';
    },

    hasTableHeaders() {
      // Check if this is a multi-column table (like FBC)
      return this.section.fields.some((field) => field.referenceRanges);
    },

    tableHeaders() {
      // Generate table headers based on field structure
      const headers = ['#', 'Result'];

      // Check if fields have reference ranges
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

    shouldShowSection() {
      // Handle conditional sections
      if (this.section.type === 'conditional') {
        // Show if section has any values OR if we're in add mode
        const hasValues = this.section.fields.some((field) => this.result[field.id]);
        return hasValues || !this.disabled;
      }

      return true;
    },
  },
  methods: {
    handleFieldChange(fieldId, value) {
      this.$emit('field-change', fieldId, value);
    },

    getFieldWrapperClass(field) {
      return {
        'field-small': field.size === 'small',
        'field-medium': field.size === 'medium',
        'field-large': field.size === 'large',
      };
    },
  },
};
</script>

<style scoped>
.dynamic-section {
  margin-bottom: 20px;
}

.section-title h5 {
  font-weight: 600;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e0e0e0;
}

.section-content {
  padding: 10px 0;
}

.fields-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.field-wrapper {
  width: 100%;
}

.field-small {
  max-width: 300px;
}

.field-medium {
  max-width: 500px;
}

.field-large {
  max-width: 100%;
}

/* Table Layout Styling */
.table {
  margin-bottom: 0;
  table-layout: fixed;
  width: 100%;
}

.table thead th {
  background-color: #f5f5f5;
  font-weight: 600;
  padding: 12px 8px;
  vertical-align: middle;
}

.table tbody th,
.table tbody td {
  padding: 10px 8px;
  vertical-align: middle;
}

/* Column Width Distribution */
.table thead th:nth-child(1),
.table tbody th {
  width: 15%;
  text-align: left;
  font-weight: 500;
}

.table thead th:nth-child(2),
.table tbody td:nth-child(1) {
  width: 12%;
  text-align: center;
}

.table thead th:nth-child(3),
.table tbody td:nth-child(2) {
  width: 20%;
  text-align: center;
}

.table thead th:nth-child(4),
.table tbody td:nth-child(3) {
  width: 20%;
  text-align: center;
}

.table thead th:nth-child(5),
.table tbody td:nth-child(4) {
  width: 20%;
  text-align: center;
}

.table thead th:nth-child(6),
.table tbody td:nth-child(5) {
  width: 13%;
  text-align: center;
}

/* Responsive adjustments */
@media (max-width: 1200px) {
  .table {
    font-size: 0.9rem;
  }

  .table thead th,
  .table tbody th,
  .table tbody td {
    padding: 8px 6px;
  }
}

@media (max-width: 992px) {
  .table {
    font-size: 0.85rem;
  }
}
</style>
