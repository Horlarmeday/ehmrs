<template>
  <div class="property-panel">
    <div v-if="!selectedField" class="no-selection">
      <i class="fas fa-hand-pointer fa-3x text-muted mb-3"></i>
      <p class="text-muted">Select a field to edit its properties</p>
    </div>

    <div v-else class="property-editor">
      <div class="panel-header">
        <h5>{{ selectedField.label || 'Field Properties' }}</h5>
        <button class="btn btn-sm btn-light-danger" @click="deleteField">
          <i class="fas fa-trash"></i>
        </button>
      </div>

      <!-- Basic Properties -->
      <div class="property-group">
        <h6>Basic Settings</h6>

        <div class="form-group">
          <label>Field ID</label>
          <input
            type="text"
            class="form-control form-control-sm"
            v-model="selectedField.id"
            @input="onPropertyChange"
          />
        </div>

        <div class="form-group">
          <label>Label *</label>
          <input
            type="text"
            class="form-control form-control-sm"
            v-model="selectedField.label"
            @input="onPropertyChange"
            placeholder="e.g., White Blood Cell Count"
          />
        </div>

        <div
          class="form-group"
          v-if="selectedField.type === 'number' || selectedField.type === 'text'"
        >
          <label>Unit</label>
          <input
            type="text"
            class="form-control form-control-sm"
            v-model="selectedField.unit"
            @input="onPropertyChange"
            placeholder="e.g., x10^3/ul, mg/dL"
          />
        </div>

        <div class="form-group">
          <label>Placeholder</label>
          <input
            type="text"
            class="form-control form-control-sm"
            v-model="selectedField.placeholder"
            @input="onPropertyChange"
            :placeholder="`Enter ${selectedField.label || 'value'}`"
          />
        </div>

        <div class="form-group">
          <label>Description</label>
          <textarea
            class="form-control form-control-sm"
            v-model="selectedField.description"
            @input="onPropertyChange"
            rows="5"
            placeholder="Enter detailed description for this field (optional)"
          ></textarea>
          <small class="form-text text-muted">
            Multi-line description that will be displayed in preview, form, and result views
          </small>
        </div>
      </div>

      <!-- Validation -->
      <div class="property-group">
        <h6>Validation</h6>

        <div class="form-group">
          <div class="custom-control custom-checkbox">
            <input
              type="checkbox"
              class="custom-control-input"
              :id="`required-${selectedField.id}`"
              v-model="selectedField.validation.required"
              @change="onPropertyChange"
            />
            <label class="custom-control-label" :for="`required-${selectedField.id}`">
              Required Field
            </label>
          </div>
        </div>

        <div v-if="selectedField.type === 'number'">
          <div class="form-group">
            <label>Minimum Value</label>
            <input
              type="number"
              class="form-control form-control-sm"
              v-model.number="selectedField.validation.min"
              @input="onPropertyChange"
            />
          </div>

          <div class="form-group">
            <label>Maximum Value</label>
            <input
              type="number"
              class="form-control form-control-sm"
              v-model.number="selectedField.validation.max"
              @input="onPropertyChange"
            />
          </div>

          <div class="form-group">
            <label>Decimal Places</label>
            <input
              type="number"
              class="form-control form-control-sm"
              v-model.number="selectedField.validation.decimalPlaces"
              @input="onPropertyChange"
              min="0"
              max="10"
            />
          </div>
        </div>
      </div>

      <!-- Reference Ranges (Number fields only) -->
      <div class="property-group" v-if="selectedField.type === 'number'">
        <h6>Reference Ranges</h6>

        <div class="reference-range-item">
          <label class="font-weight-bold">Children</label>
          <div class="row">
            <div class="col-6">
              <input
                type="number"
                class="form-control form-control-sm"
                v-model.number="childRange.min"
                @input="updateReferenceRange('child')"
                placeholder="Min"
              />
            </div>
            <div class="col-6">
              <input
                type="number"
                class="form-control form-control-sm"
                v-model.number="childRange.max"
                @input="updateReferenceRange('child')"
                placeholder="Max"
              />
            </div>
          </div>
        </div>

        <div class="reference-range-item">
          <label class="font-weight-bold">Adult Male</label>
          <div class="row">
            <div class="col-6">
              <input
                type="number"
                class="form-control form-control-sm"
                v-model.number="adultMaleRange.min"
                @input="updateReferenceRange('adultMale')"
                placeholder="Min"
              />
            </div>
            <div class="col-6">
              <input
                type="number"
                class="form-control form-control-sm"
                v-model.number="adultMaleRange.max"
                @input="updateReferenceRange('adultMale')"
                placeholder="Max"
              />
            </div>
          </div>
        </div>

        <div class="reference-range-item">
          <label class="font-weight-bold">Adult Female</label>
          <div class="row">
            <div class="col-6">
              <input
                type="number"
                class="form-control form-control-sm"
                v-model.number="adultFemaleRange.min"
                @input="updateReferenceRange('adultFemale')"
                placeholder="Min"
              />
            </div>
            <div class="col-6">
              <input
                type="number"
                class="form-control form-control-sm"
                v-model.number="adultFemaleRange.max"
                @input="updateReferenceRange('adultFemale')"
                placeholder="Max"
              />
            </div>
          </div>
        </div>

        <div class="reference-range-item">
          <label class="font-weight-bold">General Range</label>
          <small class="text-muted d-block mb-2"
            >Use for tests without age/sex-specific ranges</small
          >
          <div class="row">
            <div class="col-6">
              <input
                type="number"
                class="form-control form-control-sm"
                v-model.number="normalRange.min"
                @input="updateReferenceRange('normal')"
                placeholder="Min"
              />
            </div>
            <div class="col-6">
              <input
                type="number"
                class="form-control form-control-sm"
                v-model.number="normalRange.max"
                @input="updateReferenceRange('normal')"
                placeholder="Max"
              />
            </div>
          </div>
        </div>

        <!-- Abnormal Detection -->
        <div class="form-group mt-3">
          <div class="custom-control custom-checkbox">
            <input
              type="checkbox"
              class="custom-control-input"
              :id="`abnormal-${selectedField.id}`"
              v-model="selectedField.abnormalDetection.enabled"
              @change="onPropertyChange"
            />
            <label class="custom-control-label" :for="`abnormal-${selectedField.id}`">
              Enable Abnormal Detection
            </label>
          </div>
        </div>

        <div v-if="selectedField.abnormalDetection.enabled">
          <div class="custom-control custom-checkbox">
            <input
              type="checkbox"
              class="custom-control-input"
              :id="`age-dependent-${selectedField.id}`"
              v-model="selectedField.abnormalDetection.ageDependent"
              @change="onPropertyChange"
            />
            <label class="custom-control-label" :for="`age-dependent-${selectedField.id}`">
              Age Dependent
            </label>
          </div>

          <div class="custom-control custom-checkbox">
            <input
              type="checkbox"
              class="custom-control-input"
              :id="`sex-dependent-${selectedField.id}`"
              v-model="selectedField.abnormalDetection.sexDependent"
              @change="onPropertyChange"
            />
            <label class="custom-control-label" :for="`sex-dependent-${selectedField.id}`">
              Sex Dependent
            </label>
          </div>
        </div>
      </div>

      <!-- Options (Select, Radio, Checkbox) -->
      <div class="property-group" v-if="hasOptions">
        <h6>Options</h6>

        <div v-for="(option, index) in selectedField.options" :key="index" class="option-item">
          <div class="row">
            <div class="col-5">
              <input
                type="text"
                class="form-control form-control-sm"
                v-model="option.value"
                @input="onPropertyChange"
                placeholder="Value"
              />
            </div>
            <div class="col-5">
              <input
                type="text"
                class="form-control form-control-sm"
                v-model="option.label"
                @input="onPropertyChange"
                placeholder="Label"
              />
            </div>
            <div class="col-2">
              <button class="btn btn-sm btn-light-danger" @click="removeOption(index)">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
        </div>

        <button class="btn btn-sm btn-light-primary mt-2" @click="addOption">
          <i class="fas fa-plus"></i> Add Option
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PropertyPanel',
  props: {
    selectedField: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      normalRange: { min: undefined, max: undefined },
      childRange: { min: undefined, max: undefined },
      adultMaleRange: { min: undefined, max: undefined },
      adultFemaleRange: { min: undefined, max: undefined },
    };
  },
  computed: {
    hasOptions() {
      return ['select', 'radio', 'checkbox'].includes(this.selectedField?.type);
    },
  },
  watch: {
    selectedField: {
      immediate: true,
      handler(field) {
        if (field && field.type === 'number') {
          this.loadReferenceRanges();
        }
      },
    },
  },
  methods: {
    onPropertyChange() {
      this.$emit('field-updated', this.selectedField);
    },

    loadReferenceRanges() {
      if (!this.selectedField.referenceRanges) {
        this.$set(this.selectedField, 'referenceRanges', {});
      }

      const ranges = this.selectedField.referenceRanges;
      this.normalRange = { ...(ranges.normal || { min: undefined, max: undefined }) };
      this.childRange = { ...(ranges.child || { min: undefined, max: undefined }) };
      this.adultMaleRange = { ...(ranges.adultMale || { min: undefined, max: undefined }) };
      this.adultFemaleRange = { ...(ranges.adultFemale || { min: undefined, max: undefined }) };
    },

    updateReferenceRange(rangeType) {
      if (!this.selectedField.referenceRanges) {
        this.$set(this.selectedField, 'referenceRanges', {});
      }

      const rangeData =
        rangeType === 'normal'
          ? this.normalRange
          : rangeType === 'child'
          ? this.childRange
          : rangeType === 'adultMale'
          ? this.adultMaleRange
          : this.adultFemaleRange;

      if (rangeData.min !== undefined || rangeData.max !== undefined) {
        const format = (val) => (val != null && val !== '' ? val : '');

        this.$set(this.selectedField.referenceRanges, rangeType, {
          min: rangeData.min,
          max: rangeData.max,
          display: `${format(rangeData.min)} - ${format(rangeData.max)}`,
        });
      }

      this.onPropertyChange();
    },

    addOption() {
      if (!this.selectedField.options) {
        this.$set(this.selectedField, 'options', []);
      }
      this.selectedField.options.push({
        value: `option${this.selectedField.options.length + 1}`,
        label: `Option ${this.selectedField.options.length + 1}`,
      });
      this.onPropertyChange();
    },

    removeOption(index) {
      this.selectedField.options.splice(index, 1);
      this.onPropertyChange();
    },

    deleteField() {
      this.$emit('delete-field');
    },
  },
};
</script>

<style scoped>
.property-panel {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  height: 100%;
  overflow-y: auto;
}

.no-selection {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e0e0e0;
}

.panel-header h5 {
  margin: 0;
  font-weight: 600;
}

.property-group {
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.property-group:last-child {
  border-bottom: none;
}

.property-group h6 {
  font-weight: 600;
  margin-bottom: 15px;
  color: #3f4254;
}

.reference-range-item {
  margin-bottom: 15px;
}

.reference-range-item label {
  display: block;
  margin-bottom: 5px;
  font-size: 13px;
}

.option-item {
  margin-bottom: 10px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  font-size: 13px;
  font-weight: 500;
  color: #5e6278;
  margin-bottom: 5px;
}
</style>
