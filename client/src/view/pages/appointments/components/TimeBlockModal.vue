<template>
  <b-modal :visible="show" title="Block Time" @hide="$emit('close')" hide-footer>
    <b-form @submit.prevent="onSave">
      <div class="form-group">
        <label class="font-weight-bold">Date</label>
        <b-form-input type="date" v-model="form.date" required />
      </div>
      <div class="form-row">
        <div class="form-group col">
          <label class="font-weight-bold">Start Time</label>
          <b-form-timepicker v-model="form.start_time" minute-step="5" required />
        </div>
        <div class="form-group col">
          <label class="font-weight-bold">End Time</label>
          <b-form-timepicker v-model="form.end_time" minute-step="5" required />
        </div>
      </div>
      <div class="form-group">
        <label class="font-weight-bold">Reason</label>
        <b-form-input v-model="form.reason" placeholder="Reason for blocking" />
      </div>
      <div class="form-group">
        <label class="font-weight-bold">Recurrence</label>
        <b-form-select v-model="form.recurrence" :options="recurrenceOptions" />
      </div>

      <div class="d-flex justify-content-between">
        <b-button variant="secondary" @click="$emit('close')" :disabled="submitting"
          >Close</b-button
        >
        <b-button variant="primary" type="submit" :disabled="submitting || !isValid">
          <span v-if="submitting" class="spinner-border spinner-border-sm mr-2" />
          Save Block
        </b-button>
      </div>
    </b-form>
  </b-modal>
</template>

<script>
import dayjs from 'dayjs';

export default {
  name: 'TimeBlockModal',
  props: {
    show: { type: Boolean, default: false },
    doctor: { type: Object, default: null },
    selectedDate: { type: String, default: '' },
    selectedHour: { type: Number, default: null },
  },
  data() {
    const pad = (n) => `${n}`.padStart(2, '0');
    const startHour = this.selectedHour != null ? pad(this.selectedHour) : '08';
    const endHour = this.selectedHour != null ? pad(Math.min(this.selectedHour + 1, 23)) : '09';
    return {
      submitting: false,
      recurrenceOptions: [
        { value: 'NONE', text: 'None' },
        { value: 'WEEKLY', text: 'Weekly (same weekday)' },
      ],
      form: {
        date: this.selectedDate || dayjs().format('YYYY-MM-DD'),
        start_time: `${startHour}:00`,
        end_time: `${endHour}:00`,
        reason: '',
        recurrence: 'NONE',
      },
    };
  },
  computed: {
    isValid() {
      const { date, start_time, end_time } = this.form;
      return !!this.doctor?.id && !!date && !!start_time && !!end_time && start_time < end_time;
    },
  },
  methods: {
    async onSave() {
      if (!this.isValid) return;
      this.submitting = true;
      try {
        const payload = {
          doctor_id: this.doctor.id,
          date: this.form.date,
          start_time: this.form.start_time,
          end_time: this.form.end_time,
          reason: this.form.reason || undefined,
          recurrence: this.form.recurrence, // 'NONE' | 'WEEKLY'
        };
        await this.$store.dispatch('appointments/createTimeBlock', payload);
        this.$bvToast.toast('Time block saved', {
          title: 'Success',
          variant: 'success',
          solid: true,
        });
        this.$emit('saved');
      } catch (e) {
        this.$bvToast.toast('Failed to save time block', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      } finally {
        this.submitting = false;
      }
    },
  },
  watch: {
    selectedDate(newVal) {
      if (newVal) this.form.date = newVal;
    },
    selectedHour(newVal) {
      const pad = (n) => `${n}`.padStart(2, '0');
      if (newVal != null) {
        this.form.start_time = `${pad(newVal)}:00`;
        this.form.end_time = `${pad(Math.min(newVal + 1, 23))}:00`;
      }
    },
  },
};
</script>

<style scoped></style>
