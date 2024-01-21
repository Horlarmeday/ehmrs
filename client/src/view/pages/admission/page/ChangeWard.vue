<template>
  <div class="card card-custom card-stretch gutter-b card-shadowless">
    <div class="card-header">
      <div class="card-title">
        <div class="card-label">Change Patient Ward</div>
      </div>
    </div>
    <div class="card-body">
      <change-ward-form :admission="admission" />
    </div>
  </div>
</template>
<script>
import ChangeWardForm from '@/view/pages/admission/components/changeWard/ChangeWardForm.vue';

export default {
  components: { ChangeWardForm },
  computed: {
    admission() {
      return this.$store.state.admission.admission;
    },
  },
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
