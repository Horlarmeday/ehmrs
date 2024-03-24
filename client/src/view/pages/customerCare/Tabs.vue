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
            <div class="ml-auto">
              <button
                @click="sendForReviewAlert"
                :disabled="isDisabled || !shouldSendForReview"
                ref="kt-sendForReview-submit"
                class="text-center btn btn-md btn-primary"
              >
                Send for Review
              </button>
            </div>
          </div>
        </div>
      </div>
      <component
        :is="activeComponent"
        @approvedTests="getApprovedTestsCount"
        @approvedInvestigations="getApprovedInvestigationsCount"
      />
    </div>
  </div>
</template>

<script>
import PageSkeleton from '@/view/pages/consultation/components/skeleton/PageSkeleton.vue';
import Tests from './tabs/Tests.vue';
import Radiology from './tabs/Radiology.vue';
import Swal from 'sweetalert2';

const ComponentMapping = {
  tests: Tests,
  radiology: Radiology,
};
export default {
  components: { PageSkeleton },
  data() {
    return {
      tabIndex: 0,
      activeComponent: '',
      isDisabled: false,
      shouldSendForReview: false,
      tabs: [
        {
          name: 'Tests',
          component: 'tests',
        },
        {
          name: 'Radiology',
          component: 'radiology',
        },
      ],
    };
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
        this.activeComponent = ComponentMapping['tests'];
      }
    },

    getApprovedTestsCount(count) {
      this.shouldSendForReview = !!count;
    },

    getApprovedInvestigationsCount(count) {
      this.shouldSendForReview = !!count;
    },

    addSpinner(submitButton) {
      this.isDisabled = true;
      submitButton.classList.add('spinner', 'spinner-light', 'spinner-right');
    },

    removeSpinner(submitButton) {
      this.isDisabled = false;
      submitButton.classList.remove('spinner', 'spinner-light', 'spinner-right');
    },

    endRequest(button) {
      this.removeSpinner(button);
    },

    sendForReview() {
      const data = {
        is_taken: false,
      };

      const submitButton = this.$refs['kt-sendForReview-submit'];
      this.addSpinner(submitButton);

      this.$store
        .dispatch('visit/updateVisit', { data, id: this.$route.params.id })
        .then(() => this.endRequest(submitButton))
        .catch(() => this.endRequest(submitButton));
    },

    sendForReviewAlert() {
      const self = this;
      Swal.fire({
        title: 'Are you sure?',
        text: 'You want to send patient for review',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Send!',
      }).then(function(result) {
        if (result.value) {
          self.sendForReview();
        }
      });
    },
  },
  created() {
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
