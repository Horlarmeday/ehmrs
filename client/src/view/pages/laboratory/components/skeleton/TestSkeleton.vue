<template>
  <div>
    <div class="card card-custom gutter-b">
      <page-title :title="title" />
      <div class="card-body pt-0">
        <section-title text="Patient Information" />
        <DefaultSkeleton />
        <section-title text="Test Information" />
        <DefaultSkeleton />

        <section-title :text="sectionTitle" />
        <DefaultSkeleton />
      </div>
    </div>
  </div>
</template>
<script>
import SectionTitle from '@/utils/SectionTitle.vue';
import PageTitle from '@/utils/PageTitle.vue';
import DefaultSkeleton from '@/utils/DefaultSkeleton.vue';

export default {
  components: {
    DefaultSkeleton,
    PageTitle,
    SectionTitle,
  },
  props: {
    title: {
      type: String,
      required: true,
    },
    sectionTitle: {
      type: String,
      required: false,
      default: '',
    },
  },
};
</script>

<style scoped></style>
