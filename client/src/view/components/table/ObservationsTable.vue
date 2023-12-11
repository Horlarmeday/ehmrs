<template>
  <div>
    <div class="border">
      <div class="font-weight-boldest">Histories</div>
      <histories-table :histories="observations.histories" />
    </div>
    <hr />
    <div class="border">
      <div class="font-weight-boldest">Complaints</div>
      <complaints-table :complaints="observations.complaints" />
    </div>
  </div>
</template>
<script>
import HistoriesTable from '@/view/components/table/HistoriesTable.vue';
import ComplaintsTable from '@/view/components/table/ComplaintsTable.vue';

export default {
  name: 'ObservationsTable',
  components: { ComplaintsTable, HistoriesTable },
  props: {
    observations: {
      type: Object,
      required: true,
      default: () => {},
    },
  },
};
</script>

<style scoped></style>
