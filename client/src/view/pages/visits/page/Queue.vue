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
    currentUser: '',
    GENERAL_PRACTITIONER: 'General Practitioner',
  }),
  created() {
    this.currentUser = parseJwt(localStorage.getItem('user_token'));
  },
  computed: {
    filter() {
      return {
        has_done_vitals: this.currentUser.role === this.GENERAL_PRACTITIONER,
        ...(this.currentUser.role === this.GENERAL_PRACTITIONER && { is_taken: false }),
      };
    },
  },
};
</script>

<style scoped></style>
