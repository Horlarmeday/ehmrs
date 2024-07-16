<template>
  <div>
    <div class="table-responsive">
      <table class="table table-head-custom table-head-bg table-vertical-center">
        <thead>
          <tr class="text-uppercase">
            <th style="min-width: 120px" class="pl-2">
              <span class="text-dark-75">Patient ID</span>
            </th>
            <th style="min-width: 280px">Patient Name</th>
            <th style="min-width: 100px">Category</th>
            <th style="min-width: 100px">Professional</th>
            <th v-if="$route.name !== antenatalRoute" style="min-width: 100px">Gender</th>
            <th style="min-width: 100px">Status</th>
            <th style="min-width: 150px">Date</th>
            <th style="min-width: 100px">Created By</th>
            <th class="text-right pr-0" style="min-width: 100px">Action</th>
            <th style="min-width: 5px"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="queues.length === 0">
            <td colspan="9" align="center" class="text-muted">No Data</td>
          </tr>
          <tr v-for="queue in queues" :key="queue.id">
            <td class="pl-2 py-8">
              <div class="d-flex align-items-center">
                <div>
                  <span
                    v-b-tooltip.hover
                    :title="queue?.patient?.insurances?.[0]?.insurance?.name"
                    class="label label-dot label-lg mr-2"
                    :class="getPatientDotStatus(queue?.patient?.insurances?.[0]?.insurance?.name)"
                  ></span>
                  <router-link
                    :to="`/patient/profile/${queue.patient_id}`"
                    class="text-dark-75 font-weight-bolder text-hover-primary mb-1 font-size-lg"
                    >{{ queue.patient.hospital_id }}</router-link
                  >
                </div>
              </div>
            </td>
            <td>
              <router-link
                :to="`/patient/profile/${queue.patient_id}`"
                class="text-dark-75 font-weight-bolder d-block font-size-lg"
              >
                {{ queue.patient.fullname }}
              </router-link>
            </td>
            <td>
              <span class="text-dark-75 font-weight-bolder d-block font-size-md">
                {{ queue.category }}
              </span>
            </td>
            <td>
              <span class="text-dark-75 font-weight-bolder d-block font-size-md">
                {{ queue.professional }}
              </span>
            </td>
            <td v-if="$route.name !== antenatalRoute">
              <span class="text-dark-75 font-weight-bolder d-block font-size-md">
                {{ queue.patient.gender }}
              </span>
            </td>
            <td>
              <span :class="getVisitStatus(queue.status)" class="label label-sm label-inline">{{
                queue.status
              }}</span>
            </td>
            <td>
              <span class="text-dark-75 font-weight-bolder d-block font-size-md">
                {{ queue.date_visit_start | dayjs('DD/MM/YYYY, h:mma') }}
              </span>
            </td>
            <td>
              <span class="text-dark-75 font-weight-bolder d-block font-size-md">{{
                queue?.staff?.fullname
              }}</span>
            </td>
            <td class="text-right pr-0">
              <router-link
                :to="getRoute(queue)"
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
import { getPatientDotStatus } from '@/common/common';

export default {
  data: () => ({
    currentUser: '',
    doctor: 'General Practitioner',
    antenatalRoute: 'ante-natal-visits',
    activeVisitRoute: 'active-visits',
  }),

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
    url: {
      type: String,
      required: true,
    },
  },

  methods: {
    getPatientDotStatus,
    getRoute(queue) {
      let url = this.url;
      url = url.replaceAll('{queueId}', queue.id);
      if (url.includes('{antenatalId}')) {
        if (queue?.ante_natal_id) {
          url = url.replaceAll('{antenatalId}', queue?.ante_natal_id);
        } else {
          url = url.replace('antenatal={antenatalId}', '');
        }
      } else if (url.includes('{immunizationId}')) {
        url = url.replaceAll('{immunizationId}', queue?.immunization_id);
      }
      return url;
    },

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
