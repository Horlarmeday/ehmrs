<template>
  <div>
    <div
      class="accordion accordion-solid accordion-panel accordion-svg-toggle"
      id="accordionExample8"
      role="tablist"
    >
      <div class="card">
        <div class="card-header" header-tag="header" role="tab">
          <div class="card-title" v-b-toggle.accordion-1>
            <div class="card-label">Laboratory</div>
            <accordion-icon />
          </div>
        </div>
        <b-collapse id="accordion-1" visible accordion="my-accordion" role="tabpanel">
          <div class="card-body">
            <div class="col-3 offset-9">
              <input
                placeholder="Search..."
                @keyup="searchTests"
                v-model="searchString"
                class="form-control form-control-md"
                type="text"
              />
            </div>
            <div class="d-flex flex-row">
              <test-side-bar />
              <component :is="activeTab" />
            </div>
          </div>
        </b-collapse>
      </div>
    </div>
  </div>
</template>
<script>
import Tests from '../components/orders/Tests.vue';
import AccordionIcon from '../../../../assets/icons/AccordionIcon';
import TestSideBar from '../components/orders/TestSideBar.vue';

export default {
  name: 'Orders',
  components: { Tests, AccordionIcon, TestSideBar },
  data() {
    return {
      activeTab: '',
      backgroundColor: '#3699ff29',
      searchString: '',
    };
  },
  methods: {
    changeTab() {
      this.activeTab = Tests;
    },

    dispatchSearchTests(type) {
      this.$store.dispatch(type, {
        currentPage: 1,
        itemsPerPage: 100,
        search: this.searchString,
      });
    },

    searchTests() {
      this.dispatchSearchTests('laboratory/fetchTests');
    },
  },

  created() {
    this.activeTab = Tests;
  }
};
</script>

<style scoped></style>
