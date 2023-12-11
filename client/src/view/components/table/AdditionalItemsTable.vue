<template>
  <div>
    <div class="table-responsive">
      <table class="table table-sm">
        <thead class="thead-light">
          <tr class="text-uppercase">
            <th scope="col">Item</th>
            <th scope="col">Quantity</th>
            <th scope="col">Total Price</th>
            <th scope="col">Date Prescribed.</th>
            <th scope="col">Examiner</th>
            <th scope="col"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="items.length === 0">
            <td colspan="9" align="center" class="text-muted">No Data</td>
          </tr>
          <tr v-for="item in items" :key="item.id">
            <th>
              <a href="#">{{ item?.drug?.name || '-' }}</a>
            </th>
            <td>
              <span> {{ item.quantity_prescribed }} {{ item?.unit?.name }} </span>
            </td>
            <td>
              <span> ₦{{ item.total_price }} </span>
            </td>
            <td>
              <span>{{ item.date_prescribed | dayjs('ddd, MMM Do YYYY, h:mma') }}</span>
            </td>
            <td>
              <span
                >{{ item?.requester?.firstname }} {{ item?.requester?.lastname?.charAt(0) }}</span
              >
            </td>
            <td>
              <span>
                <a href="#"><i class="flaticon-delete text-danger"></i></a>
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    items: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
};
</script>

<style scoped></style>
