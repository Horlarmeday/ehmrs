<template>
  <div class="table-responsive">
    <table class="table table-sm">
      <thead class="thead-light">
        <tr class="text-uppercase">
          <th scope="col">Blood Pressure</th>
          <th scope="col">Temperature</th>
          <th scope="col">Pulse</th>
          <th scope="col">Respiration</th>
          <th scope="col">Lochia</th>
          <th scope="col">Weight</th>
          <th scope="col">Date Added</th>
          <th scope="col">Added By</th>
          <th scope="col">Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="!postNatals?.length">
          <td colspan="9" align="center" class="text-muted">No Data</td>
        </tr>
        <tr v-for="(postnatal, i) in postNatals" :key="i">
          <td>{{ postnatal.blood_pressure }}</td>
          <td>{{ postnatal.temperature }}</td>
          <td>{{ postnatal.pulse }}</td>
          <td>{{ postnatal.respiration }}</td>
          <td>{{ postnatal.lochia }}</td>
          <td>{{ postnatal.weight }}</td>
          <td>{{ postnatal.createdAt | dayjs('DD/MM/YYYY, h:mma') }}</td>
          <td>{{ postnatal?.staff?.fullname }}</td>
          <td>
            <a :id="popOverId" @click="viewPopover(postnatal)" href="#"
              ><i class="icon-xl text-primary la la-eye"></i
            ></a>
          </td>
        </tr>
      </tbody>
    </table>
    <postnatal-popover
      :postnatal="postnatal"
      :target="popOverId"
      :show="showPopover"
      @closePopover="hidePopover"
    />
  </div>
</template>
<script>
import PostnatalPopover from '@/view/components/popover/PostnatalPopover.vue';

export default {
  name: 'PostnatalTable',
  components: { PostnatalPopover },
  data: () => ({
    showPopover: false,
    popOverId: 'popover-reactive-9',
    postnatal: {},
  }),
  props: {
    postNatals: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
  methods: {
    viewPopover(postnatal) {
      this.postnatal = postnatal;
      this.showPopover = true;
    },
    hidePopover() {
      this.showPopover = false;
    },
  },
};
</script>

<style scoped></style>
