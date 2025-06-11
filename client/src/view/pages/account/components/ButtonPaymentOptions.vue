<template>
  <div>
    <make-payment-modal
      :display-prompt="displayMakePaymentModal"
      :available-items="selectedItems"
      :service-type="type"
      @closeModal="closeMakePaymentModal"
    />
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
        <b-button @click="showMakePaymentModal" variant="outline-secondary">Make Payment</b-button>
      </b-button-group>
    </transition>
  </div>
</template>
<script>
import Swal from 'sweetalert2';
import MakePaymentModal from '@/view/pages/account/components/MakePaymentModal.vue';

export default {
  components: { MakePaymentModal },
  data: () => ({
    BILLED: 'Billed',
    displayMakePaymentModal: false,
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
    },
  },
  methods: {
    billItems() {
      const selectedItems = this.selectedItems.map(item => ({
        id: item.id,
        billing_status: this.BILLED,
      }));

      switch (this.type) {
        case 'Drugs':
          return this.billDrugPrescriptions(selectedItems);
        case 'Items':
          return this.billAdditionalItems(selectedItems);
        case 'Services':
          return this.billServices(selectedItems);
        case 'Tests':
          return this.billTestPrescriptions(selectedItems);
        case 'Investigations':
          return this.billInvestigationPrescriptions(selectedItems);
      }
    },

    endPayment() {
      switch (this.type) {
        case 'Drugs':
          return this.endBillRequest('order/fetchPrescribedDrugsPerVisit');
        case 'Items':
          return this.endBillRequest('order/fetchAdditionalItemsPerVisit');
        case 'Services':
          return this.endBillRequest('order/fetchPrescribedServicesPerVisit');
        case 'Tests':
          return this.endBillRequest('order/fetchPrescribedTestsPerVisit');
        case 'Investigations':
          return this.endBillRequest('order/fetchPrescribedInvestigationsPerVisit');
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

    billServices(selectedItems) {
      this.$store.dispatch('order/updateBulkServices', selectedItems).then(() => {
        this.endBillRequest('order/fetchPrescribedServicesPerVisit');
      });
    },

    billTestPrescriptions(selectedItems) {
      this.$store.dispatch('order/updateBulkUpdatePrescribedDrugs', selectedItems).then(() => {
        this.endBillRequest('order/fetchPrescribedTestsPerVisit');
      });
    },

    billInvestigationPrescriptions(selectedItems) {
      this.$store
        .dispatch('order/updateBulkUpdatePrescribedInvestigations', selectedItems)
        .then(() => {
          this.endBillRequest('order/fetchPrescribedInvestigationsPerVisit');
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

    showMakePaymentModal() {
      this.displayMakePaymentModal = true;
    },

    closeMakePaymentModal() {
      this.displayMakePaymentModal = false;
      this.endPayment();
    },
  },
};
</script>

<style scoped></style>
