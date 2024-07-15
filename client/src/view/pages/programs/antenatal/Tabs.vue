<template>
  <div>
    <div class="header-top mb-6">
      <div class="container white">
        <div class="d-none d-lg-flex align-items-center mr-1">
          <ul class="header-tabs nav align-self-end font-size-lg" role="tablist">
            <li class="nav-item mr-1">
              <a
                class="nav-link text-dark py-4 px-6"
                :class="{ active: tabIndex === 5, disabled: tabIndex === 5 }"
                @click="setActiveTab($event, 'summary')"
                data-tab="5"
                data-toggle="tab"
                href="#"
                role="tab"
                aria-selected="true"
                >Past Visits</a
              >
            </li>
            <li v-if="doctorAllowedTabs.includes(currentUser.department)" class="nav-item mr-1">
              <a
                class="nav-link text-dark py-4 px-6"
                :class="{ active: tabIndex === 6, disabled: tabIndex === 6 }"
                @click="setActiveTab($event, 'observation')"
                data-tab="6"
                data-toggle="tab"
                href="#"
                role="tab"
                aria-selected="true"
                >History</a
              >
            </li>
            <li v-if="nurseAllowedTabs.includes(currentUser.role)" class="nav-item">
              <a
                v-if="antenatal && antenatal.account_status === Inactive"
                class="nav-link text-dark py-4 px-6"
                :class="{ active: tabIndex === 0, disabled: tabIndex === 0 }"
                @click="setActiveTab($event, 'accountUpdate')"
                data-tab="0"
                data-toggle="tab"
                href="#"
                role="tab"
                aria-selected="true"
                >Account Update</a
              >
              <a
                v-else
                class="nav-link text-dark py-4 px-6"
                @click="setActiveTab($event, 'triage')"
                data-tab="0"
                data-toggle="tab"
                :class="{ active: tabIndex === 0, disabled: tabIndex === 0 }"
                href="#"
                role="tab"
                aria-selected="true"
                >Triage</a
              >
            </li>
            <li class="nav-item mr-1">
              <a
                class="nav-link text-dark py-4 px-6"
                :class="{ active: tabIndex === 1, disabled: tabIndex === 1 }"
                @click="setActiveTab($event, 'tests')"
                data-tab="1"
                data-toggle="tab"
                href="#"
                role="tab"
                aria-selected="true"
                >Tests</a
              >
            </li>
            <li class="nav-item mr-1">
              <a
                class="nav-link text-dark py-4 px-6"
                :class="{ active: tabIndex === 2, disabled: tabIndex === 2 }"
                @click="setActiveTab($event, 'medication')"
                data-tab="2"
                data-toggle="tab"
                href="#"
                role="tab"
                aria-selected="true"
                >Medication</a
              >
            </li>
            <li class="nav-item mr-1">
              <a
                class="nav-link text-dark py-4 px-6"
                :class="{ active: tabIndex === 3, disabled: tabIndex === 3 }"
                @click="setActiveTab($event, 'radiology')"
                data-tab="3"
                data-toggle="tab"
                href="#"
                role="tab"
                aria-selected="true"
                >Radiology</a
              >
            </li>
            <li class="nav-item mr-1">
              <a
                class="nav-link text-dark py-4 px-6"
                :class="{ active: tabIndex === 10, disabled: tabIndex === 10 }"
                @click="setActiveTab($event, 'services')"
                data-tab="10"
                data-toggle="tab"
                href="#"
                role="tab"
                aria-selected="true"
                >Services</a
              >
            </li>
            <li v-if="nurseAllowedTabs.includes(currentUser.role)" class="nav-item">
              <a
                class="nav-link text-dark py-4 px-6"
                :class="{ active: tabIndex === 4, disabled: tabIndex === 4 }"
                @click="setActiveTab($event, 'clinicalNote')"
                data-tab="4"
                data-toggle="tab"
                href="#"
                role="tab"
                aria-selected="true"
                >Clinical Notes</a
              >
            </li>
            <li
              v-if="
                doctorAllowedTabs.includes(currentUser.department) ||
                  subRolesAllowedTabs.includes(currentUser.sub_role)
              "
              class="nav-item"
            >
              <a
                class="nav-link text-dark py-4 px-6"
                :class="{ active: tabIndex === 7, disabled: tabIndex === 7 }"
                @click="setActiveTab($event, 'disposition')"
                data-tab="7"
                data-toggle="tab"
                href="#"
                role="tab"
                aria-selected="true"
                >Admission</a
              >
            </li>
            <li v-if="doctorAllowedTabs.includes(currentUser.department)" class="nav-item">
              <a
                class="nav-link text-dark py-4 px-6"
                :class="{ active: tabIndex === 8, disabled: tabIndex === 8 }"
                @click="setActiveTab($event, 'surgery')"
                data-tab="8"
                data-toggle="tab"
                href="#"
                role="tab"
                aria-selected="true"
                >Surgery</a
              >
            </li>
            <li v-if="nurseAllowedTabs.includes(currentUser.role)" class="nav-item">
              <a
                class="nav-link text-dark py-4 px-6"
                :class="{ active: tabIndex === 9, disabled: tabIndex === 9 }"
                @click="setActiveTab($event, 'alert')"
                data-tab="9"
                data-toggle="tab"
                href="#"
                role="tab"
                aria-selected="true"
                >Alerts</a
              >
            </li>
          </ul>
          <div class="ml-auto">
            <pulse-icons />
          </div>
        </div>
      </div>
    </div>
    <page-skeleton v-if="loading" title="Antenatal" :times="6" />
    <component :is="activeComponent" @accountUpdated="handleAccountUpdate" />
  </div>
