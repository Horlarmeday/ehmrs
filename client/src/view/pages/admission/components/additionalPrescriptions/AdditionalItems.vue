<template>
  <div>
    <div class="accordion accordion-solid accordion-panel accordion-svg-toggle">
      <routine-items
        :filter="filter"
        :source="source"
        :show-switch="showSwitch"
        :switch-position="switchPosition"
        :display-prompt="displayPrompt"
        @closeModal="hideModal"
      />
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
            <a
              v-if="currentUser?.sub_role === THEATER"
              title="Routine Items"
              v-b-tooltip.hover
              href="#"
              class="btn btn-icon btn-light-primary float-right mt-3"
              @click="openModal"
            >
              <i class="fas fa-tablets"></i>
            </a>
            <create-additional-items
              :source="source"
              :show-switch="showSwitch"
              :switch-position="switchPosition"
              :filter="filter"
              :insurance-name="insuranceName"
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
import { parseJwt } from '@/common/common';
import RoutineItems from '@/view/pages/surgery/components/items/RoutineItems.vue';

export default {
  components: { RoutineItems, CreateAdditionalItems, AdditionalItemsAccordion, AccordionIcon },
  data: () => ({
    currentUser: parseJwt(localStorage.getItem('user_token')),
    THEATER: 'Theater',
    displayPrompt: false,
  }),
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
    insuranceName: {
      type: String,
      required: false,
    },
    filter: {
      type: Object,
      required: true,
    },
  },
  methods: {
    openModal() {
      this.displayPrompt = true;
    },

    hideModal() {
      this.displayPrompt = false;
    },
  },
};
</script>

<style scoped></style>
