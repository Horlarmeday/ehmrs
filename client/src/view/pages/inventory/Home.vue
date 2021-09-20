<template>
  <div>
    <!--begin::Row-->
    <div class="row mb-10">
      <div
        class="col-lg-6 col-xl-4 mb-10"
        v-for="(inventory, i) in inventories"
        :key="i"
      >
        <!--begin::Callout-->
        <div class="card card-custom mb-2 bg-diagonal">
          <div class="card-body">
            <div
              class="d-flex align-items-center justify-content-between p-4 flex-lg-wrap flex-xl-nowrap"
            >
              <div class="d-flex flex-column mr-5">
                <router-link
                  :to="inventory.link"
                  class="h4 text-dark text-hover-primary mb-5"
                >
                  {{ inventory.name }}
                </router-link>
                <p class="text-dark-50">
                  {{ inventory.desc }}
                </p>
              </div>
              <div class="ml-6 ml-lg-0 ml-xxl-6 flex-shrink-0">
                <router-link
                  :to="inventory.link"
                  class="btn font-weight-bolder text-uppercase btn-light-primary py-4 px-6"
                >
                  View
                </router-link>
              </div>
            </div>
          </div>
        </div>
        <!--end::Callout-->
      </div>
    </div>
    <!--end::Row-->
  </div>
</template>

<script>
export default {
  name: "Home.vue",
  data() {
    return {
      inventories: [
        {
          name: "Outpatient Inventory",
          link: "/inventory/outpatient-inventory",
          desc: "Click here to view items in the outpatient inventory"
        },
        {
          name: "Inpatient Inventory",
          link: "/inventory/inpatient-inventory",
          desc: "Click here to view items in the inpatient inventory"
        },
        {
          name: "NHIS Outpatient Inventory",
          link: "/inventory/nhis-outpatient-inventory",
          desc: "Click here to view items in the NHIS outpatient inventory"
        },
        {
          name: "NHIS Inpatient Inventory",
          link: "/inventory/nhis-inpatient-inventory",
          desc: "Click here to view items in the NHIS inpatient inventory"
        }
      ]
    };
  }
};
</script>

<style scoped></style>
