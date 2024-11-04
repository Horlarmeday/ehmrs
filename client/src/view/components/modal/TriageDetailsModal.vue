<template>
  <b-modal v-model="activePrompt" hide-footer title="Triage" size="xl">
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
  </b-modal>
</template>

<script>
export default {
  props: {
    displayPrompt: {
      type: Boolean,
      required: true,
    },
    triage: {
      type: Object,
      required: true,
      default: () => {},
    },
  },
  computed: {
    activePrompt: {
      get() {
        return this.displayPrompt;
      },
      set(value) {
        this.$emit('closeModal', value);
      },
    },
  },
};
</script>

<style scoped></style>
