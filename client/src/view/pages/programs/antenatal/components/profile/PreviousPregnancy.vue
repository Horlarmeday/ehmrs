<template>
  <div class="card-custom card-stretch card-stretch-fourth gutter-b">
    <previous-pregnancies-table :pregnancies="pregnancies" />
  </div>
</template>
<script>
import PreviousPregnanciesTable from '@/view/components/table/PreviousPregnanciesTable.vue';

export default {
  components: { PreviousPregnanciesTable },
  computed: {
    pregnancies() {
      return this.$store.state.antenatal.previousPregnancies;
    },
  },
  methods: {
    fetchPreviousPregnancies() {
      this.$store.dispatch('antenatal/fetchPreviousPregnancies', this.$route.params.id);
    },
  },
  created() {
    this.fetchPreviousPregnancies();
  },
};
</script>

<style scoped></style>
