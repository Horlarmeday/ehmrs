<template>
  <b-popover :show="activePrompt" :target="target" triggers="click blur">
    <b-button @click="onClose" class="close text-danger" aria-label="Close">
      <span class="d-inline-block" aria-hidden="true">&times;</span>
    </b-button>
    <table class="table table-sm">
      <tbody>
        <tr>
          <th scope="row">CVS</th>
          <td>
            <span>{{ history.cvs || '-' }}</span>
          </td>
        </tr>
        <tr>
          <th scope="row">Chest</th>
          <td>
            <span>{{ history.chest || '-' }}</span>
          </td>
        </tr>
        <tr>
          <th scope="row">Abdomen</th>
          <td>
            <span>{{ history.abdomen || '-' }}</span>
          </td>
        </tr>
        <tr>
          <th scope="row">MSS</th>
          <td>
            <span>{{ history.mss || '-' }}</span>
          </td>
        </tr>
        <tr>
          <th scope="row">Other</th>
          <td>
            <span>{{ history.other_examination || '-' }}</span>
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
    history: {
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
