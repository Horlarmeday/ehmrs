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
              <span
                :title="`${item.drug_type}`"
                v-b-tooltip.hover
                :class="getLabelDotStatus(item.drug_type)"
                class="label label-dot label-lg mr-2"
              ></span>
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
                <a
                  href="#"
                  :class="loading && 'disabled'"
                  @click="showDeleteAlert(item)"
                  v-if="item.billing_status === UNBILLED && item.payment_status === PENDING"
                >
                  <i class="flaticon-delete text-danger"></i>
                </a>
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script>
import Swal from 'sweetalert2';
import { getLabelDotStatus } from '@/common/common';

export default {
  data: () => ({
    loading: false,
    UNBILLED: 'Unbilled',
    PENDING: 'Pending',
  }),

  props: {
    items: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
  methods: {
    getLabelDotStatus,
    showDeleteAlert(item) {
      const self = this;
      Swal.fire({
        title: 'Are you sure?',
        text: 'You want to delete this item',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Delete!',
        customClass: {
          confirmButton: 'btn btn-danger',
          cancelButton: 'btn btn-default',
        },
      }).then(function(result) {
        if (result.value) {
          self.deleteAdditionalItem(item);
        }
      });
    },

    deleteAdditionalItem(item) {
      this.loading = true;
      this.$store
        .dispatch('order/deleteAdditionalItem', { itemId: item.id })
        .then(() => (this.loading = false))
        .catch(() => (this.loading = false));
    },
  },
};
</script>

<style scoped></style>
