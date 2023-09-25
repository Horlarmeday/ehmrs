<template>
  <div class="row">
    <search @search="onHandleSearch" />

    <div class="col-lg-12">
      <div
        class="bg-gray-200 rounded-lg pr-4 pl-4 pointer text-center mr-2 inline-display mb-2"
        v-for="visit in visits"
        :key="visit.id"
        @click="visitDetailsPage(visit)"
        v-b-tooltip.hover
        :title="visit.patient.fullname"
      >
        <div>
          <img alt="Pic" src="/media/users/blank.png" width="50" class="mb-2" />
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
</template>

<script>
import Search from '@/utils/Search';
import { debounce, removeSpinner } from '@/common/common';
export default {
  components: { Search },
  data() {
    return {
      currentPage: 1,
      itemsPerPage: 10,
    };
  },
  computed: {
    visits() {
      return this.$store.state.visit.visitTypes;
    },
    queriedItems() {
      return this.$store.state.visit.totalVisitTypes;
    },
    pages() {
      return this.$store.state.visit.totalVisitTypesPages;
    },
    perPage() {
      return this.visits.length;
    },
  },

  props: {
    type: {
      type: String,
      required: true,
    },
  },

  methods: {
    handlePageChange() {
      this.$store.dispatch('visit/fetchVisitsType', {
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        type: this.type,
      });
    },

    onPageChange(page) {
      this.currentPage = page;
      this.handlePageChange();
    },

    onHandleSearch(prop) {
      const { search, spinDiv } = prop;
      this.debounceSearch(search, this, spinDiv);
    },

    debounceSearch: debounce((search, vm, spinDiv) => {
      vm.$store
        .dispatch('visit/fetchVisitsType', {
          currentPage: 1,
          itemsPerPage: vm.itemsPerPage,
          search,
          type: this.type,
        })
        .then(() => removeSpinner(spinDiv))
        .catch(() => removeSpinner(spinDiv));
    }, 500),

    displayIcon() {
      if (this.type === 'IPD') return 'fas fa-bed';
      if (this.type === 'ANC') return 'fas fa-female';
    },

    cutName(name) {
      const splitName = name.split(' ');
      if (splitName.length <= 2) return name;
      splitName.splice(2, 1);
      return splitName.join(' ');
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
      if (this.type === 'Antenatal') {
        return this.$router.push(
          `/program/ante-natal/visit/${visit.id}?antenatal=${visit.ante_natal_id}`
        );
      }
      return this.$router.push(`/consultation/${visit.id}`);
    },
  },
  created() {
    this.$store.dispatch('visit/fetchVisitsType', {
      currentPage: this.currentPage,
      itemsPerPage: this.itemsPerPage,
      type: this.type,
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
