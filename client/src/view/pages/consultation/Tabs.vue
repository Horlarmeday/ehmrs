<template>
  <div>
    <div v-if="visit">
      <div class="header-top mb-6">
        <triage-card v-if="visit?.triage" :triage="visit.triage" />
        <div class="container white">
          <div class="d-none d-lg-flex align-items-center mr-3">
            <ul class="header-tabs nav align-self-end font-size-lg" role="tablist">
              <li class="nav-item mr-1" v-for="(tab, index) in tabs" :key="index">
                <a
                  class="nav-link text-dark py-4 px-6"
                  v-if="tab.showComponent"
                  :class="{
                    active: tabIndex === index,
                    disabled: tabIndex === index,
                  }"
                  @click="setActiveTab($event, tab.component)"
                  :data-tab="index"
                  data-toggle="tab"
                  href="#"
                  role="tab"
                  aria-selected="true"
                  >{{ tab.name }}</a
                >
              </li>
            </ul>
            <div class="ml-auto">
              <pulse-icons />
            </div>
          </div>
        </div>
      </div>
      <component :is="activeComponent" />
    </div>
    <page-skeleton v-else :tabs="tabs" />
  </div>
</template>

<script>
import Observations from './tabs/Observations.vue';
import TestOrders from './tabs/TestOrders.vue';
import InvestigationOrders from './tabs/InvestigationOrders.vue';
import Medications from './tabs/BulkMedicationsOrders.vue';
import ServicesOrder from './tabs/ServiceOrders.vue';
import Disposition from '@/view/pages/consultation/tabs/Disposition.vue';
import PulseIcons from '@/view/pages/consultation/components/PulseIcons.vue';
import PageSkeleton from './components/skeleton/PageSkeleton.vue';
import History from '@/view/pages/consultation/tabs/History.vue';
import Surgery from '@/view/pages/consultation/tabs/Surgery.vue';
import WardRound from '@/view/pages/consultation/tabs/WardRound.vue';
import TriageCard from '@/view/components/util/TriageCard.vue';
import AdditionalItems from '@/view/pages/visits/components/tabs/additionalItems/AdditionalItems.vue';

const ComponentMapping = {
  observations: Observations,
  tests: TestOrders,
  radiology: InvestigationOrders,
  medications: Medications,
  services: ServicesOrder,
  disposition: Disposition,
  history: History,
  surgery: Surgery,
  wardRound: WardRound,
  additionalItems: AdditionalItems,
};

export default {
  name: 'Tabs',
  components: { TriageCard, PageSkeleton, PulseIcons },
  data() {
    return {
      tabIndex: 0,
      activeComponent: '',
      loading: false,
      tabs: [
        {
          name: 'Past History',
          component: 'history',
          showComponent: true,
        },
        {
          name: 'History',
          component: 'observations',
          showComponent: true,
        },
        {
          name: 'Tests',
          component: 'tests',
          showComponent: true,
        },
        {
          name: 'Medications',
          component: 'medications',
          showComponent: true,
        },
        {
          name: 'Radiology',
          component: 'radiology',
          showComponent: true,
        },
        {
          name: 'Admission',
          component: 'disposition',
          showComponent: true,
        },
        {
          name: 'Services',
          component: 'services',
          showComponent: true,
        },
        {
          name: 'Items',
          component: 'additionalItems',
          showComponent: true,
        },
        {
          name: 'Surgery',
          component: 'surgery',
          showComponent: true,
        },
        {
          name: 'Ward Round',
          component: 'wardRound',
          showComponent: false,
        },
      ],
    };
  },
  computed: {
    visit() {
      return this.$store.state.visit.visit;
    },
  },
  watch: {
    visit(value) {
      this.tabs.filter(tab => {
        if (tab.component === 'wardRound' && value.category === 'Inpatient') {
          tab.showComponent = true;
          return tab;
        }
      });
    },
  },
  methods: {
    /**
     * Set current active on click
     * @param event
     * @param component
     */
    setActiveTab(event, component) {
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

      // set current active tab
      target.classList.add('active');
      target.setAttribute('disabled', true);

      this.setActiveComponent(component);

      this.$router.push({
        query: {
          tab: component,
          tabIndex: this.tabIndex,
        },
      });
    },

    setActiveComponent(component) {
      this.activeComponent = ComponentMapping[component];
    },

    getActiveTab() {
      const storedTab = this.$route.query.tab;
      const storedTabIndex = this.$route.query.tabIndex;
      if (storedTab && ComponentMapping[storedTab] && storedTabIndex) {
        this.activeComponent = ComponentMapping[storedTab];
        this.tabIndex = parseInt(storedTabIndex);
        this.loading = false;
      } else {
        this.activeComponent = ComponentMapping['history'];
        this.tabIndex = 0;
        this.loading = false;
      }
    },
  },
  created() {
    this.loading = true;
    this.getActiveTab();
    this.$store.dispatch('visit/fetchVisit', this.$route.params.id).then(response => {
      const res = response.data.data;
      this.$store.dispatch('patient/setCurrentPatient', {
        ...res.insurance,
        ...res.patient,
      });
    });
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
