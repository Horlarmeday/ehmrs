<template>
  <div>
    <transition name="fade-in-up">
      <b-button-group size="sm" class="mt-5 mb-3">
        <b-button variant="outline-secondary">
          <span class="pl-3 pr-3">
            <span class="mr-2" />
            {{ count }} Selected
          </span>
        </b-button>
        <b-button :disabled="disableBilling" @click="showBillAlert" variant="outline-secondary">
          <span class="pl-3 pr-3">
            Bill Items
          </span>
        </b-button>
        <b-button variant="outline-secondary">Make Payment</b-button>
      </b-button-group>
    </transition>
  </div>
</template>
<script>
import Swal from 'sweetalert2';

export default {
  data: () => ({
    BILLED: 'Billed',
  }),
  props: {
    count: {
      type: Number,
      default: 0,
    },
    type: {
      type: String,
      required: true,
    },
    selectedItems: {
      type: Array,
      required: true,
      default: () => [],
    },
    disableBilling: {
      type: Boolean,
      required: true,
    }
  },
  methods: {
    billItems() {
      console.log(this.selectedItems);
      const selectedItems = this.selectedItems.map(item => ({
        id: item,
        billing_status: this.BILLED,
      }));

      switch (this.type) {
        case 'Drugs':
          return this.billDrugPrescriptions(selectedItems);
        case 'Items':
          return this.billAdditionalItems(selectedItems);
      }
    },

    billDrugPrescriptions(selectedItems) {
      this.$store.dispatch('order/updateBulkPrescribedDrugs', selectedItems).then(() => {
        this.endBillRequest('order/fetchPrescribedDrugsPerVisit');
      });
    },

    billAdditionalItems(selectedItems) {
      this.$store.dispatch('order/updateBulkAdditionalItems', selectedItems).then(() => {
        this.endBillRequest('order/fetchAdditionalItemsPerVisit');
      });
    },

    endBillRequest(type) {
      this.$store.dispatch(type, { id: this.$route.params.id });
      this.$emit('endBillRequest');
    },

    showBillAlert() {
      const self = this;
      Swal.fire({
        title: 'Are you sure?',
        text: `You want to bill these ${this.type}`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Bill!',
        customClass: {
          confirmButton: 'btn btn-success',
          cancelButton: 'btn btn-default',
        },
      }).then(function(result) {
        if (result.value) {
          self.billItems();
        }
      });
    },
  },
};
</script>

<style scoped></style>
