<template>
  <div id="serviceOrders">
    <div class="accordion accordion-solid accordion-panel accordion-svg-toggle">
      <div class="card">
        <div class="card-header">
          <div class="card-title" v-b-toggle.accordion-3>
            <div class="card-label">Services</div>
            <accordion-icon />
          </div>
        </div>
        <b-collapse id="accordion-3" :visible="visible">
          <div class="card-body">
            <div class="col-3 offset-9">
              <div ref="spinn">
                <input
                  placeholder="Search..."
                  @keyup="searchServices"
                  v-model="searchString"
                  class="form-control form-control-md mb-3"
                  type="text"
                />
              </div>
            </div>
            <div class="d-flex flex-row">
              <service-sidebar />
              <component
                :switchPosition="switchPosition"
                :showSwitch="showSwitch"
                :source="source"
                :is="activeTab"
                :filter="filter"
                :insurance-name="insuranceName"
              />
            </div>
          </div>
        </b-collapse>
      </div>
    </div>
  </div>
</template>

<script>
import Services from '@/view/pages/consultation/components/services/Services.vue';
import ServiceSidebar from '@/view/pages/consultation/components/services/ServiceSidebar.vue';
import AccordionIcon from '@/assets/icons/AccordionIcon.vue';
import { addSpinner, debounce, removeSpinner } from '@/common/common';

export default {
  name: 'ServiceCard',
  data() {
    return {
      activeTab: '',
      backgroundColor: '#3699ff29',
      searchString: '',
    };
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
    visible: {
      type: Boolean,
      default: true,
    },
    insuranceName: {
      type: String,
      required: false,
    },
  },
  components: { AccordionIcon, ServiceSidebar, Services },
  methods: {
    changeTab() {
      this.activeTab = Services;
    },

    searchServices() {
      const spinDiv = this.$refs['spinn'];
      addSpinner(spinDiv);
      this.debounceSearch(this.searchString, this, spinDiv);
    },

    debounceSearch: debounce((search, vm, spinDiv) => {
      vm.$store
        .dispatch('model/fetchServices', {
          currentPage: vm.currentPage,
          itemsPerPage: vm.itemsPerPage,
          search,
        })
        .then(() => removeSpinner(spinDiv))
        .catch(() => removeSpinner(spinDiv));
    }, 500),
  },

  created() {
    this.activeTab = Services;
  },
};
</script>

<style scoped></style>
