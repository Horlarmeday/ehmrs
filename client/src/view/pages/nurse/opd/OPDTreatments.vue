<template>
  <div>
    <CategoryVisits category="Outpatient" :url="url" />
  </div>
</template>
<script>
import CategoryVisits from '@/view/pages/visits/components/types/CategoryVisits.vue';
import { parseJwt } from '@/core/plugins/parseJwt';

export default {
  components: { CategoryVisits },
  data: () => ({
    url: `/visit/treatments/{queueId}`,
    currentUser: '',
  }),
  created() {
    this.currentUser = parseJwt(localStorage.getItem('user_token'));
  },
  methods: {},
};
</script>

<style scoped></style>
