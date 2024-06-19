<template>
  <div class="card card-custom card-stretch gutter-b card-shadowless">
    <div v-if="!loading">
      <div v-if="!isEmptySummary">
        <div class="card-body">
          <div
            v-for="(summary, i) in summaries"
            :key="i"
            class="card card-custom card-stretch card-stretch-fourth gutter-b"
          >
            <div
              class="accordion accordion-solid accordion-panel accordion-svg-toggle"
              role="tablist"
            >
              <div class="card">
                <div class="card-header" header-tag="header" role="tab" style="background: blue">
                  <div class="card-title accord" v-b-toggle="`accordion-${i}`">
                    <span
                      :title="`Visit ${summary.status}`"
                      v-b-tooltip.hover
                      :class="getVisitDotStatus(summary.status)"
                      class="label label-dot label-xl mr-3"
                    ></span>
                    <div class="card-label text-dark-50">
                      <span class="mr-5">
                        <span class="mr-2 text-dark">Start:</span>
                        <span>{{
                          summary.date_visit_start | dayjs('ddd, MMM Do YYYY, h:mma')
                        }}</span>
                      </span>
                      <span v-if="summary.date_visit_ended">
                        <span class="mr-2 text-dark">End:</span>
                        <span>{{
                          summary.date_visit_ended | dayjs('ddd, MMM Do YYYY, h:mma')
                        }}</span>
                      </span>
                      <span
                        :class="getLabelStatusColor(summary.category)"
                        class="label label-pill label-inline mr-2 ml-2"
                        >{{ summary.category }}</span
                      >
                    </div>
                    <div class="">
                      <span class="font-size-h6-md font-italic mr-4">Created By:</span>
                      <span class="font-size-h6-md">{{ summary?.staff?.fullname }}</span>
                    </div>
                  </div>
                </div>
                <b-collapse :id="`accordion-${i}`" accordion="my-accordion" role="tabpanel">
                  <div class="mt-3 card-body border-bottom border-left border-right">
                    <b-tabs content-class="mt-5">
                      <b-tab title="Vitals" active>
                        <antenatal-triage-table
                          v-if="summary.category === ANTENATAL"
                          :triages="summary.triages"
                        />
                        <triage-table v-else :triages="summary.triages" />
                      </b-tab>
                      <b-tab title="Observations">
                        <antenatal-observations-table
                          v-if="summary.category === ANTENATAL"
                          :observations="summary.observations"
                        />
                        <observations-table v-else :observations="summary.observations" />
                      </b-tab>
                      <b-tab title="Diagnoses">
                        <diagnoses-table :diagnoses="summary.diagnoses" />
                      </b-tab>
                      <b-tab title="Tests">
                        <tests-table :tests="summary.tests" />
                      </b-tab>
                      <b-tab title="Medications">
                        <medications-table :drugs="summary.drugs" />
                      </b-tab>
                      <b-tab title="Items">
                        <additional-items-table :items="summary.items" />
                      </b-tab>
                      <b-tab title="Radiology">
                        <radiology-table :investigations="summary.investigations" />
                      </b-tab>
                      <b-tab title="Services">
                        <services-table :services="summary.services" />
                      </b-tab>
                      <b-tab v-if="summary.category === ANTENATAL" title="Clinical Notes">
                        <clinical-notes-table :notes="summary.notes" />
                      </b-tab>
                    </b-tabs>
                  </div>
                </b-collapse>
              </div>
            </div>
          </div>
          <div class="text-center">
            <a
              href="#"
              :disabled="isInLastPage"
              :class="isInLastPage ? disabled : ''"
              @click="onFetchMore"
              class="btn btn-outline-secondary mb-3 padding-left padding-right"
            >
              <i class="flaticon2-circle-vol-2"></i> See more
            </a>
          </div>
        </div>
      </div>
      <div v-else>
        <empty-data-card @addData="goToObservation" :text="content" />
      </div>
    </div>
    <div v-else class="card card-custom card-stretch gutter-b card-shadowless">
      <div class="card-body">
        <div class="card card-custom card-stretch card-stretch-fourth gutter-b">
          <div class="accordion accordion-solid accordion-panel accordion-svg-toggle">
            <div class="accord">
              <b-skeleton animation="wave" width="85%"></b-skeleton>
              <b-skeleton animation="wave" width="70%"></b-skeleton>
              <b-skeleton animation="wave" width="90%"></b-skeleton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import DiagnosesTable from '@/view/components/table/DiagnosesTable.vue';
import TestsTable from '@/view/components/table/TestsTable.vue';
import RadiologyTable from '@/view/components/table/RadiologyTable.vue';
import ServicesTable from '@/view/components/table/ServicesTable.vue';
import EmptyDataCard from '@/utils/EmptyDataCard.vue';
import TriageTable from '@/view/components/table/TriageTable.vue';
import MedicationsTable from '@/view/components/table/MedicationsTable.vue';
import ObservationsTable from '@/view/components/table/ObservationsTable.vue';
import AntenatalObservationsTable from '@/view/components/table/AntenatalObservationsTable.vue';
import AntenatalTriageTable from '@/view/components/table/AntenatalTriageTable.vue';
import AdditionalItemsTable from '@/view/components/table/AdditionalItemsTable.vue';
import ClinicalNotesTable from '@/view/components/table/ClinicalNotesTable.vue';

export default {
  props: {
    summaries: {
      type: Array,
      required: true,
      default: () => [],
    },
    isEmptySummary: {
      type: Boolean,
      required: true,
    },
    isInLastPage: {
      type: Boolean,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    source: {
      type: String,
      required: true,
    },
    loading: {
      type: Boolean,
      required: false,
    },
  },
  data: () => ({
    disabled: 'disabled',
    ANTENATAL: 'Antenatal',
  }),
  components: {
    ClinicalNotesTable,
    AdditionalItemsTable,
    AntenatalTriageTable,
    ObservationsTable,
    MedicationsTable,
    TriageTable,
    EmptyDataCard,
    ServicesTable,
    RadiologyTable,
    TestsTable,
    DiagnosesTable,
    AntenatalObservationsTable,
  },
  methods: {
    onFetchMore() {
      this.$emit('fetchMore');
    },
    goToObservation() {
      this.$emit('openObservation');
    },
    getLabelStatusColor(category) {
      if (category === 'Inpatient') return 'label-warning';
      if (category === 'Outpatient') return 'label-success';
      if (category === 'Emergency') return 'label-danger';
      if (category === 'Antenatal') return 'label-primary';
      return 'label-dark';
    },
    getVisitDotStatus(status) {
      if (status === 'Ongoing') return 'label-success';
      return 'label-danger';
    },
  },
};
</script>

<style scoped>
.accord {
  background: #f1f1f1 !important;
  padding: 0.5rem 1.25rem !important;
}

.padding-left {
  padding-left: 50px;
}

.padding-right {
  padding-right: 70px;
}
</style>
