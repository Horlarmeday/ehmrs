<template>
  <div>
    <div class="card card-custom gutter-b">
      <div class="card-header">
        <div class="card-title">
          <h3 class="card-label">
            {{ item?.drug?.name }}
          </h3>
        </div>
      </div>
      <div class="card-body card-header-tabs-line">
        <div class="card-toolbar">
          <div class="example">
            <b-tabs content-class="mt-3">
              <!-- This tabs content will always be mounted -->
              <b-tab title="Item Detail">
                <inventory-item-detail :item="item" />
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
              <b-tab title="All" lazy>
                <inventory-item-history :history_type="null" table_type="All" table_name="All" />
              </b-tab>
              <b-tab title="Pending Prescriptions" lazy>
                <pending-prescriptions />
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
import PendingPrescriptions from '@/view/pages/inventory/components/PendingPrescriptions.vue';

export default {
  components: {
    InventoryItemHistory,
    InventoryItemDetail,
    PendingPrescriptions,
  },
  computed: {
    item() {
      return this.$store.state.inventory.item;
    },
  },
  methods: {
    fetchInventoryItem() {
      this.$store.dispatch('inventory/fetchInventoryItem', { id: this.$route.params.id });
    },
    countToHundred() {
      for (let i = 1; i <= 100; i++) {
        this.count = i;
        if (this.item) break;
      }
    },
  },
  created() {
    this.countToHundred();
    this.fetchInventoryItem();
  },
};
</script>
<style scoped></style>
