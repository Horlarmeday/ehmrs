<template>
  <div class="heritage-login-container">
    <!-- Background Pattern -->
    <div class="background-pattern"></div>

    <!-- Main Login Container -->
    <div class="login-wrapper">
      <!-- Left Side - Brand Section -->
      <div class="brand-section">
        <div class="brand-content">
          <!-- Heritage Logo -->
          <div class="logo-container">
            <img
              src="/media/logos/health-clone.png"
              alt="Health Clone Medical Center Karu"
              class="heritage-logo"
            />
          </div>

          <!-- Brand Text -->
          <div class="brand-text">
            <h1 class="brand-title">Health Clone</h1>
            <h2 class="brand-subtitle">Medical Center Karu</h2>
            <p class="brand-tagline">
              Providing exceptional healthcare with compassion and expertise
            </p>
          </div>

          <!-- Decorative Elements -->
          <div class="decorative-elements">
            <i class="fas fa-shield-alt medical-icon" aria-hidden="true"></i>
            <div class="trust-indicator">Trusted Healthcare Provider</div>
          </div>
        </div>
      </div>

      <!-- Right Side - Login Form -->
      <div class="login-section">
        <div class="login-card">
          <div class="login-content">
            <!-- Welcome Header -->
            <div class="welcome-header">
              <h2 class="welcome-title">Welcome Back</h2>
              <p class="welcome-subtitle">Sign in to access your medical dashboard</p>
            </div>

            <!-- Login Form -->
            <form class="login-form" @submit.prevent="onSubmitLogin">
              <!-- Username Field -->
              <div class="form-group">
                <label class="form-label">Username</label>
                <div class="input-wrapper">
                  <div class="input-icon">
                    <i class="fas fa-user"></i>
                  </div>
                  <input
                    v-validate="'required|min:3'"
                    data-vv-validate-on="blur"
                    class="form-input"
                    type="text"
                    autofocus="true"
                    autocomplete="off"
                    ref="username"
                    name="username"
                    v-model="form.username"
                    placeholder="Enter your username"
                  />
                </div>
                <span class="error-message" v-if="errors.has('username')">{{
                  errors.first('username')
                }}</span>
              </div>

              <!-- Password Field -->
              <div class="form-group">
                <label class="form-label">Password</label>
                <div class="input-wrapper">
                  <div class="input-icon">
                    <i class="fas fa-lock"></i>
                  </div>
                  <input
                    data-vv-validate-on="blur"
                    v-validate="'required|min:6'"
                    class="form-input"
                    :type="showPassword ? 'text' : 'password'"
                    name="password"
                    ref="password"
                    v-model="form.password"
                    autocomplete="off"
                    placeholder="Enter your password"
                  />
                  <div class="password-toggle" @click="togglePasswordVisibility">
                    <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                  </div>
                </div>
                <span class="error-message" v-if="errors.has('password')">{{
                  errors.first('password')
                }}</span>
              </div>

              <!-- Forgot Password Link -->
              <div class="forgot-password">
                <a class="forgot-link" href="#" @click="showForm('forgot')">
                  Forgot your password?
                </a>
              </div>

              <!-- Login Button -->
              <button
                ref="kt_login_signin_submit"
                @click="onSubmitLogin"
                :disabled="isDisabled"
                class="login-button"
                type="submit"
              >
                <span class="button-text">Sign In</span>
                <div class="button-icon">
                  <i class="fas fa-arrow-right"></i>
                </div>
              </button>
            </form>

            <!-- Additional Info -->
            <div class="additional-info">
              <p class="info-text">Need help? Contact our support team</p>
              <div class="contact-info">
                <span class="contact-item">
                  <i class="fas fa-phone"></i>
                  +234 XXX XXX XXXX
                </span>
                <span class="contact-item">
                  <i class="fas fa-envelope"></i>
                  support@healthclone.com
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Forgot Password Modal -->
    <div class="forgot-modal" v-if="state === 'forgot'">
      <div class="modal-overlay" @click="showForm('signin')"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">Reset Your Password</h3>
          <button class="modal-close" @click="showForm('signin')">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form class="forgot-form" @submit.prevent="onSubmitForgot">
          <div class="form-group">
            <label class="form-label">Phone Number</label>
            <div class="input-wrapper">
              <div class="input-icon">
                <i class="fas fa-phone"></i>
              </div>
              <input
                class="form-input"
                type="text"
                placeholder="Enter your phone number"
                name="phone"
                autocomplete="off"
                v-model="phone"
                autofocus
              />
            </div>
          </div>

          <div class="modal-actions">
            <button
              type="button"
              ref="kt_login_forgot_submit"
              class="btn-secondary"
              @click="onSubmitForgot"
            >
              <i class="fas fa-paper-plane"></i>
              Send Reset Link
            </button>
            <button type="button" class="btn-cancel" @click="showForm('signin')">Cancel</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Notifications -->
    <notifications group="foo" />
  </div>
