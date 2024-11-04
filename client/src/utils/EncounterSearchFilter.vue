<template>
  <!--begin: Search Form-->
  <div class="card-body py-1 px-0">
    <div class="d-flex align-items-center justify-content-between flex-wrap mt-2">
      <div class="col-lg-3">
        <div ref="spin">
          <input
            type="text"
            class="form-control"
            placeholder="Search"
            data-col-index="0"
            v-model="search"
            @keyup="onSearch"
          />
        </div>
      </div>
      <div>
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
      </div>
    </div>
    <br />
  </div>
  <!--begin: Datatable-->
</template>

<script>
import { addSpinner } from '@/common/common';
import Datepicker from 'vuejs-datepicker';
import dayjs from 'dayjs';
export default {
  components: {
    Datepicker,
  },
  data() {
    return {
      search: this.$route.query.search || '',
      start:
        this.$route.query.start ||
        dayjs()
          .startOf('month')
          .format('YYYY-MM-DD'),
      end:
        this.$route.query.end ||
        dayjs()
          .endOf('month')
          .format('YYYY-MM-DD'),
    };
  },
  methods: {
    onSearch() {
      const spinDiv = this.$refs['spin'];
      addSpinner(spinDiv);
      this.$emit('search', { search: this.search, spinDiv });
    },

    notifyEmptyField() {
      return this.$notify({
        group: 'foo',
        title: 'Error message',
        text: 'Date fields must be filled',
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

<style scoped></style>
