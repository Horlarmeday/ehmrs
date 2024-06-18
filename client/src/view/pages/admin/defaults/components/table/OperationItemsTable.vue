<template>
  <div class="card-body pb-3">
    <!--begin::Table-->
    <div class="table-responsive">
      <table class="table table-head-custom table-vertical-center table-head-bg">
        <thead>
          <tr class="text-uppercase">
            <th class="pl-5" style="min-width: 150px">Drug</th>
            <th style="min-width: 150px">Quantity</th>
            <th style="min-width: 150px">Strength</th>
            <th style="min-width: 160px">Price</th>
            <th class="pr-0 " style="min-width: 150px">action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="operationItems.length === 0">
            <td colspan="9" align="center" class="text-muted">No Data</td>
          </tr>
          <tr v-for="item in operationItems" :key="item.id">
            <td class="pl-5">
              <span class="text-dark-75 font-weight-bolder font-size-lg">
                {{ item?.drug?.name }}
              </span>
              <span :class="getItemType(item?.drug?.drug_type)" class="label label-inline ml-2">{{
                item?.drug?.drug_type
              }}</span>
            </td>
            <td>
              <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                {{ item?.quantity }} {{ item?.drug?.unit_name }}
              </span>
            </td>
            <td>
              <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                {{ item?.drug?.strength_input }} {{ item?.drug?.strength?.name }}
              </span>
            </td>
            <td>
              <span class="text-dark-75 font-weight-bolder d-block font-size-lg">{{
                item.drug.price
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
import DeleteIcon from '@/assets/icons/DeleteIcon.vue';
import { getItemType } from '@/common/common';

export default {
  methods: { getItemType },
  components: { DeleteIcon },
  computed: {
    defaults() {
      if (this.$store.state.model.defaults?.length) {
        return this.$store.state.model.defaults;
      }
      return JSON.parse(localStorage.getItem('defaults'));
    },
    operationItems() {
      return this.defaults.find(def => def.id?.toString() === this.$route.params.id)?.data;
    },
  },
};
</script>

<style scoped></style>
