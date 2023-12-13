<template>
  <div id="observations">
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
import Sidebar from '../components/observations/Sidebar.vue';
import Examination from '../components/observations/Examination.vue';
import sidebarList from '../components/observations/examinationSidebarList';
import Vitals from '../components/observations/Vitals.vue';

const TabMapping = {
  vitals: Vitals,
  examination: Examination,
};

export default {
  name: 'Observations',
  components: { Vitals, Examination, Sidebar },
  data() {
    return {
      list: sidebarList,
      activeTab: '',
    };
  },
  methods: {
    changeTab(tab) {
      this.activeTab = TabMapping[tab];
    },
    getActiveTab() {
      const storedTab = this.$route.query.subTab;
      if (storedTab && TabMapping[storedTab]) {
        this.activeTab = TabMapping[storedTab];
      } else {
        this.activeTab = TabMapping['examination'];
      }
    },
  },
  created() {
    this.getActiveTab();
  },
};
</script>

<style scoped></style>
