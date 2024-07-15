<template>
  <div class="form-container border border-gray-500">
    <table class="table">
      <thead>
        <tr>
          <th scope="col">#</th>
          <th scope="col">Result</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row">Culture</th>
          <td>
            <input v-model="culture" type="text" class="form-control" />
          </td>
        </tr>
        <tr>
          <th scope="row">Appearance</th>
          <td>
            <input v-model="appearance" type="text" class="form-control" />
          </td>
        </tr>
        <tr>
          <th scope="row">Leukocytes</th>
          <td>
            <input v-model="leukocytes" type="text" class="form-control form-control-sm" />
          </td>
        </tr>
        <tr>
          <th scope="row">Protein</th>
          <td>
            <input v-model="protein" type="text" class="form-control form-control-sm" />
          </td>
        </tr>
        <tr>
          <th scope="row">Glucose</th>
          <td>
            <input v-model="glucose" type="text" class="form-control form-control-sm" />
          </td>
        </tr>
        <tr>
          <th scope="row">Blood</th>
          <td>
            <input v-model="blood" type="text" class="form-control form-control-sm" />
          </td>
        </tr>
        <tr>
          <th scope="row">PH</th>
          <td>
            <input v-model="ph" type="text" class="form-control form-control-sm" />
          </td>
        </tr>
        <tr>
          <th scope="row">Ascorbic Acid</th>
          <td>
            <input v-model="ascorbic_acid" type="text" class="form-control form-control-sm" />
          </td>
        </tr>
        <tr>
          <th scope="row">Urobilinogen</th>
          <td>
            <input v-model="urobilinogen" type="text" class="form-control form-control-sm" />
          </td>
        </tr>
        <tr>
          <th scope="row">Ketones</th>
          <td>
            <input v-model="ketones" type="text" class="form-control form-control-sm" />
          </td>
        </tr>
        <tr>
          <th scope="row">S.gravity</th>
          <td>
            <input v-model="gravity" type="text" class="form-control form-control-sm" />
          </td>
        </tr>
        <tr>
          <th scope="row">Bilirubin</th>
          <td>
            <input v-model="bilirubin" type="text" class="form-control form-control-sm" />
          </td>
        </tr>
        <tr>
          <th scope="row">Nitrite</th>
          <td>
            <input v-model="nitrite" type="text" class="form-control form-control-sm" />
          </td>
        </tr>
        <tr>
          <th scope="row">Comments</th>
          <td>
            <input v-model="comments" type="text" class="form-control" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
export default {
  data: () => ({
    leukocytes: '',
    protein: '',
    glucose: '',
    culture: '',
    appearance: '',
    blood: '',
    ph: '',
    ascorbic_acid: '',
    urobilinogen: '',
    ketones: '',
    gravity: '',
    bilirubin: '',
    nitrite: '',
    comments: '',
  }),
};
</script>

<style scoped></style>
