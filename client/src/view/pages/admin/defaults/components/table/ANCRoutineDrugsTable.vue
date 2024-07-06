<template>
  <div class="card-body pb-3">
    <!--begin::Table-->
    <div class="table-responsive">
      <table class="table table-head-custom table-vertical-center table-head-bg">
        <thead>
          <tr class="text-uppercase">
            <th class="pl-5" style="min-width: 250px">Drug</th>
            <th style="min-width: 150px">Quantity</th>
            <th style="min-width: 150px">Strength</th>
            <th style="min-width: 160px">Frequency</th>
            <th style="min-width: 160px">Price</th>
            <th style="min-width: 160px">Group</th>
            <th class="pr-0 " style="min-width: 150px">action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="routineDrugs.length === 0">
            <td colspan="9" align="center" class="text-muted">No Data</td>
          </tr>
          <tr v-for="drug in routineDrugs" :key="drug.id">
            <td class="pl-5">
              <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                {{ drug?.drug?.name }}
                <span :class="getItemType(drug?.drug?.drug_type)" class="label label-inline ml-2">{{
                  drug?.drug?.drug_type
                }}</span>
              </span>
              <span :class="getItemType(drug?.drug?.drug_type)" class="label label-inline ml-2">{{
                drug?.drug?.drug_type
              }}</span>
            </td>
            <td>
              <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                {{ drug?.quantity }} {{ drug?.dosage_form }}
              </span>
            </td>
            <td>
              <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                {{ drug?.prescribed_strength }} {{ drug?.drug?.strength?.name }}
              </span>
            </td>
            <td>
              <span class="text-dark-75 font-weight-bolder d-block font-size-lg">{{
                drug.frequency
              }}</span>
            </td>
            <td>
              <span class="text-dark-75 font-weight-bolder d-block font-size-lg">{{
                drug.drug.price
              }}</span>
            </td>
            <td>
              <span class="text-dark-75 font-weight-bolder d-block font-size-lg">{{
                drug.group || '-'
              }}</span>
            </td>
            <td class="pr-0">
              <button
                @click="deleteDefaultData(drug.id)"
                class="btn btn-icon btn-light btn-hover-primary btn-sm mx-3"
              >
                <delete-icon />
              </button>
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
  methods: {
    getItemType,
    deleteDefaultData(dataId) {
      this.$store
        .dispatch('model/deleteDefaultData', { id: this.$route.params.id, dataId })
        .then(() => this.fetchDefaults());
    },
    fetchDefaults() {
      this.$store
        .dispatch('model/fetchDefaults')
        .then(res => localStorage.setItem('defaults', JSON.stringify(res.data.data)));
    },
  },
  components: { DeleteIcon },
  computed: {
    defaults() {
      if (this.$store.state.model.defaults?.length) {
        return this.$store.state.model.defaults;
      }
      return JSON.parse(localStorage.getItem('defaults'));
    },
    routineDrugs() {
      return this.defaults.find(def => def.id?.toString() === this.$route.params.id)?.data;
    },
  },
};
</script>
<style scoped></style>
