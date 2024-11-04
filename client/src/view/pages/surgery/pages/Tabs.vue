<template>
  <div>
    <div>
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
      <component :is="activeComponent" />
    </div>
  </div>
</template>
<script>
import CreateOperationNote from '../components/notes/CreateOperationNote.vue';
import Medication from '@/view/pages/surgery/components/medication/Medication.vue';
import AdditionalItem from '@/view/pages/surgery/components/items/AdditionalItem.vue';
import AdditionalServices from '@/view/pages/surgery/components/services/AdditionalServices.vue';

const ComponentMapping = {
  notes: CreateOperationNote,
  medications: Medication,
  items: AdditionalItem,
  services: AdditionalServices,
};
export default {
  data() {
    return {
      tabIndex: 0,
      activeComponent: '',
      isDisabled: false,
      shouldSendForReview: false,
      tabs: [
        {
          name: 'Operation Notes',
          component: 'notes',
        },
        {
          name: 'Medications',
          component: 'medications',
        },
        {
          name: 'Items',
          component: 'items',
        },
        {
          name: 'Services',
          component: 'services',
        },
      ],
    };
  },
  computed: {
    surgery() {
      return this.$store.state.surgery.surgery;
    },
  },
  methods: {
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
          surgery: this.surgery.id,
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
        this.activeComponent = ComponentMapping['notes'];
      }
    },

    fetchOneSurgeryRequest() {
      return this.$store.dispatch('surgery/fetchSurgery', { visitId: this.$route.params.id });
    },
  },

  created() {
    this.getActiveTab();
    this.fetchOneSurgeryRequest().then(response => {
      const res = response.data.data;
      this.$store.dispatch('patient/setCurrentPatient', { ...res.insurance, ...res.patient });
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
