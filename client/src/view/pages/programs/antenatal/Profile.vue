<template>
  <div>
    <div class="card card-custom gutter-b">
      <div class="card-body card-header-tabs-line">
        <div class="card-toolbar">
          <div class="example">
            <b-tabs content-class="mt-3">
              <b-tab title="Information">
                <information />
              </b-tab>
              <b-tab title="Previous Pregnancies" lazy>
                <previous-pregnancy />
              </b-tab>
              <b-tab title="Triages" lazy>
                <triages />
              </b-tab>
              <b-tab title="Medications" lazy>
                <medications />
              </b-tab>
              <b-tab title="Items" lazy>
                <additional-items />
              </b-tab>
              <b-tab title="Tests" lazy>
                <tests />
              </b-tab>
              <b-tab title="Radiology" lazy>
                <radiology />
              </b-tab>
              <b-tab title="Clinical Notes" lazy>
                <clinical-notes />
              </b-tab>
              <b-tab title="Delivery" lazy>
                <delivery />
              </b-tab>
              <b-tab title="Postnatal" lazy>
                <postnatal />
              </b-tab>
            </b-tabs>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Information from '@/view/pages/programs/antenatal/components/profile/Information.vue';
import PreviousPregnancy from '@/view/pages/programs/antenatal/components/profile/PreviousPregnancy.vue';
import Triages from '@/view/pages/programs/antenatal/components/profile/Triages.vue';
import Medications from '@/view/pages/programs/antenatal/components/profile/Medications.vue';
import Tests from '@/view/pages/programs/antenatal/components/profile/Tests.vue';
import Radiology from '@/view/pages/programs/antenatal/components/profile/Radiology.vue';
import ClinicalNotes from '@/view/pages/programs/antenatal/components/profile/ClinicalNotes.vue';
import Delivery from '@/view/pages/programs/antenatal/components/profile/Delivery.vue';
import Postnatal from '@/view/pages/programs/antenatal/components/profile/Postnatal.vue';
import AdditionalItems from '@/view/pages/programs/antenatal/components/profile/AdditionalItems.vue';

export default {
  components: {
    AdditionalItems,
    Postnatal,
    Delivery,
    ClinicalNotes,
    Radiology,
    Tests,
    Medications,
    Triages,
    PreviousPregnancy,
    Information,
  },
};
</script>
<style scoped></style>
