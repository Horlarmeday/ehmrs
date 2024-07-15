<template>
  <div class="form-container border border-gray-500">
    <table class="table">
      <thead>
        <tr>
          <th scope="col">Age in Days</th>
          <th scope="col">Total</th>
          <th scope="col">Direct</th>
          <th scope="col">Total Range</th>
          <th scope="col">Direct Range</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row">0 - 1 day</th>
          <td>
            <input v-model="total_zero_to_one_day" type="text" class="form-control" />
          </td>
          <td>
            <input v-model="direct_zero_to_one_day" type="text" class="form-control" />
          </td>
          <td>3.5 - 10.4 mg/dl</td>
          <td>0.0 - 0-4 mg/dl</td>
        </tr>
        <tr>
          <th scope="row">2 - 3 days</th>
          <td>
            <input v-model="total_two_to_three_days" type="text" class="form-control" />
          </td>
          <td>
            <input v-model="direct_two_to_three_days" type="text" class="form-control" />
          </td>
          <td>3.4 - 11.5 mg/dl</td>
          <td>0.0 - 0-4 mg/dl</td>
        </tr>
        <tr>
          <th scope="row">3 - 5 days</th>
          <td>
            <input v-model="total_three_to_five_days" type="text" class="form-control" />
          </td>
          <td>
            <input v-model="direct_three_to_five_days" type="text" class="form-control" />
          </td>
          <td>1.5 - 12.0 mg/dl</td>
          <td>0.0 - 0-4 mg/dl</td>
        </tr>
        <tr>
          <th scope="row">Above 5 days</th>
          <td>
            <input v-model="total_above_five_days" type="text" class="form-control" />
          </td>
          <td>
            <input v-model="direct_above_five_days" type="text" class="form-control" />
          </td>
          <td>0.2 - 1.2 mg/dl</td>
          <td>0.0 - 0-4 mg/dl</td>
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
    total_zero_to_one_day: '',
    direct_zero_to_one_day: '',
    total_two_to_three_days: '',
    direct_two_to_three_days: '',
    total_three_to_five_days: '',
    direct_three_to_five_days: '',
    total_above_five_days: '',
    direct_above_five_days: '',
    comments: '',
  }),
};
</script>

<style scoped></style>
