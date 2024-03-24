<template>
  <div class="card card-custom gutter-b">
    <div class="card-body">
      <alert-accordion @alert="getEditedAlert" />
      <create-alert :alert="alert" />
    </div>
  </div>
</template>
<script>
import AlertAccordion from '@/view/components/accordion/AlertAccordion.vue';
import CreateAlert from '@/view/pages/programs/antenatal/components/alerts/CreateAlert.vue';

export default {
  components: { CreateAlert, AlertAccordion },
  data() {
    return {
      alert: {},
    };
  },
  methods: {
    getEditedAlert(data) {
      this.alert = data;
    },
  },
};
</script>

<style scoped></style>
