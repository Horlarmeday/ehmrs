<template>
  <b-button-group size="md" class="mt-5">
    <b-button variant="outline-secondary">
      <label class="checkbox checkbox-md checkbox-inline">
        <!--        <input type="checkbox" value="1" />-->
        <span class="mr-2" />
        {{ count ? count : null }} Selected
      </label>
    </b-button>
    <b-button @click="gotoUpdateItem" variant="outline-secondary">Edit Items</b-button>
    <b-dropdown text="More Actions" variant="outline-secondary">
      <b-dropdown-item @click="dispenseItems">Dispense</b-dropdown-item>
      <b-dropdown-item @click="reorderItems">Reorder</b-dropdown-item>
      <b-dropdown-item @click="exportData">Export</b-dropdown-item>
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
  },
};
</script>

<style scoped></style>
