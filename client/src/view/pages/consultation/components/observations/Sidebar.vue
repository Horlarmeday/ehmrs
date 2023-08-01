<template>
  <div class="flex-row-auto offcanvas-mobile w-xl-250px" id="kt_profile_aside">
    <div class="card card-custom card-stretch">
      <div class="card-body pt-4 p-0">
        <div
          class="navi navi-bold navi-hover navi-active navi-link-rounded"
          :style="{ backgroundColor: backgroundColor }"
        >
          <div class="navi-item mb-2" v-for="(data, i) in list" :key="i">
            <a
              href="#"
              @click="switchTab(data.link, $event)"
              :data-active="i"
              class="navi-link"
              :class="{ active: tabIndex === i, disabled: tabIndex === i }"
            >
              <span class="navi-text font-size-lg p-0">
                {{ data.name }}
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Sidebar',
  data() {
    return {
      tabIndex: 0,
    };
  },
  props: {
    list: { type: Array, required: true, default: () => [] },
    backgroundColor: { type: String },
  },
  methods: {
    switchTab(tab, event) {
      this.$emit('changeTab', tab);
      this.setActiveTab(event, tab);
    },
    setActiveTab(event, tab) {
      let target = event.target;
      if (!event.target.classList.contains('navi-link')) {
        target = event.target.closest('.navi-link');
      }

      // const tab = target.closest('[role="tablist"]');
      const links = document.querySelectorAll('.navi-link');
      // remove active tab links
      for (let i = 0; i < links.length; i++) {
        links[i].classList.remove('active');
      }

      // set clicked tab index to bootstrap tab
      this.tabIndex = parseInt(target.getAttribute('data-active'));

      // set current active tab
      target.classList.add('active');
      target.setAttribute('disabled', true);

      this.$router.push({
        query: {
          subTab: tab,
          subTabIndex: this.tabIndex,
        },
      });
    },
    getActiveTabIndex() {
      const storedTabIndex = this.$route.query.subTabIndex;
      if (storedTabIndex) {
        this.tabIndex = parseInt(storedTabIndex);
      } else {
        this.tabIndex = 0;
      }
    },
  },
  created() {
    this.getActiveTabIndex();
  },
};
</script>

<style scoped>
.navi .navi-item .navi-link.disabled {
  opacity: 0.9;
  background-color: #ecf2f8;
}
</style>
