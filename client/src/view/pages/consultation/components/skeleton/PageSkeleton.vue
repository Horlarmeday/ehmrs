<template>
  <div>
    <div class="header-top mb-6">
      <div class="mb-lg-5">
        <DefaultSkeleton />
      </div>
      <div class="container white">
        <div class="d-none d-lg-flex align-items-center mr-3">
          <ul class="header-tabs nav align-self-end font-size-lg" role="tablist">
            <li class="nav-item mr-1" v-for="(tab, index) in tabs" :key="index">
              <a
                class="nav-link text-dark py-4 px-6"
                :class="{
                  active: index === 0,
                }"
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
    <DefaultSkeleton />
  </div>
</template>
<script>
import DefaultSkeleton from '@/utils/DefaultSkeleton.vue';

export default {
  components: { DefaultSkeleton },
  props: {
    tabs: {
      type: Array,
      required: true,
    },
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
