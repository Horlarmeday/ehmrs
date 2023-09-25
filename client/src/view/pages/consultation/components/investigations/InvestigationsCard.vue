<template>
  <div id="investigationOrders">
    <div class="accordion accordion-solid accordion-panel accordion-svg-toggle">
      <div class="card">
        <div class="card-header">
          <div class="card-title" v-b-toggle.accordion-2>
            <div class="card-label">Radiology</div>
            <accordion-icon />
          </div>
        </div>
        <b-collapse id="accordion-2" visible>
          <div class="card-body">
            <div class="col-12">
              <search-with-filter
                label="Imaging"
                :data="this.$store.state.radiology.imagings"
                @search="onHandleSearch"
                @filter="onHandleFilter"
                :selected="1"
              />
            </div>
            <div class="d-flex flex-row">
              <investigation-side-bar />
              <component
                :switchPosition="switchPosition"
                :showSwitch="showSwitch"
                :source="source"
                :is="activeTab"
              />
            </div>
          </div>
        </b-collapse>
      </div>
    </div>
  </div>
</template>
<script>
import Investigations from './Investigations.vue';
import AccordionIcon from '@/assets/icons/AccordionIcon.vue';
import InvestigationSideBar from './InvestigationSideBar.vue';
import SearchWithFilter from '@/utils/SearchWithFilter.vue';
import { debounce, removeSpinner } from '@/common/common';

export default {
  name: 'InvestigationCard',
  components: { SearchWithFilter, Investigations, AccordionIcon, InvestigationSideBar },
  data() {
    return {
      activeTab: '',
      backgroundColor: '#3699ff29',
      searchString: '',
      currentPage: 1,
      itemsPerPage: 100,
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
  },
  methods: {
    onHandleSearch(prop) {
      const { search, spinDiv } = prop;
      this.debounceSearch(search, this, spinDiv);
    },

    debounceSearch: debounce((search, vm, spinDiv) => {
      vm.$store
        .dispatch('radiology/fetchInvestigations', {
          currentPage: vm.currentPage,
          itemsPerPage: vm.itemsPerPage,
          search,
        })
        .then(() => removeSpinner(spinDiv))
        .catch(() => removeSpinner(spinDiv));
    }, 500),

    onHandleFilter(filter) {
      this.$store.dispatch('radiology/fetchInvestigations', {
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        filter,
      });
    },

    fetchInvestigations() {
      this.$store.dispatch('radiology/fetchInvestigations', {
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        filter: 1,
      });
    },

    fetchImagings() {
      this.$store.dispatch('radiology/fetchImagings', {
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
      });
    },
  },

  created() {
    this.activeTab = Investigations;
    this.fetchInvestigations();
    this.fetchImagings();
  },
};
</script>

<style scoped></style>
