<template>
  <div id="testOrders">
    <div class="accordion accordion-solid accordion-panel accordion-svg-toggle">
      <div class="card">
        <div class="card-header">
          <div class="card-title" v-b-toggle.accordion-1>
            <div class="card-label">Laboratory</div>
            <accordion-icon />
          </div>
        </div>
        <b-collapse id="accordion-1" visible>
          <div class="card-body">
            <div class="col-3 offset-9">
              <div ref="spinner">
                <input
                  placeholder="Search..."
                  @keyup="searchTests"
                  v-model="searchString"
                  class="form-control form-control-md mb-3"
                  type="text"
                />
              </div>
            </div>
            <div class="d-flex flex-row">
              <test-side-bar />
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
import Tests from './Tests.vue';
import AccordionIcon from '@/assets/icons/AccordionIcon.vue';
import TestSideBar from './TestSideBar.vue';
import { addSpinner, debounce, removeSpinner } from '@/common/common';

export default {
  name: 'TestCard',
  components: { Tests, AccordionIcon, TestSideBar },
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

    searchTests() {
      const spinDiv = this.$refs['spinner'];
      addSpinner(spinDiv);
      this.search(this.searchString, this, spinDiv);
    },

    search: debounce((search, vm, spinDiv) => {
      vm.$store
        .dispatch('laboratory/fetchTests', {
          currentPage: 1,
          itemsPerPage: 100,
          search,
        })
        .then(() => removeSpinner(spinDiv))
        .catch(() => removeSpinner(spinDiv));
    }, 500),
  },

  created() {
    this.activeTab = Tests;
  },
};
</script>

<style scoped></style>
