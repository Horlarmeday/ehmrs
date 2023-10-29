<template>
  <div>
    <!--begin::Card-->
    <div class="card card-custom gutter-b example example-compact">
      <div class="card-header" style="min-height: 50px !important">
        <h3 class="card-title">
          Defaults
        </h3>
      </div>
      <!--begin::Header-->
      <div class="card-header border-0">
        <h3 class="card-title align-items-start flex-column">
          <span class="card-label font-weight-bolder text-dark"></span>
        </h3>
        <div class="card-toolbar">
          <router-link
            to="/settings/defaults/create"
            class="btn btn-primary font-weight-bolder font-size-sm"
          >
            <add-icon /> Add New
          </router-link>
        </div>
      </div>
      <!--end::Header-->

      <!--begin::Body-->
      <div class="card-body pt-0 pb-3">
        <!--begin::Table-->
        <div class="table-responsive">
          <table class="table table-head-custom table-vertical-center table-head-bg">
            <thead>
              <tr class="text-uppercase">
                <th class="pl-5" style="min-width: 150px">Type</th>
                <th style="min-width: 100px">Created By</th>
                <th style="min-width: 160px">Date</th>
                <th class="pr-0 " style="min-width: 150px">action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="defaults.length === 0">
                <td colspan="9" align="center" class="text-muted">No Data</td>
              </tr>
              <tr v-for="adminDefault in defaults" :key="adminDefault.id">
                <td class="pl-5">
                  <router-link
                    :to="`/settings/defaults/${adminDefault.id}?table=${adminDefault.type}`"
                    class="text-dark-75 font-weight-bolder d-block font-size-lg"
                  >
                    {{ defaultTypes[adminDefault.type] }}
                  </router-link>
                </td>
                <td>
                  <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                    {{ adminDefault?.staff?.fullname }}
                  </span>
                </td>
                <td class="">
                  <span class="text-dark-75 font-weight-bolder d-block font-size-lg">{{
                    adminDefault.createdAt | dayjs('ddd, MMM Do YYYY, h:mma')
                  }}</span>
                </td>
                <td class="pr-0">
                  <router-link to="#" class="btn btn-icon btn-light btn-hover-primary btn-sm mx-3">
                    <edit-icon />
                  </router-link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <!--end::Body-->
    </div>
    <!--end::Card-->
  </div>
</template>

<script>
import EditIcon from '@/assets/icons/EditIcon.vue';
import AddIcon from '@/assets/icons/AddIcon.vue';
export default {
  data() {
    return {
      search: '',
      currentPage: 1,
      itemsPerPage: 10,
      displayPrompt: false,
      defaultTypes: {
        ADMISSION_ITEMS: 'Admission Items',
        ANC_ROUTINE_TESTS: 'Antenatal Routine Tests',
        ANC_ROUTINE_DRUGS: 'Antenatal Routine Drugs',
        INJECTION_ITEMS: 'Injection Items',
        OPERATION_ITEMS: 'Theater Operation Items',
      },
    };
  },
  components: {
    EditIcon,
    AddIcon,
  },

  computed: {
    defaults() {
      return this.$store.state.model.defaults;
    },
  },

  methods: {},
  created() {
    this.$store
      .dispatch('model/fetchDefaults')
      .then(res => localStorage.setItem('defaults', JSON.stringify(res.data.data)));
  },
};
</script>

<style></style>
