<template>
  <div>
    <div class="card-body">
      <b-tabs content-class="mt-3">
        <b-tab>
          <template v-slot:title>
            <strong>New</strong>
          </template>
          <AssignedVisits :url="url" :filter="newFilter" label="New" />
        </b-tab>
        <b-tab lazy>
          <template v-slot:title>
            <strong>Ongoing</strong>
          </template>
          <AssignedVisits :url="url" :filter="ongoingFilter" label="Ongoing" />
        </b-tab>
      </b-tabs>
    </div>
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
    newFilter() {
      return {
        has_done_vitals: this.currentUser.department === this.MEDICAL_PRACTITIONER,
        ...(this.currentUser.role === this.MEDICAL_PRACTITIONER && { is_taken: false }),
      };
    },
    ongoingFilter() {
      return {
        has_done_vitals: this.currentUser.department === this.MEDICAL_PRACTITIONER,
        ...(this.currentUser.role === this.MEDICAL_PRACTITIONER && { is_taken: true }),
      };
    },
  },
};
</script>

<style scoped></style>