</template>

<style lang="scss">
@import '@/assets/sass/pages/login/login-1.scss';

// Modern Login - Health-Clone teal theme
.heritage-login-container {
  min-height: 100vh;
  background: linear-gradient(160deg, #f0fafb 0%, #e8f4f5 50%, #f5f9fa 100%);
  position: relative;
  overflow: hidden;
  font-family: 'Poppins', sans-serif;
}

// Background Pattern - soft teal tint
.background-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: radial-gradient(circle at 20% 80%, rgba(0, 172, 193, 0.04) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(0, 151, 167, 0.04) 0%, transparent 50%),
    radial-gradient(circle at 50% 50%, rgba(224, 247, 250, 0.5) 0%, transparent 70%);
  z-index: 1;
}

// Main Login Wrapper - asymmetric split 45% / 55%
.login-wrapper {
  position: relative;
  z-index: 2;
  display: flex;
  min-height: 100vh;
  max-width: 1400px;
  margin: 0 auto;
  background: white;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);

  @media (max-width: 1024px) {
    flex-direction: column;
    max-width: 100%;
  }
}

// Brand Section (Left) - teal gradient
.brand-section {
  flex: 0 0 45%;
  background: linear-gradient(135deg, var(--heritage-maroon) 0%, var(--heritage-maroon-hover) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2.5rem 2rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="medical-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23medical-pattern)"/></svg>');
    opacity: 0.25;
  }

  @media (max-width: 1024px) {
    flex: none;
    min-height: 280px;
    padding: 2rem 1rem;
  }
}

.brand-content {
  text-align: center;
  color: white;
  position: relative;
  z-index: 2;
  max-width: 360px;
}

.logo-container {
  margin-bottom: 1.5rem;

  .heritage-logo {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid rgba(255, 255, 255, 0.35);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    transition: transform 0.25s ease, box-shadow 0.25s ease;
    background: white;
    padding: 6px;

    &:hover {
      transform: scale(1.04);
      box-shadow: 0 10px 32px rgba(0, 0, 0, 0.2);
    }
  }
}

.brand-text {
  margin-bottom: 1.5rem;

  .brand-title {
    font-size: 2.5rem;
    font-weight: 700;
    margin: 0 0 0.35rem 0;
    text-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
    letter-spacing: 1px;

    @media (max-width: 1024px) {
      font-size: 2rem;
    }
  }

  .brand-subtitle {
    font-size: 1.25rem;
    font-weight: 400;
    margin: 0 0 0.75rem 0;
    opacity: 0.95;
    letter-spacing: 0.5px;

    @media (max-width: 1024px) {
      font-size: 1.1rem;
    }
  }

  .brand-tagline {
    font-size: 0.9rem;
    opacity: 0.85;
    line-height: 1.5;
    margin: 0;
  }
}

.decorative-elements {
  .medical-icon {
    font-size: 2rem;
    margin-bottom: 0.75rem;
    opacity: 0.9;
    display: inline-block;
    transition: transform 0.25s ease;
  }

  .medical-icon:hover {
    transform: scale(1.08);
  }

  .trust-indicator {
    font-size: 0.85rem;
    opacity: 0.8;
    font-weight: 500;
    letter-spacing: 0.5px;
  }
}

// Login Section (Right Side) - form primary
.login-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 3rem;
  background: #fafbfc;

  @media (max-width: 1024px) {
    padding: 2rem 1rem;
  }
}

.login-card {
  width: 100%;
  max-width: 420px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06), 0 0 1px rgba(0, 0, 0, 0.04);
  padding: 2.25rem;
  animation: formEnter 0.4s ease-out;
}

