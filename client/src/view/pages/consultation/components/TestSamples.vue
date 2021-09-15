<template>
  <div>
    <div
      class="flex-row-auto offcanvas-mobile w-xl-250px"
      id="kt_profile_aside"
    >
      <div class="card card-custom card-stretch">
        <div class="card-body pt-4 p-0">
          <div
            class="navi navi-bold navi-hover navi-active navi-link-rounded"
            :style="{ backgroundColor: backgroundColor }"
          >
            <div class="navi-item mb-2" v-for="(data, i) in list" :key="i">
              <a
                href="#"
                @click="switchTab(data.id, $event)"
                :data-active="i"
                class="navi-link"
              >
                <span class="navi-text font-size-lg p-0">
                  {{ data.name }}
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
    <selected-tests
      v-if="selectedTests.length"
      :selected-tests="selectedTests"
      :s-background-color="backgroundColor"
    />
  </div>
</template>

<script>
import SelectedTests from "./SelectedTests";
export default {
  name: "TestSamples",
  components: { SelectedTests },
  data() {
    return {
      tabIndex: 0,
      sBackgroundColor: "#3699ff29"
    };
  },
  props: {
    list: { type: Array, required: true, default: () => [] },
    backgroundColor: { type: String }
  },
  created() {
    const test_type = this.$store.state.consultation.testType;
    if (test_type === "CASH") {
      this.fetchTests("laboratory/fetchTests");
    } else {
      this.fetchTests("laboratory/fetchNhisTests");
    }
  },
  computed: {
    selectedTests() {
      return this.$store.state.order.selectedTests;
    }
  },
  methods: {
    fetchTests(type) {
      this.$store.dispatch(type, {
        currentPage: 1,
        itemsPerPage: 100,
        filter: this.$store.state.consultation.sampleId
      });
    },

    switchTab(id, event) {
      this.$emit("changeSample", id);
      this.setActiveTab(event);
    },
    //
    // setDefaultActiveTab() {
    //   let target = "";
    //   const links = document.querySelectorAll(".navi-link");
    //   // remove active tab links
    //   for (let i = 0; i < links.length; i++) {
    //     links[i].classList.remove("active");
    //   }
    //
    //   // set clicked tab index to bootstrap tab
    //   this.tabIndex = parseInt(target.getAttribute("data-active"));
    //
    //   // set current active tab
    //   target.classList.add("active");
    // },

    setActiveTab(event) {
      let target = event.target;
      if (!event.target.classList.contains("navi-link")) {
        target = event.target.closest(".navi-link");
      }

      // const tab = target.closest('[role="tablist"]');
      const links = document.querySelectorAll(".navi-link");
      // remove active tab links
      for (let i = 0; i < links.length; i++) {
        links[i].classList.remove("active");
      }

      // set clicked tab index to bootstrap tab
      this.tabIndex = parseInt(target.getAttribute("data-active"));

      // set current active tab
      target.classList.add("active");
    }
  }
};
</script>

<style scoped></style>
