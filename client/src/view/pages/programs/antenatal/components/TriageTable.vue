<template>
  <div class="table-responsive">
    <table class="table table-sm">
      <thead class="thead-light">
        <tr class="text-uppercase">
          <th scope="col">Height</th>
          <th scope="col">Weight</th>
          <th scope="col">Pallor</th>
          <th scope="col">Blood Pressure</th>
          <th scope="col">Maturity</th>
          <th scope="col">Date Added</th>
          <th scope="col">Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="!triages?.length">
          <td colspan="9" align="center" class="text-muted">No Data</td>
        </tr>
        <tr v-for="(triage, i) in triages" :key="i">
          <td>{{ triage.height }}</td>
          <td>{{ triage.weight }}</td>
          <td>{{ triage.pallor }}</td>
          <td>{{ triage.blood_pressure }}</td>
          <td>{{ triage.maturity }}</td>
          <td>{{ triage.createdAt | dayjs('DD/MM/YYYY, h:mma') }}</td>
          <td>
            <a :id="popOverId" @click="viewPopover(triage)" href="#"
              ><i class="icon-xl text-primary la la-eye"></i
            ></a>
          </td>
        </tr>
      </tbody>
    </table>
    <triage-popover
      :triage="triage"
      :target="popOverId"
      :show="showPopover"
      @closePopover="hidePopover"
    />
  </div>
</template>
<script>
import TriagePopover from '@/view/pages/programs/antenatal/components/TriagePopover.vue';

export default {
  name: 'TriageTable',
  components: { TriagePopover },
  data: () => ({
    showPopover: false,
    popOverId: 'popover-reactive-3',
    triage: {},
  }),
  props: {
    triages: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
  methods: {
    viewPopover(triage) {
      this.triage = triage;
      this.showPopover = true;
    },
    hidePopover() {
      this.showPopover = false;
    },
  },
};
</script>

<style scoped></style>