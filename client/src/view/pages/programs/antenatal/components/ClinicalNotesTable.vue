<template>
  <div>
    <!--begin::Table-->
    <div class="table-responsive">
      <table class="table table-head-custom table-vertical-center" id="kt_advance_table_widget_1">
        <thead>
          <tr class="text-left">
            <th class="pr-0" style="width: 550px">Notes</th>
            <th style="min-width: 150px">Created By</th>
            <th style="min-width: 100px">Date Created</th>
            <th class="pr-0 text-right" style="min-width: 150px">action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="clinicalNotes.length === 0">
            <td colspan="9" align="center" class="text-muted">No Data</td>
          </tr>
          <tr v-for="note in clinicalNotes" :key="note.id">
            <td class="pr-0">
              <a
                href="#"
                class="text-dark-75 font-weight-bolder text-hover-primary mb-1 font-size-lg"
                >{{ note.notes }}</a
              >
            </td>
            <td>
              <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                {{ note.staff.fullname }}
              </span>
            </td>
            <td>
              <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                {{ note.createdAt | moment('ddd, MMM Do YYYY, h:mma') }}
              </span>
            </td>
            <td class="pr-0 text-right">
              <a
                href="#"
                class="btn btn-icon btn-light btn-hover-primary btn-sm mx-3"
                @click.stop="editData(note)"
              >
                <edit-icon />
              </a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!--end::Table-->
    <pagination
      :total-pages="pages"
      :total="queriedItems"
      :per-page="perPage"
      :current-page="currentPage"
      @pagechanged="onPageChange"
    />
  </div>
</template>
<script>
import Pagination from '@/utils/Pagination.vue';
import EditIcon from '@/assets/icons/EditIcon.vue';

export default {
  components: { EditIcon, Pagination },
  data: () => ({
    currentPage: 1,
    itemsPerPage: 10,
  }),
  computed: {
    clinicalNotes() {
      return this.$store.state.antenatal.clinicalNotes;
    },
    queriedItems() {
      return this.$store.state.antenatal.totalClinicalNotes || 0;
    },
    pages() {
      return this.$store.state.antenatal.totalClinicalNotesPages;
    },
    perPage() {
      return this.clinicalNotes.length;
    },
  },
  methods: {
    handlePageChange() {
      this.$store.dispatch('antenatal/fetchClinicalNotes', {
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        id: this.$route.query.antenatal,
      });
    },

    onPageChange(page) {
      this.currentPage = page;
      this.handlePageChange();
    },

    fetchClinicalNotes() {
      this.$store.dispatch('antenatal/fetchClinicalNotes', {
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        id: this.$route.query.antenatal,
      });
    },

    editData(note) {
      this.$emit('getClinicalNote', note);
    },
  },
  created() {
    this.fetchClinicalNotes();
  },
};
</script>

<style scoped></style>