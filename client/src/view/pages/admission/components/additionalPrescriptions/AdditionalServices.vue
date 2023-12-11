<template>
  <div>
    <service-card
      :source="source"
      :show-switch="showSwitch"
      :switch-position="switchPosition"
      :filter="filter"
      :visible="false"
    />
  </div>
</template>
<script>
import ServiceCard from '@/view/pages/consultation/components/services/ServiceCard.vue';

export default {
  components: { ServiceCard },
  props: {
    switchPosition: {
      type: Boolean,
      required: true,
      default: false,
    },
    showSwitch: {
      type: Boolean,
      required: true,
      default: false,
    },
    source: {
      type: String,
      required: true,
    },
    filter: {
      type: Object,
      required: true,
    },
  },
};
</script>

<style scoped></style>
