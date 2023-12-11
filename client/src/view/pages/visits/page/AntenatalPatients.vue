<template>
  <div>
    <CategoryVisits category="Antenatal" :url="url" />
  </div>
</template>
<script>
import CategoryVisits from '@/view/pages/visits/components/types/CategoryVisits.vue';

export default {
  components: { CategoryVisits },
  data: () => ({
    url: `/program/ante-natal/visit/{queueId}?antenatal={antenatalId}`,
  }),
};
</script>

<style scoped></style>
