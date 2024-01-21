<template>
  <div>
    <postnatal-table :post-natals="postNatals" />
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
      this.$store.dispatch('antenatal/fetchPostNatalInfo', { id: this.$route.params.id });
    },
  },
  created() {
    this.fetchPostNatalInfo();
  },
};
</script>

<style scoped></style>
