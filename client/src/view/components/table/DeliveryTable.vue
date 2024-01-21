<template>
  <div class="table-responsive">
    <table class="table table-sm">
      <thead class="thead-light">
        <tr class="text-uppercase">
          <th scope="col">Mode of Delivery</th>
          <th scope="col">Date of Delivery</th>
          <th scope="col">Time of Delivery</th>
          <th scope="col">Qty of Blood Loss</th>
          <th scope="col">Duration</th>
          <th scope="col">Mother Condition</th>
          <th scope="col">Birth Weight</th>
          <th scope="col">Date Added</th>
          <th scope="col">Added By</th>
          <th scope="col">Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="!deliveries?.length">
          <td colspan="9" align="center" class="text-muted">No Data</td>
        </tr>
        <tr v-for="(delivery, i) in deliveries" :key="i">
          <td>{{ delivery.mode_of_delivery }}</td>
          <td>{{ delivery.date_of_delivery | dayjs('MMM D, YYYY') }}</td>
          <td>{{ delivery.date_of_delivery | dayjs('h:mm A') }}</td>
          <td>{{ delivery.blood_loss_quantity }}</td>
          <td>{{ delivery.duration }}</td>
          <td>{{ delivery.condition_of_mother }}</td>
          <td>{{ delivery.birth_weight }}</td>
          <td>{{ delivery.createdAt | dayjs('DD/MM/YYYY, h:mma') }}</td>
          <td>{{ delivery?.staff?.fullname }}</td>
          <td>
            <a :id="popOverId" @click="viewPopover(delivery)" href="#"
              ><i class="icon-xl text-primary la la-eye"></i
            ></a>
          </td>
        </tr>
      </tbody>
    </table>
    <delivery-popover
      :delivery="delivery"
      :target="popOverId"
      :show="showPopover"
      @closePopover="hidePopover"
    />
  </div>
</template>
<script>
import DeliveryPopover from '@/view/components/popover/DeliveryPopover.vue';

export default {
  name: 'DeliveryTable',
  components: { DeliveryPopover },
  data: () => ({
    showPopover: false,
    popOverId: 'popover-reactive-9',
    delivery: {},
  }),
  props: {
    deliveries: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
  methods: {
    viewPopover(delivery) {
      this.delivery = delivery;
      this.showPopover = true;
    },
    hidePopover() {
      this.showPopover = false;
    },
  },
};
</script>

<style scoped></style>
