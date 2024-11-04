<template>
  <div class="form-container border border-gray-500">
    <table class="table">
      <thead>
        <tr>
          <th scope="col">#</th>
          <th scope="col">O</th>
          <th scope="col">H</th>
        </tr>
      </thead>
      <tbody>
        <widal-reaction-form-row
          v-for="(row, index) in widalFields"
          :key="index"
          :label="row.label"
          :o-value.sync="widal[row.oModel]"
          :h-value.sync="widal[row.hModel]"
          @updateOValue="updateWidalReactionValue(row.oModel, $event)"
          @updateHValue="updateWidalReactionValue(row.hModel, $event)"
          :section="section"
        />
        <tr v-if="shouldCommentRow">
          <th scope="row">Comments</th>
          <td colspan="2">
            <textarea
              @input="emitWidalReactionResult"
              v-model="widal.comments"
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
import { debounce } from '@/common/common';
import WidalReactionFormRow from '@/view/pages/laboratory/forms/rows/WidalReactionFormRow.vue';

export default {
  components: { WidalReactionFormRow },
  data: () => ({
    widal: {
      salmonella_paratyphi_CH: '',
      salmonella_paratyphia_CO: '',
      salmonella_paratyphi_BH: '',
      salmonella_paratyphia_BO: '',
      salmonella_paratyphi_AH: '',
      salmonella_paratyphia_AO: '',
      salmonella_typhi_H: '',
      salmonella_typhi_O: '',
      comments: '',
    },
    widalFields: [
      { label: 'Salmonella Typhi', oModel: 'salmonella_typhi_O', hModel: 'salmonella_typhi_H' },
      {
        label: 'S. Paratyphi A.',
        oModel: 'salmonella_paratyphia_AO',
        hModel: 'salmonella_paratyphi_AH',
      },
      {
        label: 'S. Paratyphi B.',
        oModel: 'salmonella_paratyphia_BO',
        hModel: 'salmonella_paratyphi_BH',
      },
      {
        label: 'S. Paratyphi C.',
        oModel: 'salmonella_paratyphia_CO',
        hModel: 'salmonella_paratyphi_CH',
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
          Object.assign(this.widal, JSON.parse(JSON.stringify(val)));
        }
      },
    },
  },

  computed: {
    shouldDisableRow() {
      return this.section === 'ValidationSection' || this.section === 'ApprovalSection';
    },

    shouldCommentRow() {
      return (
        (this.section === 'ValidationSection' && this.section === 'ApprovalSection') ||
        !!this.widal.comments
      );
    },
  },

  methods: {
    emitWidalReactionResult() {
      this.debounceInput(this);
    },

    debounceInput: debounce(vm => {
      vm.$emit('emitResult', vm.widal, vm.testId);
    }, 500),

    updateWidalReactionValue(model, value) {
      this.widal[model] = value;
      this.emitWidalReactionResult();
    },
  },
};
</script>

<style scoped></style>
