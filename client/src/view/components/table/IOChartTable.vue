<template>
  <div class="table-responsive">
    <table class="table table-sm">
      <thead class="thead-light">
        <tr class="text-uppercase">
          <th scope="col">Item (Input)</th>
          <th scope="col">Quantity</th>
          <th scope="col">Input Total</th>
          <th scope="col">Item (Output)</th>
          <th scope="col">Quantity</th>
          <th scope="col">Output Total</th>
          <th scope="col">Added By</th>
          <th scope="col">Date Added</th>
          <th scope="col">Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="!charts?.length">
          <td colspan="9" align="center" class="text-muted">No Data</td>
        </tr>
        <tr v-for="(chart, i) in charts" :key="i">
          <td>{{ chart.input_item }}</td>
          <td>{{ chart.input_quantity }}</td>
          <td>{{ chart.input_total }}</td>
          <td>{{ chart.output_item }}</td>
          <td>{{ chart.output_quantity }}</td>
          <td>{{ chart.output_total }}</td>
          <td>{{ chart.staff.fullname }}</td>
          <td>{{ chart.createdAt | dayjs('DD/MM/YYYY, h:mma') }}</td>
          <td>
            <a href="#"><i class="icon-lg text-danger fa fa-trash-alt"></i></a>
          </td>
        </tr>
      </tbody>
      <tfoot v-if="charts?.length && totals">
        <tr class="text-uppercase font-weight-bold">
          <td colspan="2">Summed Totals</td>
          <td>{{ totals.input }}</td>
          <td colspan="2"></td>
          <td>{{ totals.output }}</td>
          <td colspan="3"></td>
        </tr>
      </tfoot>
    </table>
  </div>
</template>
<script>
export default {
  name: 'IOChartTable',
  props: {
    charts: {
      type: Array,
      required: true,
      default: () => [],
    },
    totals: {
      type: Object,
      default: null,
    },
  },
};
</script>

<style scoped></style>
