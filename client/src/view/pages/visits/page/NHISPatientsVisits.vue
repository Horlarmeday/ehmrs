<template>
  <div>
    <b-tabs content-class="mt-3">
      <b-tab>
        <template v-slot:title>
          <strong>Active</strong>
        </template>
        <active-visits :url="url" :filter="filter" />
      </b-tab>
      <b-tab lazy>
        <template v-slot:title>
          <strong>Past</strong>
        </template>
        <past-visits :url="url" :filter="filter" />
      </b-tab>
    </b-tabs>
  </div>
</template>
<script>
import ActiveVisits from '@/view/pages/visits/components/types/ActiveVisits.vue';
import PastVisits from '@/view/pages/visits/components/types/PastVisits.vue';

export default {
  components: { PastVisits, ActiveVisits },
  data: () => ({
    url: `/visit/nhis-visits/{queueId}`,
    filter: {
      has_insurance: true,
    },
  }),
};
</script>

<style scoped></style>
