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
          <th scope="row">AST</th>
          <td>
            <input v-model="ast" type="text" class="form-control" />
          </td>
          <td>5.0 - 50 IU/L</td>
        </tr>
        <tr>
          <th scope="row">ALT</th>
          <td>
            <input v-model="alt" type="text" class="form-control" />
          </td>
          <td>5.0 - 46 IU/L</td>
        </tr>
        <tr>
          <th scope="row">ALP</th>
          <td>
            <input v-model="alp" type="text" class="form-control" />
          </td>
          <td>20 - 147 IU/L</td>
        </tr>
        <tr>
          <th scope="row">TP</th>
          <td>
            <input v-model="tp" type="text" class="form-control form-control-sm" />
          </td>
          <td>6.2 - 8.0 g/dl</td>
        </tr>
        <tr>
          <th scope="row">ALB</th>
          <td>
            <input v-model="alb" type="text" class="form-control form-control-sm" />
          </td>
          <td>3.5 - 5.5 g/dl</td>
        </tr>
        <tr>
          <th scope="row">TB</th>
          <td>
            <input v-model="tb" type="text" class="form-control form-control-sm" />
          </td>
          <td>0.2 - 1.2 mg/dl</td>
        </tr>
        <tr>
          <th scope="row">DB</th>
          <td>
            <input v-model="db" type="text" class="form-control form-control-sm" />
          </td>
          <td>0.0 - 0.4 mg/dl</td>
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
    ast: '',
    alt: '',
    alp: '',
    tp: '',
    alb: '',
    tb: '',
    db: '',
    comments: '',
  }),
};
</script>

<style scoped></style>
