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
import MedicalRecords from './medicalrecords/Dashboard.vue';
import GOPD from './nurse/opd/Dashboard.vue';
import FemaleWard from './nurse/femaleWard/Dashboard.vue';
import MaleWard from './nurse/maleWard/Dashboard.vue';
import ChildrenWard from './nurse/childrenWard/Dashboard.vue';
import Maternity from './nurse/maternity/Dashboard.vue';
import Antenatal from './nurse/antenatal/Dashboard.vue';
import NHIS from './nhis/Dashboard.vue';
import { parseJwt } from '@/common/common';

const Roles = {
  SUPER_ADMIN: 'Super Admin',
  LABORATORY: 'Laboratory',
  RADIOLOGY: 'Radiology',
  PHARMACY: 'Pharmacy',
  GENERAL_PRACTITIONER: 'General Practitioner',
  MEDICAL_RECORDS: 'Medical Records',
  NURSE: 'Nurse',
  NHIS: 'NHIS',
};
const SubRoles = {
  G_OPD: 'G-OPD',
  FEMALE_WARD: 'Female Ward',
  MALE_WARD: 'Male Ward',
  CHILDREN_WARD: 'Children Ward',
  MATERNITY: 'Maternity',
  ANTENATAL: 'ANC',
};
export default {
  data: () => ({
    dashboardComponent: null,
  }),
  methods: {
    renderDashboard(token) {
      const role = parseJwt(token);
      switch (role.role) {
        case Roles.SUPER_ADMIN:
          return (this.dashboardComponent = SuperAdmin);
        case Roles.LABORATORY:
          return (this.dashboardComponent = Laboratory);
        case Roles.RADIOLOGY:
          return (this.dashboardComponent = Radiology);
        case Roles.PHARMACY:
          return (this.dashboardComponent = Pharmacy);
        case Roles.GENERAL_PRACTITIONER:
          return (this.dashboardComponent = Doctor);
        case Roles.MEDICAL_RECORDS:
          return (this.dashboardComponent = MedicalRecords);
        case Roles.NHIS:
          return (this.dashboardComponent = NHIS);
        case Roles.NURSE:
          return this.getSubRoleDashboard(role.sub_role);
        default:
          return (this.dashboardComponent = MedicalRecords);
      }
    },

    getSubRoleDashboard(subRole) {
      switch (subRole) {
        case SubRoles.G_OPD:
          return (this.dashboardComponent = GOPD);
        case SubRoles.FEMALE_WARD:
          return (this.dashboardComponent = FemaleWard);
        case SubRoles.MALE_WARD:
          return (this.dashboardComponent = MaleWard);
        case SubRoles.CHILDREN_WARD:
          return (this.dashboardComponent = ChildrenWard);
        case SubRoles.MATERNITY:
          return (this.dashboardComponent = Maternity);
        case SubRoles.ANTENATAL:
          return (this.dashboardComponent = Antenatal);
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
