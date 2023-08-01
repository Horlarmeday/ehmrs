<template>
  <div class="section-title mb-6 mt-3">
    <div class="separator separator-solid"></div>
    <h5 class="text-dark mt-3">{{ text }}</h5>
    <div class="separator separator-solid mb-6"></div>
  </div>
</template>

<script>
export default {
  name: 'Title',
  props: {
    text: {
      type: String,
      required: true,
    },
  },
};
</script>

<style scoped>
.section-title {
  cursor: pointer;
  margin: 0;
  border-bottom: 0;
  padding: 0;
  background-color: #F3F6F9;
  border-radius: 0
}
</style>
