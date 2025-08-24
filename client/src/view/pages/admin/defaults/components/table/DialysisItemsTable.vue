<template>
  <div class="card-body pb-3">
    <!--begin::Table-->
    <div class="table-responsive">
      <table class="table table-head-custom table-vertical-center table-head-bg">
        <thead>
          <tr class="text-uppercase">
            <th class="pl-5" style="min-width: 200px">Item</th>
            <th style="min-width: 100px">Type</th>
            <th style="min-width: 100px">Quantity</th>
            <th style="min-width: 120px">Strength</th>
            <th style="min-width: 120px">Dosage Form</th>
            <th style="min-width: 120px">Route</th>
            <th style="min-width: 100px">Price</th>
            <th class="pr-0 " style="min-width: 150px">action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="items.length === 0">
            <td colspan="8" align="center" class="text-muted">No Data</td>
          </tr>
          <tr v-for="item in items" :key="item.id">
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
                {{ item.type === 'drug' ? 'Drug' : 'Consumable' }}
              </span>
            </td>
            <td>
              <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                {{ item.quantity }} {{ item.drug?.unit_name || '' }}
              </span>
            </td>
            <td>
              <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                {{ item.prescribed_strength || '-' }}
              </span>
            </td>
            <td>
              <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                {{ item.dosage_form || '-' }}
              </span>
            </td>
            <td>
              <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                {{ item.route || '-' }}
              </span>
            </td>
            <td>
              <span class="text-dark-75 font-weight-bolder d-block font-size-lg">{{
                item.drug?.price || '-'
              }}</span>
            </td>
            <td class="pr-0">
              <button
                @click="deleteDefaultData(item.id)"
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
  components: { DeleteIcon },
  computed: {
    defaults() {
      if (this.$store.state.model.defaults?.length) {
        return this.$store.state.model.defaults;
      }
      return JSON.parse(localStorage.getItem('defaults'));
    },
    items() {
      return this.defaults.find(def => def.id?.toString() === this.$route.params.id)?.data;
    },
  },
  methods: {
    getItemType,
    fetchDefaults() {
      this.$store
        .dispatch('model/fetchDefaults')
        .then(res => localStorage.setItem('defaults', JSON.stringify(res.data.data)));
    },

    deleteDefaultData(dataId) {
      this.$store
        .dispatch('model/deleteDefaultData', { id: this.$route.params.id, dataId })
        .then(() => this.fetchDefaults());
    },
  },
};
</script>

<style scoped></style>
