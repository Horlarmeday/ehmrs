<template>
  <div class="card-custom card-stretch card-stretch-fourth gutter-b">
    <div class="accordion accordion-solid accordion-panel accordion-svg-toggle" role="tablist">
      <div class="card">
        <div class="card-header" header-tag="header" role="tab" style="background: blue">
          <div class="card-title accord" v-b-toggle="'accordion-1'">
            <div class="card-label">Previous Triages</div>
          </div>
        </div>
        <b-collapse id="accordion-1" accordion="my-accordion" role="tabpanel">
          <div class="card-body border">
            <div class="table-responsive">
              <table class="table table-sm">
                <thead class="thead-light">
                  <tr class="text-uppercase">
                    <th scope="col">Height</th>
                    <th scope="col">Weight</th>
                    <th scope="col">Pallor</th>
                    <th scope="col">Blood Pressure</th>
                    <th scope="col">Maturity</th>
                    <th scope="col">Date Added</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="!triages?.length">
                    <td colspan="9" align="center" class="text-muted">No Data</td>
                  </tr>
                  <tr v-for="(triage, i) in triages" :key="i">
                    <td>{{ triage.height }}</td>
                    <td>{{ triage.weight }}</td>
                    <td>{{ triage.pallor }}</td>
                    <td>{{ triage.blood_pressure }}</td>
                    <td>{{ triage.maturity }}</td>
                    <td>{{ triage.createdAt | moment('DD/MM/YYYY, h:mma') }}</td>
                    <td>
                      <a :id="popOverId" @click="viewPopover(triage)" href="#"
                        ><i class="icon-xl text-primary la la-eye"></i
                      ></a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <triage-popover
            :triage="triage"
            :target="popOverId"
            :show="showPopover"
            @closePopover="hidePopover"
          />
        </b-collapse>
      </div>
    </div>
  </div>
</template>
<script>
import TriagePopover from './TriagePopover.vue';
export default {
  components: { TriagePopover },
  data: () => ({
    currentPage: 1,
    itemsPerPage: 10,
    showPopover: false,
    popOverId: 'popover-reactive-3',
    triage: {},
  }),
  computed: {
    triages() {
      return this.$store.state.antenatal.triages;
    },
    queriedItems() {
      return this.$store.state.antenatal.totalTriage;
    },
    pages() {
      return this.$store.state.antenatal.triagePages;
    },
    perPage() {
      return this.triages.length;
    },
  },
  methods: {
    fetchAntenatalTriages() {
      this.$store.dispatch('antenatal/fetchAntenatalTriages', {
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        id: this.$route.query.antenatal,
      });
    },
    viewPopover(triage) {
      this.triage = triage;
      this.showPopover = true;
    },
    hidePopover() {
      this.showPopover = false;
    },
  },
  created() {
    this.fetchAntenatalTriages();
  },
};
</script>

<style scoped>
.accord {
  background: #f1f1f1 !important;
  padding: 0.5rem 1.25rem !important;
}
</style>