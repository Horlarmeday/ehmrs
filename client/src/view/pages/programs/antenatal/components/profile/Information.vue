<template>
  <div v-if="antenatal">
    <div class="container bv-example-row">
      <div class="row">
        <div class="col-3">
          <div class="col d-flex flex-column flex-root">
            <span class="font-weight-bolder mb-2">PATIENT NAME</span>
            <span class="opacity-70">{{ antenatal?.patient?.fullname }}</span>
          </div>
        </div>
        <div class="col-3">
          <div class="col d-flex flex-column flex-root">
            <span class="font-weight-bolder mb-2">ANTENATAL NUMBER</span>
            <span class="opacity-70">{{ antenatal?.antenatal_number || '--' }}</span>
          </div>
        </div>
        <div class="col-3">
          <div class="col d-flex flex-column flex-root">
            <span class="font-weight-bolder mb-2">PARITY AND GRAVIDA</span>
            <span class="opacity-70"
              >{{ antenatal.parity || '--' }} & {{ antenatal.gravida || '--' }}</span
            >
          </div>
        </div>
        <div class="col-3 mb-lg-5">
          <div class="col d-flex flex-column flex-root">
            <span class="font-weight-bolder mb-2">OCCUPATION</span>
            <span class="opacity-70">{{ antenatal?.patient?.occupation || '--' }}</span>
          </div>
        </div>
        <div class="col-3">
          <div class="col d-flex flex-column flex-root">
            <span class="font-weight-bolder mb-2">FAMILY HISTORY</span>
            <span v-if="antenatal.family_history?.length" class="opacity-70">
              <span v-for="(hist, i) in antenatal.family_history" :key="i">
                {{ hist || '--' }}
              </span>
            </span>
            <span>--</span>
          </div>
        </div>
        <div class="col-3">
          <div class="col d-flex flex-column flex-root">
            <span class="font-weight-bolder mb-2">FAMILY HISTORY FOR WHO</span>
            <span class="opacity-70">{{ antenatal.for_whom || '--' }}</span>
          </div>
        </div>
        <div class="col-3">
          <div class="col d-flex flex-column flex-root">
            <span class="font-weight-bolder mb-2">MEDICAL HISTORY</span>
            <span class="opacity-70">{{ antenatal.medical_history || '--' }}</span>
          </div>
        </div>
        <div class="col-3 mb-lg-5">
          <div class="col d-flex flex-column flex-root">
            <span class="font-weight-bolder mb-2">BLOOD TRANSFUSION HISTORY</span>
            <span class="opacity-70">{{ antenatal.blood_transfusion_history || '--' }}</span>
          </div>
        </div>
        <div class="col-3">
          <div class="col d-flex flex-column flex-root">
            <span class="font-weight-bolder mb-2">OBSTETRIC HISTORY</span>
            <span class="opacity-70">{{ antenatal.obstetric_history || '--' }}</span>
          </div>
        </div>
        <div class="col-3">
          <div class="col d-flex flex-column flex-root">
            <span class="font-weight-bolder mb-2">SURGICAL HISTORY</span>
            <span class="opacity-70">{{ antenatal.surgical_history || '--' }}</span>
          </div>
        </div>
        <div class="col-3">
          <div class="col d-flex flex-column flex-root">
            <span class="font-weight-bolder mb-2">LMP</span>
            <span class="opacity-70">{{
              antenatal.last_menses_period | dayjs('MMMM D, YYYY')
            }}</span>
          </div>
        </div>
        <div class="col-3 mb-lg-5">
          <div class="col d-flex flex-column flex-root">
            <span class="font-weight-bolder mb-2">EDD</span>
            <span class="opacity-70">{{
              antenatal.estimated_delivery_date | dayjs('MMMM D, YYYY')
            }}</span>
          </div>
        </div>
        <div class="col-3">
          <div class="col d-flex flex-column flex-root">
            <span class="font-weight-bolder mb-2">ECC</span>
            <span class="opacity-70">{{
              antenatal.estimated_concept_time | dayjs('MMMM D, YYYY')
            }}</span>
          </div>
        </div>
        <div class="col-3">
          <div class="col d-flex flex-column flex-root">
            <span class="font-weight-bolder mb-2">NEXT OF KIN NAME</span>
            <span class="opacity-70">{{ antenatal?.patient?.next_of_kin_name || '--' }}</span>
          </div>
        </div>
        <div class="col-3">
          <div class="col d-flex flex-column flex-root">
            <span class="font-weight-bolder mb-2">NEXT OF KIN PHONE</span>
            <span class="opacity-70">{{ antenatal?.patient?.next_of_kin_phone || '--' }}</span>
          </div>
        </div>
        <div class="col-3 mb-lg-5">
          <div class="col d-flex flex-column flex-root">
            <span class="font-weight-bolder mb-2">NEXT OF KIN ADDRESS</span>
            <span class="opacity-70">{{ antenatal?.patient?.next_of_kin_address || '--' }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else>
    <DefaultSkeleton />
  </div>
</template>

<script>
import DefaultSkeleton from '@/utils/DefaultSkeleton.vue';

export default {
  components: { DefaultSkeleton },
  computed: {
    antenatal() {
      return this.$store.state.antenatal.antenatal;
    },
  },

  created() {
    this.$store.dispatch('antenatal/fetchOneAntenatalAccount', this.$route.params.id);
  },
};
</script>

<style scoped></style>
