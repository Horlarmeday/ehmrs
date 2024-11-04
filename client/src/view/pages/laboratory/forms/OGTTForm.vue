<template>
  <div class="form-container border border-gray-500">
    <table class="table">
      <thead>
        <tr>
          <th scope="col">Time</th>
          <th scope="col">Glucose Value</th>
          <th scope="col">Range/Unit</th>
        </tr>
      </thead>
      <tbody>
        <OGTTFormRow
          v-for="row in glucoseRows"
          :key="row.id"
          :label="row.label"
          :value.sync="ogtt[row.model]"
          :range="row.range"
          :section="section"
          @updateValue="updateOGTTValue(row.model, $event)"
        />
        <template v-if="shouldDisplayUrine">
          <tr>
            <th colspan="7" class="text-center">Urine</th>
          </tr>
          <tr>
            <th scope="col">Time</th>
            <th scope="col">Presence of Glucose</th>
            <th scope="col">Presence of Protein</th>
          </tr>
          <OGTTFormRow
            v-for="row in urineRows"
            :key="row.id"
            :label="row.label"
            :section="section"
            :protein-model="row.proteinModel"
            :value.sync="ogtt[row.glucoseModel]"
            :protein.sync="ogtt[row.proteinModel]"
            @updateValue="updateOGTTValue(row.glucoseModel, $event)"
            @updateProtein="updateOGTTValue(row.proteinModel, $event)"
          />
        </template>
        <tr v-if="shouldCommentRow">
          <th scope="row">Comments</th>
          <td colspan="2">
            <textarea
              @input="emitOGTTResult"
              v-model="ogtt.comments"
              class="form-control"
              :disabled="shouldDisableRow"
              cols="30"
              rows="2"
            ></textarea>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
import { debounce, randomId } from '@/common/common';
import OGTTFormRow from '@/view/pages/laboratory/forms/rows/OGTTFormRow.vue';

export default {
  components: { OGTTFormRow },
  data: () => ({
    ogtt: {
      ogtt_zero_min: '',
      ogtt_sixty_mins: '',
      ogtt_one_twenty_mins: '',
      urine_glucose_fasting: '',
      urine_protein_fasting: '',
      urine_glucose_sixty_mins: '',
      urine_protein_sixty_mins: '',
      urine_glucose_one_twenty_mins: '',
      urine_protein_one_twenty_mins: '',
      urine_glucose_others_mins: '',
      urine_protein_others_mins: '',
      comments: '',
    },
    glucoseRows: [
      { id: randomId(), label: '0 min', model: 'ogtt_zero_min', range: '3.9 - 5.9 Mmol/L' },
      { id: randomId(), label: '60 mins', model: 'ogtt_sixty_mins', range: '3.9 - 7.0 Mmol/L' },
      {
        id: randomId(),
        label: '120 mins',
        model: 'ogtt_one_twenty_mins',
        range: '3.9 - 6.7 Mmol/L',
      },
    ],
    urineRows: [
      {
        id: randomId(),
        label: 'Fasting',
        glucoseModel: 'urine_glucose_fasting',
        proteinModel: 'urine_protein_fasting',
      },
      {
        id: randomId(),
        label: '60 mins',
        glucoseModel: 'urine_glucose_sixty_mins',
        proteinModel: 'urine_protein_sixty_mins',
      },
      {
        id: randomId(),
        label: '120 mins',
        glucoseModel: 'urine_glucose_one_twenty_mins',
        proteinModel: 'urine_protein_one_twenty_mins',
      },
      {
        id: randomId(),
        label: 'Others',
        glucoseModel: 'urine_glucose_others_mins',
        proteinModel: 'urine_protein_others_mins',
      },
    ],
  }),
  props: {
    result: {
      type: Object,
      required: true,
    },
    testId: {
      type: Number,
      required: true,
    },
    section: {
      type: String,
      required: true,
    },
  },
  watch: {
    result: {
      immediate: true,
      handler(val) {
        if (!val) return;
        if (Object.entries(val)?.length) {
          const ogttData = JSON.parse(JSON.stringify(val));
          Object.keys(this.ogtt).forEach(key => {
            this.ogtt[key] = ogttData[key] || '';
          });
        }
      },
    },
  },
  computed: {
    shouldDisplayUrine() {
      const urine = {
        urine_glucose_fasting: '',
        urine_protein_fasting: '',
        urine_glucose_sixty_mins: '',
        urine_protein_sixty_mins: '',
        urine_glucose_one_twenty_mins: '',
        urine_protein_one_twenty_mins: '',
        urine_glucose_others_mins: '',
        urine_protein_others_mins: '',
      };
      const ogttUrine = Object.keys(urine)
        .map(key => this.ogtt[key])
        .filter(Boolean);
      return (
        (this.section !== 'ValidationSection' && this.section !== 'ApprovalSection') ||
        !!ogttUrine?.length
      );
    },

    shouldDisableRow() {
      return this.section === 'ValidationSection' || this.section === 'ApprovalSection';
    },

    shouldCommentRow() {
      return (
        (this.section === 'ValidationSection' && this.section === 'ApprovalSection') ||
        !!this.ogtt.comments
      );
    },
  },
  methods: {
    emitOGTTResult() {
      this.debounceInput(this);
    },

    debounceInput: debounce(vm => {
      vm.$emit('emitResult', vm.ogtt, vm.testId);
    }, 500),

    updateOGTTValue(model, value) {
      this.ogtt[model] = value;
      this.emitOGTTResult();
    },
  },
};
</script>

<style scoped></style>
