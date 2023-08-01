<template>
  <div id="serviceOrders">
    <div class="accordion accordion-solid accordion-panel accordion-svg-toggle">
      <div class="card">
        <div class="card-header">
          <div class="card-title" v-b-toggle.accordion-3>
            <div class="card-label">Services</div>
            <accordion-icon />
          </div>
        </div>
        <b-collapse id="accordion-3" visible>
          <div class="card-body">
            <div class="col-3 offset-9">
              <div ref="spinn">
                <input
                  placeholder="Search..."
                  @keyup="searchServices"
                  v-model="searchString"
                  class="form-control form-control-md"
                  type="text"
                />
              </div>
            </div>
            <div class="d-flex flex-row">
              <service-sidebar />
              <component :is="activeTab" />
            </div>
          </div>
        </b-collapse>
      </div>
    </div>
  </div>
</template>

<script>
import Services from '@/view/pages/consultation/components/services/Services.vue';
import ServiceSidebar from '@/view/pages/consultation/components/services/ServiceSidebar.vue';
import AccordionIcon from '@/assets/icons/AccordionIcon.vue';
import { addSpinner, debounce, removeSpinner } from '@/common/common';

export default {
  data() {
    return {
      activeTab: '',
      backgroundColor: '#3699ff29',
      searchString: '',
    };
  },
  components: { AccordionIcon, ServiceSidebar, Services },
  methods: {
    changeTab() {
      this.activeTab = Services;
    },

    debounceSearch: debounce((search, vm, spinDiv) => {
      vm.$store
        .dispatch('model/fetchServices', {
          currentPage: vm.currentPage,
          itemsPerPage: vm.itemsPerPage,
          search,
        })
        .then(() => removeSpinner(spinDiv))
        .catch(() => removeSpinner(spinDiv));
    }, 500),

    searchServices() {
      const spinDiv = this.$refs['spinn'];
      addSpinner(spinDiv);
      this.debounceSearch(this.searchString, this, spinDiv);
    },
  },

  created() {
    this.activeTab = Services;
  },
};
</script>

<style scoped></style>
