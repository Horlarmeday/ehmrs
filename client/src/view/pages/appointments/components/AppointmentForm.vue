<template>
  <AppointmentModal v-bind="$props" v-on="$listeners" />
</template>

<script>
import AppointmentModal from './AppointmentModal.vue';

export default {
  name: 'AppointmentForm',
  components: { AppointmentModal },
  props: {
    appointment: { type: Object, default: null },
    displayPrompt: { type: Boolean, required: true },
  },
};
</script>

<style scoped></style>
