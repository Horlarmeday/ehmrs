<template>
  <div>
    <AssignedVisits :url="url" :filter="filter" />
  </div>
</template>
<script>
import AssignedVisits from '@/view/pages/visits/components/types/AssignedVisits.vue';
import { parseJwt } from '@/core/plugins/parseJwt';

export default {
  components: { AssignedVisits },
  data: () => ({
    url: `/consultation/{queueId}`,
    currentUser: parseJwt(localStorage.getItem('user_token')),
    MEDICAL_PRACTITIONER: 'Medical Practitioners',
  }),
  computed: {
    filter() {
      return {
        has_done_vitals: this.currentUser.department === this.MEDICAL_PRACTITIONER,
        ...(this.currentUser.role === this.MEDICAL_PRACTITIONER && { is_taken: false }),
      };
    },
  },
};
</script>

<style scoped></style>
