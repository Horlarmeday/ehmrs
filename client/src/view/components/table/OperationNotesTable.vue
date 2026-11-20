<template>
  <div class="table-responsive">
    <table class="table table-sm">
      <thead class="thead-light">
        <tr class="text-uppercase">
          <th scope="col">Surgery</th>
          <th scope="col">Anaesthesia</th>
          <th scope="col">Findings</th>
          <th scope="col">Surgeon</th>
          <th scope="col">Scrub Nurse</th>
          <th scope="col">Date Added</th>
          <th scope="col">Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="!operationNotes?.length">
          <td colspan="9" align="center" class="text-muted">No Data</td>
        </tr>
        <tr v-for="note in operationNotes" :key="note.id">
          <td>{{ note.surgery }}</td>
          <td>{{ note.anaesthesia }}</td>
          <td>{{ note.findings }}</td>
          <td>{{ note?.surgeon?.fullname }}</td>
          <td>{{ note?.scrub_nurse?.fullname }}</td>
          <td>{{ note.createdAt | dayjs('DD/MM/YYYY, h:mma') }}</td>
          <td>
            <a :id="popoverTargetId(note)" @click.prevent="viewPopover(note)" href="#"
              ><i class="icon-xl text-primary la la-eye"></i
            ></a>
          </td>
        </tr>
      </tbody>
    </table>
    <operation-note-popover
      v-if="activeTarget"
      :key="activeTarget"
      :note="note"
      :target="activeTarget"
      :show="showPopover"
      @closePopover="hidePopover"
    />
  </div>
</template>
<script>
import OperationNotePopover from '@/view/components/popover/OperationNotePopover.vue';

export default {
  name: 'OperationNoteTable',
  components: { OperationNotePopover },
  data: () => ({
    showPopover: false,
    activeTarget: null,
    note: {},
  }),
  props: {
    operationNotes: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
  methods: {
    popoverTargetId(note) {
      return `operation-note-${this._uid}-${note.id}`;
    },
    viewPopover(note) {
      this.note = note;
      this.activeTarget = this.popoverTargetId(note);
      this.showPopover = true;
    },
    hidePopover() {
      this.showPopover = false;
      this.activeTarget = null;
    },
  },
};
</script>

<style scoped></style>
