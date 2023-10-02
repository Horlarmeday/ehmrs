<template>
  <!--begin::Card-->
  <div class="card card-custom gutter-b">
    <!--begin::Header-->
    <div class="card-header py-5">
      <h3 class="card-title align-items-start flex-column">
        <span class="card-label font-weight-bolder text-dark">Visits</span>
      </h3>
    </div>
    <!--end::Header-->
    <div class="card-body">
      <!--begin::Example-->
      <div class="example">
        <b-tabs content-class="mt-3">
          <b-tab>
            <template v-slot:title>
              <strong>Active</strong>
            </template>
            <active />
          </b-tab>

          <b-tab lazy>
            <template v-slot:title>
              <strong>Antenatal</strong>
            </template>
            <visit-category category="Antenatal" />
          </b-tab>

          <b-tab lazy>
            <template v-slot:title>
              <strong>IPD</strong>
            </template>
            <visit-category category="Inpatient" />
          </b-tab>

          <b-tab lazy>
            <template v-slot:title>
              <strong>OPD</strong>
            </template>
            <visit-category category="Outpatient" />
          </b-tab>

          <b-tab lazy>
            <template v-slot:title>
              <strong>All</strong>
            </template>
            <visit-category category="Antenatal" />
          </b-tab>
        </b-tabs>
      </div>
      <!--end::Example-->
    </div>
  </div>
  <!--end::Card-->
</template>

<script>
import Active from '../components/Active.vue';
import VisitCategory from '@/view/pages/visits/components/VisitCategory.vue';
export default {
  components: {
    VisitCategory,
    Active,
  },
};
</script>

<style></style>
