<template>
  <b-popover size="xl" :show="activePrompt" :target="target" triggers="click blur">
    <b-button @click="onClose" class="close text-danger" aria-label="Close">
      <span class="d-inline-block" aria-hidden="true">&times;</span>
    </b-button>
    <table class="table table-sm">
      <tbody>
        <tr v-if="delivery?.time_surgery_ended">
          <th scope="row">Time Patient Left Theater</th>
          <td>
            <span>{{ delivery.time_surgery_ended | dayjs('h:mm A') }}</span>
          </td>
        </tr>
        <tr>
          <th scope="row">Apgar Score at 1min</th>
          <td>
            <span>{{ delivery.apgar_one_min || '-' }}</span>
          </td>
        </tr>
        <tr>
          <th scope="row">Apgar Score at 5min</th>
          <td>
            <span>{{ delivery.apgar_five_min || '-' }}</span>
          </td>
        </tr>
        <tr>
          <th scope="row">Apgar Score at 10min</th>
          <td>
            <span>{{ delivery.apgar_ten_min || '-' }}</span>
          </td>
        </tr>
        <tr>
          <th scope="row">Sex</th>
          <td>
            <span>{{ delivery.sex || '-' }}</span>
          </td>
        </tr>
        <tr>
          <th scope="row">Condition of Baby</th>
          <td>
            <span>{{ delivery.condition_of_baby || '-' }}</span>
          </td>
        </tr>
        <tr>
          <th scope="row">Vitamin A</th>
          <td>
            <span>{{ delivery.vitaminA_IU || '-' }}</span>
          </td>
        </tr>
        <tr>
          <th scope="row">Nevirapine to Baby</th>
          <td>
            <span>{{ delivery.nevirapine || '-' }}</span>
          </td>
        </tr>
        <tr>
          <th scope="row">BCG</th>
          <td>
            <span>{{ delivery.bcg || '-' }}</span>
          </td>
        </tr>
        <tr>
          <th scope="row">OPVO</th>
          <td>
            <span>{{ delivery.opvo || '-' }}</span>
          </td>
        </tr>
        <tr>
          <th scope="row">HPV</th>
          <td>
            <span>{{ delivery.hpv || '-' }}</span>
          </td>
        </tr>
        <tr>
          <th scope="row">Nature of Liquor</th>
          <td>
            <span>{{ delivery.nature_of_liquor || '-' }}</span>
          </td>
        </tr>
        <tr>
          <th scope="row">Comments</th>
          <td>
            <span>{{ delivery.comments || '-' }}</span>
          </td>
        </tr>
        <!--        <tr>-->
        <!--          <th scope="row">Immunization Date</th>-->
        <!--          <td>-->
        <!--            <span>{{ delivery.baby_immunization_date | dayjs('MMM D, YYYY') }}</span>-->
        <!--          </td>-->
        <!--        </tr>-->
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
    delivery: {
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
