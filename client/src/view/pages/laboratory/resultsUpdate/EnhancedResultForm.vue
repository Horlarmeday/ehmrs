<template>
  <div>
    <EnhancedDynamicRenderer
      v-if="formSchema"
      :form-schema="formSchema"
      :result="result"
      :test-id="testId"
      :section="section"
      @emitResult="emitResult"
    />
    <!-- Fallback to legacy forms if no template -->
    <component
      v-else
      :section="section"
      :testId="testId"
      :is="activeForm"
      :result="result"
      @emitResult="emitResult"
    />
  </div>
</template>

<script>
import EnhancedDynamicRenderer from './EnhancedDynamicRenderer.vue';
import UrineSwabForm from '@/view/pages/laboratory/forms/UrineSwabForm.vue';
import UrinalysisForm from '@/view/pages/laboratory/forms/UrinalysisForm.vue';
import StoolAnalysisForm from '@/view/pages/laboratory/forms/StoolAnalysisForm.vue';
import SputumForm from '@/view/pages/laboratory/forms/SputumForm.vue';
import SemenAnalysisForm from '@/view/pages/laboratory/forms/SemenAnalysisForm.vue';
import SEUCrForm from '@/view/pages/laboratory/forms/SEUCrForm.vue';
import LipidProfileForm from '@/view/pages/laboratory/forms/LipidProfileForm.vue';
import LFTForm from '@/view/pages/laboratory/forms/LFTForm.vue';
import SerumForm from '@/view/pages/laboratory/forms/SerumForm.vue';
import OGTTForm from '@/view/pages/laboratory/forms/OGTTForm.vue';
import BilirubinForm from '@/view/pages/laboratory/forms/BilirubinForm.vue';
import AnalyteForm from '@/view/pages/laboratory/forms/AnalyteForm.vue';
import FBCForm from '@/view/pages/laboratory/forms/FBCForm.vue';
import WidalReactionForm from '@/view/pages/laboratory/forms/WidalReactionForm.vue';
import GlucoseForm from '@/view/pages/laboratory/forms/GlucoseForm.vue';
import HormonalAssayForm from '@/view/pages/laboratory/forms/HormonalAssayForm.vue';
import DefaultResultForm from '@/view/pages/laboratory/forms/DefaultResultForm.vue';

export default {
  components: {
    EnhancedDynamicRenderer,
  },
  data: () => ({
    activeForm: '',
    formSchema: null,
  }),
  props: {
    resultForm: {
      type: String,
      required: false,
    },
    formTemplateId: {
      type: Number,
      required: false,
    },
    result: {
      type: Object,
      required: true,
    },
    testId: {
      type: Number,
      required: true,
    },
    section: {
      type: String,
      required: true,
    },
  },
  methods: {
    emitResult(data, testId) {
      this.$emit('emitTestResult', data, testId);
    },

    async loadFormTemplate() {
      if (!this.formTemplateId) {
        this.formSchema = null;
        return;
      }

      try {
        const response = await this.$store.dispatch(
          'laboratory/fetchFormTemplateById',
          this.formTemplateId
        );
        if (response.data && response.data.data) {
          this.formSchema = response.data.data.schema_json;
        }
      } catch (error) {
        this.formSchema = null;
      }
    },
  },
  watch: {
    formTemplateId: {
      immediate: true,
      async handler(value) {
        if (value) {
          await this.loadFormTemplate();
        }
      },
    },
    resultForm: {
      immediate: true,
      handler(value) {
        if (this.formTemplateId) {
          return;
        }

        switch (value) {
          case 'UrineSwabForm':
            return (this.activeForm = UrineSwabForm);
          case 'UrinalysisForm':
            return (this.activeForm = UrinalysisForm);
          case 'StoolAnalysisForm':
            return (this.activeForm = StoolAnalysisForm);
          case 'SputumForm':
            return (this.activeForm = SputumForm);
          case 'SemenAnalysisForm':
            return (this.activeForm = SemenAnalysisForm);
          case 'SEUCrForm':
            return (this.activeForm = SEUCrForm);
          case 'LipidProfileForm':
            return (this.activeForm = LipidProfileForm);
          case 'LFTForm':
            return (this.activeForm = LFTForm);
          case 'SerumForm':
            return (this.activeForm = SerumForm);
          case 'OGTTForm':
            return (this.activeForm = OGTTForm);
          case 'BilirubinForm':
            return (this.activeForm = BilirubinForm);
          case 'AnalyteForm':
            return (this.activeForm = AnalyteForm);
          case 'FBCForm':
            return (this.activeForm = FBCForm);
          case 'WidalReactionForm':
            return (this.activeForm = WidalReactionForm);
          case 'GlucoseForm':
            return (this.activeForm = GlucoseForm);
          case 'HormonalAssayForm':
            return (this.activeForm = HormonalAssayForm);
          default:
            return (this.activeForm = DefaultResultForm);
        }
      },
    },
  },
};
</script>

<style scoped></style>
