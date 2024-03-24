<template>
  <div>
    <div class="accordion accordion-solid accordion-panel accordion-svg-toggle">
      <div class="card">
        <div class="card-header">
          <div class="card-title" v-b-toggle.accordion-78>
            <div class="card-label">Additional Services</div>
            <accordion-icon />
          </div>
        </div>
        <b-collapse id="accordion-78" :visible="isVisible">
          <div class="card-body">
            <services-accordion :filter="filter" />
            <create-additional-services
              :source="source"
              :show-switch="showSwitch"
              :switch-position="switchPosition"
              :filter="filter"
            />
          </div>
        </b-collapse>
      </div>
    </div>
  </div>
</template>
<script>
import AccordionIcon from '@/assets/icons/AccordionIcon.vue';
import ServicesAccordion from '@/view/components/accordion/ServicesAccordion.vue';
import CreateAdditionalServices from '@/view/pages/admission/components/additionalPrescriptions/CreateAdditionalServices.vue';

export default {
  components: {
    CreateAdditionalServices,
    ServicesAccordion,
    AccordionIcon,
  },
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
    isVisible: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
};
</script>

<style scoped></style>
