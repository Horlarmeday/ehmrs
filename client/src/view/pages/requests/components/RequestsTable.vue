<template>
  <!--begin::Table-->
  <div class="table-responsive">
    <table class="table table-head-custom table-vertical-center" id="kt_advance_table_widget_1">
      <thead>
        <tr>
          <th v-if="shouldSelectRequest"></th>
          <th class="pr-0" style="width: 250px">Item</th>
          <th class="pr-0" style="width: 250px">Inventory</th>
          <th class="pr-0" style="width: 150px">Quantity</th>
          <th class="pr-0" style="width: 150px">Status</th>
          <th v-if="shouldSelectRequest" class="pr-0" style="width: 150px">Requester</th>
          <th class="pr-0" style="min-width: 150px">Date Created</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="!requests.length">
          <td colspan="9" align="center" class="text-muted">No Data</td>
        </tr>
        <tr v-for="request in requests" :key="request.id">
          <td v-if="shouldSelectRequest" class="pl-0">
            <label class="checkbox checkbox-md checkbox-inline">
              <input
                :disabled="request.status !== 'Pending'"
                type="checkbox"
                :checked="isSelected(request)"
                @change="toggleRequest(request)"
              />
              <span></span>
            </label>
          </td>
          <td class="pr-0">
            <router-link
              :to="`/inventory/items/${request.id}`"
              class="text-dark-75 font-weight-bolder text-hover-primary mb-1 font-size-lg"
              >{{ request.item.drug.name }}</router-link
            >
          </td>
          <td>
            <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
              {{ request.inventory.name }}
            </span>
          </td>
          <td>
            <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
              {{ request.quantity }} {{ request.item.unit.name }}
            </span>
          </td>
          <td>
            <span :class="getRequestStatus(request.status)" class="label label-lg label-inline">{{
              request.status
            }}</span>
          </td>
          <td v-if="shouldSelectRequest">
            <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
              {{ request.requester.fullname }}
            </span>
          </td>
          <td>
            <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
              {{ request.createdAt | dayjs('ddd, MMM Do YYYY, h:mma') }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <!--end::Table-->
</template>
<script>
export default {
  props: {
    requests: {
      type: Array,
      required: true,
      default: () => [],
    },
    shouldSelectRequest: {
      type: Boolean,
      required: true,
      default: false,
    }
  },
  computed: {
    selectedRequests() {
      return this.$store.state.request.selectedRequests;
    },
  },
  methods: {
    isSelected(request) {
      return this.selectedRequests.includes(request);
    },

    toggleRequest(request) {
      if (this.isSelected(request)) {
        // If the request is already selected, remove it from selectedRequests
        this.$store.dispatch('request/removeSelectedRequest', request);
      } else {
        // If the request is not selected, add it to selectedRequests
        this.$store.dispatch('request/addSelectedRequest', request);
      }
    },

    getRequestStatus(type) {
      if (type === 'Pending') return 'label-light-warning';
      if (type === 'Granted') return 'label-light-success';
      if (type === 'Declined') return 'label-light-danger';
      return 'label-light-info';
    },
  },
};
</script>

<style scoped></style>
