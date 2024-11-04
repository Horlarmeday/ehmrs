<template>
  <div>
    <table class="table">
      <thead>
        <tr>
          <th scope="col">Ward</th>
          <th scope="col">Bed</th>
          <th scope="col">Status</th>
          <th scope="col">Should Discharge</th>
          <th scope="col">Admitted By</th>
          <th scope="col">Date</th>
          <th scope="col"></th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row">{{ admission.ward?.name }}</th>
          <td>{{ admission.bed?.code }}</td>
          <td>
            <span class="label label-inline label-light-danger font-weight-bold">
              {{ admission.discharge_status }}
            </span>
          </td>
          <td>
            <span style="width: 108px;">
              <span
                :class="getDischargeStatus(admission.should_discharge)"
                class="label label-dot mr-2"
              ></span>
              <span
                :class="getDischargeTextStatus(admission.should_discharge)"
                class="font-weight-bold"
                >{{ admission.should_discharge ? 'Yes' : 'No' }}</span
              >
            </span>
          </td>
          <td>
            <a href="#"
              >{{ admission?.examiner?.firstname }} {{ admission?.examiner?.lastname.charAt(0) }}</a
            >
          </td>
          <td>{{ admission.createdAt | dayjs('ddd, MMM Do YYYY, h:mma') }}</td>
          <td>
            <a
              v-if="doctorAllowedTabs.includes(currentUser.role) && !admission.should_discharge"
              @click="showDischargeAlert(admission.id)"
              v-b-tooltip.hover
              title="Discharge patient"
              href="#"
              ><i class="flaticon-logout mr-4 text-danger"></i
            ></a>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import Swal from 'sweetalert2';
import { parseJwt } from '@/core/plugins/parseJwt';

export default {
  props: {
    admission: {
      type: Object,
      required: true,
      default: () => {},
    },
  },
  data: () => ({
    currentUser: parseJwt(localStorage.getItem('user_token')),
    doctorAllowedTabs: ['Super Admin', 'General Practitioner'],
  }),
  methods: {
    handleSuccess() {
      Swal.fire({
        title: 'Success!',
        html: 'Patient up for discharge!',
        icon: 'success',
        confirmButtonClass: 'btn btn-primary',
        heightAuto: false,
      });
      this.$store.dispatch('admission/fetchAdmission', { visitId: this.$route.params.id });
    },

    dischargePatient(admissionId) {
      this.$store
        .dispatch('admission/recommendForDischarge', { should_discharge: true, admissionId })
        .then(() => this.handleSuccess());
    },

    showDischargeAlert(admissionId) {
      const self = this;
      Swal.fire({
        title: 'Are you sure?',
        text:
          'Note that this action will not discharge the patient, but only place the patient up for it. The rest is up to the nurses',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Discharge!',
      }).then(function(result) {
        if (result.value) {
          self.dischargePatient(admissionId);
        }
      });
    },

    getDischargeStatus(status) {
      if (status) return 'label-success';
      return 'label-primary';
    },

    getDischargeTextStatus(status) {
      if (status) return 'text-success';
      return 'text-primary';
    },
  },
};
</script>

<style scoped></style>
