<template>
  <div>
    <div class="table-responsive">
      <table class="table table-sm">
        <thead class="thead-light">
          <tr class="text-uppercase">
            <th scope="col">Drug</th>
            <th scope="col">Dose</th>
            <th scope="col">Strength</th>
            <th scope="col">Frequency</th>
            <th scope="col">Duration</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="drugs.length === 0">
            <td colspan="9" align="center" class="text-muted">No Data</td>
          </tr>
          <tr v-for="drug in drugs" :key="drug.id">
            <th>
              <a @click="viewPopover(drug)" href="#" :id="popOverId"> {{ drug.drug_name }}</a>
            </th>
            <td>
              <span>{{ drug.quantity_to_dispense }} {{ drug?.dosage_form_name || '-' }}</span>
            </td>
            <td>
              <span>{{ drug.prescribed_strength }}{{ drug?.strength_name || '-' }}</span>
            </td>
            <td>
              <span>{{ drug.frequency }}</span>
            </td>
            <td>
              <span>{{ drug.duration }} {{ drug.duration_unit }}</span>
            </td>
            <td>
              <span>
                <a href="#" @click="deletePrescribedDrug(drug)">
                  <i class="flaticon-delete mr-2 text-danger"></i>
                </a>
                <!--                <a href="#" @click="editTempDrug(drug)">-->
                <!--                  <i class="flaticon-edit-1 text-success"></i>-->
                <!--                </a>-->
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <drug-popover
      :drug="item"
      :target="popOverId"
      :show="showPopover"
      @closePopover="hidePopover"
    />
  </div>
</template>
<script>
import DrugPopover from '@/view/components/popover/DrugPopover.vue';

export default {
  name: 'TempMedicationTable',
  components: { DrugPopover },
  data: () => ({
    item: {},
    showPopover: false,
    loading: false,
    popOverId: 'popover-reactive-29',
  }),
  props: {
    drugs: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
  methods: {
    viewPopover(item) {
      this.item = item;
      this.showPopover = true;
    },

    hidePopover() {
      this.showPopover = false;
    },

    deletePrescribedDrug(drug) {
      this.$store.dispatch('order/deleteTempDrug', drug.id);
    },
  },
};
</script>

<style scoped></style>
