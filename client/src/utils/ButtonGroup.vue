<template>
  <b-button-group size="md" class="mt-5">
    <b-button variant="outline-secondary">
      <div class="checkbox-inline">
        <label class="">
          <!--        <input type="checkbox" value="1" />-->
          <span class="mr-2" />
          {{ count ? count : null }} Selected
        </label>
        <label class="checkbox ml-3">
          <input type="checkbox" :checked="selectAll" @change="selectAllItems" />
          <span></span>
          Select all items in the store
        </label>
      </div>
    </b-button>
    <b-button @click="gotoUpdateItem" variant="outline-secondary">Edit Items</b-button>
    <b-dropdown text="More Actions" variant="outline-secondary">
      <b-dropdown-item @click="dispenseItems">Dispense</b-dropdown-item>
      <b-dropdown-item @click="reorderItems">Reorder</b-dropdown-item>
      <b-dropdown-item @click="exportData">Export</b-dropdown-item>
      <b-dropdown-item @click="deactivateItems">Deactivate</b-dropdown-item>
    </b-dropdown>
  </b-button-group>
</template>

<script>
export default {
  name: 'ButtonGroup.vue',
  props: {
    count: {
      type: Number,
    },
  },
  data: () => ({
    selectAll: false,
  }),
  methods: {
    dispenseItems() {
      this.$emit('openDispenseModal', true);
    },

    reorderItems() {
      this.$emit('openReorderModal', true);
    },

    exportData() {
      this.$emit('openExportModal', true);
    },

    gotoUpdateItem() {
      this.$emit('gotoUpdateItem', true);
    },

    selectAllItems(event) {
      this.$emit('selectAllItems', event.target.checked);
    },

    deactivateItems() {
      this.$emit('deactivateItems', true);
    },
  },
};
</script>

<style scoped></style>
