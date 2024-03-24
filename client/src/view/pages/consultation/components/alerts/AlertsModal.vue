<template>
  <b-modal v-model="activePrompt" @show="fetchAlerts" hide-footer size="xl" title="Alerts">
    <div>
      <alerts-table :alerts="alerts" />
    </div>
  </b-modal>
</template>
<script>
import AlertsTable from '@/view/components/table/AlertsTable.vue';

export default {
  components: { AlertsTable },
  props: {
    displayPrompt: {
      type: Boolean,
      required: true,
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
    alerts() {
      return this.$store.state.alert.alerts;
    },
  },
  methods: {
    fetchAlerts() {
      this.$store.dispatch('alert/fetchAlerts', {
        id: this.$route.params.id,
      });
    },
  },
};
</script>

<style scoped></style>
