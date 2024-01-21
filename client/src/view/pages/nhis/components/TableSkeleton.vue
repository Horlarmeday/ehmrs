<template>
  <div>
    <b-skeleton-table :rows="5" :columns="columns" :table-props="{ striped: true }" />
  </div>
</template>
<script>
export default {
  props: {
    rows: {
      type: Number,
      default: 5,
    },
    columns: {
      type: Number,
      required: true,
      default: 5,
    },
  },
};
</script>

<style scoped></style>
