<template>
  <b-modal v-model="activePrompt" hide-footer title="History" no-close-on-backdrop size="xl">
    <div class="mb-15">
      <table class="table table-sm">
        <tbody>
          <tr>
            <th scope="row">Additional Complaint</th>
            <td>
              <span>{{ history.additional_complaint || '-' }}</span>
            </td>
          </tr>
          <tr>
            <th scope="row">Respiratory</th>
            <td>
              <span>{{ history.respiratory || '-' }}</span>
            </td>
          </tr>
          <tr>
            <th scope="row">ENT</th>
            <td>
              <span>{{ history.ent || '-' }}</span>
            </td>
          </tr>
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
            <th scope="row">CNS</th>
            <td>
              <span>{{ history.cns || '-' }}</span>
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
    </div>
  </b-modal>
</template>

<script>
export default {
  props: {
    displayPrompt: {
      type: Boolean,
      required: true,
    },
    history: {
      type: Object,
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

<style></style>
