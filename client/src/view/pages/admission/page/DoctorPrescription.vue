<template>
  <div class="card card-custom card-stretch gutter-b card-shadowless">
    <div class="card-header">
      <div class="card-title">
        <div class="card-label">Doctor Prescriptions</div>
      </div>
    </div>
    <div class="card-body">
      <tabs />
    </div>
  </div>
</template>
<script>
import Tabs from '@/view/pages/admission/components/doctorPrescriptions/Tabs.vue';

export default {
  components: { Tabs },
  methods: {
    fetchAdmission() {
      this.$store
        .dispatch('admission/fetchAdmission', { admissionId: this.$route.params.id })
        .then(response => {
          const res = response.data.data;
          this.$store.dispatch('patient/setCurrentPatient', { ...res.insurance, ...res.patient });
        });
    },
  },
  created() {
    this.fetchAdmission();
  },
};
</script>

<style scoped></style>
