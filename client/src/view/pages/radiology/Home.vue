<template>
  <div>
    <!--begin::Row-->
    <div class="row mb-10">
      <div class="col-lg-6 col-xl-4 mb-10" v-for="(card, i) in cards" :key="i">
        <!--begin::Callout-->
        <div class="card card-custom mb-2 bg-diagonal">
          <div class="card-body">
            <div
              class="d-flex align-items-center justify-content-between p-4 flex-lg-wrap flex-xl-nowrap"
            >
              <div class="d-flex flex-column mr-5">
                <router-link :to="card.link" class="h4 text-dark text-hover-primary mb-5">
                  {{ card.name }}
                </router-link>
                <p class="text-dark-50">
                  {{ card.desc }}
                </p>
              </div>
              <div class="ml-6 ml-lg-0 ml-xxl-6 flex-shrink-0">
                <router-link
                  :to="card.link"
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
  name: 'Radiology - Home',
  data() {
    return {
      cards: [
        {
          name: 'Radiology Orders',
          desc: 'Click here to view all radiology orders',
          link: '/radiology/requested-investigations',
        },
        {
          name: 'Imaging',
          link: '/radiology/imaging',
          desc: 'Click here to view imaging type',
          showComponent: true,
        },
        {
          name: 'Investigations',
          link: '/radiology/investigations',
          desc: 'Click here to view investigations',
          showComponent: true,
        },
        {
          name: 'Results Update',
          link: '/radiology/results-update',
          desc: 'Click here to update investigations result',
          showComponent: true,
        },
        {
          name: 'Combo Investigations',
          link: '/radiology/combo-investigations',
          desc: 'Click here to view combo investigations',
          showComponent: true,
        },
      ],
    };
  },
  watch: {
    currentUser: {
      handler(val) {
        this.items.filter((tab) => {
          if (val.role !== 'Super Admin' && tab.name === 'Results Update') {
            tab.showComponent = false;
          }
          return tab;
        });
      },
      immediate: true,
    },
  },
};
</script>

<style scoped></style>
