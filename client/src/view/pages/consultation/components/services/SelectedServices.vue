<template>
  <div class="flex-row-auto offcanvas-mobile w-xl-250px">
    <div class="card-custom card-stretch">
      <div class="card-header">
        <h6 class="card-title">
          <span class="card-label font-weight-bolder text-dark">Selected Services</span>
        </h6>
      </div>
      <div class="card-body">
        <div class="row">
          <div
            class="col-lg-12 mb-2 select-order"
            v-for="(service, i) in selectedServices"
            :key="i"
          >
            <div class="p-2">
              <span class="mr-3">{{ truncateText(service.name) }}</span>
              <span class="float-right ml-4" v-b-tooltip.hover title="Delete">
                <a href="#" @click="removeSelectedService(service)"
                  ><i class="flaticon2-rubbish-bin text-danger icon-md"
                /></a>
              </span>
              <span class="float-right" v-b-tooltip.hover title="Urgent!">
                <a href="#" @click="toggleServiceUrgent(service.service_id, i)">
                  <i ref="selectedService" class="flaticon2-warning icon-md" />
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SelectedServices',
  props: {
    selectedServices: {
      type: Array,
    },
  },
  methods: {
    truncateText(service) {
      if (!service.length || service.length <= 17) return service;
      const truncatedText = service.substring(0, 17);
      return `${truncatedText}...`;
    },
    removeSelectedService(service) {
      this.$store.dispatch('order/removeSelectedService', service);
      this.$store.dispatch('order/removeSelectedServiceButton', service.service_id);
    },
    toggleServiceUrgent(serviceId, i) {
      const icon = this.$refs['selectedService'][i];
      const service = this.selectedServices.find(({ service_id }) => service_id === serviceId);
      if (service && service.is_urgent) {
        icon.classList.remove('text-warning');
        this.$store.dispatch('order/toggleServiceUrgent', serviceId);
      } else {
        icon.classList.add('text-warning');
        this.$store.dispatch('order/toggleServiceUrgent', serviceId);
      }
    },
  },
};
</script>

<style scoped>
.select-order {
  background: linear-gradient(to bottom,#FFF,#DDD);
  border: 1px solid #ddd;
  border-radius: 3px;
}
</style>
