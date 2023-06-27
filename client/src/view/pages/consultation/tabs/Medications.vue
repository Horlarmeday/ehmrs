<template>
  <div id="medications">
    <div class="d-flex flex-column-fluid">
      <div class=" container ">
        <div class="d-flex flex-row">
          <sidebar />
          <component :is="activeTab" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Sidebar from '../components/medications/SideBar.vue';
import Medications from '../components/medications/Medications.vue';
const TabMapping = {
  '#medications': Medications
}

export default {
  name: "Medications",
  data() {
    return {
      activeTab: '',
    };
  },
  components: { Sidebar },
  created() {
    this.activeTab = TabMapping['#medications'];
  },
};
</script>

<style scoped>

</style>