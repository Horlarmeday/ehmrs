<template>
  <div>
    <div v-if="loading">
      <PatientProfileSkeleton />
    </div>
    <div v-else class="row">
      <div class="col-5">
        <b-list-group>
          <b-list-group-item href="#" variant="dark">Personal Information</b-list-group-item>
          <b-list-group-item class="d-flex justify-content-between align-items-center opacity-75">
            Patient Name
            <div class="font-weight-boldest text-dark">{{ patient.fullname }}</div>
          </b-list-group-item>

          <b-list-group-item class="d-flex justify-content-between align-items-center opacity-75">
            Patient ID
            <div class="font-weight-boldest text-dark">{{ patient.hospital_id }}</div>
          </b-list-group-item>

          <b-list-group-item class="d-flex justify-content-between align-items-center opacity-75">
            Religion
            <div class="font-weight-boldest text-dark">{{ patient.religion || '-' }}</div>
          </b-list-group-item>
          <b-list-group-item class="d-flex justify-content-between align-items-center opacity-75">
            Gender
            <div class="font-weight-boldest text-dark">{{ patient.gender || '-' }}</div>
          </b-list-group-item>
          <b-list-group-item class="d-flex justify-content-between align-items-center opacity-75">
            Marital Status
            <div class="font-weight-boldest text-dark">{{ patient.marital_status }}</div>
          </b-list-group-item>
          <b-list-group-item class="d-flex justify-content-between align-items-center opacity-75">
            Date of Birth
            <div class="font-weight-boldest text-dark">
              {{ patient.date_of_birth | dayjs('DD/MM/YYYY') }}
            </div>
          </b-list-group-item>
          <b-list-group-item class="d-flex justify-content-between align-items-center opacity-75">
            Occupation
            <div class="font-weight-boldest text-dark">{{ patient.occupation || '-' }}</div>
          </b-list-group-item>
          <b-list-group-item
            v-if="patient.patient_type === 'Dependant'"
            class="d-flex justify-content-between align-items-center opacity-75"
          >
            Relationship to Principal
            <div class="font-weight-boldest text-dark">
              {{ patient.relationship_to_principal || '-' }}
            </div>
          </b-list-group-item>
        </b-list-group>
      </div>
      <div class="col-5">
        <b-list-group>
          <b-list-group-item href="#" variant="dark">Contact Information</b-list-group-item>
          <b-list-group-item class="d-flex justify-content-between align-items-center opacity-75">
            Email
            <div class="font-weight-boldest text-dark">{{ patient.email || '-' }}</div>
          </b-list-group-item>

          <b-list-group-item class="d-flex justify-content-between align-items-center opacity-75">
            Phone Number
            <div class="font-weight-boldest text-dark">{{ patient.phone || '-' }}</div>
          </b-list-group-item>

          <b-list-group-item class="d-flex justify-content-between align-items-center opacity-75">
            Address
            <div class="font-weight-boldest text-dark">{{ patient.address }}</div>
          </b-list-group-item>
          <b-list-group-item class="d-flex justify-content-between align-items-center opacity-75">
            Country
            <div class="font-weight-boldest text-dark">{{ patient.country }}</div>
          </b-list-group-item>
          <b-list-group-item class="d-flex justify-content-between align-items-center opacity-75">
            State
            <div class="font-weight-boldest text-dark">{{ patient.state }}</div>
          </b-list-group-item>
          <b-list-group-item class="d-flex justify-content-between align-items-center opacity-75">
            Local Government
            <div class="font-weight-boldest text-dark">{{ patient.lga }}</div>
          </b-list-group-item>
          <b-list-group-item class="d-flex justify-content-between align-items-center opacity-75">
            Additional Phone Number
            <div class="font-weight-boldest text-dark">{{ patient.alt_phone || '-' }}</div>
          </b-list-group-item>
          <b-list-group-item class="d-flex justify-content-between align-items-center opacity-75">
            Date Created
            <div class="font-weight-boldest text-dark">
              {{ patient.createdAt | dayjs('DD/MM/YYYY, h:mma') }}
            </div>
          </b-list-group-item>
        </b-list-group>
      </div>

      <div class="col-2">
        <div class="symbol symbol-150 mr-3">
          <img
            v-if="!imageError"
            alt="Pic"
            :src="imageUrl()"
            @load="handleImageLoad"
            @error="handleImageError"
          />
          <span v-else class="symbol-label font-size-h1">
            {{ patient?.firstname?.charAt(0)?.toUpperCase() }}
            {{ patient?.lastname?.charAt(0)?.toUpperCase() }}
          </span>
        </div>
      </div>
      <div v-if="patient.next_of_kin_name" class="col-5 pt-3">
        <b-list-group>
          <b-list-group-item href="#" variant="dark">Next of Kin Information</b-list-group-item>
          <b-list-group-item class="d-flex justify-content-between align-items-center opacity-75">
            Next of Kin Name
            <div class="font-weight-boldest text-dark">{{ patient.next_of_kin_name || '-' }}</div>
          </b-list-group-item>

          <b-list-group-item class="d-flex justify-content-between align-items-center opacity-75">
            Next of Kin Address
            <div class="font-weight-boldest text-dark">
              {{ patient.next_of_kin_address || '-' }}
            </div>
          </b-list-group-item>

          <b-list-group-item class="d-flex justify-content-between align-items-center opacity-75">
            Next of Kin Phone
            <div class="font-weight-boldest text-dark">{{ patient.next_of_kin_phone || '-' }}</div>
          </b-list-group-item>
          <b-list-group-item class="d-flex justify-content-between align-items-center opacity-75">
            Relationship to Next of Kin
            <div class="font-weight-boldest text-dark">{{ patient.relationship || '-' }}</div>
          </b-list-group-item>
        </b-list-group>
      </div>
      <div v-if="patient.has_insurance" class="col-5 pt-3">
        <b-list-group>
          <b-list-group-item href="#" variant="dark"
            >Health Insurance Information</b-list-group-item
          >
          <b-list-group-item class="d-flex justify-content-between align-items-center opacity-75">
            Insurance Name
            <div class="font-weight-boldest text-dark">
              {{ patient?.insurance?.insurance?.name }}
            </div>
          </b-list-group-item>

          <b-list-group-item class="d-flex justify-content-between align-items-center opacity-75">
            HMO
            <div class="font-weight-boldest text-dark">{{ patient?.insurance?.hmo?.name }}</div>
          </b-list-group-item>

          <b-list-group-item class="d-flex justify-content-between align-items-center opacity-75">
            Policy Number
            <div class="font-weight-boldest text-dark">
              {{ patient?.insurance?.enrollee_code || '-' }}
            </div>
          </b-list-group-item>
          <b-list-group-item class="d-flex justify-content-between align-items-center opacity-75">
            Organization
            <div class="font-weight-boldest text-dark">
              {{ patient?.insurance?.organization || '-' }}
            </div>
          </b-list-group-item>
          <b-list-group-item class="d-flex justify-content-between align-items-center opacity-75">
            Plan
            <div class="font-weight-boldest text-dark">{{ patient?.insurance?.plan || '-' }}</div>
          </b-list-group-item>
        </b-list-group>
      </div>
    </div>
  </div>
</template>
<script>
import PatientProfileSkeleton from '@/view/pages/patient/page/skeleton/PatientProfileSkeleton.vue';

export default {
  components: { PatientProfileSkeleton },
  data: () => ({
    count: 0,
    imageError: false,
  }),

  props: {
    patient: {
      type: Object,
      required: true,
      default: () => {},
    },
    loading: {
      type: Boolean,
    },
  },

  methods: {
    imageUrl() {
      return `${window.location.origin}/static/images/${this.patient.photo}`;
    },
    handleImageLoad() {
      this.imageError = false;
    },
    handleImageError() {
      this.imageError = true;
    },
  },
};
</script>
<style scoped>
.symbol.symbol-150 > img {
  max-width: 250px;
}
</style>
