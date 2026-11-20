<template>
  <div>
    <table class="table">
      <thead>
        <tr>
          <th scope="col">Surgery</th>
          <th scope="col">Notes</th>
          <th scope="col">Requested By</th>
          <th scope="col">Date</th>
          <th scope="col">Operation Note</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row">{{ surgery?.service?.name }}</th>
          <td>{{ surgery.notes }}</td>
          <td>
            <a href="#">{{ surgery?.staff?.fullname }}</a>
          </td>
          <td>{{ surgery.createdAt | dayjs('ddd, MMM Do YYYY, h:mma') }}</td>
          <td>
            <router-link
              v-b-tooltip.hover
              :title="operationNoteLinkTitle"
              :to="`/surgery/requests/${surgery.visit_id}?surgery=${surgery.id}`"
              class="btn btn-icon btn-light btn-hover-primary btn-sm mx-3"
            >
              <arrow-right-icon />
            </router-link>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="mt-4">
      <h6 class="font-weight-bold mb-3">Operation Notes</h6>
      <default-skeleton v-if="loadingNotes" />
      <operation-notes-table v-else :operation-notes="operationNotes" />
    </div>
  </div>
</template>

<script>
import ArrowRightIcon from '@/assets/icons/ArrowRightIcon.vue';
import OperationNotesTable from '@/view/components/table/OperationNotesTable.vue';
import DefaultSkeleton from '@/utils/DefaultSkeleton.vue';

export default {
  components: { ArrowRightIcon, OperationNotesTable, DefaultSkeleton },
  props: {
    surgery: {
      type: Object,
      required: true,
      default: () => {},
    },
  },
  data: () => ({
    loadingNotes: false,
  }),
  computed: {
    operationNotes() {
      return this.$store.state.surgery.operationNotes;
    },
    operationNoteLinkTitle() {
      return this.operationNotes.length ? 'View / Add Operation Notes' : 'Add Operation Notes';
    },
  },
  methods: {
    fetchOperationNotes() {
      this.loadingNotes = true;
      this.$store
        .dispatch('surgery/fetchOperationNotes', { id: this.surgery.visit_id })
        .finally(() => (this.loadingNotes = false));
    },
  },
  created() {
    this.fetchOperationNotes();
  },
};
</script>

<style scoped></style>
