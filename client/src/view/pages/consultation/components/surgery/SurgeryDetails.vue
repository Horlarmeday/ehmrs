<template>
  <div>
    <table class="table">
      <thead>
        <tr>
          <th scope="col">Surgery</th>
          <th scope="col">Notes</th>
          <th scope="col">Requested By</th>
          <th scope="col">Date</th>
          <th scope="col">Operation Notes</th>
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
            <router-link
              v-b-tooltip.hover
              title="Add Operation Notes"
              :to="`/surgery/requests/${surgery.visit_id}?surgery=${surgery.id}`"
              class="btn btn-icon btn-light btn-hover-primary btn-sm mx-3"
            >
              <arrow-right-icon />
            </router-link>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import ArrowRightIcon from '@/assets/icons/ArrowRightIcon.vue';

export default {
  components: { ArrowRightIcon },
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
