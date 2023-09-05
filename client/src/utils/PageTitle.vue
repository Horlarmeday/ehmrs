<template>
  <div class="card-header">
    <div class="card-title">
      <h3 class="card-label">{{ title }}</h3>
    </div>
    <div class="card-toolbar">
      <div class="example-tools justify-content-center">
        <span data-toggle="tooltip" class="example-toggle example-toggled" /><span
          data-toggle="tooltip"
          class="example-copy"
        />
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    title: {
      type: String,
      required: true,
    },
  },
};
</script>
