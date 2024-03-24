<template>
  <div>
    <div class="card card-custom gutter-b">
      <div class="card-header border-1 py-5">
        <h3 class="card-title align-items-start flex-column">
          <span class="card-label font-weight-bolder text-dark">Prescriptions</span>
        </h3>
      </div>
      <!--end::Header-->
      <div class="card-body card-header-tabs-line">
        <div class="card-toolbar">
          <diagnosis-accordion />
          <div v-if="visit" class="example">
            <b-tabs content-class="mt-3">
              <b-tab title="Tests" active>
                <Tests />
              </b-tab>
              <b-tab title="Drugs" lazy>
                <medications />
              </b-tab>
              <b-tab title="Radiology" lazy>
                <radiology />
              </b-tab>
              <b-tab title="Services" lazy>
                <services />
              </b-tab>
            </b-tabs>
          </div>
          <TabsSkeleton :tabs="tabs" v-else />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import TabsSkeleton from '@/view/pages/programs/immunization/components/TabsSkeleton.vue';
import Tests from '@/view/pages/nhis/page/tabs/Tests.vue';
import DiagnosisAccordion from '@/view/components/accordion/DiagnosisAccordion.vue';
import Medications from '@/view/pages/nhis/page/tabs/Medications.vue';
import Radiology from '@/view/pages/nhis/page/tabs/Radiology.vue';
import Services from '@/view/pages/nhis/page/tabs/Services.vue';

export default {
  data: () => ({
    tabs: ['Tests', 'Drugs', 'Items', 'Radiology', 'Services'],
  }),
  components: {
    Services,
    Radiology,
    Medications,
    DiagnosisAccordion,
    Tests,
    TabsSkeleton,
  },
  computed: {
    visit() {
      return this.$store.state.visit.visit;
    },
  },
  created() {
    this.$store.dispatch('visit/fetchVisit', this.$route.params.id).then(response => {
      const res = response.data.data;
      this.$store.dispatch('patient/setCurrentPatient', { ...res.patient, ...res.insurance });
    });
  },
};
</script>

<style scoped></style>
