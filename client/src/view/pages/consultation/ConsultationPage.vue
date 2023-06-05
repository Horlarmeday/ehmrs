<template>
  <div>
    <transition name="fade-in-up">
      <router-view></router-view>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'ConsultationPage',
};
</script>

<style scoped></style>
