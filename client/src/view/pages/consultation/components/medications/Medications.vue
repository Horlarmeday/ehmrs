<template>
  <div class="col-8">
    <div class="card card-custom gutter-b">
      <div class="card-header pt-5">
        <h3 class="card-title align-items-start flex-column">
          <span class="card-label font-weight-bolder text-dark">Medications</span>
        </h3>
      </div>

      <div class="card-body pt-2" style="padding: 2rem 1.25rem">
        <!--begin::Table-->
        <div class="table-responsive table-bordered nowrap">
          <table class="table table-striped">
            <thead>
              <tr>
                <th>Drug</th>
                <th>Dose</th>
                <th>Strength</th>
                <th>Freq</th>
                <th>Duration</th>
                <th>Start</th>
                <th>Date Presc.</th>
                <th>Examiner.</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="drugs.length === 0">
                <td colspan="9" align="center" class="text-muted">No Data</td>
              </tr>
              <tr v-for="drug in drugs" :key="drug.id">
                <th>
                  <a
                    @click="viewPopover(drug)"
                    href="#"
                    :id="popOverId"
                    class="font-size-sm"
                    >{{ drug.drug.name }}</a
                  >
                </th>
                <td>
                  <span class="font-size-xs"
                    >{{ drug.quantity_to_dispense }} {{ drug?.dosage_form?.name || '-' }}</span
                  >
                </td>
                <td>
                  <span class="font-size-xs"
                    >{{ drug.prescribed_strength }}{{ drug?.strength?.name || '-' }}</span
                  >
                </td>
                <td>
                  <span class="font-size-xs">{{ drug.frequency }}</span>
                </td>
                <td>
                  <span class="font-size-xs">{{ drug.duration }} {{ drug.duration_unit }}</span>
                </td>
                <td>
                  <span class="font-size-xs">{{ drug.start_date | moment('DD/MM/YYYY') }}</span>
                </td>
                <td>
                  <span class="font-size-xs">{{
                    drug.date_prescribed | moment('DD/MM/YYYY, h:mma')
                  }}</span>
                </td>
                <td>
                  <a class="font-size-sm" href="#"
                    >{{ drug?.requester?.firstname }} {{ drug?.requester?.lastname?.charAt(0) }}</a
                  >
                </td>
                <td>
                  <span>
                    <a href="#"><i class="flaticon-delete mr-2"></i></a>
                    <a href="#"><i class="flaticon-edit-1"></i></a>
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <drug-popover
          :drug="item"
          :target="popOverId"
          :show="showPopover"
          @closePopover="hidePopover"
        />
        <!--end::Table-->
        <div v-if="items.length" class="table-responsive table-bordered nowrap">
          <table class="table table-striped">
            <thead>
              <th colspan="8">Additional Items</th>
            </thead>
            <tbody>
              <tr v-if="items.length === 0">
                <td colspan="9" align="center" class="text-muted">No Data</td>
              </tr>
              <tr v-for="item in items" :key="item.id">
                <th>
                  <span class="font-size-sm">{{ item?.drug?.name || '-' }}</span>
                </th>
                <td>
                  <span class="font-size-xs">
                    {{ item.quantity_prescribed }} {{ item?.unit?.name }}
                  </span>
                </td>
                <td>
                  <span class="font-size-xs">
                    ₦{{ item.total_price }}
                  </span>
                </td>
                <td>

                </td>
                <td>
                  <span class="font-size-xs">{{
                    item.date_prescribed | moment('dd, MMM Do YYYY, h:mma')
                  }}</span>
                </td>
                <td>
                  <span class="font-size-xs"
                    >{{ item?.requester?.firstname }}
                    {{ item?.requester?.lastname?.charAt(0) }}</span
                  >
                </td>
                <td>
                  <span>
                    <a href="#"><i class="flaticon-delete"></i></a>
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DrugPopover from '@/utils/DrugPopover.vue';

export default {
  name: 'Medications',
  components: { DrugPopover },
  data: () => ({
    currentPage: 1,
    itemsPerPage: 10,
    count: 0,
    item: {},
    showPopover: false,
    popOverId: 'popover-reactive-1'
  }),
  computed: {
    drugs() {
      return this.$store.state.order.drug_orders;
    },
    items() {
      return this.$store.state.order.additional_items_orders;
    },
  },
  created() {
    this.$store.dispatch('order/fetchPrescribedDrugs', {
      currentPage: this.currentPage,
      itemsPerPage: this.itemsPerPage,
      fetchWithItems: true,
      filter: { visit_id: this.$route.params.id },
    });
  },
  methods: {
    viewPopover(item) {
      this.item = item;
      this.showPopover = true;
    },
    hidePopover() {
      this.showPopover = false;
    },
  },
};
</script>

<style scoped>
.flex-row-fluid {
  -webkit-box-flex: 1;
  flex: 3 auto;
  -ms-flex: 1 0 0px;
  min-width: 0;
}
</style>
