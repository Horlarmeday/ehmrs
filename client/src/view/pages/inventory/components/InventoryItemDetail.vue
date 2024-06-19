<template>
  <div>
    <div v-if="item" class="container bv-example-row">
      <div class="row">
        <div class="col-3">
          <div class="col d-flex flex-column flex-root">
            <span class="font-weight-bolder mb-2">ITEM NAME</span>
            <span class="opacity-70">
              {{ item?.drug?.name }}
              <span :class="getItemType(item?.drug_type)" class="label label-inline ml-2">{{
                item?.drug_type
              }}</span>
            </span>
          </div>
        </div>
        <div class="col-3">
          <div class="col d-flex flex-column flex-root">
            <span class="font-weight-bolder mb-2">DOSAGE FORM</span>
            <span class="opacity-70">{{ item?.dosage_form?.name || '--' }}</span>
          </div>
        </div>
        <div class="col-3">
          <div class="col d-flex flex-column flex-root">
            <span class="font-weight-bolder mb-2">ACQUIRED PRICE</span>
            <span class="opacity-70">₦{{ item?.acquired_price?.toLocaleString() }}</span>
          </div>
        </div>
        <div class="col-3 mb-lg-5">
          <div class="col d-flex flex-column flex-root">
            <span class="font-weight-bolder mb-2">SELLING PRICE</span>
            <span class="opacity-70">₦{{ item?.selling_price?.toLocaleString() }}</span>
          </div>
        </div>
        <div class="col-3">
          <div class="col d-flex flex-column flex-root">
            <span class="font-weight-bolder mb-2">QUANTITY RECEIVED</span>
            <span class="opacity-70">{{ item.quantity_received }} {{ item?.unit?.name }}</span>
          </div>
        </div>
        <div class="col-3">
          <div class="col d-flex flex-column flex-root">
            <span class="font-weight-bolder mb-2">QUANTITY REMAINING</span>
            <span
              class="opacity-70"
              :class="item.quantity_remaining < 50 && 'text-danger font-weight-boldest'"
              >{{ item.quantity_remaining }} {{ item?.unit?.name }}</span
            >
          </div>
        </div>
        <div class="col-3">
          <div class="col d-flex flex-column flex-root">
            <span class="font-weight-bolder mb-2">QUANTITY CONSUMED</span>
            <span class="opacity-70">{{ item.quantity_consumed }} {{ item?.unit?.name }}</span>
          </div>
        </div>
        <div class="col-3 mb-lg-5">
          <div class="col d-flex flex-column flex-root">
            <span class="font-weight-bolder mb-2">DRUG FORM</span>
            <span class="opacity-70">{{ item.drug_form }}</span>
          </div>
        </div>
        <div class="col-3">
          <div class="col d-flex flex-column flex-root">
            <span class="font-weight-bolder mb-2">STRENGTH</span>
            <span class="opacity-70">{{ item.strength_input }}{{ item?.strength?.name }}</span>
          </div>
        </div>
        <div class="col-3">
          <div class="col d-flex flex-column flex-root">
            <span class="font-weight-bolder mb-2">DATE RECEIVED</span>
            <span class="opacity-70">{{ item.date_received | dayjs('ddd, MMM Do YYYY') }}</span>
          </div>
        </div>
        <div class="col-3">
          <div class="col d-flex flex-column flex-root">
            <span class="font-weight-bolder mb-2"
              >EXPIRY DATE
              <span :class="getExpiryColor(item.expiration)">{{
                getExpiryStatus(item.expiration)
              }}</span></span
            >
            <span class="opacity-70">{{ item.expiration | dayjs('ddd, MMM Do YYYY') }}</span>
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      <b-progress :value="count" variant="primary" show-progress animated :max="100"></b-progress>
    </div>
  </div>
</template>

<script>
import { getItemType, monthDiff } from '@/common/common';

export default {
  data: () => ({
    count: 0,
  }),

  computed: {
    item() {
      return this.$store.state.inventory.item;
    },
  },

  methods: {
    getItemType,
    getExpiryStatus(expiryDate) {
      const month = monthDiff(new Date(), new Date(expiryDate));
      if (month > 0 && month <= 6) return `Expiring in ${month} month(s)`;
      if (month <= 0) return `Expired ${month} month(s) ago`;
    },

    getExpiryColor(expiryDate) {
      const month = monthDiff(new Date(), new Date(expiryDate));
      if (month > 0 && month <= 6) return 'label label-inline label-warning';
      if (month <= 0) return 'label label-inline label-danger';
    },

    countToHundred() {
      for (let i = 1; i <= 100; i++) {
        this.count = i;
        if (this.item) break;
      }
    },
  },

  created() {
    this.countToHundred();
    this.$store.dispatch('inventory/fetchInventoryItem', { id: this.$route.params.id });
  },
};
</script>

<style scoped></style>
