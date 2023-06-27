<template>
  <b-button-group size="md" class="mt-5">
    <b-button variant="outline-secondary">
      <label class="checkbox checkbox-md checkbox-inline">
        <!--        <input type="checkbox" value="1" />-->
        <span class="mr-2" />
        {{ count ? count : null }} Selected
      </label>
    </b-button>
    <b-button variant="outline-secondary">Edit Items</b-button>
    <b-dropdown text="More Actions" variant="outline-secondary">
      <b-dropdown-item @click="dispenseItems">Dispense</b-dropdown-item>
      <b-dropdown-item>Reorder</b-dropdown-item>
      <b-dropdown-item>Export</b-dropdown-item>
    </b-dropdown>
  </b-button-group>
</template>

<script>

export default {
  name: "ButtonGroup.vue",
  props: {
    count: {
      type: Number,
    },
  },
  methods: {
    dispenseItems() {
      this.$emit('openModal', true);
    }
  }
};
</script>

<style scoped></style>
