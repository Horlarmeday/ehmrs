<template>
  <div class="alert alert-custom alert-light-primary fade show mb-5" role="alert">
    <div class="d-flex flex-column flex-grow-1">
      <div class="d-flex justify-content-between">
        <div class="d-flex flex-column">
          <a
            href="#"
            v-b-tooltip.hover
            title="Route"
            class="text-dark-50 text-hover-primary font-weight-bold mr-lg-8 mr-5 mb-lg-0 mb-2"
            ><i class="flaticon2-heart-rate-monitor mr-2 font-size-lg icon-lg"></i>Route:
            <span class="text-dark ml-2">{{ prescription?.route }}</span></a
          >
          <a
            href="#"
            v-b-tooltip.hover
            title="Strength"
            class="text-dark-50 text-hover-primary font-weight-bold mr-lg-8 mr-5 mb-lg-0 mb-2"
            ><i class="fas fa-flask mr-2 font-size-lg icon-lg"></i>Prescribed Strength:
            <span class="text-dark ml-2"
              >{{ prescription.prescribed_strength }} {{ prescription?.strength }}</span
            ></a
          >
        </div>
        <div class="d-flex flex-column flex-root">
          <a
            href="#"
            v-b-tooltip.hover
            title="Dosage Form"
            class="text-dark-50 text-hover-primary font-weight-bold mr-lg-8 mr-5 mb-lg-0 mb-2"
            ><i class="fab fa-wpforms mr-2 font-size-lg icon-lg"></i>Dosage Form:
            <span class="ml-2 text-dark">{{ prescription?.dosage_form }}</span>
          </a>
          <a
            href="#"
            v-b-tooltip.hover
            title="Quantity to Dispense"
            class="text-dark-50 text-hover-primary font-weight-bold mr-lg-8 mr-5 mb-lg-0 mb-2"
            ><i class="fas fa-flask mr-2 font-size-lg icon-lg"></i>Quantity to Dispense<span
              class="text-dark ml-2"
              >{{ prescription.quantity_to_dispense }} {{ prescription?.dosage_form }}</span
            ></a
          >
        </div>
        <div class="d-flex flex-column flex-root">
          <a
            href="#"
            v-b-tooltip.hover
            title="Duration"
            class="text-dark-50 text-hover-primary font-weight-bold mr-lg-8 mr-5 mb-lg-0 mb-2"
            ><i class="flaticon-calendar-with-a-clock-time-tools mr-2 font-size-lg icon-lg"></i
            >Duration:
            <span class="ml-2 text-dark"
              >{{ prescription.duration }} {{ prescription.duration_unit }}</span
            ></a
          >
          <a
            href="#"
            v-b-tooltip.hover
            title="Total Price"
            class="text-dark-50 text-hover-primary font-weight-bold mr-lg-8 mr-5 mb-lg-0 mb-2"
            ><i class="far fa-money-bill-alt mr-2 font-size-lg icon-lg"></i>Total Price:
            <span class="text-dark ml-2">₦‎{{ prescription.total_price }}</span></a
          >
        </div>
        <div class="d-flex flex-column flex-root">
          <a
            href="#"
            v-b-tooltip.hover
            title="Quantity Prescribed"
            class="text-dark-50 text-hover-primary font-weight-bold mr-lg-8 mr-5 mb-lg-0 mb-2"
            ><i class="fab fa-creative-commons-remix mr-2 font-size-lg icon-lg"></i>Quantity
            Prescribed:
            <span class="ml-2 text-dark"
              >{{ prescription.quantity }} {{ prescription?.dosage_form }}</span
            ></a
          >
          <a
            href="#"
            v-b-tooltip.hover
            title="Drug Starting Date"
            class="text-dark-50 text-hover-primary font-weight-bold mr-lg-8 mr-5 mb-lg-0 mb-2"
            ><i class="far fa-calendar-alt mr-2 font-size-lg icon-lg"></i>Starting Date:
            <span class="text-dark ml-2">{{
              prescription.start_date | moment('DD/MM/YYYY')
            }}</span></a
          >
        </div>
        <div class="d-flex flex-column flex-root">
          <a
            href="#"
            v-b-tooltip.hover
            title="Frequency"
            class="text-dark-50 text-hover-primary font-weight-bold mr-lg-8 mr-5 mb-lg-0 mb-2"
            ><i class="far fa-chart-bar mr-2 font-size-lg icon-lg"></i>Frequency:
            <span class="ml-2 text-dark">{{ prescription.frequency }}</span></a
          >
          <a
            href="#"
            v-b-tooltip.hover
            title="Date Drug Prescribed"
            class="text-dark-50 text-hover-primary font-weight-bold mr-lg-8 mr-5 mb-lg-0 mb-2"
            ><i class="flaticon2-calendar-2 mr-2 font-size-lg icon-lg"></i>Date Prescribed:
            <span class="ml-2 text-dark">{{
              prescription.date_prescribed | moment('ddd, MMM Do YYYY')
            }}</span></a
          >
        </div>
      </div>

      <span v-if="prescription.notes" class="font-weight-bold text-dark-50"
        >Notes: {{ prescription.notes }}</span
      >
    </div>
  </div>
</template>
<script>
export default {
  props: {
    prescription: {
      type: Object,
      required: true,
      default: () => {},
    },
  },
};
</script>
<style scoped>
.fa,
.fas,
.fab,
.far {
  line-height: 1.6;
}
</style>
