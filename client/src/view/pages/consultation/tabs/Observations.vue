<template>
  <div>
    <div class="d-flex flex-column-fluid">
      <div class=" container ">
        <div class="d-flex flex-row">
          <sidebar :list="list" @changeTab="changeTab" />
          <component :is="activeTab" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Sidebar from "../components/Sidebar";
import Examination from "../components/Examination";
import sidebarList from "../components/sidebarList";
import Vitals from "../components/Vitals";

const TabMapping = {
  "#vitals": Vitals,
  "#history": Examination
};

export default {
  name: "Observations",
  components: { Vitals, Examination, Sidebar },
  data() {
    return {
      list: sidebarList,
      activeTab: ""
    };
  },
  methods: {
    changeTab(tab) {
      this.activeTab = TabMapping[tab];
    }
  },
  created() {
    this.activeTab = TabMapping["#history"];
  }
};
</script>

<style scoped></style>
