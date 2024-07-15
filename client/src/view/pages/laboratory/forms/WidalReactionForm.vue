<template>
  <div class="form-container border border-gray-500">
    <table class="table">
      <thead>
        <tr>
          <th scope="col">#</th>
          <th scope="col">O</th>
          <th scope="col">H</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row">Salmonella Typhi</th>
          <td>
            <input v-model="salmonella_typhi_O" type="text" class="form-control" />
          </td>
          <td>
            <input v-model="salmonella_typhi_H" type="text" class="form-control" />
          </td>
        </tr>
        <tr>
          <th scope="row">S. Paratyphi A.</th>
          <td>
            <input v-model="salmonella_paratyphia_AO" type="text" class="form-control" />
          </td>
          <td>
            <input v-model="salmonella_paratyphi_AH" type="text" class="form-control" />
          </td>
        </tr>
        <tr>
          <th scope="row">S. Paratyphi B.</th>
          <td>
            <input v-model="salmonella_paratyphia_BO" type="text" class="form-control" />
          </td>
          <td>
            <input v-model="salmonella_paratyphi_BH" type="text" class="form-control" />
          </td>
        </tr>
        <tr>
          <th scope="row">S. Paratyphi C.</th>
          <td>
            <input v-model="salmonella_paratyphia_CO" type="text" class="form-control" />
          </td>
          <td>
            <input v-model="salmonella_paratyphi_CH" type="text" class="form-control" />
          </td>
        </tr>
        <tr>
          <th scope="row" colspan="6">Significant titre >= 1/80</th>
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
    salmonella_paratyphi_CH: '',
    salmonella_paratyphia_CO: '',
    salmonella_paratyphi_BH: '',
    salmonella_paratyphia_BO: '',
    salmonella_paratyphi_AH: '',
    salmonella_paratyphia_AO: '',
    salmonella_typhi_H: '',
    salmonella_typhi_O: '',
    comments: '',
  }),
};
</script>

<style scoped></style>
