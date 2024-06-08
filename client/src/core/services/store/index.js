import Vue from 'vue';
import Vuex from 'vuex';

import auth from './auth/moduleAuth';
import patient from './patient/modulePatient';
import insurance from './insurance/moduleInsurance';
import employee from './employee/moduleEmployee';
import model from './model/moduleModel';
import store from './store/moduleStore';
import pharmacy from './pharmacy/modulePharmacy';
import laboratory from './laboratory/moduleLaboratory';
import visit from './visit/moduleVisit';
import consultation from './consultation/moduleConsultation';
import triage from './triage/moduleTriage';
import order from './order/moduleOrder';
import inventory from './inventory/moduleInventory';
import radiology from './radiology/moduleRadiology';
import diagnosis from './diagnosis/moduleDiagnosis';
import admission from './admission/moduleAdmission';
import request from './request/moduleRequest';
import antenatal from './antenatal/moduleAntenatal';
import surgery from './surgery/moduleSurgery';
import immunization from './immunization/moduleImmunization';
import alert from './alert/moduleAlert';
import settings from './settings/moduleSettings';
import htmlClass from './htmlclass.module';
import config from './config.module';
import breadcrumbs from './breadcrumbs.module';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    auth,
    patient,
    model,
    employee,
    insurance,
    store,
    pharmacy,
    laboratory,
    visit,
    consultation,
    triage,
    order,
    inventory,
    radiology,
    diagnosis,
    admission,
    request,
    antenatal,
    surgery,
    immunization,
    alert,
    settings,
    htmlClass,
    config,
    breadcrumbs,
  },
  strict: process.env.NODE_ENV !== 'production',
});