</template>

<script>
import PulseIcons from '@/view/pages/consultation/components/PulseIcons.vue';
import AccountUpdate from '@/view/pages/programs/antenatal/tabs/AccountUpdate.vue';
import Tests from '@/view/pages/programs/antenatal/tabs/Tests.vue';
import Triage from '@/view/pages/programs/antenatal/tabs/Triage.vue';
import PageSkeleton from '@/utils/PageSkeleton.vue';
import Radiology from '@/view/pages/programs/antenatal/tabs/Radiology.vue';
import ClinicalNote from '@/view/pages/programs/antenatal/tabs/ClinicalNote.vue';
import Summary from '@/view/pages/programs/antenatal/tabs/Summary.vue';
import { parseJwt } from '@/core/plugins/parseJwt';
import Observation from '@/view/pages/programs/antenatal/tabs/Observation.vue';
import Disposition from '@/view/pages/consultation/tabs/Disposition.vue';
import Surgery from '@/view/pages/consultation/tabs/Surgery.vue';
import Alerts from '@/view/pages/programs/antenatal/tabs/Alerts.vue';
import Medication from '@/view/pages/programs/antenatal/tabs/Medication.vue';
import MedicationDoctor from '@/view/pages/programs/antenatal/tabs/MedicationDoctor.vue';
import Services from '@/view/pages/programs/antenatal/tabs/Services.vue';

const ComponentMapping = {
  accountUpdate: AccountUpdate,
  tests: Tests,
  medication: Medication,
  triage: Triage,
  radiology: Radiology,
  clinicalNote: ClinicalNote,
  summary: Summary,
  observation: Observation,
  disposition: Disposition,
  surgery: Surgery,
  alert: Alerts,
  services: Services,
};
export default {
  components: {
    PageSkeleton,
    PulseIcons,
  },
  data: () => ({
    tabIndex: 0,
    activeComponent: '',
    loading: false,
    currentUser: parseJwt(localStorage.getItem('user_token')),
    doctorAllowedTabs: ['Administrator', 'Medical Practitioners'],
    subRolesAllowedTabs: ['Maternity'],
    nurseAllowedTabs: ['Super Admin', 'Nurse'],
    Active: 'ACTIVE',
    Inactive: 'INACTIVE',
  }),
  computed: {
    antenatal() {
      return this.$store.state.antenatal.antenatal;
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
          antenatal: this.antenatal.id,
        },
      });
    },

    setActiveComponent(component) {
      if (
        component === 'medication' &&
        this.doctorAllowedTabs.includes(this.currentUser.department)
      ) {
        this.activeComponent = MedicationDoctor;
        return;
      }
      this.activeComponent = ComponentMapping[component];
    },

    defaultTab() {
      if (this.doctorAllowedTabs.includes(this.currentUser.department)) {
        return 'summary';
      } else {
        if (this.antenatal && this.antenatal.account_status === this.Inactive) {
          return 'accountUpdate';
        }

        if (this.antenatal && this.antenatal.account_status === this.Active) {
          return 'triage';
        }
        return null;
      }
    },

    getActiveTab() {
      let storedTab = this.$route.query.tab;
      const storedTabIndex = this.$route.query.tabIndex;
      if (storedTab && ComponentMapping[storedTab] && storedTabIndex) {
        if (storedTab === 'accountUpdate') storedTab = this.defaultTab();
        this.setActiveComponent(storedTab);
        this.tabIndex = parseInt(storedTabIndex);
        this.loading = false;
      } else {
        const activeTab = this.defaultTab();
        this.setActiveComponent(activeTab);
        this.tabIndex = this.doctorAllowedTabs.includes(this.currentUser.department) ? 5 : 0;
        this.loading = false;
      }
    },

    handleAccountUpdate() {
      this.fetchAntenatalRecord();
      setTimeout(() => this.getActiveTab(), 300);
    },

    fetchVisit() {
      this.$store.dispatch('visit/fetchVisit', this.$route.params.id);
    },

    fetchAntenatalRecord() {
      this.$store
        .dispatch('antenatal/fetchOneAntenatalAccount', this.$route.query.antenatal)
        .then(response => {
          const res = response.data.data;
          this.$store.dispatch('insurance/fetchPatientDefaultInsurance', res.patient_id);
          this.$store.dispatch('patient/setCurrentPatient', { ...res.insurance, ...res.patient });
        });
    },
  },
  created() {
    this.loading = true;
    this.fetchAntenatalRecord();
    this.fetchVisit();
    setTimeout(() => this.getActiveTab(), 300);
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
