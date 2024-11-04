<template>
  <div class="card card-custom gutter-b">
    <div class="card-header py-5">
      <h3 class="card-title align-items-start flex-column">
        <span class="card-label font-weight-bolder text-dark">Discharge Recommended Patients</span>
      </h3>
    </div>

    <div class="card-body">
      <div class="table-responsive">
        <table class="table table-head-custom table-head-bg table-vertical-center">
          <thead>
            <tr class="text-uppercase">
              <th style="min-width: 150px" class="pl-7">
                <span class="text-dark-75">Patient ID</span>
              </th>
              <th style="min-width: 250px">Patient Name</th>
              <th style="min-width: 150px">Ward</th>
              <th style="min-width: 150px">Date</th>
              <th class="text-right pr-0" style="min-width: 130px">Action</th>
              <th style="min-width: 10px"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="admissions.length === 0">
              <td colspan="9" align="center" class="text-muted">No Data</td>
            </tr>
            <tr v-for="admission in admissions" :key="admission.id">
              <td class="pl-7 py-8">
                <div class="d-flex align-items-center">
                  <div>
                    <router-link
                      :to="`/patient/profile/${admission.patient_id}`"
                      class="text-dark-75 font-weight-bolder text-hover-primary mb-1 font-size-lg"
                      >{{ admission.patient.hospital_id }}</router-link
                    >
                  </div>
                </div>
              </td>
              <td>
                <router-link
                  :to="`/patient/profile/${admission.patient_id}`"
                  class="text-dark-75 font-weight-bolder d-block font-size-lg"
                >
                  {{ admission?.patient?.fullname }}
                </router-link>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                  {{ admission.ward.name }}
                </span>
              </td>
              <td>
                <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                  {{ admission.date_admitted | dayjs('ddd, MMM Do YYYY, h:mma') }}
                </span>
              </td>
              <td class="text-right pr-0">
                <router-link
                  :to="`/admission/discharge/${admission.id}`"
                  class="btn btn-icon btn-light btn-hover-primary btn-sm"
                >
                  <ArrowRightIcon />
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
<script>
import ArrowRightIcon from '@/assets/icons/ArrowRightIcon.vue';

export default {
  components: { ArrowRightIcon },
  computed: {
    admissions() {
      return (
        this.$store.state.admission.recommendedDischarges ||
        JSON.parse(localStorage.getItem('recommendedDischarges'))
      );
    },
  },
};
</script>

<style scoped></style>
