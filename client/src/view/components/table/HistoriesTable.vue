<template>
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
            <a :id="popOverId" @click="viewPopover(history)" href="#"
              ><i class="icon-xl text-primary la la-eye"></i
            ></a>
          </td>
        </tr>
      </tbody>
    </table>
    <history-popover
      :target="popOverId"
      :show="showPopover"
      @closePopover="hidePopover"
      :history="history"
    />
  </div>
</template>
<script>
import HistoryPopover from '@/view/components/popover/HistoryPopover.vue';

export default {
  components: { HistoryPopover },
  props: {
    histories: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
  data: () => ({
    showPopover: false,
    popOverId: 'popover-reactive-73',
    history: {},
  }),
  methods: {
    viewPopover(history) {
      this.history = history;
      this.showPopover = true;
    },
    hidePopover() {
      this.showPopover = false;
    },
  },
};
</script>

<style scoped></style>
