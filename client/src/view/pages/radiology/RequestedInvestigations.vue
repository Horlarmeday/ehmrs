<template>
  <div class="card card-custom gutter-b">
    <div class="card-body card-header-tabs-line">
      <h3 class="card-title align-items-start">
        <span class="card-label font-weight-bolder text-dark">Investigations</span>
      </h3>
      <div class="card-toolbar">
        <div class="example">
          <b-tabs content-class="" lazy>
            <b-tab title="Today">
              <requested-investigation-table period="Today" />
            </b-tab>
            <b-tab title="Backlog" lazy>
              <requested-investigation-table period="Backlog" />
            </b-tab>
          </b-tabs>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import RequestedInvestigationTable from './requestedInvestigations/RequestedInvestigationTable.vue';

export default {
  components: { RequestedInvestigationTable },
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
  },
};
</script>
