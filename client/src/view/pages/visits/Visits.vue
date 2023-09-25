<template>
  <!--begin::Card-->
  <div class="card card-custom gutter-b">
    <!--begin::Header-->
    <div class="card-header py-5">
      <h3 class="card-title align-items-start flex-column">
        <span class="card-label font-weight-bolder text-dark">Visits</span>
      </h3>
      <div class="card-toolbar">
        <router-link to="#" class="btn btn-primary font-weight-bolder font-size-sm">
          <add-icon /> Create Visit
        </router-link>
      </div>
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
            <visit-type type="Antenatal" />
          </b-tab>

          <b-tab lazy>
            <template v-slot:title>
              <strong>IPD</strong>
            </template>
            <visit-type type="IPD" />
          </b-tab>

          <b-tab lazy>
            <template v-slot:title>
              <strong>OPD</strong>
            </template>
            <visit-type type="OPD" />
          </b-tab>

          <b-tab lazy>
            <template v-slot:title>
              <strong>All</strong>
            </template>
            <visit-type type="Antenatal" />
          </b-tab>
        </b-tabs>
      </div>
      <!--end::Example-->
    </div>
  </div>
  <!--end::Card-->
</template>

<script>
import Active from './components/Active.vue';
import VisitType from '@/view/pages/visits/components/VisitType.vue';
import AddIcon from '@/assets/icons/AddIcon.vue';
export default {
  components: {
    AddIcon,
    VisitType,
    Active,
  },
};
</script>

<style></style>