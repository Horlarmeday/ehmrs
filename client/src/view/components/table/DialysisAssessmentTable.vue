<template>
  <div class="table-responsive">
    <table class="table table-sm">
      <thead class="thead-light">
        <tr class="text-uppercase">
          <th scope="col">Date</th>
          <th scope="col">Machine</th>
          <th scope="col">Conc.</th>
          <th scope="col">Access</th>
          <th scope="col">Weights</th>
          <th scope="col">TMP</th>
          <th scope="col">ICD10</th>
          <th scope="col">Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="!assessments || assessments.length === 0">
          <td colspan="8" align="center" class="text-muted">No Data</td>
        </tr>
        <tr v-for="(a, i) in assessments" :key="i">
          <td>{{ a.assessment_date | dayjs('DD/MM/YYYY, h:mma') }}</td>
          <td>{{ a.machine_type || '-' }}</td>
          <td>{{ a.concentration_type || '-' }}</td>
          <td>{{ a.access_route || '-' }}</td>
          <td>
            <div class="d-flex flex-column">
              <span>Cur: {{ a.current_weight || '-' }}</span>
              <span>Dry: {{ a.dry_weight || '-' }}</span>
              <span>Req Loss: {{ a.required_weight_loss || '-' }}</span>
            </div>
          </td>
          <td>{{ a.tmp || '-' }}</td>
          <td>
            <span v-if="Array.isArray(a.icd10_diagnoses) && a.icd10_diagnoses.length">
              {{ a.icd10_diagnoses[0]?.icd10_code }}
              <span v-if="a.icd10_diagnoses.length > 1" class="text-muted"
                >+{{ a.icd10_diagnoses.length - 1 }}</span
              >
            </span>
            <span v-else>-</span>
          </td>
          <td>
            <a @click="viewModal(a)" href="#"><i class="icon-xl text-primary la la-eye"></i></a>
          </td>
        </tr>
      </tbody>
    </table>
    <dialysis-assessment-details-modal
      @closeModal="hideModal"
      :assessment="selected"
      :display-prompt="displayPrompt"
    />
  </div>
</template>
<script>
import DialysisAssessmentDetailsModal from '@/view/components/modal/DialysisAssessmentDetailsModal.vue';
export default {
  name: 'DialysisAssessmentTable',
  components: { DialysisAssessmentDetailsModal },
  props: {
    assessments: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
  methods: {
    viewModal(assessment) {
      this.selected = assessment;
      this.displayPrompt = true;
    },
    hideModal() {
      this.displayPrompt = false;
    },
  },
  data: () => ({
    displayPrompt: false,
    selected: {},
  }),
};
</script>
