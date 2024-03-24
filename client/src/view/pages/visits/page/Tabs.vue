<template>
  <div>
    <div class="header-top mb-6">
      <div class="container white">
        <div class="d-none d-lg-flex align-items-center mr-3">
          <ul class="header-tabs nav align-self-end font-size-lg" role="tablist">
            <li class="nav-item mr-3" v-for="(tab, index) in tabs" :key="index">
              <a
                class="nav-link text-dark py-4 px-6"
                :class="{ active: tabIndex === index, disabled: tabIndex === index }"
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
        </div>
      </div>
    </div>
    <page-skeleton v-if="loading" title="Doctor Treatments" :times="6" />
    <component :is="activeComponent" />
  </div>
</template>

<script>
import PageSkeleton from '@/utils/PageSkeleton.vue';
import DoctorPrescriptions from '../components/tabs/doctorPrescriptions/DoctorPrescriptions.vue';
import AdditionalItems from '@/view/pages/visits/components/tabs/additionalItems/AdditionalItems.vue';
import Treatments from '@/view/pages/visits/components/tabs/treatments/Treatments.vue';
import AdditionalServices from '@/view/pages/visits/components/tabs/additionalServices/AdditionalServices.vue';
import Alerts from '@/view/pages/programs/antenatal/tabs/Alerts.vue';

const ComponentMapping = {
  doctorPrescriptions: DoctorPrescriptions,
  services: AdditionalServices,
  additionalItems: AdditionalItems,
  treatmentData: Treatments,
  alert: Alerts,
};

export default {
  name: 'Tabs',
  components: { PageSkeleton },
  data() {
    return {
      tabIndex: 0,
      activeComponent: '',
      loading: false,
      tabs: [
        {
          name: 'Doctor Prescriptions',
          component: 'doctorPrescriptions',
        },
        {
          name: 'Treatment Data',
          component: 'treatmentData',
        },
        {
          name: 'Services',
          component: 'services',
        },
        {
          name: 'Items',
          component: 'additionalItems',
        },
        {
          name: 'Alerts',
          component: 'alert',
        },
      ],
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
        this.loading = false;
      } else {
        this.activeComponent = ComponentMapping['doctorPrescriptions'];
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
      this.$store.dispatch('patient/setCurrentPatient', { ...res.patient, ...res.insurance });
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
