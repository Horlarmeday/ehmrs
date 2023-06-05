<template>
  <div>
    <selected-tests v-if="selectedTests.length" :selected-tests="selectedTests" />
  </div>
</template>

<script>
import SelectedTests from './SelectedTests.vue';
export default {
  name: 'TestSideBar',
  components: { SelectedTests },
  data() {
    return {
      tabIndex: 0,
      sBackgroundColor: '#3699ff29',
    };
  },
  created() {
    this.fetchTests('laboratory/fetchTests');
  },
  computed: {
    selectedTests() {
      return this.$store.state.order.selectedTests;
    },
    visit() {
      return this.$store.state.visit.visit;
    },
  },
  methods: {
    fetchTests(type) {
      this.$store.dispatch(type, {
        currentPage: 1,
        itemsPerPage: 100,
      });
    },

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

    // setActiveTab(event) {
    //   let target = event.target;
    //   if (!event.target.classList.contains('navi-link')) {
    //     target = event.target.closest('.navi-link');
    //   }
    //
    //   // const tab = target.closest('[role="tablist"]');
    //   const links = document.querySelectorAll('.navi-link');
    //   // remove active tab links
    //   for (let i = 0; i < links.length; i++) {
    //     links[i].classList.remove('active');
    //   }
    //
    //   // set clicked tab index to bootstrap tab
    //   this.tabIndex = parseInt(target.getAttribute('data-active'));
    //
    //   // set current active tab
    //   target.classList.add('active');
    // },
  },
};
</script>

<style scoped></style>
