<template>
  <div>
    <b-modal v-model="showModal" title="Session Timeout Notification" hide-footer centered>
      <p class="my-2">Your session is about to expire.</p>
      <p class="my-2">Redirecting in {{ remainingSeconds }} seconds.</p>

      <b-progress :value="remainingSeconds" :max="warningDuration" animated></b-progress>

      <div class="d-flex justify-content-between mt-3">
        <b-button variant="danger" @click="logout">Logout</b-button>
        <b-button variant="primary" @click="stayConnected">Stay Connected</b-button>
      </div>
    </b-modal>
  </div>
</template>

<script>
export default {
  name: 'LoginTimeout',
  data() {
    return {
      inactivityTimeout: null,
      warningTimeout: null,
      timeoutDuration: 900000, // 15 minutes in milliseconds
      warningDuration: 60, // Show warning 60 seconds before timeout
      showModal: false,
      remainingSeconds: 0,
    };
  },
  methods: {
    resetTimer() {
      if (this.inactivityTimeout) {
        clearTimeout(this.inactivityTimeout);
      }
      if (this.warningTimeout) {
        clearTimeout(this.warningTimeout);
      }
      this.showModal = false;
      this.inactivityTimeout = setTimeout(
        this.showWarning,
        this.timeoutDuration - this.warningDuration * 1000
      );
    },
    showWarning() {
      this.showModal = true;
      this.remainingSeconds = this.warningDuration;
      this.warningTimeout = setInterval(() => {
        this.remainingSeconds--;
        if (this.remainingSeconds <= 0) {
          this.logout();
        }
      }, 1000);
    },
    logout() {
      clearInterval(this.warningTimeout);
      this.showModal = false;
      this.$store.dispatch('auth/logout').then(() => this.$router.push('/auth/login'));
    },
    stayConnected() {
      this.resetTimer();
    },
    setupActivityListeners() {
      ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(eventName => {
        document.addEventListener(eventName, this.resetTimer, true);
      });
    },
    removeActivityListeners() {
      ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(eventName => {
        document.removeEventListener(eventName, this.resetTimer, true);
      });
    },
  },
  created() {
    this.resetTimer();
    this.setupActivityListeners();
  },
  beforeDestroy() {
    if (this.inactivityTimeout) {
      clearTimeout(this.inactivityTimeout);
    }
    if (this.warningTimeout) {
      clearInterval(this.warningTimeout);
    }
    this.removeActivityListeners();
  },
};
</script>
