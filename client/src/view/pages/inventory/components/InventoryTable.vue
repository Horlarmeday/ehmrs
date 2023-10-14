<template>
  <div class="card-body py-0">
    <!--begin::Table-->
    <div class="table-responsive">
      <table class="table table-head-custom table-vertical-center" id="kt_advance_table_widget_1">
        <thead>
          <tr class="text-left">
            <th class="pl-0" style="width: 20px">
              <label class="checkbox checkbox-md checkbox-inline">
                <input type="checkbox" />
                <span></span>
              </label>
            </th>
            <th class="pr-0" style="width: 250px">Name</th>
            <th class="pr-0" style="width: 150px">Quantity</th>
            <th class="pr-0" style="width: 150px">Price</th>
            <th class="pr-0" style="width: 250px">Dosage Form</th>
            <th style="min-width: 150px">Date Created</th>
            <th class="pr-0 text-right" style="min-width: 50px">action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!items.length">
            <td colspan="9" align="center" class="text-muted">No Data</td>
          </tr>
          <tr v-for="item in items" :key="item.id">
            <td class="pl-0">
              <label class="checkbox checkbox-md checkbox-inline">
                <input type="checkbox" value="1" />
                <span></span>
              </label>
            </td>
            <td class="pr-0">
              <router-link
                :to="`/inventory/items/${item.id}`"
                class="text-dark-75 font-weight-bolder text-hover-primary mb-1 font-size-lg"
                >{{ item.drug.name }}</router-link
              >
              <span v-if="item.drug_type === 'NHIS'" class="label label-inline label-success ml-2"
                >NHIS</span
              >
            </td>
            <td>
              <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                {{ item.quantity_remaining }} {{ item.unit.name }}
              </span>
            </td>
            <td>
              <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                {{ item.selling_price || 'None' }}
              </span>
            </td>
            <td>
              <span
                v-if="item.dosage_form_id"
                class="text-dark-75 font-weight-bolder d-block font-size-lg"
              >
                {{ item.dosage_form.name || 'None' }}
              </span>
              <span v-else class="text-dark-75 font-weight-bolder d-block font-size-lg">Nil</span>
            </td>
            <td>
              <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                {{ item.date_received | dayjs('ddd, MMM Do YYYY, h:mma') }}
              </span>
            </td>
            <td class="pr-0 text-right">
              <a
                href="#"
                class="btn btn-icon btn-light btn-hover-primary btn-sm mx-3"
                @click.stop="() => {}"
              >
                <send-icon />
              </a>
              <a
                href="#"
                class="btn btn-icon btn-light btn-hover-primary btn-sm mx-3"
                @click.stop="() => {}"
              >
                <edit-icon />
              </a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!--end::Table-->
    <pagination
      :total-pages="paginationParams.pages"
      :total="paginationParams.queriedItems"
      :per-page="paginationParams.perPage"
      :current-page="paginationParams.currentPage"
      @pagechanged="changePage"
      @changepagecount="changePageCount"
    />
  </div>
</template>

<script>
import Pagination from '../../../../utils/Pagination';
import SendIcon from '@/assets/icons/SendIcon.vue';
import EditIcon from '@/assets/icons/EditIcon.vue';
export default {
  name: 'InventoryTable',
  components: { EditIcon, SendIcon, Pagination },
  props: {
    items: {
      type: Array,
      default: () => [],
    },
    paginationParams: {
      type: Object,
      required: true,
    },
  },
  methods: {
    changePage(page) {
      this.$emit('changePage', page);
    },

    changePageCount(pagecount) {
      this.$emit('changePageCount', pagecount);
    },
  },
};
</script>

<style scoped></style>
