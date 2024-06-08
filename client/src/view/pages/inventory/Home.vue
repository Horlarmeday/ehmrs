<template>
  <div>
    <create-inventory
      :data="inventoryToEdit"
      :display-prompt="displayPrompt"
      @closeModal="hideModal"
    />
    <div v-if="!inventories.length" class="bv-example">
      <empty-data-card :text="content" @addData="addNewData" />
    </div>
    <!--begin::Row-->
    <div v-if="inventories.length" class="row mb-10">
      <div class="col-lg-6 col-xl-4 mb-10" v-for="(inventory, i) in inventories" :key="i">
        <callout-card
          :name="inventory.name"
          :desc="inventory.desc || `Click here to view items in the ${inventory.name}`"
          :link="`/inventory/${inventory.id}?name=${inventory.name}`"
        />
      </div>
      <div v-if="ALLOWED_ROLES.includes(user.role)" class="col-lg-6 col-xl-4 mb-10">
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
import { parseJwt } from '@/common/common';

export default {
  name: 'Home.vue',
  components: { EmptyDataCard, CalloutCard, CreateInventory },
  data() {
    return {
      displayPrompt: false,
      inventoryToEdit: {},
      content: 'There are no inventories, kindly click on the plus icon to create one',
      user: parseJwt(localStorage.getItem('user_token')),
      ALLOWED_ROLES: ['Super Admin', 'Pharmacy Store'],
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
