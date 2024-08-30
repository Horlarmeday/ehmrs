<template>
  <div>
    <div class="table-responsive">
      <table class="table table-sm">
        <thead class="thead-light">
          <tr class="text-uppercase">
            <th scope="col">Complaint Note</th>
            <th scope="col">History Note</th>
            <th scope="col">Examination</th>
            <th scope="col">Added By</th>
            <th scope="col">Date Added</th>
            <th scope="col"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!histories?.length">
            <td colspan="9" align="center" class="text-muted">No Data</td>
          </tr>
          <tr v-for="(history, i) in histories" :key="i">
            <td>{{ history.complaint_note || '-' }}</td>
            <td>{{ history.history_note || '-' }}</td>
            <td>{{ history.examination_note || '-' }}</td>
            <td>{{ history?.staff?.fullname || '-' }}</td>
            <td>{{ history.createdAt | dayjs('DD/MM/YYYY, h:mma') }}</td>
            <td>
              <a :id="popOverId" @click="viewModal(history)" href="#"
                ><i class="icon-xl text-primary la la-eye"></i
              ></a>
            </td>
          </tr>
        </tbody>
      </table>
      <history-modal :display-prompt="displayPrompt" @closeModal="hideModal" :history="history" />
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
import HistoryModal from '@/view/components/modal/HistoryModal.vue';

export default {
  components: { HistoryModal, Pagination },
  data: () => ({
    showPopover: false,
    popOverId: 'popover-reactive-73',
    history: {},
    currentPage: 1,
    itemsPerPage: 10,
    displayPrompt: false,
  }),
  computed: {
    histories() {
      return this.$store.state.consultation.patientHistories;
    },
    queriedItems() {
      return this.$store.state.consultation.totalPatientHistories || 0;
    },
    pages() {
      return this.$store.state.consultation.totalPatientHistoryPages;
    },
    perPage() {
      return this.histories.length;
    },
  },
  methods: {
    viewModal(history) {
      this.history = history;
      this.displayPrompt = true;
    },
    hideModal() {
      this.displayPrompt = false;
    },

    handlePageCount(count) {
      this.itemsPerPage = count;
      this.fetchHistories({
        itemsPerPage: count,
      });
    },

    onPageChange(page) {
      this.currentPage = page;
      this.fetchHistories({ itemsPerPage: this.itemsPerPage });
    },

    fetchHistories({ itemsPerPage = 10 }) {
      this.$store.dispatch('consultation/fetchHistories', {
        currentPage: this.currentPage,
        itemsPerPage,
        filter: { patient_id: this.$route.params.id },
      });
    },
  },
  created() {
    this.fetchHistories({ itemsPerPage: this.itemsPerPage });
  },
};
</script>

<style scoped></style>
