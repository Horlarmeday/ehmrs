<template>
  <div>
    <div class="">
      <histories-table :histories="observations" />
    </div>
    <hr />
    <!--    <div v-if="observations?.complaints?.length" class="border">-->
    <!--      <div class="font-weight-boldest">Complaints</div>-->
    <!--      <complaints-table :complaints="observations.complaints" />-->
    <!--    </div>-->
  </div>
</template>
<script>
import HistoriesTable from '@/view/components/table/HistoriesTable.vue';

export default {
  name: 'ObservationsTable',
  components: { HistoriesTable },
  props: {
    observations: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
};
</script>

<style scoped></style>
