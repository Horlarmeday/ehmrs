<template>
  <div>
    <component
      :section="section"
      :testId="testId"
      :is="activeForm"
      :result="result"
      @emitResult="emitResult"
    />
  </div>
</template>
<script>
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
  data: () => ({
    activeForm: '',
  }),
  props: {
    resultForm: {
      type: String,
      required: true,
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
  },
  watch: {
    resultForm: {
      immediate: true,
      handler(value) {
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
