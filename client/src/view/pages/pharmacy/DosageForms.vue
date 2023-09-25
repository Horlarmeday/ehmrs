<template>
  <!--begin::Advance Table Widget 1-->
  <div class="card card-custom gutter-b">
    <create-dosage-form
      :displayPrompt="displayPrompt"
      @closeModal="hideModal"
      :data="dosageToEdit"
    />
    <!--begin::Header-->
    <div class="card-header border-0 py-5">
      <h3 class="card-title align-items-start flex-column">
        <span class="card-label font-weight-bolder text-dark"
          >Dosage Forms</span
        >
      </h3>
      <div class="card-toolbar">
        <a
          href="#"
          class="btn btn-success font-weight-bolder font-size-sm"
          @click="addNewData"
        >
          <add-icon /> Add New
        </a>
      </div>
    </div>
    <!--end::Header-->

    <!--begin::Body-->
    <div class="card-body py-0">
      <!--begin::Table-->
      <div class="table-responsive">
        <table
          class="table table-head-custom table-vertical-center"
          id="kt_advance_table_widget_1"
        >
          <thead>
            <tr class="text-left">
              <th class="pr-0" style="width: 450px">Name</th>
              <th style="min-width: 150px">Date Created</th>
              <th class="pr-0 text-right" style="min-width: 150px">action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="dosageForms.length === 0">
              <td colspan="9" align="center" class="text-muted">No Data</td>
            </tr>
            <tr v-for="dosage in dosageForms" :key="dosage.id">
              <td class="pr-0">
                <a
                  href="#"
                  class="text-dark-75 font-weight-bolder text-hover-primary mb-1 font-size-lg"
                  >{{ dosage.name }}</a
                >
              </td>
              <td>
                <span
                  class="text-dark-75 font-weight-bolder d-block font-size-lg"
                >
                  {{ dosage.createdAt | moment("ddd, MMM Do YYYY, h:mma") }}
                </span>
              </td>
              <td class="pr-0 text-right">
                <a
                  href="#"
                  class="btn btn-icon btn-light btn-hover-primary btn-sm mx-3"
                  @click.stop="editData(dosage)"
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
import CreateDosageForm from "./create/CreateDosageForm.vue";
import EditIcon from "../../../assets/icons/EditIcon.vue";
import AddIcon from "../../../assets/icons/AddIcon.vue";
export default {
  data() {
    return {
      displayPrompt: false,
      dosageToEdit: {},
      currentPage: 1,
      itemsPerPage: 10
    };
  },
  components: {
    CreateDosageForm,
    EditIcon,
    AddIcon
  },
  computed: {
    dosageForms() {
      return this.$store.state.pharmacy.dosageForms;
    },
    perPage() {
      return this.dosageForms.length;
    }
  },
  methods: {
    addNewData() {
      this.dosageToEdit = {};
      this.displayPrompt = true;
    },

    hideModal() {
      this.displayPrompt = false;
    },

    editData(dosage) {
      this.dosageToEdit = dosage;
      this.displayPrompt = true;
    }
  },
  created() {
    this.$store.dispatch("pharmacy/fetchDosageForms");
  }
};
</script>

<style></style>
