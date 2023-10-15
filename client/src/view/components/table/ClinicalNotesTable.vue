<template>
  <div>
    <div class="table-responsive">
      <table class="table table-sm">
        <thead class="thead-light">
          <tr class="text-uppercase">
            <th scope="col">Notes</th>
            <th scope="col">Added By</th>
            <th scope="col">Date Requested</th>
            <th scope="col"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="notes.length === 0">
            <td colspan="9" align="center" class="text-muted">No Data</td>
          </tr>
          <tr v-for="note in notes" :key="note.id">
            <td>
              <span>{{ note.notes }}</span>
            </td>
            <td>
              <span>
                {{ note.staff.fullname }}
              </span>
            </td>
            <td>
              <span>
                {{ note.createdAt | dayjs('ddd, MMM Do YYYY, h:mma') }}
              </span>
            </td>
            <td>
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
  </div>
</template>
<script>
import EditIcon from '@/assets/icons/EditIcon.vue';

export default {
  components: { EditIcon },
  props: {
    notes: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
  methods: {
    editData(note) {
      this.$emit('getClinicalNote', note);
    },
  },
};
</script>

<style scoped></style>
