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
          <th scope="row">Fasting glu.</th>
          <td>
            <input v-model="fasting_glu" type="text" class="form-control" />
          </td>
          <td>3.9 - 5.8 Mmol/L</td>
        </tr>
        <tr>
          <th scope="row">Random glu.</th>
          <td>
            <input v-model="random_glu" type="text" class="form-control" />
          </td>
          <td>3.9 - 6.7 Mmol/L</td>
        </tr>
        <tr>
          <th scope="row">2hr pp</th>
          <td>
            <input v-model="two_hour_pp" type="text" class="form-control" />
          </td>
          <td>3.9 - 6.7 Mmol/L</td>
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
    fasting_glu: '',
    random_glu: '',
    two_hour_pp: '',
    comments: '',
  }),
};
</script>

<style scoped></style>
