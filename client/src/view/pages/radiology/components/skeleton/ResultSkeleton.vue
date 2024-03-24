<template>
  <div class="card card-custom gutter-b">
    <page-title :title="title" />
    <div class="card-body">
      <section-title text="Patient Information" />
      <DefaultSkeleton />
      <DefaultSkeleton />
    </div>
  </div>
</template>
<script>
import PageTitle from '@/utils/PageTitle.vue';
import SectionTitle from '@/utils/SectionTitle.vue';
import DefaultSkeleton from '@/utils/DefaultSkeleton.vue';

export default {
  components: { DefaultSkeleton, SectionTitle, PageTitle },
  props: {
    title: {
      type: String,
      required: true,
    },
  },
};
</script>

<style scoped></style>
