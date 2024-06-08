<template>
  <div id="medications">
    <div class="d-flex flex-column-fluid">
      <div class="container">
        <div class="row">
          <bulk-sidebar
            :show-switch="showSwitch"
            :source="source"
            :switch-position="switchPosition"
            :insurance-name="insuranceName"
          />
          <component :is="activeTab" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import BulkSidebar from './BulkSideBar.vue';
import Medications from './BulkMedications.vue';

export default {
  name: 'BulkMedicationCard',
  data() {
    return {
      activeTab: '',
    };
  },
  components: { BulkSidebar },
  props: {
    switchPosition: {
      type: Boolean,
      required: true,
    },
    showSwitch: {
      type: Boolean,
      required: true,
    },
    source: {
      type: String,
      required: true,
    },
    insuranceName: {
      type: String,
      required: false,
    },
  },
  created() {
    this.activeTab = Medications;
  },
};
</script>

<style scoped></style>
