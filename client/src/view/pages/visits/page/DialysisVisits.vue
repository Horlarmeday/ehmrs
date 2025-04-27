<template>
  <div>
    <category-visits :category="CATEGORY" :url="url" :filter="filter" />
  </div>
</template>

<script>
import CategoryVisits from '@/view/pages/visits/components/types/CategoryVisits.vue';
import { parseJwt } from '@/core/plugins/parseJwt';

export default {
  components: { CategoryVisits },
  data: () => ({
    url: `/consultation/{queueId}`,
    currentUser: parseJwt(localStorage.getItem('user_token')),
    MEDICAL_PRACTITIONER: 'Medical Practitioners',
    CATEGORY: 'Dialysis',
  }),
  computed: {
    filter() {
      return {
        ...(this.currentUser.role === this.MEDICAL_PRACTITIONER && { is_taken: false }),
      };
    },
  },
};
</script>

<style scoped></style>
