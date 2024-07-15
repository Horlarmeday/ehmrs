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
          <th scope="row">Na+</th>
          <td>
            <input v-model="sodium" type="text" class="form-control" />
          </td>
          <td>128 - 160 Mmol/L</td>
        </tr>
        <tr>
          <th scope="row">K</th>
          <td>
            <input v-model="potassium" type="text" class="form-control" />
          </td>
          <td>3.5 - 5.5 Mmol/L</td>
        </tr>
        <tr>
          <th scope="row">CL</th>
          <td>
            <input v-model="chlorine" type="text" class="form-control" />
          </td>
          <td>97 - 108 Mmol/L</td>
        </tr>
        <tr>
          <th scope="row">HCO3</th>
          <td>
            <input v-model="hco3" type="text" class="form-control form-control-sm" />
          </td>
          <td>24 - 32 Mmol/L</td>
        </tr>
        <tr>
          <th scope="row">Urea</th>
          <td>
            <input v-model="urea" type="text" class="form-control form-control-sm" />
          </td>
          <td>10 - 55 Mmol/L</td>
        </tr>
        <tr>
          <th scope="row">Cr</th>
          <td>
            <input v-model="chromium" type="text" class="form-control form-control-sm" />
          </td>
          <td>0.7 - 1.4 Mmol/L</td>
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
    sodium: '',
    potassium: '',
    chlorine: '',
    hco3: '',
    urea: '',
    chromium: '',
    comments: '',
  }),
};
</script>

<style scoped></style>
