<template>
  <div>
    <div class="accordion accordion-solid accordion-panel accordion-svg-toggle">
      <div class="card">
        <div class="card-header">
          <div class="card-title" v-b-toggle.accordion-1>
            <div class="card-label">Additional Items</div>
            <accordion-icon />
          </div>
        </div>
        <b-collapse id="accordion-1" visible>
          <div class="card-body">
            <additional-items-accordion :filter="filter" />
            <create-additional-items
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
import AdditionalItemsAccordion from '@/view/components/accordion/AdditionalItemsAccordion.vue';
import CreateAdditionalItems from '@/view/pages/visits/components/tabs/additionalItems/CreateAdditionalItems.vue';

export default {
  components: { CreateAdditionalItems, AdditionalItemsAccordion, AccordionIcon },
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
