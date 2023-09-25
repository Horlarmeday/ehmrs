<template>
  <div>
    <component :is="dashboardComponent" />
  </div>
</template>

<script>
import SuperAdmin from './superadmin/Dashboard.vue';
import Laboratory from './laboratory/Dashboard.vue';
import Radiology from './radiology/Dashboard.vue';
import Pharmacy from './pharmacy/Dashboard.vue';
import Doctor from './medicalPractitioners/generalPractitioner/Dashboard.vue';
import { parseJwt } from '@/common/common';
export default {
  data: () => ({
    dashboardComponent: null,
  }),
  methods: {
    renderDashboard(token) {
      const role = parseJwt(token);
      switch (role.role) {
        case 'Super Admin':
          return (this.dashboardComponent = SuperAdmin);
        case 'Laboratory':
          return (this.dashboardComponent = Laboratory);
        case 'Radiology':
          return (this.dashboardComponent = Radiology);
        case 'Pharmacy':
          return (this.dashboardComponent = Pharmacy);
        case 'General Practitioner':
          return (this.dashboardComponent = Doctor);
        default:
          return (this.dashboardComponent = SuperAdmin);
      }
    },
  },
  created() {
    const token = this.$store.state.auth.token;
    this.renderDashboard(token);
  },
};
</script>

<style scoped></style>
