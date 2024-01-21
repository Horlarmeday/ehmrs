<template>
  <div class="alert alert-custom alert-light-primary fade show" role="alert">
    <div class="d-flex">
      <!--begin: Pic-->
      <div class="flex-shrink-0 mr-7 mt-lg-0 mt-3">
        <div class="symbol symbol-lg-60 symbol-circle">
          <img
            v-if="!imageError"
            alt="Pic"
            :src="imageUrl(patient.photo)"
            @load="handleImageLoad"
            @error="handleImageError"
          />
          <span v-else class="symbol-label font-size-h4">
            {{ patient?.firstname?.charAt(0)?.toUpperCase() }}
            {{ patient?.lastname?.charAt(0)?.toUpperCase() }}
          </span>
        </div>
      </div>
      <!--end::Pic-->

      <!--begin::Info-->
      <div class="flex-grow-1">
        <!--begin::Title-->
        <div class="d-flex justify-content-between flex-wrap mt-1">
          <div class="d-flex mr-3">
            <a
              href="#"
              class="text-dark-75 font-weight-bolder text-hover-primary font-size-h5 font-weight-bold mr-3"
              >{{ patient.fullname }}</a
            >
            <a href="#"><i class="flaticon2-correct text-success font-size-h5"></i></a>
          </div>
        </div>
        <!--end::Title-->

        <!--begin::Content-->
        <div class="d-flex flex-wrap justify-content-between mt-1">
          <div class="d-flex flex-column flex-grow-1 pr-8">
            <div class="d-flex flex-wrap mb-4">
              <a
                href="#"
                class="text-dark-75 font-weight-bold text-hover-primary font-weight-bold mr-lg-8 mr-5 mb-lg-0 mb-2"
                ><i class="flaticon-user mr-2 font-size-lg icon-md"></i>{{ patient.hospital_id }}
              </a>
            </div>

            <div class="d-flex flex-wrap">
              <span class="font-weight-bold text-dark-75 mr-5"
                ><i class="flaticon2-calendar-3 mr-1 font-size-lg icon-md"></i> Phone Number:
                <span class="font-weight-bold text-dark-50 ml-3">{{ patient.phone }}</span></span
              >
              <span class="mr-3" style="border: 1px solid gainsboro; height: 25px"></span>
              <span class="font-weight-bold text-dark-75 mr-5"
                ><i class="flaticon-technology-1 mr-1 font-size-lg icon-md"></i> Gender:
                <span class="font-weight-bold text-dark-50 ml-3">{{ patient.gender }}</span></span
              >
              <span class="mr-3" style="border: 1px solid gainsboro; height: 25px"></span>
              <span class="font-weight-bold text-dark-75 mr-5"
                ><i class="flaticon-bus-stop mr-1 font-size-lg icon-md"></i> Address:
                <span class="font-weight-bold text-dark-50 ml-3">{{ patient.address }}</span></span
              >
              <span class="mr-3" style="border: 1px solid gainsboro; height: 25px"></span>
              <span class="font-weight-bold text-dark-75 mr-5"
                ><i class="flaticon-user mr-1 font-size-lg icon-md"></i> Age:
                <span class="font-weight-bold text-dark-50 ml-3"
                  >{{ calculateAge(patient.date_of_birth) }} years old</span
                ></span
              >
            </div>
          </div>
        </div>
        <!--end::Content-->
      </div>
      <!--end::Info-->
    </div>
  </div>
</template>

<script>
import { calculateAge } from '@/common/common';

export default {
  data: () => ({
    imageError: false,
  }),
  props: {
    patient: {
      type: Object,
      required: true,
      default: () => {},
    },
  },
  methods: {
    calculateAge,
    imageUrl(url) {
      return `${window.location.origin}/static/images/${url}`;
    },
    handleImageLoad() {
      this.imageError = false;
    },
    handleImageError() {
      this.imageError = true;
    },
  },
};
</script>

<style scoped></style>
