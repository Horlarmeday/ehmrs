<template>
  <b-popover :show="activePrompt" :target="target" triggers="click blur">
    <b-button @click="onClose" class="close text-danger" aria-label="Close">
      <span class="d-inline-block" aria-hidden="true">&times;</span>
    </b-button>
    <table class="table table-sm">
      <tbody>
        <tr>
          <th scope="row">Pulse</th>
          <td>
            <span>{{ triage.pulse || '-' }}</span>
          </td>
        </tr>
        <tr>
          <th scope="row">Respiration</th>
          <td>
            <span>{{ triage.respiration || '-' }}</span>
          </td>
        </tr>
        <tr>
          <th scope="row">Heart Rate</th>
          <td>
            <span>{{ triage.heart_rate || '-' }}</span>
          </td>
        </tr>
        <tr>
          <th scope="row">MUAC</th>
          <td>
            <span>{{ triage.muac || '-' }}</span>
          </td>
        </tr>
        <tr>
          <th scope="row">SPO2</th>
          <td>
            <span>{{ triage.spo2 || '-' }}</span>
          </td>
        </tr>
        <tr>
          <th scope="row">RVS</th>
          <td>
            <span>{{ triage.rvs || '-' }}</span>
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
    triage: {
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
