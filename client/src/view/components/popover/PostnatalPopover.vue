<template>
  <b-popover size="xl" :show="activePrompt" :target="target" triggers="click blur">
    <b-button @click="onClose" class="close text-danger" aria-label="Close">
      <span class="d-inline-block" aria-hidden="true">&times;</span>
    </b-button>
    <table class="table table-sm">
      <tbody>
        <tr>
          <th scope="row">General Condition</th>
          <td>
            <span>{{ postnatal.general_condition || '-' }}</span>
          </td>
        </tr>
        <tr>
          <th scope="row">Involution of Uterus</th>
          <td>
            <span>{{ postnatal.involution_of_uterus || '-' }}</span>
          </td>
        </tr>
        <tr>
          <th scope="row">Episotomy/Operation Scar</th>
          <td>
            <span>{{ postnatal.episotomy || '-' }}</span>
          </td>
        </tr>
        <tr>
          <th scope="row">Pelvic Examination</th>
          <td>
            <span>{{ postnatal.pelvic_examination || '-' }}</span>
          </td>
        </tr>
        <tr>
          <th scope="row">Pap Smear Date</th>
          <td>
            <span>{{ postnatal.pap_smear_date | dayjs('DD/MM/YYYY') }}</span>
          </td>
        </tr>
        <tr>
          <th scope="row">Result</th>
          <td>
            <span>{{ postnatal.result || '-' }}</span>
          </td>
        </tr>
        <tr>
          <th scope="row">PCV</th>
          <td>
            <span>{{ postnatal.pcv || '-' }}</span>
          </td>
        </tr>
        <tr>
          <th scope="row">Baby's Condition</th>
          <td>
            <span>{{ postnatal.baby_condition || '-' }}</span>
          </td>
        </tr>
        <tr>
          <th scope="row">Reflexes</th>
          <td>
            <span>{{ postnatal.reflexes || '-' }}</span>
          </td>
        </tr>
        <tr>
          <th scope="row">Feeding</th>
          <td>
            <span>{{ postnatal.feeding || '-' }}</span>
          </td>
        </tr>
        <tr>
          <th scope="row">Umbilical Cord</th>
          <td>
            <span>{{ postnatal.umbilical_cord || '-' }}</span>
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
    postnatal: {
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
