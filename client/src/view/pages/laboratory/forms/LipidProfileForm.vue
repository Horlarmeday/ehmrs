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
          <th scope="row">Chol</th>
          <td>
            <input v-model="chol" type="text" class="form-control" />
          </td>
          <td>140 - 220 mg/dl</td>
        </tr>
        <tr>
          <th scope="row">VLDL</th>
          <td>
            <input v-model="vldl" type="text" class="form-control" />
          </td>
          <td>15 - 50 mg/dl</td>
        </tr>
        <tr>
          <th scope="row">HDL</th>
          <td>
            <input v-model="hdl" type="text" class="form-control" />
          </td>
          <td>35 - 65 mg/dl</td>
        </tr>
        <tr>
          <th scope="row">TG</th>
          <td>
            <input v-model="tg" type="text" class="form-control form-control-sm" />
          </td>
          <td>60 - 165 mg/dl</td>
        </tr>
        <tr>
          <th scope="row">LDL</th>
          <td>
            <input v-model="ldl" type="text" class="form-control form-control-sm" />
          </td>
          <td>less than 130 mg/dl</td>
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
    ldl: '',
    hdl: '',
    tg: '',
    vldl: '',
    chol: '',
    comments: '',
  }),
};
</script>

<style scoped></style>
