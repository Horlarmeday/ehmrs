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
            <th scope="col">Date</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="drugs.length === 0">
            <td colspan="9" align="center" class="text-muted">No Data</td>
          </tr>
          <tr v-for="drug in drugs" :key="drug.id">
            <th>
              <a
                @click="viewPopover(drug)"
                href="#"
                :id="popOverId"
              >
                {{ drug.drug.name }}</a
              >
            </th>
            <td>
              <span>{{ drug.quantity_to_dispense }} {{ drug?.dosage_form?.name || '-' }}</span>
            </td>
            <td>
              <span>{{ drug.prescribed_strength }}{{ drug?.strength?.name || '-' }}</span>
            </td>
            <td>
              <span>{{ drug.frequency }}</span>
            </td>
            <td>
              <span>{{ drug.duration }} {{ drug.duration_unit }}</span>
            </td>
            <td>
              <span>{{ drug.date_prescribed | dayjs('DD/MM/YYYY, h:mma') }}</span>
            </td>
            <td>
              <span>
                <a href="#"><i class="flaticon-delete mr-2 text-danger"></i></a>
                <a href="#"><i class="flaticon-edit-1 text-success"></i></a>
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
import DrugPopover from '@/utils/DrugPopover.vue';

export default {
  name: 'MedicationsTable',
  components: { DrugPopover },
  data: () => ({
    item: {},
    showPopover: false,
    popOverId: 'popover-reactive-1',
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
  },
};
</script>

<style scoped></style>
