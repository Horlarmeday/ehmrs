<template>
  <div>
    <active-visits :url="url" :filter="filter" />
  </div>
</template>
<script>
import ActiveVisits from '@/view/pages/visits/components/types/ActiveVisits.vue';

export default {
  components: { ActiveVisits },
  data: () => ({
    url: `/visit/nhis-visits/{queueId}`,
    filter: {
      has_insurance: true,
    },
  }),
};
</script>

<style scoped></style>
