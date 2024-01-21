<template>
  <div>
    <CategoryVisits category="Immunization" :url="url" />
  </div>
</template>
<script>
import CategoryVisits from '@/view/pages/visits/components/types/CategoryVisits.vue';

export default {
  components: { CategoryVisits },
  data: () => ({
    url: `/program/immunization/visit/{queueId}?immunization={immunizationId}`,
  }),
};
</script>

<style scoped></style>
