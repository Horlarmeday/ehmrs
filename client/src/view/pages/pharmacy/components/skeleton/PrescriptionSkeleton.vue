<template>
  <div>
    <div class="card card-custom gutter-b">
      <page-title :title="title" />
      <div class="card-body pt-0">
        <section-title text="Patient Information" />
        <DefaultSkeleton />
        <div>
          <section-title text="Drugs Information" />
          <DefaultSkeleton />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import DefaultSkeleton from '@/utils/DefaultSkeleton.vue';
import SectionTitle from '@/utils/SectionTitle.vue';
import PageTitle from '@/utils/PageTitle.vue';

export default {
  components: { PageTitle, SectionTitle, DefaultSkeleton },
  props: {
    title: {
      type: String,
      required: true,
    },
  },
};
</script>

<style scoped></style>
