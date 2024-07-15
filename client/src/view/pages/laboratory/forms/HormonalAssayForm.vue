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
        <tr>
          <th scope="row">FSH</th>
          <td>
            <input type="text" v-model="fsh" class="form-control" />
          </td>
          <td>
            <p>Male: 2.0 - 14.0 mIU/ML</p>
            <p>Female:</p>
            <p>Follicular Phase: 2.0 - 10.0 mIU/ML</p>
            <p>Ovulatorial: 6.0 - 24.0 mIU/ML</p>
            <p>Luteal Phase: 1.5 - 8.0 mIU/ML</p>
            <p>Post Menopausal: 17.0 - 95.0 mIU/ML</p>
            <p>Pregnant Female: 0.0 - 11.6 mIU/ML</p>
          </td>
        </tr>
        <tr>
          <th scope="row">LH</th>
          <td>
            <input type="text" v-model="lh" class="form-control" />
          </td>
          <td>
            <p>Male: 0.7 - 7.4 mIU/ML</p>
            <p>Female:</p>
            <p>Follicular Phase: 0.5 - 10.5 mIU/ML</p>
            <p>Mid Cycle: 18.4 - 61.2 mIU/ML</p>
            <p>Luteal Phase: 0.5 - 10.5 mIU/ML</p>
            <p>Post Menopause: 8.2 - 40.8 mIU/ML</p>
          </td>
        </tr>
        <tr>
          <th scope="row">Progesterone</th>
          <td>
            <input type="text" v-model="progesterone" class="form-control" />
          </td>
          <td>
            <p>Child (1 - 10yrs): 0.07 - 0.52 ng/ml</p>
            <p>Male: 0.13 - 1.22 ng/ml</p>
            <p>Female:</p>
            <p>Follicular Phase: 0.15 - 1.40 ng/ml</p>
            <p>First Trimester: 7.25 - 90.0 ng/ml</p>
            <p>Luteal Phase: 2.0 - 25.0 ng/ml</p>
            <p>Second Trimester: 19.5 - 91.0 ng/ml</p>
            <p>Third Trimester: 49.0 - 422.0 ng/ml</p>
            <p>Post Menopausal: 0.0 - 0.80 ng/ml</p>
          </td>
        </tr>
        <tr>
          <th scope="row">Estradiol</th>
          <td>
            <input type="text" v-model="estradiol" class="form-control" />
          </td>
          <td>
            <p>Male: 9.0 - 94.0 pg/ml</p>
            <p>Female:</p>
            <p>Follicular Phase: 9.0 - 175 pg/ml</p>
            <p>Periovulatory: 107 - 281 pg/ml</p>
            <p>Luteal Phase: 44.0 - 196 pg/ml</p>
            <p>Treated Menopausal: 42 - 289 pg/ml</p>
            <p>Unreated Menopausal: ND - 20 pg/ml</p>
            <p>Oral Contraceptives: ND - 103 pg/ml</p>
          </td>
        </tr>
        <tr>
          <th scope="row">Testosterone</th>
          <td>
            <input type="text" v-model="testosterone" class="form-control" />
          </td>
          <td>
            <p>Boys Before Puberty: 0.1 - 3.7 ng/ML</p>
            <p>Male: 2.5 - 10.0 ng/ML</p>
            <p>Female: 0.2 - 0.95 ng/ML</p>
          </td>
        </tr>
        <tr>
          <th scope="row">Prolactin</th>
          <td>
            <input type="text" v-model="prolactin" class="form-control" />
          </td>
          <td>
            <p>Post Menopausal: 1.5 - 18.5 ng/ML</p>
            <p>Adult Male: 1.8 - 17.0 ng/ML</p>
            <p>Adult Female: 1.2 - 19.5 ng/ML</p>
          </td>
        </tr>
        <tr>
          <th scope="row">PSA</th>
          <td>
            <input type="text" v-model="psa" class="form-control" />
          </td>
          <td>
            <p>Healthy Males: (Less than 4.0)</p>
          </td>
        </tr>
        <tr>
          <th scope="row">TSH</th>
          <td>
            <input type="text" v-model="tsh" class="form-control" />
          </td>
          <td>
            <p>Low Normal: 0.28 - 0.53 uIu/ML</p>
            <p>High Normal: 5.6 - 6.82 uIu/ML</p>
          </td>
        </tr>
        <tr>
          <th scope="row">tT3</th>
          <td>
            <input type="text" v-model="tT3" class="form-control" />
          </td>
          <td>
            <p>Expected Range: 0.52 - 1.85 ng/ML</p>
          </td>
        </tr>
        <tr>
          <th scope="row">tT4</th>
          <td>
            <input type="text" v-model="tT4" class="form-control" />
          </td>
          <td>
            <p>Male: 4.4 - 10.0 ug/ML</p>
            <p>Female: 4.8 - 11.6 ug/ML</p>
          </td>
        </tr>
        <tr>
          <th scope="row">Comments</th>
          <td colspan="2">
            <textarea v-model="comments" class="form-control" cols="30" rows="2"></textarea>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
export default {
  data: () => ({
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
  }),
};
</script>

<style scoped></style>
