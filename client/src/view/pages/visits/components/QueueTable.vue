<template>
  <div>
    <div class="table-responsive">
      <table class="table table-head-custom table-head-bg table-vertical-center">
        <thead>
          <tr class="text-uppercase">
            <th style="min-width: 150px" class="pl-7">
              <span class="text-dark-75">Patient ID</span>
            </th>
            <th style="min-width: 200px">Patient Name</th>
            <th style="min-width: 150px">Category</th>
            <th style="min-width: 150px">Status</th>
            <th style="min-width: 150px">Date</th>
            <th class="text-right pr-0" style="min-width: 130px">Action</th>
            <th style="min-width: 10px"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="queues.length === 0">
            <td colspan="9" align="center" class="text-muted">No Data</td>
          </tr>
          <tr v-for="queue in queues" :key="queue.id">
            <td class="pl-7 py-8">
              <div class="d-flex align-items-center">
                <div>
                  <a
                    href="#"
                    class="text-dark-75 font-weight-bolder text-hover-primary mb-1 font-size-lg"
                    >{{ queue.patient.hospital_id }}</a
                  >
                </div>
              </div>
            </td>
            <td>
              <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                {{ queue.patient.fullname }}
              </span>
            </td>
            <td>
              <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                {{ queue.category }}
              </span>
            </td>
            <td>
              <span :class="getVisitStatus(queue.status)" class="label label-lg label-inline">{{
                queue.status
              }}</span>
            </td>
            <td>
              <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                {{ queue.date_visit_start | moment('ddd, MMM Do YYYY, h:mma') }}
              </span>
            </td>
            <td class="text-right pr-0">
              <router-link
                :to="
                  $route.name === 'ante-natal-visits'
                    ? `/program/ante-natal/visit/${queue.id}?antenatal=${queue.ante_natal_id}`
                    : `/consultation/${queue.id}`
                "
                class="btn btn-icon btn-light btn-hover-primary btn-sm"
              >
                <ArrowRightIcon />
              </router-link>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <pagination
      :total-pages="paginationParams.pages"
      :total="paginationParams.queriedItems"
      :per-page="paginationParams.perPage"
      :current-page="paginationParams.currentPage"
      @pagechanged="changePage"
      @changepagecount="changePageCount"
    />
  </div>
</template>
<script>
import Pagination from '@/utils/Pagination.vue';
import ArrowRightIcon from '@/assets/icons/ArrowRightIcon.vue';

export default {
  components: { ArrowRightIcon, Pagination },
  props: {
    queues: {
      type: Array,
      required: true,
      default: () => [],
    },
    paginationParams: {
      type: Object,
      required: true,
      default: () => {},
    },
  },
  methods: {
    getVisitStatus(status) {
      if (status === 'Ongoing') return 'label-light-success ';
      return 'label-light-primary ';
    },

    changePage(page) {
      this.$emit('changePage', page);
    },

    changePageCount(pagecount) {
      this.$emit('changePageCount', pagecount);
    },
  },
};
</script>

<style scoped></style>
