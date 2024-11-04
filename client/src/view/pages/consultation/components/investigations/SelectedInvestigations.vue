<template>
  <div class="flex-row-auto offcanvas-mobile w-xl-250px">
    <div class="card-custom card-stretch">
      <div class="card-header">
        <h6 class="card-title">
          <span class="card-label font-weight-bolder text-dark">Selected Investigations</span>
        </h6>
      </div>
      <div class="card-body">
        <div class="row">
          <div
            class="col-lg-12 mb-2 select-order"
            v-for="(investigation, i) in selectedInvestigations"
            :key="i"
          >
            <div class="p-2">
              <span
                :title="`${investigation.investigation_type}`"
                v-b-tooltip.hover
                :class="getLabelDotStatus(investigation.investigation_type)"
                class="label label-dot label-lg mr-2"
              ></span>
              <span v-b-tooltip.hover :title="investigation.name" class="mr-3">{{
                truncateText(investigation.name)
              }}</span>
              <span class="float-right ml-4" v-b-tooltip.hover title="Delete">
                <a href="#" @click="removeSelectedInvestigation(investigation)"
                  ><i class="flaticon2-rubbish-bin text-danger icon-md"
                /></a>
              </span>
              <span class="float-right" v-b-tooltip.hover title="Urgent!">
                <a href="#" @click="toggleInvestigationUrgency(investigation.investigation_id, i)">
                  <i ref="selectedInvestigation" class="flaticon2-warning icon-md" />
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getLabelDotStatus } from '@/common/common';

export default {
  name: 'SelectedInvestigations',
  props: {
    selectedInvestigations: {
      type: Array,
    },
  },
  methods: {
    getLabelDotStatus,
    truncateText(investigation) {
      if (!investigation.length || investigation.length <= 17) return investigation;
      const truncatedText = investigation.substring(0, 17);
      return `${truncatedText}...`;
    },
    removeSelectedInvestigation(investigation) {
      this.$store.dispatch('order/removeSelectedInvestigation', investigation);
      this.$store.dispatch(
        'order/removeSelectedInvestigationButton',
        investigation.investigation_id
      );
    },
    toggleInvestigationUrgency(investigationId, i) {
      const icon = this.$refs['selectedInvestigation'][i];
      const investigation = this.selectedInvestigations.find(
        ({ investigation_id }) => investigation_id === investigationId
      );
      if (investigation && investigation.is_urgent) {
        icon.classList.remove('text-warning');
        this.$store.dispatch('order/toggleInvestigationUrgency', investigationId);
      } else {
        icon.classList.add('text-warning');
        this.$store.dispatch('order/toggleInvestigationUrgency', investigationId);
      }
    },
  },
};
</script>

<style scoped>
.select-order {
  background: linear-gradient(to bottom, #fff, #ddd);
  border: 1px solid #ddd;
  border-radius: 3px;
}
</style>
