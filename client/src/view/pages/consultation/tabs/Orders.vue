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
        <b-collapse
          id="accordion-1"
          visible
          accordion="my-accordion"
          role="tabpanel"
        >
          <div class="card-body">
            <div class="col-3 offset-9">
              <!--       TODO: Fix search functionality         -->
              <input
                placeholder="Search..."
                @keyup="searchTests"
                v-model="searchString"
                class="form-control form-control-sm"
                type="text"
              />
            </div>
            <div class="d-flex flex-row">
              <test-samples
                :list="samples"
                @changeSample="changeSample"
                :backgroundColor="backgroundColor"
              />
              <component :is="activeTab" />
            </div>
          </div>
        </b-collapse>
      </div>
    </div>
  </div>
</template>
<script>
import Sidebar from "../components/Sidebar";
import Tests from "../components/Tests";
import AccordionIcon from "../../../../assets/icons/AccordionIcon";
import TestSamples from "../components/TestSamples";

export default {
  name: "Orders",
  components: { Sidebar, Tests, AccordionIcon, TestSamples },
  data() {
    return {
      activeTab: "",
      backgroundColor: "#3699ff29",
      searchString: ""
    };
  },
  methods: {
    changeTab() {
      this.activeTab = Tests;
    },

    changeSample(id) {
      const test_type = this.$store.state.consultation.testType;
      if (test_type === "CASH") {
        this.fetchTests("laboratory/fetchTests", id);
      } else {
        this.fetchTests("laboratory/fetchNhisTests", id);
      }

      this.dispatchChangeSampleId(id);
    },

    fetchTests(type, id) {
      this.$store.dispatch(type, {
        currentPage: 1,
        itemsPerPage: 100,
        filter: id
      });
    },

    dispatchChangeSampleId(id) {
      this.$store.dispatch("consultation/changeSampleId", id);
    },

    dispatchSearchTests(type) {
      this.$store.dispatch(type, {
        currentPage: 1,
        itemsPerPage: 100,
        search: this.searchString,
        sampleId: this.$store.state.consultation.sampleId
      });
    },

    searchTests() {
      const test_type = this.$store.state.consultation.testType;
      if (test_type === "CASH") {
        this.dispatchSearchTests("laboratory/fetchTests");
      } else {
        this.dispatchSearchTests("laboratory/fetchNhisTests");
      }
    }
  },
  computed: {
    samples() {
      return this.$store.state.laboratory.samples;
    }
  },

  created() {
    this.$store.dispatch("laboratory/fetchTestSamples", {
      currentPage: 1,
      itemsPerPage: 100
    });
    this.activeTab = Tests;
  }
};
</script>

<style scoped></style>
