<template>
  <div class="table-responsive">
    <table class="table table-sm">
      <thead class="thead-light">
        <tr class="text-uppercase">
          <th scope="col">Complaint Note</th>
          <th scope="col">Treatment Plan</th>
          <th scope="col">Physical Examination</th>
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
            <a :id="popOverId" @click="viewPopover(history)" href="#"
              ><i class="icon-xl text-primary la la-eye"></i
            ></a>
          </td>
        </tr>
      </tbody>
    </table>
    <history-modal :display-prompt="displayPrompt" @closeModal="hideModal" :history="history" />
  </div>
</template>
<script>
import HistoryModal from '@/view/components/modal/HistoryModal.vue';

export default {
  components: { HistoryModal },
  props: {
    histories: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
  data: () => ({
    displayPrompt: false,
    popOverId: 'popover-reactive-73',
    history: {},
  }),
  methods: {
    viewPopover(history) {
      this.history = history;
      this.displayPrompt = true;
    },
    hideModal() {
      this.displayPrompt = false;
    },
  },
};
</script>

<style scoped></style>
