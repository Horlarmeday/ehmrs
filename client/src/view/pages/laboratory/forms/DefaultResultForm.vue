<template>
  <div>
    <textarea v-model="result" class="form-control" cols="30" rows="5"></textarea>
  </div>
</template>
<script>
export default {
  data: () => ({
    result: '',
  }),
};
</script>

<style scoped></style>
