<template>
  <div>
    <div class="table-responsive">
      <table class="table table-sm">
        <thead class="thead-light">
          <tr class="text-uppercase">
            <th scope="col">Drug</th>
            <th scope="col">Dose</th>
            <th scope="col">Strength</th>
            <th scope="col">Frequency</th>
            <th scope="col">Duration</th>
            <th scope="col">Date</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="drugs.length === 0">
            <td colspan="9" align="center" class="text-muted">No Data</td>
          </tr>
          <tr v-for="drug in drugs" :key="drug.id">
            <th>
              <span
                :title="`${drug.drug_type}`"
                v-b-tooltip.hover
                :class="getLabelDotStatus(drug.drug_type)"
                class="label label-dot label-lg mr-2"
              ></span>
              <a @click="viewPopover(drug)" href="#" :id="popOverId"> {{ drug.drug.name }}</a>
              <span class="ml-2">
                <label
                  v-if="drug?.drug_group"
                  class="label label-sm label-inline label-secondary"
                  >{{ drug?.drug_group }}</label
                >
              </span>
            </th>
            <td>
              <span>{{ drug.quantity_to_dispense }} {{ drug?.dosage_form?.name || '-' }}</span>
            </td>
            <td>
              <span>{{ drug.prescribed_strength }}{{ drug?.strength?.name || '-' }}</span>
            </td>
            <td>
              <span>{{ drug.frequency }}</span>
            </td>
            <td>
              <span>{{ drug.duration }} {{ drug.duration_unit }}</span>
            </td>
            <td>
              <span>{{ drug.date_prescribed | dayjs('DD/MM/YYYY, h:mma') }}</span>
            </td>
            <td>
              <span
                v-if="allowedRoles.includes(currentUser.role) || currentUser.sub === drug.examiner"
              >
                <a
                  href="#"
                  :class="loading && 'disabled'"
                  @click="showDeleteAlert(drug)"
                  v-if="drug.billing_status === UNBILLED && drug.payment_status === PENDING"
                >
                  <i class="flaticon-delete mr-2 text-danger"></i>
                </a>
                <!--                <a-->
                <!--                  href="#"-->
                <!--                  v-if="drug.billing_status === UNBILLED && drug.payment_status === PENDING"-->
                <!--                >-->
                <!--                  <i class="flaticon-edit-1 text-success"></i>-->
                <!--                </a>-->
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <drug-popover
      :drug="item"
      :target="popOverId"
      :show="showPopover"
      @closePopover="hidePopover"
    />
  </div>
</template>
<script>
import DrugPopover from '@/view/components/popover/DrugPopover.vue';
import { parseJwt } from '@/core/plugins/parseJwt';
import Swal from 'sweetalert2';
import { getLabelDotStatus } from '@/common/common';

export default {
  name: 'MedicationsTable',
  components: { DrugPopover },
  data: () => ({
    item: {},
    showPopover: false,
    loading: false,
    popOverId: 'popover-reactive-1',
    currentUser: parseJwt(localStorage.getItem('user_token')),
    allowedRoles: ['General Practitioner', 'Super Admin'],
    PENDING: 'Pending',
    UNBILLED: 'Unbilled',
  }),
  props: {
    drugs: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
  methods: {
    getLabelDotStatus,
    viewPopover(item) {
      this.item = item;
      this.showPopover = true;
    },

    hidePopover() {
      this.showPopover = false;
    },

    showDeleteAlert(drug) {
      const self = this;
      Swal.fire({
        title: 'Are you sure?',
        text: 'You want to delete this drug',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Delete!',
        customClass: {
          confirmButton: 'btn btn-danger',
          cancelButton: 'btn btn-default',
        },
      }).then(function(result) {
        if (result.value) {
          self.deletePrescribedDrug(drug);
        }
      });
    },

    endRequest() {
      this.loading = false;
      this.$store.dispatch('order/fetchPrescribedDrugs', {
        fetchWithItems: true,
        filter: { visit_id: this.$route.params.id },
      });
    },

    deletePrescribedDrug(drug) {
      this.loading = true;
      this.$store
        .dispatch('order/deletePrescribedDrug', { drugId: drug.id })
        .then(() => this.endRequest())
        .catch(() => (this.loading = false));
    },
  },
};
</script>

<style scoped></style>
