<template>
  <div class="form-container border border-gray-500">
    <table class="table">
      <thead>
        <tr>
          <th scope="col">#</th>
          <th scope="col">Result</th>
          <th scope="col">Children Range</th>
          <th scope="col" colspan="2">Adult Range</th>
          <th scope="col">Unit</th>
        </tr>
        <tr>
          <th></th>
          <th></th>
          <th></th>
          <th>Male</th>
          <th>Female</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row">WBC</th>
          <td>
            <input v-model="wbc" type="text" class="form-control form-control-sm" />
          </td>
          <td>
            5 - 19
          </td>
          <td>3.3 - 10.0</td>
          <td>3.4 - 9.8</td>
          <td>x10^3/ul</td>
        </tr>
        <tr>
          <th scope="row">RBC</th>
          <td>
            <input v-model="rbc" type="text" class="form-control form-control-sm" />
          </td>
          <td>
            3.9 - 5.3
          </td>
          <td>4.35 - 5.9</td>
          <td>3.69 - 5.19</td>
          <td>x10^4/ul</td>
        </tr>
        <tr>
          <th scope="row">HGB</th>
          <td>
            <input v-model="hgb" type="text" class="form-control form-control-sm" />
          </td>
          <td>
            9.5 - 14.1
          </td>
          <td>13.7 - 16.7</td>
          <td>11.7 - 14.5</td>
          <td>g/dl</td>
        </tr>
        <tr>
          <th scope="row">HCT</th>
          <td>
            <input v-model="hct" type="text" class="form-control form-control-sm" />
          </td>
          <td>
            30 - 40
          </td>
          <td>40.5 - 49.7</td>
          <td>34.1 - 44.3</td>
          <td>%</td>
        </tr>
        <tr>
          <th scope="row">MCV</th>
          <td>
            <input v-model="mcv" type="text" class="form-control form-control-sm" />
          </td>
          <td>
            70 - 84
          </td>
          <td>79.7 - 92.0</td>
          <td>81.5 - 96.7</td>
          <td>fl</td>
        </tr>
        <tr>
          <th scope="row">MCH</th>
          <td>
            <input v-model="mch" type="text" class="form-control form-control-sm" />
          </td>
          <td>
            23 - 29
          </td>
          <td>26.1 - 33.3</td>
          <td>26.5 - 33.5</td>
          <td>pg</td>
        </tr>
        <tr>
          <th scope="row">MCHC</th>
          <td>
            <input v-model="mchc" type="text" class="form-control form-control-sm" />
          </td>
          <td>
            31 - 35
          </td>
          <td>32.2 - 35.0</td>
          <td>31.9 - 35.3</td>
          <td>g/dl</td>
        </tr>
        <tr>
          <th scope="row">RDW</th>
          <td>
            <input v-model="rdw" type="text" class="form-control form-control-sm" />
          </td>
          <td>
            11.6 - 14.4
          </td>
          <td colspan="2">11.6 - 14.4</td>
          <td>%</td>
        </tr>
        <tr>
          <th scope="row">PLT</th>
          <td>
            <input v-model="plt" type="text" class="form-control form-control-sm" />
          </td>
          <td>
            140 - 450
          </td>
          <td colspan="2">140 - 450</td>
          <td>x10^3/ul</td>
        </tr>
        <tr>
          <th>Differential</th>
          <th>Result</th>
          <th>Children Range</th>
          <th colspan="2">Adult Range</th>
          <th>Unit</th>
        </tr>
        <tr>
          <th>Neutrophils</th>
          <td>
            <input v-model="neutrophils" type="text" class="form-control form-control-sm" />
          </td>
          <td>20 - 45</td>
          <td colspan="2">45 - 66</td>
          <td>%</td>
        </tr>
        <tr>
          <th>Bands (Neutrophilic)</th>
          <td>
            <input v-model="bands" type="text" class="form-control form-control-sm" />
          </td>
          <td>1 - 12</td>
          <td colspan="2">1 - 12</td>
          <td>%</td>
        </tr>
        <tr>
          <th>Lymphocytes</th>
          <td>
            <input v-model="lymphocytes" type="text" class="form-control form-control-sm" />
          </td>
          <td>46 - 76</td>
          <td colspan="2">20 - 40</td>
          <td>%</td>
        </tr>
        <tr>
          <th>Atypical Lymphocytes</th>
          <td>
            <input
              v-model="atypical_lymphocytes"
              type="text"
              class="form-control form-control-sm"
            />
          </td>
          <td>0 - 2</td>
          <td colspan="2">0 - 2</td>
          <td>%</td>
        </tr>
        <tr>
          <th>Monocytes</th>
          <td>
            <input v-model="monocytes" type="text" class="form-control form-control-sm" />
          </td>
          <td>1 - 5</td>
          <td colspan="2">4 - 10</td>
          <td>%</td>
        </tr>
        <tr>
          <th>Eosinophils</th>
          <td>
            <input v-model="eosinophils" type="text" class="form-control form-control-sm" />
          </td>
          <td>1 - 3</td>
          <td colspan="2">1 - 6</td>
          <td>%</td>
        </tr>
        <tr>
          <th>Basophils</th>
          <td>
            <input v-model="basophils" type="text" class="form-control form-control-sm" />
          </td>
          <td>0 - 2</td>
          <td colspan="2">0 - 2</td>
          <td>%</td>
        </tr>
        <tr>
          <th class="text-center" colspan="6">RBC Morphology</th>
        </tr>
        <tr>
          <th>Anisocytosis</th>
          <td colspan="6">
            <input v-model="anisocytosis" type="text" class="form-control form-control-sm" />
          </td>
        </tr>
        <tr>
          <th>Microcytosis</th>
          <td colspan="6">
            <input v-model="microcytosis" type="text" class="form-control form-control-sm" />
          </td>
        </tr>
        <tr>
          <th>Macrocytosis</th>
          <td colspan="6">
            <input v-model="macrocytosis" type="text" class="form-control form-control-sm" />
          </td>
        </tr>
        <tr>
          <th>Hypochromia</th>
          <td colspan="6">
            <input v-model="hypochromia" type="text" class="form-control form-control-sm" />
          </td>
        </tr>
        <tr>
          <th>Poikliocytosis</th>
          <td colspan="6">
            <input v-model="poikliocytosis" type="text" class="form-control form-control-sm" />
          </td>
        </tr>
        <tr>
          <th colspan="2">Slight = 1</th>
          <th colspan="2">Moderate = 2</th>
          <th colspan="2">Marked = 3</th>
        </tr>
        <tr>
          <th scope="row">Comments</th>
          <td colspan="6">
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
    wbc: '',
    rbc: '',
    hgb: '',
    hct: '',
    mcv: '',
    mch: '',
    mchc: '',
    rdw: '',
    plt: '',
    poikliocytosis: '',
    hypochromia: '',
    macrocytosis: '',
    microcytosis: '',
    anisocytosis: '',
    basophils: '',
    eosinophils: '',
    monocytes: '',
    atypical_lymphocytes: '',
    lymphocytes: '',
    bands: '',
    neutrophils: '',
    comments: '',
  }),
};
</script>

<style scoped></style>
