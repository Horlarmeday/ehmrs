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
import PharmacyStore from './pharmacyStore/Dashboard.vue';
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
import Physiotherapist from './medicalPractitioners/physiotherapist/Dashboard.vue';
import GOPD from './nurse/opd/Dashboard.vue';
import FemaleWard from './nurse/femaleWard/Dashboard.vue';
import MaleWard from './nurse/maleWard/Dashboard.vue';
import ChildrenWard from './nurse/childrenWard/Dashboard.vue';
import Maternity from './nurse/maternity/Dashboard.vue';
import Antenatal from './nurse/antenatal/Dashboard.vue';
import HealthInsurance from './nhis/Dashboard.vue';
import CustomerCare from './reception/Dashboard.vue';
import Theater from './nurse/theater/Dashboard.vue';
import FinancialOfficer from './financeOfficer/Dashboard.vue';
import HODNurse from './nurse/hod/Dashboard.vue';
import HODLaboratory from './laboratory/hod/Dashboard.vue';
import Emergency from './nurse/emergency/Dashboard.vue';
import VIPWard from './nurse/vip/Dashboard.vue';
import HODPharmacy from './pharmacy/hod/Dashboard.vue';
import { parseJwt } from '@/common/common';
import { departments } from '@/view/pages/employees/create/employeeRoles';
import Admin from '@/view/pages/admin/Admin.vue';
import Geriatrics from '@/view/pages/home/medicalPractitioners/geriatrics/Dashboard.vue';
import LifestyleMedicine from '@/view/pages/home/medicalPractitioners/livestyleMedicine/Dashboard.vue';
import AdolescentHealth from '@/view/pages/home/medicalPractitioners/adolescentHealth/Dashboard.vue';
import HospicesAndPalliative from '@/view/pages/home/medicalPractitioners/hospicesAndPalliative/Dashboard.vue';
import SportsMedicine from '@/view/pages/home/medicalPractitioners/sportsMedicine/Dashboard.vue';
import PlasticSurgeon from '@/view/pages/home/medicalPractitioners/plasticSurgeon/Dashboard.vue';
import ENT from '@/view/pages/home/medicalPractitioners/ENT/Dashboard.vue';
import DentalSurgeon from '@/view/pages/home/medicalPractitioners/dentalSurgeon/Dashboard.vue';
import PediatricsSurgeon from '@/view/pages/home/medicalPractitioners/pediatricsSurgeon/Dashboard.vue';
import Anesthesiologist from '@/view/pages/home/medicalPractitioners/anesthesiologist/Dashboard.vue';
import Radiologist from '@/view/pages/home/medicalPractitioners/radiologist/Dashboard.vue';
import InfectiousDiseaseSpecialist from '@/view/pages/home/medicalPractitioners/infectiousDiseaseSpecialist/Dashboard.vue';
import GeneralMedicine from '@/view/pages/home/medicalPractitioners/generalMedicine/Dashboard.vue';
import Rheumatologist from '@/view/pages/home/medicalPractitioners/rheumatologist/Dashboard.vue';
import PediatricCardiologist from '@/view/pages/home/medicalPractitioners/pediatricCardiologist/Dashboard.vue';
import PediatricEndocrinologist from '@/view/pages/home/medicalPractitioners/pediatricEndocrinologist/Dashboard.vue';
import PediatricDermatologist from '@/view/pages/home/medicalPractitioners/pediatricDermatologist/Dashboard.vue';
import Nephrologist from '@/view/pages/home/medicalPractitioners/nephrologist/Dashboard.vue';
import PediatricGastroenterologist from '@/view/pages/home/medicalPractitioners/pediatricGastroenterologist/Dashboard.vue';
import PediatricInfectiousDisease from '@/view/pages/home/medicalPractitioners/pediatricInfectiousDisease/Dashboard.vue';
import AdolescentMedicine from '@/view/pages/home/medicalPractitioners/adolescentMedicine/Dashboard.vue';
import Infertility from '@/view/pages/home/medicalPractitioners/infertility/Dashboard.vue';
import ObstetricEndocrinologist from '@/view/pages/home/medicalPractitioners/obstetricEndocrinologist/Dashboard.vue';
import MaternalFetalMedicine from '@/view/pages/home/medicalPractitioners/maternalFetalMedicine/Dashboard.vue';
import PediatricEmergency from '@/view/pages/home/medicalPractitioners/pediatricEmergency/Dashboard.vue';

