<template>
  <div>
    <div class="header-top mb-6">
      <div class="container white">
        <div class="d-none d-lg-flex align-items-center mr-3">
          <ul class="header-tabs nav align-self-end font-size-lg" role="tablist">
            <li class="nav-item mr-3" v-for="(tab, index) in tabs" :key="index">
              <a
                class="nav-link text-dark py-4 px-6"
                :class="{
                  active: tabIndex === index,
                  disabled: tabIndex === index || isEmptySummary,
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
    <page-skeleton v-if="loading" title="Consultation" :times="6" />
    <component :is="activeComponent" :isEmptySummary="isEmptySummary" />
  </div>
</template>

<script>
import Observations from './tabs/Observations.vue';
import TestOrders from './tabs/TestOrders.vue';
import InvestigationOrders from './tabs/InvestigationOrders.vue';
import Medications from './tabs/MedicationOrders.vue';
import ServicesOrder from './tabs/ServiceOrders.vue';
import Disposition from '@/view/pages/consultation/tabs/Disposition.vue';
import PulseIcons from '@/view/pages/consultation/components/PulseIcons.vue';
import PageSkeleton from '@/utils/PageSkeleton.vue';
import History from '@/view/pages/consultation/tabs/History.vue';
import Surgery from '@/view/pages/consultation/tabs/Surgery.vue';
import { isEmpty } from '@/common/common';

const ComponentMapping = {
  observations: Observations,
  tests: TestOrders,
  investigations: InvestigationOrders,
  medications: Medications,
  services: ServicesOrder,
  disposition: Disposition,
  history: History,
  surgery: Surgery,
};

export default {
  name: 'Tabs',
  components: { PageSkeleton, PulseIcons },
  data() {
    return {
      tabIndex: 0,
      activeComponent: '',
      loading: false,
      tabs: [
        {
          name: 'History',
          component: 'history',
        },
        {
          name: 'Observations',
          component: 'observations',
        },
        {
          name: 'Tests',
          component: 'tests',
        },
        {
          name: 'Medications',
          component: 'medications',
        },
        {
          name: 'Radiology',
          component: 'radiology',
        },
        {
          name: 'Disposition',
          component: 'disposition',
        },
        {
          name: 'Services',
          component: 'services',
        },
        {
          name: 'Surgery',
          component: 'surgery',
        },
      ],
    };
  },
  computed: {
    summaries() {
      return this.$store.state.consultation.histories;
    },
    isEmptySummary() {
      return this.summaries.every(
        summary =>
          isEmpty(summary.drugs) &&
          isEmpty(summary.tests) &&
          isEmpty(summary.investigations) &&
          isEmpty(summary.items) &&
          isEmpty(summary.diagnoses) &&
          isEmpty(summary.triages) &&
          isEmpty(summary.observations.histories) &&
          isEmpty(summary.observations.complaints)
      );
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

    fetchVisitsHistory() {
      this.$store.dispatch('consultation/fetchVisitsHistory', {
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        visitId: this.$route.params.id,
      });
    },
  },
  created() {
    this.loading = true;
    this.getActiveTab();
    this.$store.dispatch('visit/fetchVisit', this.$route.params.id).then(response => {
      const res = response.data.data;
      this.$store.dispatch('patient/setCurrentPatient', { ...res.patient, ...res.insurance });
    });
    this.fetchVisitsHistory();
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
