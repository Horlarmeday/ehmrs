<template>
  <div class="card card-custom card-stretch gutter-b card-shadowless">
    <div class="card-header">
      <div class="card-title">
        <div class="card-label">Admission History</div>
      </div>
    </div>
    <div class="card-body">
      <tabs />
    </div>
  </div>
</template>
<script>
import Tabs from '@/view/pages/admission/components/history/Tabs.vue';

export default {
  components: { Tabs },
  methods: {
    fetchAdmission() {
      this.$store
        .dispatch('admission/fetchAdmission', { admissionId: this.$route.params.id })
        .then(response => {
          const res = response.data.data;
          this.$store.dispatch('patient/setCurrentPatient', { ...res.patient, ...res.insurance });
        });
    },
  },
  created() {
    this.fetchAdmission();
  },
};
</script>

<style scoped></style>
