<template>
  <b-modal v-model="activePrompt" hide-footer title="Triage" size="xl">
    <table class="table table-sm">
      <tbody>
        <tr>
          <th scope="row">Body Mass Index</th>
          <td>
            <span>{{ triage.body_mass_index || '-' }}</span>
          </td>
        </tr>
        <tr>
          <th scope="row">Urinalysis Protein</th>
          <td>
            <span>{{ triage.urinalysis_protein || '-' }}</span>
          </td>
        </tr>
        <tr>
          <th scope="row">Urinalysis Glucose</th>
          <td>
            <span>{{ triage.urinalysis_glucose || '-' }}</span>
          </td>
        </tr>
        <tr>
          <th scope="row">Oedema</th>
          <td>
            <span>{{ triage.oedema || '-' }}</span>
          </td>
        </tr>
        <tr>
          <th scope="row">Presentation</th>
          <td>
            <span>{{ triage.presentation || '-' }}</span>
          </td>
        </tr>
        <tr>
          <th scope="row">Foetal Heart Rate</th>
          <td>
            <span>{{ triage.foetal_heart_rate || '-' }}</span>
          </td>
        </tr>
        <tr>
          <th scope="row">Fundal Height</th>
          <td>
            <span>{{ triage.fundal_height || '-' }}</span>
          </td>
        </tr>
        <tr>
          <th scope="row">RVST</th>
          <td>
            <span>{{ triage.rvst || '-' }}</span>
          </td>
        </tr>
        <tr>
          <th scope="row">Comments</th>
          <td>
            <span>{{ triage.comments || '-' }}</span>
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
