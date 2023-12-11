<template>
  <div>
    <div class="placeholder-content">
      <h5 class="mb-4">{{ title }}</h5>
      <div v-for="index in times" :key="index" class="skeleton-loader"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PageSkeleton',
  props: {
    times: {
      type: Number,
      required: true,
      defaultValue: 6,
    },
    title: {
      type: String,
      required: true,
    },
  },
};
</script>

<style scoped>
.skeleton-loader {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  height: 30px;
  margin-bottom: 10px;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Placeholder Content Styles (You can customize this as needed) */
.placeholder-content {
  width: 100%;
  margin: 0 auto;
  padding: 20px;
}

.placeholder-text {
  height: 20px;
  margin-bottom: 10px;
}
</style>
