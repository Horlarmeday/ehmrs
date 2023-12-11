<template>
  <div>
    <CategoryVisits category="Inpatient" :url="url" />
  </div>
</template>
<script>
import CategoryVisits from '@/view/pages/visits/components/types/CategoryVisits.vue';

export default {
  components: { CategoryVisits },
  data: () => ({
    url: `/consultation/{queueId}`,
  }),
};
</script>

<style scoped></style>
