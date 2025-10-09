<template>
  <button
    class="btn font-weight-bold"
    :class="buttonClass"
    @click="handleEndVisit"
    :disabled="!visitId"
  >
    <i class="fas fa-times-circle"></i>
    End Visit
  </button>
</template>

<script>
import Swal from 'sweetalert2';
import { mapActions } from 'vuex';

export default {
  props: {
    visitId: {
      type: Number,
      required: true,
    },
    buttonClass: {
      type: String,
      required: true,
    },
  },
  methods: {
    ...mapActions('visit', ['endVisit']),
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
          await this.endVisit(this.visitId);

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
};
</script>
<style scoped></style>
