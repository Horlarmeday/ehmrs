<template>
  <div class="card card-custom gutter-b">
    <div class="card-header py-5">
      <h3 class="card-title align-items-start flex-column">
        <span class="card-label font-weight-bolder text-dark">Transaction</span>
      </h3>
      <div class="card-toolbar">
        <div class="d-flex align-items-center">
          <b-button-group size="md">
            <b-button
              ref="kt-print-all"
              variant="primary"
              @click.prevent="downloadPaymentReceipt('All', 'kt-print-all')"
              ><i class="fas fa-print mr-2"></i> Print</b-button
            >
            <b-dropdown right variant="primary">
              <b-dropdown-item
                type="button"
                ref="kt-print-drugs"
                @click.prevent="downloadPaymentReceipt('Drugs', 'kt-print-drugs')"
                >Drugs</b-dropdown-item
              >
              <b-dropdown-item
                ref="kt-print-tests"
                @click.prevent="downloadPaymentReceipt('Tests', 'kt-print-tests')"
                >Tests</b-dropdown-item
              >
              <b-dropdown-item
                ref="kt-print-items"
                @click.prevent="downloadPaymentReceipt('Items', 'kt-print-items')"
                >Items</b-dropdown-item
              >
              <b-dropdown-item
                ref="kt-print-services"
                @click.prevent="downloadPaymentReceipt('Services', 'kt-print-services')"
                >Services</b-dropdown-item
              >
              <b-dropdown-item
                ref="kt-print-investigations"
                @click.prevent="downloadPaymentReceipt('Investigations', 'kt-print-investigations')"
                >Investigations</b-dropdown-item
              >
            </b-dropdown>
          </b-button-group>
        </div>
      </div>
    </div>
    <div class="card-body">
      <div class="example">
        <b-tabs content-class="mt-3">
          <b-tab title="Medications" active>
            <prescribed-drugs-table />
          </b-tab>
          <b-tab title="Items" lazy>
            <additional-items-table />
          </b-tab>
          <b-tab title="Tests" lazy>
            <prescribed-tests-table />
          </b-tab>
          <b-tab title="Services" lazy>
            <prescribed-services-table />
          </b-tab>
          <b-tab title="Investigations">
            <prescribed-investigations />
          </b-tab>
        </b-tabs>
      </div>
    </div>
  </div>
</template>
<script>
import PrescribedDrugsTable from '@/view/pages/account/components/drugs/PrescribedDrugsTable.vue';
import AdditionalItemsTable from '@/view/pages/account/components/items/AdditionalItemsTable.vue';
import PrescribedServicesTable from '@/view/pages/account/components/services/PrescribedServicesTable.vue';
import PrescribedTestsTable from '@/view/pages/account/components/tests/PrescribedTestsTable.vue';
import PrescribedInvestigations from '@/view/pages/account/components/investigations/PrescribedInvestigations.vue';

export default {
  components: {
    PrescribedInvestigations,
    PrescribedTestsTable,
    PrescribedServicesTable,
    PrescribedDrugsTable,
    AdditionalItemsTable,
  },
  data() {
    return {
      isDisabled: false,
    };
  },
  methods: {
    addSpinner(submitButton) {
      this.isDisabled = true;
      submitButton.classList.add('spinner', 'spinner-light', 'spinner-right');
    },

    removeSpinner(submitButton) {
      this.isDisabled = false;
      submitButton.classList.remove('spinner', 'spinner-light', 'spinner-right');
    },

    downloadPaymentReceipt(serviceName, ref) {
      const submitButton = this.$refs[ref];
      //this.addSpinner(submitButton);

      const obj = {
        id: this.$route.params.id,
        serviceName: serviceName.toUpperCase(),
      };

      this.$store
        .dispatch('account/downloadPaymentReceipt', obj)
        .then(() => {
          this.removeSpinner(submitButton);
        })
        .catch(() => this.removeSpinner(submitButton));
    },
  },
};
</script>

<style scoped></style>
