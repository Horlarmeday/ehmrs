<template>
  <div>
    <div class="card card-custom gutter-b">
      <div class="card-header border-1 py-5">
        <h3 class="card-title align-items-start flex-column">
          <span class="card-label font-weight-bolder text-dark">Prescriptions</span>
        </h3>
      </div>
      <patient-history-modal :display-prompt="displayPrompt" />
      <!--end::Header-->
      <div class="card-body card-header-tabs-line">
        <a
          v-b-tooltip.hover
          title="View Past Prescriptions"
          @click="showModal"
          href="#"
          class="btn btn-icon btn-light-primary pulse pulse-primary mb-4"
        >
          <i class="flaticon2-document"></i>
          <span class="pulse-ring"></span>
        </a>
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
              <b-tab title="Items" lazy>
                <items />
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
import Items from '@/view/pages/nhis/page/tabs/Items.vue';
import DiagnosisAccordion from '@/view/components/accordion/DiagnosisAccordion.vue';
import Medications from '@/view/pages/nhis/page/tabs/Medications.vue';
import Radiology from '@/view/pages/nhis/page/tabs/Radiology.vue';
import Services from '@/view/pages/nhis/page/tabs/Services.vue';
import PatientHistoryModal from '@/view/pages/nhis/components/PatientHistoryModal.vue';

export default {
  data: () => ({
    tabs: ['Tests', 'Drugs', 'Items', 'Radiology', 'Services'],
    displayPrompt: false,
  }),
  components: {
    PatientHistoryModal,
    Services,
    Radiology,
    Medications,
    DiagnosisAccordion,
    Tests,
    TabsSkeleton,
    Items,
  },
  computed: {
    visit() {
      return this.$store.state.visit.visit;
    },
  },
  methods: {
    hideModal() {
      this.displayPrompt = false;
    },

    showModal() {
      this.displayPrompt = true;
    },
  },
  created() {
    this.$store.dispatch('visit/fetchVisit', this.$route.params.id).then(response => {
      const res = response.data.data;
      this.$store.dispatch('patient/setCurrentPatient', { ...res.insurance, ...res.patient });
    });
  },
};
</script>

<style scoped></style>
