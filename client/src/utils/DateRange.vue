<template>
  <div class="input-daterange input-group">
    <datepicker v-model="start" input-class="form-control" placeholder="Start"></datepicker>
    <div class="input-group-append">
      <span class="input-group-text"><i class="la la-ellipsis-h"></i></span>
    </div>
    <datepicker v-model="end" input-class="form-control" placeholder="End"></datepicker>
    <div class="input-group-append">
      <button ref="dateSpin" type="button" class="btn btn-primary" @click="onFilter">
        Filter
      </button>
    </div>
  </div>
</template>
<script>
import Datepicker from 'vuejs-datepicker';
import { addSpinner } from "@/common/common";
export default {
  components: {
    Datepicker,
  },
  data() {
    return {
      start: '',
      end: '',
    };
  },
  methods: {
    notifyEmptyField() {
      return this.$notify({
        group: 'foo',
        title: 'Error message',
        text: 'Date fields cannot be left empty',
        type: 'error',
      });
    },

    onFilter() {
      if (!this.start || !this.end) return this.notifyEmptyField();
      const dateSpin = this.$refs['dateSpin'];
      addSpinner(dateSpin);
      this.$emit('searchByDate', { start: this.start, end: this.end, dateSpin });
    },
  },
};
</script>
