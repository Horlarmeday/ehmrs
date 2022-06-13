<template>
  <b-button-group size="md" class="mt-5">
    <b-button variant="outline-secondary">
      <label class="checkbox checkbox-md checkbox-inline">
        <input type="checkbox" value="1" />
        <span class="mr-2" />
        {{ count }} Selected
      </label>
    </b-button>
    <b-button variant="outline-secondary">Edit Items</b-button>
    <b-dropdown text="More Actions" variant="outline-secondary">
      <b-dropdown-item>Action A</b-dropdown-item>
      <b-dropdown-item>Action B</b-dropdown-item>
    </b-dropdown>
  </b-button-group>
</template>

<script>
export default {
  name: "ButtonGroup.vue",
  props: {
    count: {
      type: Number
    }
  }
};
</script>

<style scoped></style>
