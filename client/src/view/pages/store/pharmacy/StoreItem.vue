<template>
  <div>
    <div class="card card-custom gutter-b">
      <div class="card-body card-header-tabs-line">
        <div class="card-toolbar">
          <div class="example">
            <b-tabs content-class="mt-3">
              <!-- This tabs content will always be mounted -->
              <b-tab title="Item Detail">
                <item-detail />
              </b-tab>
              <!-- and will be un-mounted when hidden -->
              <b-tab title="Dispenses" lazy>
                <HistoryTable
                  table_name="Dispense"
                  table_type="Dispensed"
                  history_type="Dispensed"
                />
              </b-tab>

              <b-tab title="Supplies" lazy>
                <HistoryTable table_name="Supply" table_type="Supplied" history_type="Supplied" />
              </b-tab>
              <b-tab title="Returns" lazy>
                <HistoryTable table_name="Return" table_type="Returned" history_type="Returned" />
              </b-tab>
              <b-tab title="Logs" lazy>
                <item-log-table />
              </b-tab>
            </b-tabs>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import ItemDetail from '@/view/pages/store/pharmacy/components/ItemDetail.vue';
import HistoryTable from '@/view/pages/store/pharmacy/components/HistoryTable.vue';
import ItemLogTable from "@/view/pages/store/pharmacy/components/ItemLogTable.vue";

export default {
  components: { ItemLogTable, HistoryTable, ItemDetail },
};
</script>
<style scoped></style>
