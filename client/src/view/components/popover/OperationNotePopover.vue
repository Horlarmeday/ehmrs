<template>
  <b-popover :show="activePrompt" :target="target" triggers="click blur">
    <b-button @click="onClose" class="close text-danger" aria-label="Close">
      <span class="d-inline-block" aria-hidden="true">&times;</span>
    </b-button>
    <table class="table table-sm">
      <tbody>
        <tr>
          <th scope="row">Anaesthetist</th>
          <td>
            <span>{{ note.anaesthetist?.fullname }}</span>
          </td>
        </tr>
        <tr>
          <th scope="row">Post Operation Order</th>
          <td>
            <span>{{ note.post_operation_order || '-' }}</span>
          </td>
        </tr>
        <tr>
          <th scope="row">Findings</th>
          <td>
            <span>{{ note.findings || '-' }}</span>
          </td>
        </tr>
        <tr>
          <th scope="row">Procedure</th>
          <td>
            <span>{{ note.procedure || '-' }}</span>
          </td>
        </tr>
        <tr>
          <th scope="row">Indications</th>
          <td>
            <span>{{ note.indications || '-' }}</span>
          </td>
        </tr>
        <tr>
          <th scope="row">Assistances</th>
          <td>
            <span v-for="(assist, i) in note?.assistance" :key="i">
              <div>{{ assist.name || '-' }}</div>
            </span>
          </td>
        </tr>
        <tr>
          <th scope="row">Time In</th>
          <td>
            <span>{{ note.time_in | dayjs('YYYY/MM/DD, h:mma') }}</span>
          </td>
        </tr>
        <tr>
          <th scope="row">Time Out</th>
          <td>
            <span>{{ note.time_out | dayjs('YYYY/MM/DD, h:mma') }}</span>
          </td>
        </tr>
      </tbody>
    </table>
  </b-popover>
</template>
<script>
export default {
  props: {
    target: {
      type: String,
      required: true,
    },
    note: {
      type: Object,
      required: true,
      default: () => {},
    },
    show: {
      type: Boolean,
      required: true,
    },
  },
  computed: {
    activePrompt: {
      get() {
        return this.show;
      },
      set(value) {
        this.$emit('closePopover', value);
      },
    },
  },
  methods: {
    onClose() {
      this.$emit('closePopover', false);
    },
  },
};
</script>

<style scoped></style>