@keyframes formEnter {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-content {
  width: 100%;
  max-width: 100%;
}

.welcome-header {
  text-align: center;
  margin-bottom: 2rem;

  .welcome-title {
    font-size: 2rem;
    font-weight: 700;
    color: var(--heritage-maroon);
    margin: 0 0 0.35rem 0;

    @media (max-width: 1024px) {
      font-size: 1.75rem;
    }
  }

  .welcome-subtitle {
    font-size: 1rem;
    color: #6c757d;
    margin: 0;
    line-height: 1.5;
  }
}

// Form Styles
.login-form {
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--heritage-maroon);
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 1rem;
  color: #6c757d;
  z-index: 2;
}

.password-toggle {
  position: absolute;
  right: 1rem;
  color: #6c757d;
  cursor: pointer;
  z-index: 2;
  padding: 0.5rem;
  border-radius: 50%;
  transition: color 0.2s ease, background 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: var(--heritage-maroon);
    background: rgba(0, 172, 193, 0.1);
  }

  i {
    font-size: 1rem;
  }
}

.form-input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 3rem;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  font-size: 1rem;
  transition: border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
  background: #f8f9fa;

  &[type='password'],
  &[type='text'] {
    padding-right: 3.5rem;
  }

  &:focus {
    outline: none;
    border-color: var(--heritage-maroon);
    background: white;
    box-shadow: 0 0 0 4px rgba(0, 172, 193, 0.15);
  }

  &::placeholder {
    color: #adb5bd;
  }
}

.error-message {
  display: block;
  color: #dc3545;
  font-size: 0.8rem;
  margin-top: 0.5rem;
}

.forgot-password {
  text-align: right;
  margin-bottom: 2rem;

  .forgot-link {
    color: var(--heritage-maroon);
    text-decoration: none;
    font-size: 0.9rem;
    font-weight: 500;
    transition: color 0.3s ease;

    &:hover {
      color: var(--heritage-maroon-hover);
      text-decoration: underline;
    }
  }
}

// Login Button
.login-button {
  width: 100%;
  min-height: 48px;
  padding: 0.875rem 2rem;
  background: linear-gradient(135deg, var(--heritage-maroon) 0%, var(--heritage-maroon-hover) 100%);
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 1.05rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  position: relative;
  overflow: hidden;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 172, 193, 0.35);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    background: #6c757d;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  .button-text {
    z-index: 2;
  }

  .button-icon {
    z-index: 2;
    transition: transform 0.2s ease;
  }

  &:hover:not(:disabled) .button-icon {
    transform: translateX(4px);
  }
}

// Additional Info
.additional-info {
  text-align: center;
  padding-top: 2rem;
  border-top: 1px solid #e9ecef;

  .info-text {
    color: #6c757d;
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }

  .contact-info {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    .contact-item {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      color: var(--heritage-maroon);
      font-size: 0.8rem;
      font-weight: 500;

      i {
        opacity: 0.7;
      }
    }
  }
}

// Forgot Password Modal
.forgot-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  width: 100%;
  max-width: 400px;
  position: relative;
  z-index: 1001;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  animation: modalSlideIn 0.3s ease-out;
  transition: box-shadow 0.2s ease;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;

  .modal-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--heritage-maroon);
    margin: 0;
  }

  .modal-close {
    background: none;
    border: none;
    font-size: 1.2rem;
    color: #6c757d;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 50%;
    transition: background 0.2s ease, color 0.2s ease;

    &:hover {
      background: var(--heritage-maroon-light);
      color: var(--heritage-maroon);
    }
  }
}

.forgot-form {
  .form-input {
    transition: border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
  }

  .modal-actions {
    display: flex;
    gap: 1rem;
    margin-top: 2rem;

    .btn-secondary {
      flex: 1;
      padding: 0.75rem 1.5rem;
      background: linear-gradient(
        135deg,
        var(--heritage-maroon) 0%,
        var(--heritage-maroon-hover) 100%
      );
      border: none;
      border-radius: 10px;
      color: white;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;

      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 20px rgba(0, 172, 193, 0.35);
      }
    }

    .btn-cancel {
      padding: 0.75rem 1.5rem;
      background: #6c757d;
      border: none;
      border-radius: 10px;
      color: white;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s ease, transform 0.2s ease;

      &:hover {
        background: #5a6268;
        transform: translateY(-1px);
      }
    }
  }
}

