<template>
  <div>
    <b-tabs content-class="mt-5">
      <b-tab title="Drugs" active>
        <prescribed-drugs-table />
      </b-tab>
      <b-tab title="Additional Items">
        <additional-items-table />
      </b-tab>
    </b-tabs>
  </div>
</template>
<script>
import PrescribedDrugsTable from '@/view/pages/account/components/drugs/PrescribedDrugsTable.vue';
import AdditionalItemsTable from '@/view/pages/account/components/drugs/AdditionalItemsTable.vue';

export default {
  components: { PrescribedDrugsTable, AdditionalItemsTable },
};
</script>

<style scoped></style>
