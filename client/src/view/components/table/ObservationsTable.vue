<template>
  <div>
    <div class="">
      <histories-table :histories="observations" />
      <div v-if="wardRounds?.length">
        <section-title text="Ward Rounds" />
        <ward-rounds-table :ward-rounds="wardRounds" />
      </div>
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
import WardRoundsTable from '@/view/components/table/WardRoundsTable.vue';
import SectionTitle from '@/utils/SectionTitle.vue';

export default {
  name: 'ObservationsTable',
  components: { SectionTitle, WardRoundsTable, HistoriesTable },
  props: {
    observations: {
      type: Array,
      required: true,
      default: () => [],
    },
    wardRounds: {
      type: Array,
      default: () => [],
    },
  },
};
</script>

<style scoped></style>
