<template>
  <div>
    <div class="card card-custom gutter-b">
      <div class="card-body card-header-tabs-line">
        <div class="card-toolbar">
          <div class="example">
            <b-tabs content-class="mt-3">
              <!-- This tabs content will always be mounted -->
              <b-tab title="Item Detail">
                <inventory-item-detail />
              </b-tab>
              <!-- and will be un-mounted when hidden -->
              <b-tab title="Dispenses" lazy>
                <inventory-item-history
                  history_type="Dispensed"
                  table_type="Dispensed"
                  table_name="Dispenses"
                />
              </b-tab>

              <b-tab title="Supplies" lazy>
                <inventory-item-history
                  history_type="Supplied"
                  table_type="Supplied"
                  table_name="Supply"
                />
              </b-tab>
              <b-tab title="Returns" lazy>
                <inventory-item-history
                  history_type="Returned"
                  table_type="Returned"
                  table_name="Returns"
                />
              </b-tab>
            </b-tabs>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import InventoryItemDetail from '@/view/pages/inventory/components/InventoryItemDetail.vue';
import InventoryItemHistory from '@/view/pages/inventory/components/InventoryItemHistory.vue';

export default {
  components: { InventoryItemHistory, InventoryItemDetail },
};
</script>
<style scoped></style>
