<template>
  <!--begin::Advance Table Widget 1-->
  <div class="card card-custom gutter-b">
    <create-route :displayPrompt="displayPrompt" @closeModal="hideModal" :data="routeToEdit" />
    <!--begin::Header-->
    <div class="card-header border-0 py-5">
      <h3 class="card-title align-items-start flex-column">
        <span class="card-label font-weight-bolder text-dark">Routes of Administration</span>
      </h3>
      <div class="card-toolbar">
        <a href="#" class="btn btn-primary font-weight-bolder font-size-sm" @click="addNewData">
          <add-icon /> Add New
        </a>
      </div>
    </div>
    <!--end::Header-->

    <!--begin::Body-->
    <div class="card-body py-0">
      <!--begin::Table-->
      <div class="table-responsive">
        <table class="table table-head-custom table-vertical-center" id="kt_advance_table_widget_1">
          <thead>
            <tr class="text-left">
              <th class="pr-0" style="width: 250px">Name</th>
              <th class="pr-0" style="width: 350px">Dosage Form</th>
              <th style="min-width: 150px">Date Created</th>
              <th class="pr-0 text-right" style="min-width: 150px">action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="routes.length == 0">
              <td colspan="9" align="center" class="text-muted">No Data</td>
            </tr>
            <tr v-for="route in routes" :key="route.id">
              <td class="pr-0">
                <a
                  href="#"
                  class="text-dark-75 font-weight-bolder text-hover-primary mb-1 font-size-lg"
                  >{{ route.name }}</a
                >
              </td>
              <td>
                <a
                  href="#"
                  class="text-dark-75 font-weight-bolder text-hover-primary mb-1 font-size-lg"
                  >{{ route.dosage_form.name }}</a
                >
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                  {{ route.createdAt | dayjs('ddd, MMM Do YYYY, h:mma') }}
                </span>
              </td>
              <td class="pr-0 text-right">
                <a
                  href="#"
                  class="btn btn-icon btn-light btn-hover-primary btn-sm mx-3"
                  @click.stop="editData(route)"
                >
                  <edit-icon />
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!--end::Table-->
    </div>
    <!--end::Body-->
  </div>
  <!--end::Advance Table Widget 1-->
</template>

<script>
import CreateRoute from './create/CreateRouteOfAdministration.vue';
import EditIcon from '@/assets/icons/EditIcon.vue';
import AddIcon from '@/assets/icons/AddIcon.vue';
export default {
  data() {
    return {
      displayPrompt: false,
      routeToEdit: {},
      currentPage: 1,
      itemsPerPage: 10,
    };
  },
  components: {
    CreateRoute,
    EditIcon,
    AddIcon,
  },
  computed: {
    routes() {
      return this.$store.state.pharmacy.routes;
    },
    perPage() {
      return this.routes.length;
    },
  },
  methods: {
    addNewData() {
      this.routeToEdit = {};
      this.displayPrompt = true;
    },

    hideModal() {
      this.displayPrompt = false;
    },

    editData(measurement) {
      this.routeToEdit = measurement;
      this.displayPrompt = true;
    },
  },
  created() {
    this.$store.dispatch('pharmacy/fetchRoutes');
  },
};
</script>

<style></style>
