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
          <th class="text-center" colspan="2">Method of Production</th>
        </tr>
        <tr>
          <th scope="row">Time Produced</th>
          <td>
            <input v-model="time_produced" type="text" class="form-control form-control-sm" />
          </td>
        </tr>
        <tr>
          <th scope="row">Time Received</th>
          <td>
            <input v-model="time_received" type="text" class="form-control form-control-sm" />
          </td>
        </tr>
        <tr>
          <th scope="row">Time of Analysis</th>
          <td>
            <input v-model="time_of_analysis" type="text" class="form-control form-control-sm" />
          </td>
        </tr>
        <tr>
          <th scope="row">Period of Abstinence</th>
          <td>
            <input
              v-model="period_of_abstinence"
              type="text"
              class="form-control form-control-sm"
            />
          </td>
        </tr>
        <tr>
          <th scope="row">Colour</th>
          <td>
            <input v-model="colour" type="text" class="form-control form-control-sm" />
          </td>
        </tr>
        <tr>
          <th scope="row">Viscosity</th>
          <td>
            <input v-model="viscosity" type="text" class="form-control form-control-sm" />
          </td>
        </tr>
        <tr>
          <th scope="row">Liquefaction</th>
          <td>
            <input v-model="liquefaction" type="text" class="form-control form-control-sm" />
          </td>
        </tr>
        <tr>
          <th scope="row">Spillage</th>
          <td>
            <input v-model="spillage" type="text" class="form-control form-control-sm" />
          </td>
        </tr>
        <tr>
          <th scope="row">Volume</th>
          <td>
            <input v-model="viscosity" type="text" class="form-control form-control-sm" />
          </td>
        </tr>
        <tr>
          <th scope="row">Odour</th>
          <td>
            <input v-model="odour" type="text" class="form-control form-control-sm" />
          </td>
        </tr>
        <tr>
          <th scope="row">PH</th>
          <td>
            <input v-model="ph" type="text" class="form-control form-control-sm" />
          </td>
        </tr>
        <tr>
          <th class="text-center" colspan="2">Microscopy</th>
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
          <th scope="row">Cellula Debris</th>
          <td>
            <input v-model="cellula_debris" type="text" class="form-control form-control-sm" />
          </td>
        </tr>
        <tr>
          <th scope="row">Spermatozoan</th>
          <td>
            <input v-model="spermatozoan" type="text" class="form-control form-control-sm" />
          </td>
        </tr>
        <tr>
          <th scope="row">Epithelial Cells</th>
          <td>
            <input v-model="epithelial_cells" type="text" class="form-control form-control-sm" />
          </td>
        </tr>
        <tr>
          <th class="text-center" colspan="2">Percentage Motility</th>
        </tr>
        <tr>
          <th scope="row">Active</th>
          <td>
            <input v-model="active" type="text" class="form-control form-control-sm" />
          </td>
        </tr>
        <tr>
          <th scope="row">Sluggish</th>
          <td>
            <input v-model="sluggish" type="text" class="form-control form-control-sm" />
          </td>
        </tr>
        <tr>
          <th scope="row">Non-Progressive</th>
          <td>
            <input v-model="non_progressive" type="text" class="form-control form-control-sm" />
          </td>
        </tr>
        <tr>
          <th scope="row">Dead Cells</th>
          <td>
            <input v-model="dead_cells" type="text" class="form-control form-control-sm" />
          </td>
        </tr>
        <tr>
          <th class="text-center" colspan="2">Morphology</th>
        </tr>
        <tr>
          <th scope="row">% Normal Cells</th>
          <td>
            <input v-model="normal_cells" type="text" class="form-control form-control-sm" />
          </td>
        </tr>
        <tr>
          <th scope="row">% Abnormal Cells</th>
          <td>
            <input v-model="abnormal_cells" type="text" class="form-control form-control-sm" />
          </td>
        </tr>
        <tr>
          <th scope="row">Sperm Count</th>
          <td>
            <input v-model="sperm_count" type="text" class="form-control form-control-sm" />
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
    culture: '',
    appearance: '',
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
    time_produced: '',
    time_received: '',
    time_of_analysis: '',
    period_of_abstinence: '',
    colour: '',
    viscosity: '',
    liquefaction: '',
    spillage: '',
    volume: '',
    odour: '',
    ph: '',
    pus_cells: '',
    rbc: '',
    cellula_debris: '',
    spermatozoan: '',
    epithelial_cells: '',
    active: '',
    sluggish: '',
    non_progressive: '',
    dead_cells: '',
    normal_cells: '',
    abnormal_cells: '',
    sperm_count: '',
  }),
};
</script>

<style scoped></style>
