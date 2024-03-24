<template>
  <div class="card card-custom gutter-b example example-compact">
    <div class="card-header" style="min-height: 50px !important">
      <h3 class="card-title">
        Aggregate Reports
      </h3>
    </div>
    <div class="card-body" style="padding: 1rem 2.25rem">
      <div class="">
        <div class="">
          <date-filter @filterbydate="searchByDate" label="Patient" />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import DateFilter from '@/utils/DateFilter.vue';
import { setUrlQueryParams } from '@/common/common';
import dayjs from 'dayjs';

export default {
  components: { DateFilter },
  methods: {
    searchByDate(start, end) {
      (this.start = start)((this.end = end));
      this.currentPage = 1;
      setUrlQueryParams({
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        startDate: dayjs(start).format('YYYY-MM-DD'),
        endDate: dayjs(end).format('YYYY-MM-DD'),
      });
      this.$store.dispatch('patient/fetchPatients', {
        currentPage: this.$route.query.currentPage,
        itemsPerPage: this.$route.query.itemsPerPage,
        start: this.$route.query.startDate,
        end: this.$route.query.endDate,
      });
    },
  },
};
</script>

<style scoped></style>
