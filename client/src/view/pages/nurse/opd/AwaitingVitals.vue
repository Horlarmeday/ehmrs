<template>
  <div>
    <CategoryVisits category="Outpatient" :url="url" :filter="filter" />
  </div>
</template>
<script>
import CategoryVisits from '@/view/pages/visits/components/types/CategoryVisits.vue';
import { parseJwt } from '@/core/plugins/parseJwt';

export default {
  components: { CategoryVisits },
  data: () => ({
    url: `/vitals/{queueId}`,
    MEDICAL_PRACTITIONER: 'Medical Practitioners',
    currentUser: parseJwt(localStorage.getItem('user_token')),
  }),
  computed: {
    filter() {
      return {
        has_done_vitals: this.currentUser.department === this.MEDICAL_PRACTITIONER,
        ...(this.currentUser.department === this.MEDICAL_PRACTITIONER && { is_taken: false }),
      };
    },
  },
};
</script>

<style scoped></style>
