<template>
  <div>
    <div class="card card-custom gutter-b">
      <div class="card-header py-5">
        <h3 class="card-title align-items-start flex-column">
          <span class="card-label font-weight-bolder text-dark">Discharge Patient</span>
        </h3>
      </div>
      <div class="card-body">
        <discharge-accordion />
        <discharge-form />
      </div>
    </div>
  </div>
</template>
<script>
import DischargeAccordion from '@/view/pages/admission/components/discharge/DischargeAccordion.vue';
import DischargeForm from '@/view/pages/admission/components/discharge/DischargeForm.vue';

export default {
  components: { DischargeForm, DischargeAccordion },
  created() {
    this.$store
      .dispatch('admission/fetchAdmission', { admissionId: this.$route.params.id })
      .then(response => {
        const res = response.data.data;
        this.$store.dispatch('patient/setCurrentPatient', { ...res.insurance, ...res.patient });
      });
  },
};
</script>

<style scoped></style>
