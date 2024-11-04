<template>
  <div>
    <div class="table-responsive">
      <table class="table table-sm">
        <thead class="thead-light">
          <tr class="text-uppercase">
            <th scope="col">Diagnosis</th>
            <th scope="col">Code</th>
            <th scope="col">Type</th>
            <th scope="col">Certainty</th>
            <th scope="col">Notes</th>
            <th scope="col">Added By</th>
            <th scope="col">Date Added</th>
            <th scope="col"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!diagnoses?.length">
            <td colspan="9" align="center" class="text-muted">No Data</td>
          </tr>
          <tr v-for="(diagnosis, i) in diagnoses" :key="i">
            <td>{{ diagnosis.diagnosis.diagnosis }}</td>
            <td>{{ diagnosis.diagnosis.code }}</td>
            <td>
              <span :class="getDiagnosisTypeColor(diagnosis.type)">{{ diagnosis.type }}</span>
            </td>
            <td>{{ diagnosis.certainty }}</td>
            <td>{{ diagnosis.notes || '-' }}</td>
            <td>{{ diagnosis.staff.fullname }}</td>
            <td>{{ diagnosis.createdAt | dayjs('DD/MM/YYYY, h:mma') }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <pagination
      :total-pages="pages"
      :total="queriedItems"
      :per-page="perPage"
      :current-page="currentPage"
      @pagechanged="onPageChange"
      @changepagecount="handlePageCount"
    />
  </div>
</template>
<script>
import Pagination from '@/utils/Pagination.vue';

export default {
  components: { Pagination },
  data: () => ({
    currentPage: 1,
    itemsPerPage: 10,
  }),
  created() {
    this.fetchDiagnoses({
      itemsPerPage: this.itemsPerPage,
      currentPage: this.currentPage,
    });
  },
  methods: {
    handlePageCount(count) {
      this.itemsPerPage = count;
      this.fetchDiagnoses({
        itemsPerPage: count,
      });
    },

    onPageChange(page) {
      this.currentPage = page;
      this.fetchDiagnoses({ itemsPerPage: this.itemsPerPage });
    },

    fetchDiagnoses({ itemsPerPage = 10 }) {
      this.$store.dispatch('consultation/fetchDiagnoses', {
        currentPage: this.currentPage,
        itemsPerPage,
        filter: { patient_id: this.$route.params.id },
      });
    },

    getDiagnosisTypeColor(type) {
      if (type === 'ICD10') return 'label label-inline label-light-primary font-weight-bold';
      return 'label label-inline label-light-danger font-weight-bold';
    },
  },
  computed: {
    diagnoses() {
      return this.$store.state.consultation.diagnosis || [];
    },
    queriedItems() {
      return this.$store.state.consultation.totalDiagnosis || 0;
    },
    pages() {
      return this.$store.state.consultation.totalDiagnosisPages;
    },
    perPage() {
      return this.diagnoses.length;
    },
  },
};
</script>

<style scoped></style>
