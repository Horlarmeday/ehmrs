<template>
  <div class="alert alert-custom alert-light-danger fade show mb-5" role="alert">
    <div class="alert-icon"><i class="flaticon-warning"></i></div>
    <div class="alert-text">
      <span class="mb-3">{{ message }}</span>
      <div v-if="lists?.length">
        <ul v-for="(list, i) in lists" :key="i">
          <li>{{ list }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    message: {
      type: String,
      required: true,
    },
    lists: {
      type: Array,
      required: false,
    },
  },
};
</script>

<style scoped></style>