const DEPARTMENTS = {
  MEDICAL_PRACTITIONERS: 'Medical Practitioners',
  SURGERY_UNIT: 'Surgery Unit',
  MEDICINE_UNIT: 'Medicine Unit',
  PEDIATRICS_UNIT: 'Pediatrics Unit',
  OBSTETRICS_AND_GYNAECOLOGY_UNIT: 'Obstetrics & Gynaecology Unit',
  FAMILY_MEDICINE_UNIT: 'Family Medicine Unit',
  RECORDS: 'Records',
  NURSING: 'Nursing',
  PHARMACY: 'Pharmacy',
  LABORATORY: 'Laboratory',
  RADIOLOGY: 'Radiology',
  RECEPTION: 'Reception',
  ACCOUNTS: 'Accounts',
  ADMINISTRATION: 'Administration',
  HEALTH_INSURANCE: 'Health Insurance',
  STORE: 'Store',
};

const ROLES = {
  ADMIN: 'Admin',
  ADOLESCENT_HEALTH: 'Adolescent Health',
  ADOLESCENTS_MEDICINE: 'Adolescents medicine',
  ANESTHESIOLOGIST: 'Anesthesiologist',
  CARDIOLOGIST: 'Cardiologist',
  CUSTOMER_CARE: 'Customer Care',
  DENTAL_SURGEON: 'Dental Surgeon',
  DERMATOLOGIST: 'Dermatologist',
  EMERGENCY: 'Emergency',
  ENDOCRINOLOGIST: 'Endocrinologist',
  FINANCE_OFFICER: 'Finance Officer',
  GENERAL_MEDICINE: 'General Medicine',
  GENERAL_PRACTITIONER: 'General Practitioner',
  GERIATRICS: 'Geriatrics',
  GYNECOLOGY_ONCOLOGIST: 'Gynecology Oncologist',
  HOD_LABORATORY: 'HOD Laboratory',
  HOD_PHARMACY: 'HOD Pharmacy',
  HOD_RADIOLOGY: 'HOD Radiology',
  HEALTH_INSURANCE: 'Health Insurance',
  INFECTIOUS_DISEASE: 'Infectious Disease',
  INFECTIOUS_DISEASE_SPECIALIST: 'Infectious Disease Specialist',
  INFERTILITY: 'Infertility',
  LAB_STORE: 'Lab Store',
  LABORATORY_MANAGER: 'Laboratory Manager',
  LABORATORY_RECEPTIONIST: 'Laboratory Receptionist',
  LABORATORY_TECHNICIAN: 'Laboratory Technician',
  LIFESTYLE_MEDICINE: 'Lifestyle Medicine',
  MATERNAL_FETAL_MEDICINE: 'Maternal-Fetal Medicine',
  MEDICAL_RECORDS: 'Medical Records',
  NEPHROLOGIST: 'Nephrologist',
  NEUROLOGIST: 'Neurologist',
  NURSE: 'Nurse',
  OBSTETRICS_ENDOCRINOLOGIST: 'Obstetrics Endocrinologist',
  ONCOLOGIST: 'Oncologist',
  OPHTHALMOLOGIST: 'Ophthalmologist',
  ORTHOPAEDIST: 'Orthopaedist',
  PAEDIATRICS_SURGEON: 'Paediatrics Surgeon',
  PEDIATRIC_CARDIOLOGIST: 'Pediatric Cardiologist',
  PHARMACY: 'Pharmacy',
  PHARMACY_STORE: 'Pharmacy Store',
  PLASTIC_SURGEON: 'Plastic Surgeon',
  PSYCHIATRIST: 'Psychiatrist',
  RADIOLOGY: 'Radiology',
  RHEUMATOLOGIST: 'Rheumatologist',
  SPORTS_MEDICINE: 'Sports Medicine',
  SUPER_ADMIN: 'Super Admin',
  UROLOGIST: 'Urologist',
  HOSPICES_AND_PALLIATIVE_CARE: 'Hospices and Palliative Care',
  EAR_NOSE_AND_THROAT_ENT_SPECIALIST: 'Ear, Nose and Throat (ENT) Specialist',
  GASTROENTEROLOGIST: 'Gastroenterologist',
};

