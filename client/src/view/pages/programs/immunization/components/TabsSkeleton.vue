<template>
  <div class="example">
    <b-tabs content-class="mt-3">
      <b-tab v-for="(tab, i) in tabs" :key="i" :title="tab" active>
        <DefaultSkeleton />
      </b-tab>
    </b-tabs>
  </div>
</template>
<script>
import DefaultSkeleton from '@/utils/DefaultSkeleton.vue';

export default {
  components: { DefaultSkeleton },
  props: {
    tabs: {
      type: Array,
      required: true,
    },
  },
};
</script>

<style scoped></style>