// Responsive Design
@media (max-width: 768px) {
  .login-wrapper {
    box-shadow: none;
  }

  .brand-section {
    min-height: 240px;
  }

  .login-card {
    padding: 1.75rem 1.25rem;
  }

  .brand-title {
    font-size: 2rem !important;
  }

  .brand-subtitle {
    font-size: 1rem !important;
  }

  .welcome-title {
    font-size: 1.75rem !important;
  }

  .modal-content {
    margin: 1rem;
    padding: 1.5rem;
  }

  .modal-actions {
    flex-direction: column;

    .btn-secondary,
    .btn-cancel {
      width: 100%;
    }
  }
}

// Loading States
.login-button:disabled {
  .button-text {
    opacity: 0.7;
  }

  .button-icon {
    animation: spin 1s linear infinite;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

// Focus States for Accessibility (teal ring)
.form-input:focus,
.login-button:focus,
.modal-close:focus,
.btn-secondary:focus,
.btn-cancel:focus,
.forgot-link:focus {
  outline: 2px solid var(--heritage-maroon);
  outline-offset: 2px;
}

.form-input:hover {
  border-color: #dee2e6;
  background: #fff;
}

// Typography
.brand-title,
.welcome-title {
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
  letter-spacing: 1px;
}

.brand-subtitle,
.welcome-subtitle {
  font-family: 'Poppins', sans-serif;
  font-weight: 400;
  line-height: 1.6;
}

.form-label,
.form-input,
.login-button {
  font-family: 'Poppins', sans-serif;
}
</style>

<script>
export default {
  name: 'login-1',
  data() {
    return {
      state: 'signin',
      form: {
        username: '',
        password: '',
      },
      phone: '',
      isDisabled: false,
      imageError: false,
      loading: false,
      showPassword: false,
    };
  },
  created() {
    this.fetchSettings();
  },
  computed: {
    isFormValid() {
      return !this.errors.any() && this.username && this.password;
    },

    backgroundImage() {
      return process.env.BASE_URL + 'media/users/health.png';
    },

    settings() {
      const settings = localStorage.getItem('settings');
      const parsedSettings = settings ? JSON.parse(settings) : null;
      return parsedSettings || this.$store.state.settings.settings;
    },
  },
  methods: {
    showForm(form) {
      this.state = form;
      if (form === 'signin') {
        // Add smooth transition back to signin
        document.querySelector('.login-content').style.opacity = '0';
        setTimeout(() => {
          document.querySelector('.login-content').style.opacity = '1';
        }, 150);
      }
    },

    removeSpinner(submitButton) {
      this.isDisabled = false;
      submitButton.classList.remove('spinner', 'spinner-light', 'spinner-right');
    },

    initialValues() {
      this.form = {};
    },

    onSubmitLogin() {
      this.$validator.validateAll().then((result) => {
        if (result) {
          let username = this.form.username;
          let password = this.form.password;

          // set spinner to submit button
          const submitButton = this.$refs['kt_login_signin_submit'];
          this.isDisabled = true;
          submitButton.classList.add('spinner', 'spinner-light', 'spinner-right');

          this.$store
            .dispatch('auth/login', { username, password })
            .then(() => {
              this.initialValues();
              this.$router.push('/dashboard');
              this.removeSpinner(submitButton);
            })
            .catch(() => this.removeSpinner(submitButton));
        }
      });
    },

    onSubmitForgot() {
      this.fv1.validate();

      this.fv1.on('core.form.valid', () => {
        const phone = this.phone;

        // set spinner to submit button
        const submitButton = this.$refs['kt_login_forgot_submit'];
        submitButton.classList.add('spinner', 'spinner-light', 'spinner-right');

        this.$store
          .dispatch('auth/forgot', { phone })
          .then(() => this.removeSpinner(submitButton))
          .catch(() => this.removeSpinner(submitButton));
      });
    },

    fetchSettings() {
      this.loading = true;
      this.$store
        .dispatch('settings/fetchSettings')
        .then((response) => {
          localStorage.setItem('settings', JSON.stringify(response.data.data));
          this.loading = false;
        })
        .catch((e) => {
          this.loading = false;
          console.error(e);
        });
    },

    imageUrl() {
      return `${window.location.origin}/static/images/${this.settings?.organization_logo}`;
    },

    handleImageLoad() {
      this.imageError = false;
    },

    handleImageError() {
      this.imageError = true;
    },

    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    },
  },
};
</script>
