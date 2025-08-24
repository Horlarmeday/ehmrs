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
    ALLOWED_ROLES: ['Super Admin', 'Medical Practitioner', 'Nephrologist', 'Doctor'],
    CATEGORY: 'Dialysis',
  }),
  computed: {
    filter() {
      return {
        category: this.CATEGORY,
        ...(this.ALLOWED_ROLES.includes(this.currentUser.role) && { is_taken: false }),
      };
    },
  },
};
</script>

<style scoped></style>
