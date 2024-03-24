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
import MedicalRecords from './medicalrecords/Dashboard.vue';
import Doctor from './medicalPractitioners/generalPractitioner/Dashboard.vue';
import Pediatrician from './medicalPractitioners/pediatrician/Dashboard.vue';
import Cardiologist from './medicalPractitioners/cardiologist/Dashboard.vue';
import Gynaecologist from './medicalPractitioners/gyneacologist/Dashboard.vue';
import Oncologist from './medicalPractitioners/oncologist/Dashboard.vue';
import Ophthalmologist from './medicalPractitioners/opthalmology/Dashboard.vue';
import Dermatologist from './medicalPractitioners/dermatologist/Dashboard.vue';
import Psychiatrist from './medicalPractitioners/psychiatrist/Dashboard.vue';
import Neurologist from './medicalPractitioners/neurologist/Dashboard.vue';
import Orthopaedist from './medicalPractitioners/orthopeadist/Dashboard.vue';
import Urologist from './medicalPractitioners/urologist/Dashboard.vue';
import Endocrinologist from './medicalPractitioners/endocrinologist/Dashboard.vue';
import Gastroenterologist from './medicalPractitioners/gastroenterologist/Dashboard.vue';
import GOPD from './nurse/opd/Dashboard.vue';
import FemaleWard from './nurse/femaleWard/Dashboard.vue';
import MaleWard from './nurse/maleWard/Dashboard.vue';
import ChildrenWard from './nurse/childrenWard/Dashboard.vue';
import Maternity from './nurse/maternity/Dashboard.vue';
import Antenatal from './nurse/antenatal/Dashboard.vue';
import NHIS from './nhis/Dashboard.vue';
import CustomerCare from './reception/Dashboard.vue';
import Theater from './nurse/theater/Dashboard.vue';
import { parseJwt } from '@/common/common';

const Roles = {
  SUPER_ADMIN: 'Super Admin',
  LABORATORY: 'Laboratory',
  RADIOLOGY: 'Radiology',
  PHARMACY: 'Pharmacy',
  GENERAL_PRACTITIONER: 'General Practitioner',
  CARDIOLOGIST: 'Cardiologist',
  GYNAECOLOGIST: 'Obstetrics and gynaecologist',
  PEDIATRICIAN: 'Pediatrician',
  ONCOLOGIST: 'Oncologist',
  OPHTHALMOLOGIST: 'Ophthalmologist',
  NEUROLOGIST: 'Neurologist',
  DERMATOLOGIST: 'Dermatologist',
  PSYCHIATRIST: 'Psychiatrist',
  ORTHOPAEDIST: 'Orthopaedist',
  UROLOGIST: 'Urologist',
  ENDOCRINOLOGIST: 'Endocrinologist',
  GASTROENTEROLOGIST: 'Gastroenterologist',
  MEDICAL_RECORDS: 'Medical Records',
  NURSE: 'Nurse',
  NHIS: 'NHIS',
  CUSTOMER_CARE: 'Customer Care',
};
const SubRoles = {
  G_OPD: 'G-OPD',
  FEMALE_WARD: 'Female Ward',
  MALE_WARD: 'Male Ward',
  CHILDREN_WARD: 'Children Ward',
  MATERNITY: 'Maternity',
  ANTENATAL: 'ANC',
  THEATER: 'Theater',
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
        case Roles.CUSTOMER_CARE:
          return (this.dashboardComponent = CustomerCare);
        case Roles.NURSE:
          return this.getNurseDashboard(role.sub_role);
        case Roles.PEDIATRICIAN:
          return (this.dashboardComponent = Pediatrician);
        case Roles.OPHTHALMOLOGIST:
          return (this.dashboardComponent = Ophthalmologist);
        case Roles.ONCOLOGIST:
          return (this.dashboardComponent = Oncologist);
        case Roles.NEUROLOGIST:
          return (this.dashboardComponent = Neurologist);
        case Roles.PSYCHIATRIST:
          return (this.dashboardComponent = Psychiatrist);
        case Roles.ORTHOPAEDIST:
          return (this.dashboardComponent = Orthopaedist);
        case Roles.CARDIOLOGIST:
          return (this.dashboardComponent = Cardiologist);
        case Roles.GYNAECOLOGIST:
          return (this.dashboardComponent = Gynaecologist);
        case Roles.DERMATOLOGIST:
          return (this.dashboardComponent = Dermatologist);
        case Roles.UROLOGIST:
          return (this.dashboardComponent = Urologist);
        case Roles.ENDOCRINOLOGIST:
          return (this.dashboardComponent = Endocrinologist);
        case Roles.GASTROENTEROLOGIST:
          return (this.dashboardComponent = Gastroenterologist);
        default:
          return (this.dashboardComponent = MedicalRecords);
      }
    },

    getNurseDashboard(subRole) {
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
        case SubRoles.THEATER:
          return (this.dashboardComponent = Theater);
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
