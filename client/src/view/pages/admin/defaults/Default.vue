<template>
  <div>
    <div class="card card-custom gutter-b example example-compact">
      <div class="card-header" style="min-height: 50px !important">
        <h3 class="card-title">
          {{ defaultTypes[$route.query.table] }}
        </h3>
      </div>
      <Component :is="activeTable" />
    </div>
  </div>
</template>
<script>
import AdmissionItemsTable from './components/table/AdmissionItemsTable.vue';
import ANCRoutineDrugsTable from './components/table/ANCRoutineDrugsTable.vue';
import ANCRoutineTestsTable from './components/table/ANCRoutineTestsTable.vue';
import InjectionItemsTable from './components/table/InjectionItemsTable.vue';
import OperationItemsTable from './components/table/OperationItemsTable.vue';

const TableDefault = {
  ADMISSION_ITEMS: AdmissionItemsTable,
  ANC_ROUTINE_TESTS: ANCRoutineTestsTable,
  ANC_ROUTINE_DRUGS: ANCRoutineDrugsTable,
  INJECTION_ITEMS: InjectionItemsTable,
  OPERATION_ITEMS: OperationItemsTable,
};
export default {
  data: () => ({
    activeTable: '',
    defaultTypes: {
      ADMISSION_ITEMS: 'Admission Items',
      ANC_ROUTINE_TESTS: 'Antenatal Routine Tests',
      ANC_ROUTINE_DRUGS: 'Antenatal Routine Drugs',
      INJECTION_ITEMS: 'Injection Items',
      OPERATION_ITEMS: 'Theater Operation Items',
    },
  }),
  created() {
    const table = this.$route.query.table;
    this.activeTable = TableDefault[table];
  },
};
</script>

<style scoped></style>
