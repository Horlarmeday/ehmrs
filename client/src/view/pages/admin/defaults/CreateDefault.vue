<template>
  <div>
    <div class="card card-custom gutter-b">
      <div class="card-header">
        <h3 class="card-title">
          <span class="card-label font-weight-bolder text-dark">Create Default</span>
        </h3>
      </div>
      <div class="card-body">
        <div class="form-group row">
          <label class="col-lg-2 col-form-label">Type:</label>
          <div class="col-lg-6">
            <select class="form-control" v-model="type">
              <option :value="type.code" v-for="(type, i) in defaultTypes" :key="i">{{
                type.name
              }}</option>
            </select>
          </div>
        </div>
        <Component :is="currentComponent" :type="type" />
      </div>
    </div>
  </div>
</template>
<script>
import ANCRoutineDrugsForm from './components/forms/ANCRoutineDrugsForm.vue';
import AdmissionItemsForm from './components/forms/AdmissionItemsForm.vue';
import ANCRoutineTestsForm from './components/forms/ANCRoutineTestsForm.vue';
import InjectionItemsForm from './components/forms/InjectionItemsForm.vue';
import OperationItemsForm from './components/forms/OperationItemsForm.vue';
import InjectionsWaterForm from './components/forms/InjectionsWaterForm.vue';

export default {
  components: { ANCRoutineDrugsForm },
  data: () => ({
    type: '',
    currentComponent: '',
    defaultTypes: [
      {
        name: 'Admission Items',
        code: 'ADMISSION_ITEMS',
      },
      {
        name: 'Antenatal Routine Tests',
        code: 'ANC_ROUTINE_TESTS',
      },
      {
        name: 'Antenatal Routine Drugs',
        code: 'ANC_ROUTINE_DRUGS',
      },
      {
        name: 'Injection Items',
        code: 'INJECTION_ITEMS',
      },
      {
        name: 'Injections Needing Water',
        code: 'WATER_INJECTIONS',
      },
      {
        name: 'Theater Operation Items',
        code: 'OPERATION_ITEMS',
      },
    ],
  }),
  watch: {
    type(value) {
      switch (value) {
        case 'ADMISSION_ITEMS':
          this.currentComponent = AdmissionItemsForm;
          break;
        case 'ANC_ROUTINE_TESTS':
          this.currentComponent = ANCRoutineTestsForm;
          break;
        case 'ANC_ROUTINE_DRUGS':
          this.currentComponent = ANCRoutineDrugsForm;
          break;
        case 'INJECTION_ITEMS':
          this.currentComponent = InjectionItemsForm;
          break;
        case 'OPERATION_ITEMS':
          this.currentComponent = OperationItemsForm;
          break;
        case 'WATER_INJECTIONS':
          this.currentComponent = InjectionsWaterForm;
          break;
      }
    },
  },
};
</script>

<style scoped></style>
