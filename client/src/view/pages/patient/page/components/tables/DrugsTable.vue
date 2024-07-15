<template>
  <div>
    <div class="table-responsive">
      <table class="table table-sm">
        <thead class="thead-light">
          <tr class="text-uppercase">
            <th scope="col">Drug</th>
            <th scope="col">Dose</th>
            <th scope="col">Strength</th>
            <th scope="col">Frequency</th>
            <th scope="col">Duration</th>
            <th scope="col">Date</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="drugs.length === 0">
            <td colspan="9" align="center" class="text-muted">No Data</td>
          </tr>
          <tr v-for="drug in drugs" :key="drug.id">
            <th>
              <span
                :title="`${drug.drug_type}`"
                v-b-tooltip.hover
                :class="getLabelDotStatus(drug.drug_type)"
                class="label label-dot label-lg mr-2"
              ></span>
              <a @click="viewPopover(drug)" href="#" :id="popOverId"> {{ drug.drug.name }}</a>
              <span class="ml-2">
                <label
                  v-if="drug?.drug_group"
                  class="label label-sm label-inline label-secondary"
                  >{{ drug?.drug_group }}</label
                >
              </span>
            </th>
            <td>
              <span>{{ drug.quantity_to_dispense }} {{ drug?.dosage_form?.name || '-' }}</span>
            </td>
            <td>
              <span>{{ drug.prescribed_strength }}{{ drug?.strength?.name || '-' }}</span>
            </td>
            <td>
              <span>{{ drug.frequency }}</span>
            </td>
            <td>
              <span>{{ drug.duration }} {{ drug.duration_unit }}</span>
            </td>
            <td>
              <span>{{ drug.date_prescribed | dayjs('DD/MM/YYYY, h:mma') }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <pagination
      :total-pages="pages"
      :total="queriedItems"
      :per-page="perPage"
      :current-page="currentPage"
      @pagechanged="onPageChange"
      @changepagecount="handlePageCount"
    />
    <drug-popover
      :drug="item"
      :target="popOverId"
      :show="showPopover"
      @closePopover="hidePopover"
    />
  </div>
</template>
<script>
import DrugPopover from '@/view/components/popover/DrugPopover.vue';
import { getLabelDotStatus } from '@/common/common';
import Pagination from '@/utils/Pagination.vue';

export default {
  name: 'DrugsTable',
  components: { Pagination, DrugPopover },
  data: () => ({
    item: {},
    showPopover: false,
    loading: false,
    popOverId: 'popover-reactive-1',
    currentPage: 1,
    itemsPerPage: 10,
  }),
  computed: {
    drugs() {
      return this.$store.state.order.drug_orders;
    },
    queriedItems() {
      return this.$store.state.order.totalDrugsOrders || 0;
    },
    pages() {
      return this.$store.state.order.drugsPages;
    },
    perPage() {
      return this.drugs.length;
    },
  },
  methods: {
    getLabelDotStatus,
    viewPopover(item) {
      this.item = item;
      this.showPopover = true;
    },

    hidePopover() {
      this.showPopover = false;
    },

    fetchPrescribedDrugs({ itemsPerPage = 10 }) {
      this.$store.dispatch('order/fetchPrescribedDrugs', {
        currentPage: this.currentPage,
        itemsPerPage,
        filter: { patient_id: this.$route.params.id },
      });
    },

    onPageChange(page) {
      this.currentPage = page;
      this.fetchPrescribedDrugs({});
    },

    handlePageCount(count) {
      this.fetchPrescribedDrugs({
        itemsPerPage: count,
      });
    },
  },
  created() {
    this.fetchPrescribedDrugs({ itemsPerPage: this.itemsPerPage });
  },
};
</script>

<style scoped></style>
