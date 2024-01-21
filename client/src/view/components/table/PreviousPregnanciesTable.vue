<template>
  <div class="table-responsive">
    <table class="table table-sm">
      <thead class="thead-light">
        <tr class="text-uppercase">
          <th scope="col">Year</th>
          <th scope="col">Birth Place</th>
          <th scope="col">Maturity</th>
          <th scope="col">Duration</th>
          <th scope="col">Delivery Type</th>
          <th scope="col">Date Added</th>
          <th scope="col">Added By</th>
          <th scope="col">Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="!pregnancies?.length">
          <td colspan="9" align="center" class="text-muted">No Data</td>
        </tr>
        <tr v-for="(pregnancy, i) in pregnancies" :key="i">
          <td>{{ pregnancy.year }}</td>
          <td>{{ pregnancy.delivery_place }}</td>
          <td>{{ pregnancy.maturity }}</td>
          <td>{{ pregnancy.duration }}</td>
          <td>{{ pregnancy.delivery_type }}</td>
          <td>{{ pregnancy.createdAt | dayjs('DD/MM/YYYY, h:mma') }}</td>
          <td>{{ pregnancy?.requester?.fullname }}</td>
          <td>
            <a :id="popOverId" @click="viewPopover(pregnancy)" href="#"
              ><i class="icon-xl text-primary la la-eye"></i
            ></a>
          </td>
        </tr>
      </tbody>
    </table>
    <previous-pregnancy-popover
      :pregnancy="pregnancy"
      :target="popOverId"
      :show="showPopover"
      @closePopover="hidePopover"
    />
  </div>
</template>
<script>
import PreviousPregnancyPopover from '@/view/components/popover/PreviousPregnancyPopover.vue';

export default {
  name: 'PreviousPregnanciesTable',
  components: { PreviousPregnancyPopover },
  data: () => ({
    showPopover: false,
    popOverId: 'popover-reactive-9',
    pregnancy: {},
  }),
  props: {
    pregnancies: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
  methods: {
    viewPopover(pregnancy) {
      this.pregnancy = pregnancy;
      this.showPopover = true;
    },
    hidePopover() {
      this.showPopover = false;
    },
  },
};
</script>

<style scoped></style>
