<template>
  <div class="row">
    <search @search="onHandleSearch" @filterByDateRange="searchByDate" :show-date-filter="true" />

    <div class="col-lg-12">
      <div
        class="bg-gray-200 rounded-lg pointer text-center mr-2 inline-display mb-2"
        v-for="visit in visits"
        :key="visit.id"
        @click="visitDetailsPage(visit)"
        v-b-tooltip.hover
        :title="visit.patient.fullname"
        style="min-width: 150px"
      >
        <div v-if="visit.category !== OUTPATIENT" class="displayIcon">
          <i :class="displayIcon(visit.category)" class="text-white"></i>
        </div>
        <div class="pr-4 pl-4 pb-4">
          <div>
            <img
              v-if="!imageError"
              alt="Pic"
              :src="imageUrl(visit.patient.photo)"
              @load="handleImageLoad"
              @error="handleImageError"
            />
            <img v-else alt="Pic" src="/media/users/blank.png" width="50" class="mb-2" />
          </div>
          <p class="mb-0 font-size-lg">
            <strong
              >{{ shortenName(visit.patient.fullname, 11) }}
              <span>{{ displayEllipsis(visit.patient.fullname) }}</span></strong
            >
          </p>
          <p class="mb-0">
            <small class="font-size-lg font-weight-bolder">{{ visit.patient.hospital_id }}</small>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Search from '@/utils/Search.vue';
import { debounce, removeSpinner, setUrlQueryParams } from '@/common/common';
import dayjs from 'dayjs';
export default {
  components: { Search },
  data() {
    return {
      currentPage: 1,
      itemsPerPage: 10,
      imageError: false,
      OUTPATIENT: 'Outpatient',
      ANTENATAL: 'Antenatal',
      IMMUNIZATION: 'Immunization',
    };
  },
  computed: {
    visits() {
      return this.$store.state.visit.visits;
    },
    queriedItems() {
      return this.$store.state.visit.visits;
    },
    pages() {
      return this.$store.state.visit.visits;
    },
    perPage() {
      return this.visits.length;
    },
  },

  methods: {
    handlePageChange() {
      setUrlQueryParams({
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
      });
      this.$store.dispatch('visit/fetchAllVisits', {
        currentPage: this.$route.query.currentPage || this.currentPage,
        itemsPerPage: this.$route.query.itemsPerPage || this.itemsPerPage,
        start: this.$route.query.startDate,
        end: this.$route.query.endDate,
        search: this.$route.query.search,
      });
    },

    onPageChange(page) {
      this.currentPage = page;
      this.handlePageChange();
    },

    onHandleSearch(prop) {
      const { search, spinDiv } = prop;
      setUrlQueryParams({
        currentPage: 1,
        itemsPerPage: this.itemsPerPage,
        search,
      });
      this.debounceSearch(search, this, spinDiv);
    },

    debounceSearch: debounce((search, vm, spinDiv) => {
      vm.$store
        .dispatch('visit/fetchAllVisits', {
          currentPage: 1,
          itemsPerPage: vm.itemsPerPage,
          search,
        })
        .then(() => removeSpinner(spinDiv))
        .catch(() => removeSpinner(spinDiv));
    }, 500),

    displayIcon(category) {
      if (category === 'Inpatient') return 'fas fa-bed';
      if (category === 'Antenatal') return 'fas fa-female';
      if (category === 'Immunization') return 'fas fa-baby';
    },

    displayEllipsis(name) {
      if (name.length <= 11) return '';
      return '...';
    },

    shortenName(name, character) {
      if (!name.length || name.length <= 11) return name;
      return name.substring(0, character);
    },

    visitDetailsPage(visit) {
      if (visit.category === this.ANTENATAL) {
        return this.$router.push(
          `/program/ante-natal/visit/${visit.id}?antenatal=${visit.ante_natal_id}`
        );
      }
      if (visit.category === this.IMMUNIZATION) {
        return this.$router.push(
          `/program/immunization/visit/${visit.id}?immunization=${visit.immunization_id}`
        );
      }
      return this.$router.push(`/consultation/${visit.id}`);
    },

    imageUrl(url) {
      return `${window.location.origin}/static/images/${url}`;
    },

    handleImageLoad() {
      this.imageError = false;
    },

    handleImageError() {
      this.imageError = true;
    },

    searchByDate(range) {
      const { start, end, dateSpin } = range;
      this.currentPage = 1;
      setUrlQueryParams({
        pathName: 'request-list',
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        startDate: dayjs(start).format('YYYY-MM-DD'),
        endDate: dayjs(end).format('YYYY-MM-DD'),
      });
      this.$store
        .dispatch('visit/fetchAllVisits', {
          currentPage: this.$route.query.currentPage,
          itemsPerPage: this.$route.query.itemsPerPage,
          start: this.$route.query.startDate,
          end: this.$route.query.endDate,
        })
        .then(() => removeSpinner(dateSpin))
        .catch(() => removeSpinner(dateSpin));
    },
  },
  created() {
    this.$store.dispatch('visit/fetchAllVisits', {
      currentPage: this.$route.query.currentPage || this.currentPage,
      itemsPerPage: this.$route.query.itemsPerPage || this.itemsPerPage,
      search: this.$route.query.search || null,
      start: this.$route.query.startDate || null,
      end: this.$route.query.endDate || null,
    });
  },
};
</script>

<style>
.inline-display {
  display: inline-block;
}

.pointer {
  cursor: pointer;
}
</style>
