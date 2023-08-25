<template>
  <div>
    <div class="header-top mb-6">
      <div class="container white">
        <div class="d-none d-lg-flex align-items-center mr-3">
          <ul class="header-tabs nav align-self-end font-size-lg" role="tablist">
            <li class="nav-item">
              <a
                class="nav-link text-dark py-4 px-6"
                :class="{ active: tabIndex === 0, disabled: tabIndex === 0 }"
                @click="setActiveTab($event, 'observations')"
                data-tab="0"
                data-toggle="tab"
                href="#"
                role="tab"
                aria-selected="true"
                >Observations</a
              >
            </li>
            <li class="nav-item mr-3">
              <a
                class="nav-link text-dark py-4 px-6"
                @click="setActiveTab($event, 'tests')"
                data-tab="1"
                data-toggle="tab"
                :class="{ active: tabIndex === 1, disabled: tabIndex === 1 }"
                href="#"
                role="tab"
                aria-selected="true"
                >Tests</a
              >
            </li>
            <li class="nav-item mr-3">
              <a
                class="nav-link text-dark py-4 px-6"
                :class="{ active: tabIndex === 2, disabled: tabIndex === 2 }"
                @click="setActiveTab($event, 'medications')"
                data-tab="2"
                data-toggle="tab"
                href="#"
                role="tab"
                aria-selected="true"
                >Medications</a
              >
            </li>
            <li class="nav-item mr-3">
              <a
                class="nav-link text-dark py-4 px-6"
                :class="{ active: tabIndex === 3, disabled: tabIndex === 3 }"
                @click="setActiveTab($event, 'investigations')"
                data-tab="3"
                data-toggle="tab"
                href="#"
                role="tab"
                aria-selected="true"
                >Radiology</a
              >
            </li>
            <li class="nav-item mr-3">
              <a
                class="nav-link text-dark py-4 px-6"
                :class="{ active: tabIndex === 4, disabled: tabIndex === 4 }"
                @click="setActiveTab($event, 'disposition')"
                data-tab="4"
                data-toggle="tab"
                href="#"
                role="tab"
                aria-selected="true"
                >Disposition</a
              >
            </li>
            <li class="nav-item mr-3">
              <a
                class="nav-link text-dark py-4 px-6"
                :class="{ active: tabIndex === 5, disabled: tabIndex === 5 }"
                @click="setActiveTab"
                data-tab="5"
                data-toggle="tab"
                href="#"
                role="tab"
                aria-selected="true"
                >History</a
              >
            </li>
            <li class="nav-item mr-3">
              <a
                class="nav-link text-dark py-4 px-6"
                :class="{ active: tabIndex === 6, disabled: tabIndex === 6 }"
                @click="setActiveTab($event, 'services')"
                data-tab="6"
                data-toggle="tab"
                href="#"
                role="tab"
                aria-selected="true"
                >Services</a
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
</template>

<script>
import Observations from '../tabs/Observations';
import TestOrders from '../tabs/TestOrders.vue';
import InvestigationOrders from '../tabs/InvestigationOrders.vue';
import Medications from '../tabs/Medications.vue';
import ServicesOrder from '../tabs/ServiceOrders.vue';
import Disposition from '@/view/pages/consultation/tabs/Disposition.vue';
import PulseIcons from '@/view/pages/consultation/components/PulseIcons.vue';
// import router from '@/router';

const ComponentMapping = {
  observations: Observations,
  tests: TestOrders,
  investigations: InvestigationOrders,
  medications: Medications,
  services: ServicesOrder,
  disposition: Disposition,
};

export default {
  name: 'Tabs',
  components: { PulseIcons },
  data() {
    return {
      tabIndex: 0,
      activeComponent: '',
    };
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
      } else {
        this.activeComponent = ComponentMapping['observations'];
        this.tabIndex = 0;
      }
    },
  },
  created() {
    this.getActiveTab();
    this.$store
      .dispatch('visit/fetchVisit', this.$route.params.visitId)
      .then(response =>
        this.$store.dispatch('patient/setCurrentPatient', response.data.data.patient)
      );
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
