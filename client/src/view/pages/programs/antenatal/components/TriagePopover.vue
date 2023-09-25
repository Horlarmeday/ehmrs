<template>
  <b-popover :show="activePrompt" :target="target" triggers="click blur">
    <b-button @click="onClose" class="close text-danger" aria-label="Close">
      <span class="d-inline-block" aria-hidden="true">&times;</span>
    </b-button>
    <table class="table table-sm">
      <tbody>
        <tr>
          <th scope="row">Body Mass Index</th>
          <td>
            <span>{{ triage.body_mass_index }}</span>
          </td>
        </tr>
        <tr>
          <th scope="row">Urinalysis Protein</th>
          <td>
            <span>{{ triage.urinalysis_protein }}</span>
          </td>
        </tr>
        <tr>
          <th scope="row">Urinalysis Glucose</th>
          <td>
            <span>{{ triage.urinalysis_glucose }}</span>
          </td>
        </tr>
        <tr>
          <th scope="row">Oedema</th>
          <td>
            <span>{{ triage.oedema }}</span>
          </td>
        </tr>
        <tr>
          <th scope="row">Presentation</th>
          <td>
            <span>{{ triage.presentation }}</span>
          </td>
        </tr>
        <tr>
          <th scope="row">Foetal Heart Rate</th>
          <td>
            <span>{{ triage.foetal_heart_rate }}</span>
          </td>
        </tr>
        <tr>
          <th scope="row">Fundal Height</th>
          <td>
            <span>{{ triage.fundal_height }}</span>
          </td>
        </tr>
        <tr>
          <th scope="row">RVST</th>
          <td>
            <span>{{ triage.rvst }}</span>
          </td>
        </tr>
        <tr>
          <th scope="row">Comments</th>
          <td>
            <span>{{ triage.comments }}</span>
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
