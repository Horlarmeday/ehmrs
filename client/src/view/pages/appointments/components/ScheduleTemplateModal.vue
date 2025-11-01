<template>
  <b-modal :visible="show" title="Schedule Template" @hide="$emit('close')" hide-footer>
    <div class="mb-3">
      <p class="text-muted mb-0">
        Define weekly working hours for {{ doctor?.fullname || 'Doctor' }}
      </p>
    </div>

    <b-form @submit.prevent="onSave">
      <div class="table-responsive">
        <table class="table table-sm mb-4">
          <thead>
            <tr>
              <th>Day</th>
              <th class="text-center">Working</th>
              <th>Start</th>
              <th>End</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="day in form.days" :key="day.name">
              <td class="align-middle">{{ day.name }}</td>
              <td class="text-center align-middle">
                <b-form-checkbox v-model="day.enabled" switch></b-form-checkbox>
              </td>
              <td>
                <b-form-timepicker
                  v-model="day.start_time"
                  :disabled="!day.enabled"
                  minute-step="5"
                  reset-button
                ></b-form-timepicker>
              </td>
              <td>
                <b-form-timepicker
                  v-model="day.end_time"
                  :disabled="!day.enabled"
                  minute-step="5"
                  reset-button
                ></b-form-timepicker>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="d-flex justify-content-between">
        <div>
          <b-button variant="secondary" @click="$emit('close')" :disabled="submitting"
            >Close</b-button
          >
        </div>
        <div class="btn-group">
          <b-button variant="outline-primary" @click="onApply" :disabled="submitting || !doctor"
            >Apply Template</b-button
          >
          <b-button variant="primary" type="submit" :disabled="submitting || !doctor">
            <span v-if="submitting" class="spinner-border spinner-border-sm mr-2" />
            Save Template
          </b-button>
        </div>
      </div>
    </b-form>
  </b-modal>
</template>

<script>
import { mapState } from 'vuex';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default {
  name: 'ScheduleTemplateModal',
  props: {
    show: { type: Boolean, default: false },
    doctor: { type: Object, default: null },
  },
  data() {
    return {
      submitting: false,
      form: {
        days: DAYS.map((name) => ({
          name,
          enabled: !['Saturday', 'Sunday'].includes(name),
          start_time: '08:00',
          end_time: '18:00',
        })),
      },
    };
  },
  computed: {
    ...mapState('appointments', ['error', 'validationErrors']),
  },
  methods: {
    validate() {
      for (const d of this.form.days) {
        if (!d.enabled) continue;
        if (!d.start_time || !d.end_time) return false;
        if (d.start_time >= d.end_time) return false;
      }
      return !!this.doctor?.id;
    },
    async onSave() {
      if (!this.validate()) return;
      this.submitting = true;
      try {
        const payload = {
          doctor_id: this.doctor.id,
          template: this.form.days.map((d) => ({
            day: d.name,
            enabled: d.enabled,
            start_time: d.start_time,
            end_time: d.end_time,
          })),
        };
        await this.$store.dispatch('appointments/createScheduleTemplate', payload);
        this.$bvToast.toast('Schedule template saved', {
          title: 'Success',
          variant: 'success',
          solid: true,
        });
        this.$emit('saved');
      } catch (e) {
        this.$bvToast.toast(this.error || 'Failed to save template', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      } finally {
        this.submitting = false;
      }
    },
    async onApply() {
      if (!this.validate()) return;
      this.submitting = true;
      try {
        const payload = {
          doctor_id: this.doctor.id,
          template: this.form.days.map((d) => ({
            day: d.name,
            enabled: d.enabled,
            start_time: d.start_time,
            end_time: d.end_time,
          })),
        };
        await this.$store.dispatch('appointments/applyScheduleTemplate', payload);
        this.$bvToast.toast('Schedule template applied', {
          title: 'Success',
          variant: 'success',
          solid: true,
        });
        this.$emit('saved');
      } catch (e) {
        this.$bvToast.toast(this.error || 'Failed to apply template', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      } finally {
        this.submitting = false;
      }
    },
  },
};
</script>

<style scoped>
.table-responsive {
  max-height: 60vh;
}
</style>
