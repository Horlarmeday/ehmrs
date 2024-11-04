<template>
  <div>
    <h3 class="card-title align-items-start">
      <span class="card-label font-weight-bolder text-dark">Samples Collected</span>
    </h3>
    <div class="header-top mb-6">
      <div class="container white">
        <div class="d-none d-lg-flex align-items-center mr-3">
          <ul class="header-tabs nav align-self-end font-size-lg" role="tablist">
            <li class="nav-item mr-1" v-for="(tab, index) in tabs" :key="index">
              <a
                class="nav-link text-dark py-4 px-6"
                :class="{
                  active: tabIndex === index,
                  disabled: tabIndex === index,
                }"
                @click="setActiveTab($event, tab.period)"
                :data-tab="index"
                data-toggle="tab"
                href="#"
                role="tab"
                aria-selected="true"
                >{{ tab.name }}</a
              >
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="card-body">
        <samples-collected-table :period="period" />
      </div>
    </div>
  </div>
</template>
<script>
import SamplesCollectedTable from './samplesCollected/SamplesCollectedTable.vue';

export default {
  components: { SamplesCollectedTable },
  data: () => ({
    tabIndex: 0,
    period: 'Today',
    tabs: [
      {
        name: 'Today',
        period: 'Today',
        showComponent: true,
      },
      {
        name: 'Backlog',
        period: 'Backlog',
        showComponent: true,
      },
    ],
  }),
  methods: {
    setActiveTab(event, period) {
      let target = event.target;
      if (!event.target.classList.contains('nav-link')) {
        target = event.target.closest('.nav-link');
      }

      const tab = target.closest('[role="tablist"]');
      const links = tab.querySelectorAll('.nav-link');
      // remove active tab links
      for (let i = 0; i < links.length; i++) {
        links[i].classList.remove('active');
        links[i].removeAttribute('disabled');
      }

      // set clicked tab index to bootstrap tab
      this.tabIndex = parseInt(target.getAttribute('data-tab'));

      // set the current active tab
      target.classList.add('active');
      target.setAttribute('disabled', true);

      this.period = period;

      this.$router.push({
        query: {
          period,
          tabIndex: this.tabIndex,
        },
      });
    },

    getActiveTab() {
      const storedPeriod = this.$route.query.period;
      const storedTabIndex = this.$route.query.tabIndex;
      if (storedPeriod && storedTabIndex) {
        this.period = storedPeriod;
        this.tabIndex = parseInt(storedTabIndex);
      } else {
        this.period = 'Today';
        this.tabIndex = 0;
      }
    },
  },
  created() {
    this.getActiveTab();
  },
};
</script>
<style scoped>
.white {
  background-color: white;
}
.nav-item .nav-link.active {
  background-color: #a9a9a961 !important;
}
</style>
