<template>
  <b-modal v-model="activePrompt" hide-footer title="Dialysis Assessment Details" size="xl">
    <div class="row">
      <div class="col-md-6">
        <table class="table table-sm">
          <tbody>
            <tr>
              <th scope="row">Assessment Date</th>
              <td>{{ assessment.assessment_date | dayjs('DD/MM/YYYY, h:mma') }}</td>
            </tr>
            <tr>
              <th scope="row">Status</th>
              <td>{{ assessment.status || '-' }}</td>
            </tr>
            <tr>
              <th scope="row">HIV Status</th>
              <td>{{ assessment.hiv_status || '-' }}</td>
            </tr>
            <tr>
              <th scope="row">HBsAg Status</th>
              <td>{{ assessment.hbsag_status || '-' }}</td>
            </tr>
            <tr>
              <th scope="row">Blood Group</th>
              <td>{{ assessment.blood_group || '-' }}</td>
            </tr>
            <tr>
              <th scope="row">Current Weight</th>
              <td>{{ assessment.current_weight || '-' }}</td>
            </tr>
            <tr>
              <th scope="row">Dry Weight</th>
              <td>{{ assessment.dry_weight || '-' }}</td>
            </tr>
            <tr>
              <th scope="row">Previous Post-dialysis Weight</th>
              <td>{{ assessment.previous_post_dialysis_weight || '-' }}</td>
            </tr>
            <tr>
              <th scope="row">Required Weight Loss</th>
              <td>{{ assessment.required_weight_loss || '-' }}</td>
            </tr>
            <tr>
              <th scope="row">Access Route</th>
              <td>{{ assessment.access_route || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="col-md-6">
        <table class="table table-sm">
          <tbody>
            <tr>
              <th scope="row">Machine Type</th>
              <td>{{ assessment.machine_type || '-' }}</td>
            </tr>
            <tr>
              <th scope="row">Dialyser Type</th>
              <td>{{ assessment.dialyser_type || '-' }}</td>
            </tr>
            <tr>
              <th scope="row">Concentration Type</th>
              <td>{{ assessment.concentration_type || '-' }}</td>
            </tr>
            <tr>
              <th scope="row">TMP</th>
              <td>{{ assessment.tmp || '-' }}</td>
            </tr>
            <tr>
              <th scope="row">Clotting Time</th>
              <td>{{ assessment.clothing_time || '-' }}</td>
            </tr>
            <tr>
              <th scope="row">Heparin Units</th>
              <td>{{ assessment.heparin_units || '-' }}</td>
            </tr>
            <tr>
              <th scope="row">Infusion Drugs</th>
              <td class="text-break">{{ assessment.infusion_drugs || '-' }}</td>
            </tr>
            <tr>
              <th scope="row">Blood Transfusion</th>
              <td>{{ assessment.blood_transfusion || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="row">
      <div class="col-md-12">
        <table class="table table-sm">
          <tbody>
            <tr>
              <th scope="row" style="width: 220px">Per Dialysis Assessment</th>
              <td class="text-break">{{ assessment.per_dialysis_assessment || '-' }}</td>
            </tr>
            <tr>
              <th scope="row">Treatment Plan</th>
              <td class="text-break">{{ assessment.treatment_plan || '-' }}</td>
            </tr>
            <tr>
              <th scope="row">Clinical Notes</th>
              <td class="text-break">{{ assessment.clinical_notes || '-' }}</td>
            </tr>
            <tr>
              <th scope="row">ICD10 Diagnoses</th>
              <td>
                <div
                  v-if="
                    Array.isArray(assessment.icd10_diagnoses) && assessment.icd10_diagnoses.length
                  "
                >
                  <ul class="mb-0 pl-4">
                    <li v-for="(d, idx) in assessment.icd10_diagnoses" :key="idx">
                      <strong>{{ d.icd10_code }}</strong> - {{ d.category || d.description || '' }}
                    </li>
                  </ul>
                </div>
                <span v-else class="text-muted">-</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </b-modal>
</template>

<script>
export default {
  props: {
    displayPrompt: {
      type: Boolean,
      required: true,
    },
    assessment: {
      type: Object,
      required: true,
      default: () => ({}),
    },
  },
  computed: {
    activePrompt: {
      get() {
        return this.displayPrompt;
      },
      set(value) {
        this.$emit('closeModal', value);
      },
    },
  },
};
</script>
