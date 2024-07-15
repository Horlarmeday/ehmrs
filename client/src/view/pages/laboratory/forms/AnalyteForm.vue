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
          <th scope="row">Urine Protein</th>
          <td>
            <input v-model="urine_protein" type="text" class="form-control" />
          </td>
          <td>0 - 20 mg/dL</td>
        </tr>
        <tr>
          <th scope="row">CSF Glucose</th>
          <td>
            <input v-model="csf_glucose" type="text" class="form-control" />
          </td>
          <td>2.5 - 4.4 Mmol/L</td>
        </tr>
        <tr>
          <th scope="row">CSF Protein+</th>
          <td>
            <input v-model="csf_protein" type="text" class="form-control" />
          </td>
          <td>1.5 - 6.0 g/dL</td>
        </tr>
        <tr>
          <th scope="row">Ascitic Fluid</th>
          <td>
            <input v-model="ascitic_fluid" type="text" class="form-control form-control-sm" />
          </td>
          <td>2.2 - 3.3 Mmol/L</td>
        </tr>
        <tr>
          <th scope="row">Glucose</th>
          <td>
            <input v-model="glucose" type="text" class="form-control form-control-sm" />
          </td>
          <td></td>
        </tr>
        <tr>
          <th scope="row">Ascitic Fluid Total</th>
          <td>
            <input v-model="ascitic_fluid_total" type="text" class="form-control form-control-sm" />
          </td>
          <td>2.5 - 3.0 g/dL</td>
        </tr>
        <tr>
          <th scope="row">Protein</th>
          <td>
            <input v-model="protein" type="text" class="form-control form-control-sm" />
          </td>
          <td></td>
        </tr>
        <tr>
          <th scope="row">CSF Chloride</th>
          <td>
            <input v-model="csf_chloride" type="text" class="form-control form-control-sm" />
          </td>
          <td>110 - 125 Mmol/L</td>
        </tr>
        <tr>
          <th scope="row">24 hour Urine</th>
          <td>
            <input
              v-model="twenty_four_hour_urine"
              type="text"
              class="form-control form-control-sm"
            />
          </td>
          <td>20 - 150 mg/24hrs</td>
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
    urine_protein: '',
    csf_glucose: '',
    csf_protein: '',
    ascitic_fluid: '',
    glucose: '',
    ascitic_fluid_total: '',
    protein: '',
    csf_chloride: '',
    twenty_four_hour_urine: '',
    comments: '',
  }),
};
</script>

<style scoped></style>
