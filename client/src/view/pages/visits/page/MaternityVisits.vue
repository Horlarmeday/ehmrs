<template>
  <div>
    <CategoryVisits category="Maternity" :url="url" />
  </div>
</template>
<script>
import CategoryVisits from '@/view/pages/visits/components/types/CategoryVisits.vue';

export default {
  components: { CategoryVisits },
  data: () => ({
    url: `/visit/admit-patient/{queueId}?antenatal={antenatalId}`,
  }),
};
</script>

<style scoped></style>
