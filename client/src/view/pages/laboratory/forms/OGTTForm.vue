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
        <tr>
          <th scope="row">0 min</th>
          <td>
            <input v-model="ogtt_zero_min" type="text" class="form-control" />
          </td>
          <td>3.9 - 5.9 Mmol/L</td>
        </tr>
        <tr>
          <th scope="row">60 mins</th>
          <td>
            <input v-model="ogtt_sixty_mins" type="text" class="form-control" />
          </td>
          <td>3.9 - 7.0 Mmol/L</td>
        </tr>
        <tr>
          <th scope="row">120 mins</th>
          <td>
            <input v-model="ogtt_one_twenty_mins" type="text" class="form-control" />
          </td>
          <td>3.9 - 6.7 Mmol/L</td>
        </tr>
        <tr>
          <th colspan="7" class="text-center">Urine</th>
        </tr>
        <tr>
          <th scope="col">Time</th>
          <th scope="col">Presence of Glucose</th>
          <th scope="col">Presence of Protein</th>
        </tr>
        <tr>
          <th scope="row">Fasting</th>
          <td>
            <input
              v-model="urine_glucose_fasting"
              type="text"
              class="form-control form-control-sm"
            />
          </td>
          <td>
            <input
              v-model="urine_protein_fasting"
              type="text"
              class="form-control form-control-sm"
            />
          </td>
        </tr>
        <tr>
          <th scope="row">60 mins</th>
          <td>
            <input
              v-model="urine_glucose_sixty_mins"
              type="text"
              class="form-control form-control-sm"
            />
          </td>
          <td>
            <input
              v-model="urine_protein_sixty_mins"
              type="text"
              class="form-control form-control-sm"
            />
          </td>
        </tr>
        <tr>
          <th scope="row">120 mins</th>
          <td>
            <input
              v-model="urine_glucose_one_twenty_mins"
              type="text"
              class="form-control form-control-sm"
            />
          </td>
          <td>
            <input
              v-model="urine_protein_one_twenty_mins"
              type="text"
              class="form-control form-control-sm"
            />
          </td>
        </tr>
        <tr>
          <th scope="row">Others</th>
          <td>
            <input
              v-model="urine_glucose_others_mins"
              type="text"
              class="form-control form-control-sm"
            />
          </td>
          <td>
            <input
              v-model="urine_protein_others_mins"
              type="text"
              class="form-control form-control-sm"
            />
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
  }),
};
</script>

<style scoped></style>
