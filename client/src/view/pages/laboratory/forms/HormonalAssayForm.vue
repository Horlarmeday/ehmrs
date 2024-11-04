<template>
  <div class="form-container border border-gray-500">
    <table class="table">
      <thead>
        <tr>
          <th scope="col">#</th>
          <th scope="col">Result</th>
          <th scope="col">Ranges</th>
        </tr>
      </thead>
      <tbody>
        <hormonal-assay-form-row
          v-for="row in rows"
          :key="row.id"
          :section="section"
          :hormonalAssay="hormonalAssay"
          :row="row"
          @emitHormonalAssayResult="emitHormonalAssayResult"
        />
      </tbody>
    </table>
  </div>
</template>
<script>
import { debounce, randomId } from '@/common/common';
import HormonalAssayFormRow from '@/view/pages/laboratory/forms/rows/HormonalAssayFormRow.vue';

export default {
  components: { HormonalAssayFormRow },
  data: () => ({
    hormonalAssay: {
      comments: '',
      fsh: '',
      lh: '',
      progesterone: '',
      estradiol: '',
      testosterone: '',
      prolactin: '',
      psa: '',
      tsh: '',
      tT3: '',
      tT4: '',
    },
    rows: [
      {
        id: randomId(),
        label: 'FSH',
        model: 'fsh',
        ranges: [
          'Male: 2.0 - 14.0 mIU/ML',
          'Female:',
          'Follicular Phase: 2.0 - 10.0 mIU/ML',
          'Ovulatorial: 6.0 - 24.0 mIU/ML',
          'Luteal Phase: 1.5 - 8.0 mIU/ML',
          'Post Menopausal: 17.0 - 95.0 mIU/ML',
          'Pregnant Female: 0.0 - 11.6 mIU/ML',
        ],
      },
      {
        id: randomId(),
        label: 'LH',
        model: 'lh',
        ranges: [
          'Male: 0.7 - 7.4 mIU/ML',
          'Female:',
          'Follicular Phase: 0.5 - 10.5 mIU/ML',
          'Mid Cycle: 18.4 - 61.2 mIU/ML',
          'Luteal Phase: 0.5 - 10.5 mIU/ML',
          'Post Menopause: 8.2 - 40.8 mIU/ML',
        ],
      },
      {
        id: randomId(),
        label: 'Progesterone',
        model: 'progesterone',
        ranges: [
          'Child (1 - 10yrs): 0.07 - 0.52 ng/ml',
          'Male: 0.13 - 1.22 ng/ml',
          'Female:',
          'Follicular Phase: 0.15 - 1.40 ng/ml',
          'First Trimester: 7.25 - 90.0 ng/ml',
          'Luteal Phase: 2.0 - 25.0 ng/ml',
          'Second Trimester: 19.5 - 91.0 ng/ml',
          'Third Trimester: 49.0 - 422.0 ng/ml',
          'Post Menopausal: 0.0 - 0.80 ng/ml',
        ],
      },
      {
        id: randomId(),
        label: 'Estradiol',
        model: 'estradiol',
        ranges: [
          'Male: 9.0 - 94.0 pg/ml',
          'Female:',
          'Follicular Phase: 9.0 - 175 pg/ml',
          'Periovulatory: 107 - 281 pg/ml',
          'Luteal Phase: 44.0 - 196 pg/ml',
          'Treated Menopausal: 42 - 289 pg/ml',
          'Unreated Menopausal: ND - 20 pg/ml',
          'Oral Contraceptives: ND - 103 pg/ml',
        ],
      },
      {
        id: randomId(),
        label: 'Testosterone',
        model: 'testosterone',
        ranges: [
          'Boys Before Puberty: 0.1 - 3.7 ng/ML',
          'Male: 2.5 - 10.0 ng/ML',
          'Female: 0.2 - 0.95 ng/ML',
        ],
      },
      {
        id: randomId(),
        label: 'Prolactin',
        model: 'prolactin',
        ranges: [
          'Post Menopausal: 1.5 - 18.5 ng/ML',
          'Adult Male: 1.8 - 17.0 ng/ML',
          'Adult Female: 1.2 - 19.5 ng/ML',
        ],
      },
      { id: randomId(), label: 'PSA', model: 'psa', ranges: ['Healthy Males: (Less than 4.0)'] },
      {
        id: randomId(),
        label: 'TSH',
        model: 'tsh',
        ranges: ['Low Normal: 0.28 - 0.53 uIu/ML', 'High Normal: 5.6 - 6.82 uIu/ML'],
      },
      { id: randomId(), label: 'tT3', model: 'tT3', ranges: ['Expected Range: 0.52 - 1.85 ng/ML'] },
      {
        id: randomId(),
        label: 'tT4',
        model: 'tT4',
        ranges: ['Male: 4.4 - 10.0 ug/ML', 'Female: 4.8 - 11.6 ug/ML'],
      },
      { id: randomId(), label: 'Comments', model: 'comments', ranges: [], isTextArea: true },
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
          Object.assign(this.hormonalAssay, JSON.parse(JSON.stringify(val)));
          // const hormonalAssayData = JSON.parse(JSON.stringify(val));
          // Object.keys(this.hormonalAssay).forEach(key => {
          //   this.hormonalAssay[key] = hormonalAssayData[key] || '';
          // });
        }
      },
    },
  },
  methods: {
    emitHormonalAssayResult() {
      this.debounceInput(this);
    },

    debounceInput: debounce(vm => {
      vm.$emit('emitResult', vm.hormonalAssay, vm.testId);
    }, 500),
  },
};
</script>

<style scoped></style>
