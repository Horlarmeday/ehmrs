<template>
  <div>
    <div>
      <div class="card card-custom gutter-b">
        <div class="card-header">
          <h3 class="card-title">
            <span class="card-label font-weight-bolder text-dark">Result Forms</span>
          </h3>
        </div>
        <div class="card-body">
          <div class="form-group row">
            <label class="col-lg-2 col-form-label">Form:</label>
            <div class="col-lg-6">
              <select @change="selectResultForm" class="form-control" v-model="form">
                <option :value="form.code" v-for="(form, i) in forms" :key="i">{{
                  form.name
                }}</option>
              </select>
            </div>
          </div>
          <Component :is="currentForm" />
        </div>
      </div>
    </div>
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
import DefaultResultForm from '@/view/pages/laboratory/forms/DefaultResultForm.vue';
import { resultFormList } from '@/view/pages/laboratory/forms/resultFormList';
import GlucoseForm from '@/view/pages/laboratory/forms/GlucoseForm.vue';
import HormonalAssayForm from '@/view/pages/laboratory/forms/HormonalAssayForm.vue';

export default {
  data: () => ({
    forms: resultFormList,
    form: '',
    currentForm: '',
  }),
  methods: {
    selectResultForm() {
      switch (this.form) {
        case 'UrineSwabForm':
          return (this.currentForm = UrineSwabForm);
        case 'UrinalysisForm':
          return (this.currentForm = UrinalysisForm);
        case 'StoolAnalysisForm':
          return (this.currentForm = StoolAnalysisForm);
        case 'SputumForm':
          return (this.currentForm = SputumForm);
        case 'SemenAnalysisForm':
          return (this.currentForm = SemenAnalysisForm);
        case 'SEUCrForm':
          return (this.currentForm = SEUCrForm);
        case 'LipidProfileForm':
          return (this.currentForm = LipidProfileForm);
        case 'LFTForm':
          return (this.currentForm = LFTForm);
        case 'SerumForm':
          return (this.currentForm = SerumForm);
        case 'OGTTForm':
          return (this.currentForm = OGTTForm);
        case 'BilirubinForm':
          return (this.currentForm = BilirubinForm);
        case 'AnalyteForm':
          return (this.currentForm = AnalyteForm);
        case 'FBCForm':
          return (this.currentForm = FBCForm);
        case 'WidalReactionForm':
          return (this.currentForm = WidalReactionForm);
        case 'GlucoseForm':
          return (this.currentForm = GlucoseForm);
        case 'HormonalAssayForm':
          return (this.currentForm = HormonalAssayForm);
        case 'DefaultResultForm':
          return (this.currentForm = DefaultResultForm);
      }
    },
  },
};
</script>

<style scoped></style>
