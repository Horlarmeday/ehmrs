<template>
  <div class="card-body py-0">
    <b-button-group v-if="selectedItems?.length" class="mt-5 btn-group-sm">
      <b-button variant="outline-secondary">
        <div class="checkbox-inline">
          <label class="">
            <span class="mr-2" />
            {{ selectedItems?.length ? selectedItems?.length : null }} Selected
          </label>
        </div>
      </b-button>
      <b-button @click="openReturnModal" variant="outline-secondary">Return Items</b-button>
    </b-button-group>
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
            <th class="pr-0" style="width: 300px">Name</th>
            <th class="pr-0" style="width: 150px">Quantity</th>
            <th class="pr-0" style="width: 150px">Price(₦)</th>
            <th class="pr-0" style="width: 150px">Dosage Form</th>
            <th class="pr-0" style="width: 150px">Strength</th>
            <th style="min-width: 150px">Expiration</th>
            <th
              v-if="
                allowedRoles.includes(currentUser.role) ||
                  allowedSubRoles.includes(currentUser.sub_role)
              "
              class="pr-0 text-right"
              style="min-width: 70px"
            >
              action
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!items.length">
            <td colspan="9" align="center" class="text-muted">No Data</td>
          </tr>
          <tr v-for="item in items" :key="item.id">
            <td class="pl-0">
              <label class="checkbox checkbox-md checkbox-inline">
                <input type="checkbox" :checked="isSelected(item)" @change="toggleItem(item)" />
                <span></span>
              </label>
            </td>
            <td class="pr-0">
              <router-link
                :to="`/inventory/items/${item.id}`"
                class="text-dark-75 font-weight-bolder text-hover-primary mb-1 font-size-lg"
                >{{ item.drug.name }}</router-link
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
              <span
                v-if="item.measurement_id"
                class="text-dark-75 font-weight-bolder d-block font-size-lg"
              >
                {{ item.strength_input }} {{ item.strength.name || 'None' }}
              </span>
              <span v-else class="text-dark-75 font-weight-bolder d-block font-size-lg">Nil</span>
            </td>
            <td>
              <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                {{ item.expiration | dayjs('ddd, MMM Do YYYY, h:mma') }}
              </span>
            </td>
            <td class="pr-0 text-right">
              <a
                v-if="
                  allowedRoles.includes(currentUser.role) ||
                    allowedSubRoles.includes(currentUser.sub_role)
                "
                href="#"
                class="btn btn-icon btn-light btn-hover-primary btn-sm mx-3"
                @click.stop="deactivateItem(item)"
              >
                <send-icon />
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
import { parseJwt } from '@/common/common';
export default {
  name: 'InventoryTable',
  components: { SendIcon, Pagination },
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
  computed: {
    selectedItems() {
      return this.$store.state.inventory.selectedItems;
    },
  },
  data: () => ({
    allowedRoles: ['Super Admin'],
    allowedSubRoles: ['HOD'],
    currentUser: parseJwt(localStorage.getItem('user_token')),
  }),
  methods: {
    changePage(page) {
      this.$emit('changePage', page);
    },

    changePageCount(pagecount) {
      this.$emit('changePageCount', pagecount);
    },

    deactivateItem(item) {
      this.$emit('deactivateItem', item);
    },

    isSelected(item) {
      return this.selectedItems.includes(item);
    },

    toggleItem(item) {
      if (this.isSelected(item)) {
        // If the item is already selected, remove it from selectedItems
        this.$store.dispatch('inventory/removeSelectedItem', item);
      } else {
        // If the item is not selected, add it to selectedItems
        this.$store.dispatch('inventory/addSelectedItem', item);
      }
    },

    openReturnModal() {
      this.$emit('openReturnModal', true);
    },
  },
};
</script>

<style scoped></style>
