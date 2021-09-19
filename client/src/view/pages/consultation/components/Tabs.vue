<template>
  <div>
    <div class="header-top mb-6">
      <div class="container white">
        <div class="d-none d-lg-flex align-items-center mr-3">
          <ul
            class="header-tabs nav align-self-end font-size-lg"
            role="tablist"
          >
            <li class="nav-item">
              <a
                class="nav-link text-dark py-4 px-6 active"
                @click="setActiveTab($event, '#observations')"
                data-tab="0"
                data-toggle="tab"
                href="#"
                role="tab"
                aria-selected="true"
                >Observations</a
              >
            </li>
            <li class="nav-item mr-3">
              <a
                class="nav-link text-dark py-4 px-6"
                @click="setActiveTab($event, '#diagnosis')"
                data-tab="1"
                data-toggle="tab"
                href="#"
                role="tab"
                aria-selected="true"
                >Diagnosis</a
              >
            </li>
            <li class="nav-item mr-3">
              <a
                class="nav-link text-dark py-4 px-6"
                @click="setActiveTab($event, '#orders')"
                data-tab="1"
                data-toggle="tab"
                href="#"
                role="tab"
                aria-selected="true"
                >Orders</a
              >
            </li>
            <li class="nav-item mr-3">
              <a
                class="nav-link text-dark py-4 px-6"
                @click="setActiveTab"
                data-tab="1"
                data-toggle="tab"
                href="#"
                role="tab"
                aria-selected="true"
                >Medications</a
              >
            </li>
            <li class="nav-item mr-3">
              <a
                class="nav-link text-dark py-4 px-6"
                @click="setActiveTab"
                data-tab="1"
                data-toggle="tab"
                href="#"
                role="tab"
                aria-selected="true"
                >Radiology</a
              >
            </li>
            <li class="nav-item mr-3">
              <a
                class="nav-link text-dark py-4 px-6"
                @click="setActiveTab"
                data-tab="1"
                data-toggle="tab"
                href="#"
                role="tab"
                aria-selected="true"
                >Disposition</a
              >
            </li>
            <li class="nav-item mr-3">
              <a
                class="nav-link text-dark py-4 px-6"
                @click="setActiveTab"
                data-tab="1"
                data-toggle="tab"
                href="#"
                role="tab"
                aria-selected="true"
                >History</a
              >
            </li>
          </ul>
        </div>
      </div>
    </div>
    <component :is="activeComponent" />
  </div>
</template>

<script>
import Observations from "../tabs/Observations";
import Diagnosis from "../tabs/Diagnosis";
import Orders from "../tabs/Orders";

const ComponentMapping = {
  "#observations": Observations,
  "#diagnosis": Diagnosis,
  "#orders": Orders
};

export default {
  name: "Tabs",
  data() {
    return {
      tabIndex: 0,
      activeComponent: ""
    };
  },
  methods: {
    /**
     * Set current active on click
     * @param event
     * @param component
     */
    setActiveTab(event, component) {
      let target = event.target;
      if (!event.target.classList.contains("nav-link")) {
        target = event.target.closest(".nav-link");
      }

      const tab = target.closest('[role="tablist"]');
      const links = tab.querySelectorAll(".nav-link");
      // remove active tab links
      for (let i = 0; i < links.length; i++) {
        links[i].classList.remove("active");
      }

      // set clicked tab index to bootstrap tab
      this.tabIndex = parseInt(target.getAttribute("data-tab"));

      // set current active tab
      target.classList.add("active");

      this.setActiveComponent(component);
    },

    setActiveComponent(component) {
      this.activeComponent = ComponentMapping[component];
    }
  },
  created() {
    this.activeComponent = ComponentMapping["#observations"];
    this.$store.dispatch("visit/fetchVisit", this.$route.params.visitId);
  }
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
