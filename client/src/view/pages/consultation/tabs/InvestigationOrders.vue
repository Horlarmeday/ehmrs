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
              <component :is="activeTab" />
            </div>
          </div>
        </b-collapse>
      </div>
    </div>
  </div>
</template>
<script>
import Investigations from '../components/investigations/Investigations.vue';
import AccordionIcon from '../../../../assets/icons/AccordionIcon.vue';
import InvestigationSideBar from '../components/investigations/InvestigationSideBar.vue';
import SearchWithFilter from '@/utils/SearchWithFilter.vue';

export default {
  name: 'InvestigationOrders',
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
  methods: {
    changeTab() {
      this.activeTab = Investigations;
    },

    dispatchSearchTests(type) {
      this.$store.dispatch(type, {
        currentPage: 1,
        itemsPerPage: 100,
        search: this.searchString,
      });
    },

    onHandleSearch(search) {
      this.$store.dispatch('radiology/fetchInvestigations', {
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        search,
      });
    },

    onHandleFilter(filter) {
      this.$store.dispatch('radiology/fetchInvestigations', {
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        filter,
      });
    },
  },

  created() {
    this.activeTab = Investigations;
    this.$store.dispatch('radiology/fetchImagings', {
      currentPage: this.currentPage,
      itemsPerPage: this.itemsPerPage,
    });
    this.$store.dispatch('radiology/fetchInvestigations', {
      currentPage: this.currentPage,
      itemsPerPage: this.itemsPerPage,
      filter: 1
    });
  },
};
</script>

<style scoped></style>
