<template>
  <div class="card-body pb-3">
    <!--begin::Table-->
    <div class="table-responsive">
      <table class="table table-head-custom table-vertical-center table-head-bg">
        <thead>
          <tr class="text-uppercase">
            <th class="pl-5" style="min-width: 150px">Test</th>
            <th style="min-width: 160px">Price</th>
            <th class="pr-0 " style="min-width: 150px">action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="tests.length === 0">
            <td colspan="9" align="center" class="text-muted">No Data</td>
          </tr>
          <tr v-for="test in tests" :key="test.id">
            <td class="pl-5">
              <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                {{ test?.test?.name }}
              </span>
            </td>
            <td>
              <span class="text-dark-75 font-weight-bolder d-block font-size-lg">{{
                test.test.price
              }}</span>
            </td>
            <td class="pr-0">
              <router-link to="#" class="btn btn-icon btn-light btn-hover-primary btn-sm mx-3">
                <delete-icon />
              </router-link>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script>
import { defineComponent } from 'vue';
import DeleteIcon from '@/assets/icons/DeleteIcon.vue';

export default defineComponent({
  components: { DeleteIcon },
  computed: {
    defaults() {
      if (this.$store.state.model.defaults?.length) {
        return this.$store.state.model.defaults;
      }
      return JSON.parse(localStorage.getItem('defaults'));
    },
    tests() {
      return this.defaults.find(def => def.id?.toString() === this.$route.params.id)?.data;
    },
  },
});
</script>

<style scoped></style>
