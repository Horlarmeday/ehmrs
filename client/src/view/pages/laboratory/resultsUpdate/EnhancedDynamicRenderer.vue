<template>
  <div class="enhanced-dynamic-renderer">
    <!-- Form Header (if template has name) -->
    <!--    <div v-if="formSchema.formName" class="form-header">-->
    <!--      <h4 class="form-title">{{ formSchema.formName }}</h4>-->
    <!--      <span class="form-version">v{{ formSchema.version }}</span>-->
    <!--    </div>-->

    <!-- Render Sections -->
    <div class="sections-container">
      <component
        v-for="(section, index) in formSchema.sections"
        :key="`section-${index}`"
        :is="getSectionComponent(section)"
        :section="section"
        :result="formData"
        :section-index="index"
        :disabled="isDisabled"
        @field-change="handleFieldChange"
      />
    </div>
  </div>
</template>

<script>
import EnhancedTableSection from './sections/EnhancedTableSection.vue';
import EnhancedListSection from './sections/EnhancedListSection.vue';
import EnhancedConditionalSection from './sections/EnhancedConditionalSection.vue';
import { debounce } from '@/common/common';

export default {
  name: 'EnhancedDynamicRenderer',
  components: {
    EnhancedTableSection,
    EnhancedListSection,
    EnhancedConditionalSection,
  },
  props: {
    formSchema: {
      type: Object,
      required: true,
      validator(value) {
        return value.formId && value.formName && value.sections && Array.isArray(value.sections);
      },
    },
    result: {
      type: Object,
      default: () => ({}),
    },
    testId: {
      type: Number,
      required: true,
    },
    section: {
      type: String,
      required: true,
      validator(value) {
        return ['ResultSection', 'ValidationSection', 'ApprovalSection'].includes(value);
      },
    },
  },
  data() {
    return {
      formData: {},
    };
  },
  computed: {
    isDisabled() {
      return this.section === 'ValidationSection' || this.section === 'ApprovalSection';
    },
  },
  watch: {
    result: {
      immediate: true,
      deep: true,
      handler(val) {
        if (val && Object.keys(val).length > 0) {
          this.formData = { ...val };
        }
      },
    },
  },
  methods: {
    getSectionComponent(section) {
      const componentMap = {
        table: 'EnhancedTableSection',
        list: 'EnhancedListSection',
        conditional: 'EnhancedConditionalSection',
      };
      return componentMap[section.type] || 'EnhancedListSection';
    },

    handleFieldChange(fieldId, value) {
      this.formData[fieldId] = value;
      this.emitFormData();
    },

    emitFormData() {
      this.debounceInput(this);
    },

    debounceInput: debounce((vm) => {
      vm.$emit('emitResult', vm.formData, vm.testId);
    }, 500),
  },
};
</script>

<style scoped>
.enhanced-dynamic-renderer {
  width: 100%;
}

.form-header {
  background: linear-gradient(135deg, #8b0000 0%, #a0522d 100%);
  padding: 20px 24px;
  border-radius: 10px;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(139, 0, 0, 0.15);
}

.form-title {
  color: #fff;
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  letter-spacing: 0.3px;
}

.form-version {
  color: rgba(255, 255, 255, 0.85);
  font-size: 14px;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.1);
  padding: 4px 12px;
  border-radius: 12px;
}

.sections-container {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
</style>
