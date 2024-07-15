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
          <th scope="row">PUS Cells</th>
          <td>
            <input v-model="pus_cells" type="text" class="form-control form-control-sm" />
          </td>
        </tr>
        <tr>
          <th scope="row">RBC</th>
          <td>
            <input v-model="rbc" type="text" class="form-control form-control-sm" />
          </td>
        </tr>
        <tr>
          <th scope="row">OVA/Cyst</th>
          <td>
            <input v-model="ova_cyst" type="text" class="form-control form-control-sm" />
          </td>
        </tr>
        <tr>
          <th scope="row">Undigested Food Particles</th>
          <td>
            <input
              v-model="undigested_food_particles"
              type="text"
              class="form-control form-control-sm"
            />
          </td>
        </tr>
        <tr>
          <th scope="row">Schistoma Ova</th>
          <td>
            <input v-model="schistoma_ova" type="text" class="form-control form-control-sm" />
          </td>
        </tr>
        <tr>
          <th scope="row">FOB</th>
          <td>
            <input v-model="fob" type="text" class="form-control form-control-sm" />
          </td>
        </tr>
        <tr>
          <th class="text-center" colspan="2">Antibiotic Sensitivity</th>
        </tr>
        <tr>
          <th scope="row">Ciprofloxacin</th>
          <td>
            <input v-model="ciprofloxacin" type="text" class="form-control form-control-sm" />
          </td>
        </tr>
        <tr>
          <th scope="row">Rifampicin</th>
          <td>
            <input v-model="rifampicin" type="text" class="form-control form-control-sm" />
          </td>
        </tr>
        <tr>
          <th scope="row">Streptomycin</th>
          <td>
            <input v-model="streptomycin" type="text" class="form-control form-control-sm" />
          </td>
        </tr>
        <tr>
          <th scope="row">Azithromycin</th>
          <td>
            <input v-model="azithromycin" type="text" class="form-control form-control-sm" />
          </td>
        </tr>
        <tr>
          <th scope="row">Amoxicillin</th>
          <td>
            <input v-model="amoxicillin" type="text" class="form-control form-control-sm" />
          </td>
        </tr>
        <tr>
          <th scope="row">Erythromycin</th>
          <td>
            <input v-model="erythromycin" type="text" class="form-control form-control-sm" />
          </td>
        </tr>
        <tr>
          <th scope="row">Levofloxacin</th>
          <td>
            <input v-model="levofloxacin" type="text" class="form-control form-control-sm" />
          </td>
        </tr>
        <tr>
          <th scope="row">Gentamycin</th>
          <td>
            <input v-model="gentamycin" type="text" class="form-control form-control-sm" />
          </td>
        </tr>
        <tr>
          <th scope="row">Cefuroxime</th>
          <td>
            <input v-model="cefuroxime" type="text" class="form-control form-control-sm" />
          </td>
        </tr>
        <tr>
          <th scope="row">Ofloxacin</th>
          <td>
            <input v-model="ofloxacin" type="text" class="form-control form-control-sm" />
          </td>
        </tr>
        <tr>
          <th scope="row">Augmentin</th>
          <td>
            <input v-model="augmentin" type="text" class="form-control form-control-sm" />
          </td>
        </tr>
        <tr>
          <th scope="row">Peflacine</th>
          <td>
            <input v-model="peflacine" type="text" class="form-control form-control-sm" />
          </td>
        </tr>
        <tr>
          <th scope="row">Ceftazidime</th>
          <td>
            <input v-model="ceftazidime" type="text" class="form-control form-control-sm" />
          </td>
        </tr>
        <tr>
          <th scope="row">Ceporex</th>
          <td>
            <input v-model="ceporex" type="text" class="form-control form-control-sm" />
          </td>
        </tr>
        <tr>
          <th scope="row">Ceftriaxone</th>
          <td>
            <input v-model="ceftriaxone" type="text" class="form-control form-control-sm" />
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
    pus_cells: '',
    rbc: '',
    ova_cyst: '',
    culture: '',
    appearance: '',
    undigested_food_particles: '',
    schistoma_ova: '',
    fob: '',
    comments: '',
    ciprofloxacin: '',
    rifampicin: '',
    streptomycin: '',
    azithromycin: '',
    amoxicillin: '',
    erythromycin: '',
    levofloxacin: '',
    gentamycin: '',
    ceftazidime: '',
    cefuroxime: '',
    ofloxacin: '',
    augmentin: '',
    peflacine: '',
    ceftriaxone: '',
    ceporex: '',
  }),
};
</script>

<style scoped></style>
