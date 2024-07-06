<template>
  <div>
    <div class="card card-custom gutter-b">
      <div class="card-body card-header-tabs-line">
        <div class="card-toolbar">
          <div v-if="immunization" class="example">
            <b-tabs content-class="mt-3">
              <b-tab title="At Birth" active>
                <at-birth :at-birth="immunization.at_birth || {}" />
              </b-tab>
              <b-tab title="At 6 Weeks">
                <at6weeks :at6weeks="immunization.at_six_weeks || {}" />
              </b-tab>
              <b-tab title="At 10 Weeks">
                <at10weeks :at10weeks="immunization.at_ten_weeks || {}" />
              </b-tab>
              <b-tab title="At 14 Weeks">
                <at14weeks :at14weeks="immunization.at_fourteen_weeks || {}" />
              </b-tab>
              <b-tab title="At 6 Months">
                <at6months :at6months="immunization.at_six_months || {}" />
              </b-tab>
              <b-tab title="At 9 Months">
                <at9months :at9months="immunization.at_nine_months || {}" />
              </b-tab>
              <b-tab title="At 1 Year">
                <at1year :at1year="immunization.at_one_year || {}" />
              </b-tab>
              <b-tab title="At 15 Months">
                <at15months :at15months="immunization.at_fifteen_months || {}" />
              </b-tab>
              <b-tab title="At 2 Years">
                <at2years :at2years="immunization.at_two_years || {}" />
              </b-tab>
              <b-tab title="Medications">
                <Medication />
              </b-tab>
            </b-tabs>
          </div>
          <TabsSkeleton v-else :tabs="tabs" />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import AtBirth from '@/view/pages/programs/immunization/tabs/Atbirth.vue';
import At6weeks from '@/view/pages/programs/immunization/tabs/At6weeks.vue';
import At10weeks from '@/view/pages/programs/immunization/tabs/At10weeks.vue';
import At14weeks from '@/view/pages/programs/immunization/tabs/At14weeks.vue';
import At6months from '@/view/pages/programs/immunization/tabs/At6months.vue';
import At9months from '@/view/pages/programs/immunization/tabs/At9months.vue';
import At1year from '@/view/pages/programs/immunization/tabs/At1year.vue';
import At15months from '@/view/pages/programs/immunization/tabs/At15months.vue';
import At2years from '@/view/pages/programs/immunization/tabs/At2years.vue';
import TabsSkeleton from '@/view/pages/programs/immunization/components/TabsSkeleton.vue';
import Medication from '@/view/pages/programs/immunization/tabs/Medication.vue';

export default {
  data: () => ({
    tabs: [
      'At Birth',
      'At 6 Weeks',
      'At 10 Weeks',
      'At 14 Weeks',
      'At 6 Months',
      'At 9 Months',
      'At 1 Year',
      'At 15 Months',
      'At 2 Years',
      'Medications',
    ],
  }),
  components: {
    Medication,
    TabsSkeleton,
    At2years,
    At15months,
    At1year,
    At9months,
    At6months,
    At14weeks,
    At10weeks,
    At6weeks,
    AtBirth,
  },
  computed: {
    immunization() {
      return this.$store.state.immunization.immunization;
    },
  },
  created() {
    this.$store
      .dispatch('immunization/fetchOneImmunizationAccount', this.$route.query.immunization)
      .then(response => {
        const res = response.data.data;
        this.$store.dispatch('insurance/fetchPatientDefaultInsurance', res.patient_id);
        this.$store.dispatch('patient/setCurrentPatient', { ...res.insurance, ...res.patient });
      });
  },
};
</script>

<style scoped></style>
