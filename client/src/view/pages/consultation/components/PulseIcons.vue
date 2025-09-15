<template>
  <div>
    <admission-history-modal
      @closeModal="hideAdmissionModal"
      :display-prompt="displayPrompt"
      :visit="visit"
    />

    <alerts-modal :display-prompt="displayAlertPrompt" @closeModal="hideAlertModal" />

    <span v-for="(icon, i) in icons" :key="i">
      <a
        v-b-tooltip.hover
        :title="icon.title"
        href="#"
        :class="`btn-light-${icon.iconColor} pulse-${icon.iconColor}`"
        class="btn btn-icon pulse mr-2"
        v-if="icon.showIcon"
        @click="icon.title === ADMISSION_DETAILS ? showAdmissionDetails() : showAlerts()"
      >
        <i :class="icon.icon"></i>
        <span class="pulse-ring"></span>
      </a>
    </span>
    <span>
      <button class="btn btn-danger btn-sm" @click="handleEndVisit" :disabled="!visit || !visit.id">
        <i class="fas fa-times-circle"></i>
        End Visit
      </button>
    </span>
  </div>
</template>
<script>
import AdmissionHistoryModal from '@/view/pages/consultation/components/disposition/admission/AdmissionHistoryModal.vue';
import AlertsModal from '@/view/pages/consultation/components/alerts/AlertsModal.vue';
import { mapActions } from 'vuex';
import Swal from 'sweetalert2';

export default {
  components: { AlertsModal, AdmissionHistoryModal },
  data: () => ({
    displayPrompt: false,
    ADMISSION_DETAILS: 'Admission Details',
    icons: [
      // {
      //   title: 'General Information',
      //   url: '',
      //   icon: 'flaticon2-information',
      //   iconColor: 'primary',
      // },
      {
        title: 'Admission Details',
        url: '',
        icon: 'fas fa-bed',
        iconColor: 'warning',
        showIcon: false,
      },
      {
        title: 'Alerts',
        url: '',
        icon: 'fas fa-exclamation-triangle',
        iconColor: 'danger',
        showIcon: true,
      },
      // {
      //   title: 'Vitals',
      //   url: '',
      //   icon: 'fas fa-stethoscope',
      //   iconColor: 'info',
      // },
    ],
    INPATIENT: 'Inpatient',
    displayAlertPrompt: false,
  }),

  computed: {
    visit() {
      return this.$store.state.visit.visit || {};
    },
  },

  methods: {
    ...mapActions('visit', ['endVisit']),
    showAdmissionDetails() {
      this.displayPrompt = true;
    },

    hideAdmissionModal() {
      this.displayPrompt = false;
    },

    showAlerts() {
      this.displayAlertPrompt = true;
    },

    hideAlertModal() {
      this.displayAlertPrompt = false;
    },

    async handleEndVisit() {
      try {
        const result = await Swal.fire({
          title: 'End Visit?',
          text: 'Are you sure you want to end this visit? This action cannot be undone.',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: 'Yes, End Visit',
          cancelButtonText: 'Cancel',
        });

        if (result.isConfirmed) {
          await this.endVisit(this.visit.id);

          Swal.fire({
            title: 'Visit Ended!',
            text: 'The visit has been successfully ended.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
          });

          // Redirect to dashboard
          this.$router.push('/');
        }
      } catch (error) {
        console.error('Error ending visit:', error);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to end visit. Please try again.',
          icon: 'error',
          confirmButtonText: 'OK',
        });
      }
    },
  },

  watch: {
    visit: {
      handler(value) {
        this.icons.filter((icon) => {
          if (icon.title === this.ADMISSION_DETAILS && value.category === this.INPATIENT) {
            icon.showIcon = true;
            return icon;
          }
        });
      },
    },
  },
};
</script>
