<template>
  <div>
    <table class="table">
      <thead>
        <tr>
          <th scope="col">Surgery</th>
          <th scope="col">Notes</th>
          <th scope="col">Requested By</th>
          <th scope="col">Date</th>
          <th scope="col"></th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row">{{ surgery?.service?.name }}</th>
          <td>{{ surgery.notes }}</td>
          <td>
            <a href="#">{{ surgery?.staff?.fullname }}</a>
          </td>
          <td>{{ surgery.createdAt | dayjs('ddd, MMM Do YYYY, h:mma') }}</td>
          <td>
            <a v-b-tooltip.hover title="View details" href="#"
              ><i class="flaticon-menu-1 icon-md text-dark"></i
            ></a>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  props: {
    surgery: {
      type: Object,
      required: true,
      default: () => {},
    },
  },
  methods: {},
};
</script>

<style scoped></style>