const SubRoles = {
  G_OPD: 'G-OPD',
  FEMALE_WARD: 'Female Ward',
  MALE_WARD: 'Male Ward',
  CHILDREN_WARD: 'Children Ward',
  MATERNITY: 'Maternity',
  ANTENATAL: 'ANC',
  THEATER: 'Theater',
  HOD: 'HOD',
  EMERGENCY: 'Accident & Emergency',
  VIP_PRIVATE: 'VIP/Private',
};
export default {
  data: () => ({
    dashboardComponent: null,
  }),
  methods: {
    renderDashboard(token) {
      const parsedToken = parseJwt(token);
      console.log(parsedToken);
      const department = departments.find(
        department => department.department === parsedToken.department
      );
      if (department) {
        switch (department.department) {
          case DEPARTMENTS.ADMINISTRATION:
            return this.getAdminDashboard(parsedToken.role);
          case DEPARTMENTS.RECORDS:
            return this.getMedicalRecordsDashboard(parsedToken.role);
          case DEPARTMENTS.RADIOLOGY: {
            console.log(parsedToken);
            return this.getRadiologyDashboard(parsedToken.role);
          }
          case DEPARTMENTS.PHARMACY:
            return this.getPharmacyDashboard(parsedToken.role);
          case DEPARTMENTS.LABORATORY:
            return this.getLaboratoryDashboard(parsedToken.role);
          case DEPARTMENTS.NURSING:
            return this.getNurseDashboard(parsedToken.sub_role);
          case DEPARTMENTS.ACCOUNTS:
            return this.getAccountsDashboard(parsedToken.role);
          case DEPARTMENTS.RECEPTION:
            return this.getReceptionDashboard(parsedToken.role);
          case DEPARTMENTS.HEALTH_INSURANCE:
            return this.getHealthInsuranceDashboard(parsedToken.role);
          case DEPARTMENTS.FAMILY_MEDICINE_UNIT:
            return this.getFamilyMedicineDashboard(parsedToken.role);
          case DEPARTMENTS.SURGERY_UNIT:
            return this.getSurgeryDashboard(parsedToken.role);
          case DEPARTMENTS.MEDICINE_UNIT:
            return this.getMedicineUnitDashboard(parsedToken.role);
          case DEPARTMENTS.OBSTETRICS_AND_GYNAECOLOGY_UNIT:
            return this.getObstetricsAndGynaecologyDashboard(parsedToken.role);
          case DEPARTMENTS.PEDIATRICS_UNIT:
            return this.getPediatricsDashboard(parsedToken.role);
          case DEPARTMENTS.STORE:
            return this.getStoreDashboard(parsedToken.role);
          case DEPARTMENTS.MEDICAL_PRACTITIONERS:
            return this.getMedicalPractitionerDashboard(parsedToken.role);
          default:
            return this.getMedicalRecordsDashboard(parsedToken.role);
        }
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
        case SubRoles.HOD:
          return (this.dashboardComponent = HODNurse);
        case SubRoles.EMERGENCY:
          return (this.dashboardComponent = Emergency);
        case SubRoles.VIP_PRIVATE:
          return (this.dashboardComponent = VIPWard);
      }
    },

    getLaboratoryDashboard(role) {
      switch (role) {
        case ROLES.LABORATORY_TECHNICIAN:
          return (this.dashboardComponent = Laboratory);
        case ROLES.HOD_LABORATORY:
          return (this.dashboardComponent = HODLaboratory);
        case ROLES.LABORATORY_MANAGER:
          return (this.dashboardComponent = Laboratory);
        default:
          return (this.dashboardComponent = Laboratory);
      }
    },

    getPharmacyDashboard(role) {
      switch (role) {
        case ROLES.PHARMACY:
          return (this.dashboardComponent = Pharmacy);
        case ROLES.HOD_PHARMACY:
          return (this.dashboardComponent = HODPharmacy);
        default:
          return (this.dashboardComponent = Pharmacy);
      }
    },

    getAdminDashboard(role) {
      switch (role) {
        case ROLES.SUPER_ADMIN:
          return (this.dashboardComponent = SuperAdmin);
        default:
          return (this.dashboardComponent = Admin);
      }
    },

    getMedicalRecordsDashboard(role) {
      switch (role) {
        case ROLES.MEDICAL_RECORDS:
          return (this.dashboardComponent = MedicalRecords);
        default:
          return (this.dashboardComponent = MedicalRecords);
      }
    },

    getRadiologyDashboard(role) {
      switch (role) {
        case ROLES.RADIOLOGY:
          return (this.dashboardComponent = Radiology);
        default:
          return (this.dashboardComponent = Radiology);
      }
    },

    getAccountsDashboard(role) {
      switch (role) {
        case ROLES.FINANCE_OFFICER:
          return (this.dashboardComponent = FinancialOfficer);
        default:
          return (this.dashboardComponent = FinancialOfficer);
      }
    },

    getReceptionDashboard(role) {
      switch (role) {
        case ROLES.CUSTOMER_CARE:
          return (this.dashboardComponent = CustomerCare);
        default:
          return (this.dashboardComponent = CustomerCare);
      }
    },

    getHealthInsuranceDashboard(role) {
      switch (role) {
        case ROLES.HEALTH_INSURANCE:
          return (this.dashboardComponent = HealthInsurance);
        default:
          return (this.dashboardComponent = HealthInsurance);
      }
    },

    getFamilyMedicineDashboard(role) {
      switch (role) {
        case ROLES.GERIATRICS:
          return (this.dashboardComponent = Geriatrics);
        case ROLES.LIFESTYLE_MEDICINE:
          return (this.dashboardComponent = LifestyleMedicine);
        case ROLES.ADOLESCENT_HEALTH:
          return (this.dashboardComponent = AdolescentHealth);
        case ROLES.HOSPICES_AND_PALLIATIVE_CARE:
          return (this.dashboardComponent = HospicesAndPalliative);
        case ROLES.SPORTS_MEDICINE:
          return (this.dashboardComponent = SportsMedicine);
        default:
          return (this.dashboardComponent = Physiotherapist);
      }
    },

    getSurgeryDashboard(role) {
      switch (role) {
        case ROLES.OPHTHALMOLOGIST:
          return (this.dashboardComponent = Ophthalmologist);
        case ROLES.NEUROLOGIST:
          return (this.dashboardComponent = Neurologist);
        case ROLES.ORTHOPAEDIST:
          return (this.dashboardComponent = Orthopaedist);
        case ROLES.UROLOGIST:
          return (this.dashboardComponent = Urologist);
        case ROLES.PLASTIC_SURGEON:
          return (this.dashboardComponent = PlasticSurgeon);
        case ROLES.EAR_NOSE_AND_THROAT_ENT_SPECIALIST:
          return (this.dashboardComponent = ENT);
        case ROLES.DENTAL_SURGEON:
          return (this.dashboardComponent = DentalSurgeon);
        case ROLES.PAEDIATRICS_SURGEON:
          return (this.dashboardComponent = PediatricsSurgeon);
        case ROLES.ANESTHESIOLOGIST:
          return (this.dashboardComponent = Anesthesiologist);
        case ROLES.RADIOLOGY:
          return (this.dashboardComponent = Radiologist);
        default:
          return (this.dashboardComponent = Geriatrics);
      }
    },

    getMedicineUnitDashboard(role) {
      switch (role) {
        case ROLES.ONCOLOGIST:
          return (this.dashboardComponent = Oncologist);
        case ROLES.CARDIOLOGIST:
          return (this.dashboardComponent = Cardiologist);
        case ROLES.DERMATOLOGIST:
          return (this.dashboardComponent = Dermatologist);
        case ROLES.PSYCHIATRIST:
          return (this.dashboardComponent = Psychiatrist);
        case ROLES.ENDOCRINOLOGIST:
          return (this.dashboardComponent = Endocrinologist);
        case ROLES.GASTROENTEROLOGIST:
          return (this.dashboardComponent = Gastroenterologist);
        case ROLES.INFECTIOUS_DISEASE_SPECIALIST:
          return (this.dashboardComponent = InfectiousDiseaseSpecialist);
        case ROLES.GENERAL_MEDICINE:
          return (this.dashboardComponent = GeneralMedicine);
        case ROLES.RHEUMATOLOGIST:
          return (this.dashboardComponent = Rheumatologist);
        default:
          return (this.dashboardComponent = Oncologist);
      }
    },

    getObstetricsAndGynaecologyDashboard(role) {
      switch (role) {
        case ROLES.GYNECOLOGY_ONCOLOGIST:
          return (this.dashboardComponent = Gynaecologist);
        case ROLES.INFERTILITY:
          return (this.dashboardComponent = Infertility);
        case ROLES.OBSTETRICS_ENDOCRINOLOGIST:
          return (this.dashboardComponent = ObstetricEndocrinologist);
        case ROLES.MATERNAL_FETAL_MEDICINE:
          return (this.dashboardComponent = MaternalFetalMedicine);
        default:
          return (this.dashboardComponent = Gynaecologist);
      }
    },

    getPediatricsDashboard(role) {
      switch (role) {
        case ROLES.PEDIATRIC_CARDIOLOGIST:
          return (this.dashboardComponent = PediatricCardiologist);
        case ROLES.ENDOCRINOLOGIST:
          return (this.dashboardComponent = PediatricEndocrinologist);
        case ROLES.INFECTIOUS_DISEASE:
          return (this.dashboardComponent = PediatricInfectiousDisease);
        case ROLES.DERMATOLOGIST:
          return (this.dashboardComponent = PediatricDermatologist);
        case ROLES.ADOLESCENTS_MEDICINE:
          return (this.dashboardComponent = AdolescentMedicine);
        case ROLES.GASTROENTEROLOGIST:
          return (this.dashboardComponent = PediatricGastroenterologist);
        case ROLES.NEUROLOGIST:
          return (this.dashboardComponent = Nephrologist);
        case ROLES.EMERGENCY:
          return (this.dashboardComponent = PediatricEmergency);
        default:
          return (this.dashboardComponent = Pediatrician);
      }
    },

    getStoreDashboard(role) {
      switch (role) {
        case ROLES.PHARMACY_STORE:
          return (this.dashboardComponent = PharmacyStore);
        case ROLES.LAB_STORE:
          return (this.dashboardComponent = PharmacyStore);
        default:
          return (this.dashboardComponent = PharmacyStore);
      }
    },

    getMedicalPractitionerDashboard(role) {
      switch (role) {
        case ROLES.GENERAL_PRACTITIONER:
          return (this.dashboardComponent = Doctor);
        default:
          return (this.dashboardComponent = Doctor);
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
