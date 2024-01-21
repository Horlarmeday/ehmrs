<template>
  <div class="card-custom card-stretch card-stretch-fourth gutter-b">
    <div class="accordion accordion-solid accordion-panel accordion-svg-toggle" role="tablist">
      <div class="card">
        <div class="card-header" header-tag="header" role="tab" style="background: blue">
          <div class="card-title accord" v-b-toggle="'accordion-19'">
            <div class="card-label">Postnatal Information</div>
          </div>
        </div>
        <b-collapse id="accordion-19" accordion="my-accordion" role="tabpanel">
          <div class="card-body border">
            <postnatal-table :post-natals="postNatals" />
          </div>
        </b-collapse>
      </div>
    </div>
  </div>
</template>
<script>
import PostnatalTable from '@/view/components/table/PostnatalTable.vue';
export default {
  components: { PostnatalTable },
  computed: {
    postNatals() {
      return this.$store.state.antenatal.postNatals;
    },
  },
  methods: {
    fetchPostNatalInfo() {
      this.$store.dispatch('antenatal/fetchPostNatalInfo', { id: this.$route.query.antenatal });
    },
  },
  created() {
    this.fetchPostNatalInfo();
  },
};
</script>

<style scoped>
.accord {
  background: #f1f1f1 !important;
  padding: 0.5rem 1.25rem !important;
}
</style>
