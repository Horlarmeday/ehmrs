<template>
  <div>
    <div class="table-responsive">
      <table class="table table-sm">
        <thead class="thead-light">
          <tr class="text-uppercase">
            <th scope="col">Service</th>
            <th scope="col">Billing Status</th>
            <th scope="col">Type</th>
            <th scope="col">Requested By</th>
            <th scope="col">Date Requested</th>
            <th scope="col"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!services?.length">
            <td colspan="9" align="center" class="text-muted">No Data</td>
          </tr>
          <tr v-for="(service, i) in services" :key="i">
            <td>{{ service.service.name }}</td>
            <td>{{ service.billing_status }}</td>
            <td>
              <span :class="getServiceTypeColor(service.service_type)">{{
                service.service_type
              }}</span>
            </td>
            <td>{{ service.examiner.fullname }}</td>
            <td>{{ service.createdAt | dayjs('DD/MM/YYYY, h:mma') }}</td>
            <td>
              <a href="#" :class="service.payment_status !== 'Pending' ? 'disabled' : ''"
                ><i class="flaticon-delete text-danger"></i
              ></a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script>
export default {
  name: 'ServicesTable',
  props: {
    services: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
  methods: {
    getServiceTypeColor(type) {
      if (type === 'NHIS') return 'label label-inline label-light-warning font-weight-bold';
      if (type === 'Cash') return 'label label-inline label-light-success font-weight-bold';
      return 'label label-inline label-light-danger font-weight-bold';
    },
  },
};
</script>

<style scoped>
.disabled {
  opacity: 0.5;
  pointer-events: none;
}
</style>
