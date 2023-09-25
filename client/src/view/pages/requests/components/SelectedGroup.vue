<template>
  <b-button-group size="md" class="mt-5">
    <b-button variant="outline-secondary">
      <label class="checkbox checkbox-md checkbox-inline">
        <span class="mr-2" />
        {{ count ? count : null }} Selected
      </label>
    </b-button>
    <b-button @click="openModal" variant="outline-secondary">Process Request</b-button>
  </b-button-group>
</template>

<script>
export default {
  props: {
    count: {
      type: Number,
      required: true,
    },
  },
  methods: {
    openModal() {
      this.$emit('openModal', true);
    },
  },
};
</script>

<style scoped></style>
