<template>
  <div>
    <active-visits :url="url" />
  </div>
</template>
<script>
import ActiveVisits from '@/view/pages/visits/components/types/ActiveVisits.vue';

export default {
  components: { ActiveVisits },
  data: () => ({
    url: `/visit/active/{queueId}`,
  }),
};
</script>

<style scoped></style>
