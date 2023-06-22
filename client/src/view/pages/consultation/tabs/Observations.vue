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
  '#vitals': Vitals,
  '#history': Examination,
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
  },
  created() {
    this.activeTab = TabMapping['#history'];
  },
};
</script>

<style scoped></style>
