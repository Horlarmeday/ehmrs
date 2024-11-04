<template>
  <div class="table-responsive">
    <table class="table table-sm">
      <thead class="thead-light">
        <tr class="text-uppercase">
          <th scope="col">Height</th>
          <th scope="col">Weight</th>
          <th scope="col">BMI</th>
          <th scope="col">Blood Pressure</th>
          <th scope="col">Temperature</th>
          <th scope="col">Done By</th>
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
          <td>{{ triage.bmi }}</td>
          <td>{{ triage.systolic }}/{{ triage.diastolic }}</td>
          <td>{{ triage.temperature }}</td>
          <td>{{ triage.staff.fullname }}</td>
          <td>{{ triage.createdAt | dayjs('DD/MM/YYYY, h:mma') }}</td>
          <td>
            <a @click="viewModal(triage)" href="#"
              ><i class="icon-xl text-primary la la-eye"></i
            ></a>
          </td>
        </tr>
      </tbody>
    </table>
    <triage-details-modal
      @closeModal="hideModal"
      :triage="triage"
      :display-prompt="displayPrompt"
    />
  </div>
</template>
<script>
import TriageDetailsModal from '@/view/components/modal/TriageDetailsModal.vue';

export default {
  name: 'TriageTable',
  components: { TriageDetailsModal },
  data: () => ({
    displayPrompt: false,
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
    viewModal(triage) {
      this.triage = triage;
      this.displayPrompt = true;
    },
    hideModal() {
      this.displayPrompt = false;
    },
  },
};
</script>

<style scoped></style>
