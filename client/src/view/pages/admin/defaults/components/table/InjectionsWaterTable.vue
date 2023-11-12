<template>
  <div class="card-body pb-3">
    <!--begin::Table-->
    <div class="table-responsive">
      <table class="table table-head-custom table-vertical-center table-head-bg">
        <thead>
          <tr class="text-uppercase">
            <th class="pl-5" style="min-width: 250px">Drug</th>
            <th class="pr-0 " style="min-width: 150px">action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="items.length === 0">
            <td colspan="9" align="center" class="text-muted">No Data</td>
          </tr>
          <tr v-for="item in items" :key="item.id">
            <td class="pl-5">
              <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                {{ item?.drug?.name }}
              </span>
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
