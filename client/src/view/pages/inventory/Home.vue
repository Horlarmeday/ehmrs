<template>
  <div>
    <create-inventory
      :data="inventoryToEdit"
      :display-prompt="displayPrompt"
      @closeModal="hideModal"
    />
    <div v-if="!inventories.length" class="bv-example">
      <empty-data-card @addData="addNewData" />
    </div>
    <!--begin::Row-->
    <div v-if="inventories.length" class="row mb-10">
      <div class="col-lg-6 col-xl-4 mb-10" v-for="(inventory, i) in inventories" :key="i">
        <!--begin::Callout-->
        <callout-card
          :name="inventory.name"
          :desc="inventory.desc || `Click here to view items in the ${inventory.name}`"
          :link="`/inventory/${inventory.id}?name=${inventory.name}`"
        />
        <!--end::Callout-->
      </div>
      <div class="col-lg-6 col-xl-4 mb-10">
        <div class="card card-custom mb-2 bg-diagonal">
          <div class="card-body">
            <div class="text-center cursor-pointer" @click="addNewData">
              <i class="flaticon2-plus icon-4x"></i>
            </div>
            <div class="text-center text-dark-50"><p>Create a new Inventory</p></div>
          </div>
        </div>
      </div>
    </div>
    <!--end::Row-->
  </div>
</template>

<script>
import CreateInventory from './components/CreateInventory.vue';
import CalloutCard from '@/utils/CalloutCard.vue';
import EmptyDataCard from '@/utils/EmptyDataCard.vue';

export default {
  name: 'Home.vue',
  components: { EmptyDataCard, CalloutCard, CreateInventory },
  data() {
    return {
      displayPrompt: false,
      inventoryToEdit: {},
    };
  },
  computed: {
    inventories() {
      return this.$store.state.inventory.inventories;
    },
  },
  created() {
    this.$store.dispatch('inventory/fetchInventories');
  },
  methods: {
    hideModal() {
      this.displayPrompt = false;
    },

    addNewData() {
      this.inventoryToEdit = {};
      this.displayPrompt = true;
    },
  },
};
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>
