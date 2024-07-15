<template>
  <div class="form-container border border-gray-500">
    <table class="table">
      <thead>
        <tr>
          <th scope="col">#</th>
          <th scope="col">Result</th>
          <th scope="col">Range/Unit</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row">Total Ca+</th>
          <td>
            <input v-model="total_ca" type="text" class="form-control" />
          </td>
          <td>2.2 - 2.7 Mmol/L</td>
        </tr>
        <tr>
          <th scope="row">Uric Acid</th>
          <td>
            <input v-model="uric_acid" type="text" class="form-control" />
          </td>
          <td>2.4 - 7.0 mg/dL</td>
        </tr>
        <tr>
          <th scope="row">PO42+</th>
          <td>
            <input v-model="po42" type="text" class="form-control" />
          </td>
          <td>2.5 - 4.5 mg/dL</td>
        </tr>
        <tr>
          <th scope="row">Mg2+</th>
          <td>
            <input v-model="mg" type="text" class="form-control form-control-sm" />
          </td>
          <td>1.5 - 2.5 Mmol/dL</td>
        </tr>
        <tr>
          <th scope="row">Iron</th>
          <td>
            <input v-model="iron" type="text" class="form-control form-control-sm" />
          </td>
          <td>60 - 170 mcg/dl</td>
        </tr>
        <tr>
          <th scope="row">TIBC</th>
          <td>
            <input v-model="tibc" type="text" class="form-control form-control-sm" />
          </td>
          <td>240 - 450 mcg/dl</td>
        </tr>
        <tr>
          <th scope="row">HB a/c</th>
          <td>
            <input v-model="hb_ac" type="text" class="form-control form-control-sm" />
          </td>
          <td>4.0 - 5.6 %</td>
        </tr>
        <tr>
          <th scope="row">Ionized Ca2+</th>
          <td>
            <input v-model="ionized_ca" type="text" class="form-control form-control-sm" />
          </td>
          <td>1.2 - 1.4 Mmol/L</td>
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
    total_ca: '',
    uric_acid: '',
    mg: '',
    po42: '',
    ionized_ca: '',
    hb_ac: '',
    iron: '',
    tibc: '',
    comments: '',
  }),
};
</script>

<style scoped></style>
