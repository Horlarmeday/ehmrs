<template>
  <div v-if="item">
    <div class="container bv-example-row">
      <div class="row">
        <div class="col-3">
          <div class="col d-flex flex-column flex-root">
            <span class="font-weight-bolder mb-2">ITEM NAME</span>
            <span class="opacity-70">{{ item?.drug?.name }}</span>
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
            <span class="font-weight-bolder mb-2">PRODUCT CODE</span>
            <span class="opacity-70">{{ item?.product_code }}</span>
          </div>
        </div>
        <div class="col-3 mb-lg-5">
          <div class="col d-flex flex-column flex-root">
            <span class="font-weight-bolder mb-2">VOUCHER</span>
            <span class="opacity-70">{{ item.voucher }}</span>
          </div>
        </div>
        <div class="col-3">
          <div class="col d-flex flex-column flex-root">
            <span class="font-weight-bolder mb-2">PURCHASE UNIT COST</span>
            <span class="opacity-70">₦{{ item.unit_price.toLocaleString() }}</span>
          </div>
        </div>
        <div class="col-3">
          <div class="col d-flex flex-column flex-root">
            <span class="font-weight-bolder mb-2">SELLING PRICE</span>
            <span class="opacity-70">₦{{ item.selling_price.toLocaleString() }}</span>
          </div>
        </div>
        <div class="col-3">
          <div class="col d-flex flex-column flex-root">
            <span class="font-weight-bolder mb-2">QUANTITY RECEIVED</span>
            <span class="opacity-70">{{ item.quantity_received }} {{ item?.unit?.name }}</span>
          </div>
        </div>
        <div class="col-3 mb-lg-5">
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
            <span class="font-weight-bolder mb-2">BATCH</span>
            <span class="opacity-70">{{ item.batch }}</span>
          </div>
        </div>
        <div class="col-3">
          <div class="col d-flex flex-column flex-root">
            <span class="font-weight-bolder mb-2">SHELF</span>
            <span class="opacity-70">{{ item.shelf }}</span>
          </div>
        </div>
        <div class="col-3">
          <div class="col d-flex flex-column flex-root">
            <span class="font-weight-bolder mb-2">STRENGTH</span>
            <span class="opacity-70">{{ item.strength_input }}{{ item?.strength?.name }}</span>
          </div>
        </div>
        <div class="col-3 mb-lg-5">
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
  </div>
  <div v-else>
    <DefaultSkeleton />
  </div>
</template>

<script>
import { monthDiff } from '@/common/common';
import DefaultSkeleton from '@/utils/DefaultSkeleton.vue';

export default {
  components: { DefaultSkeleton },
  computed: {
    item() {
      return this.$store.state.store.item;
    },
  },

  created() {
    this.$store.dispatch('store/fetchPharmacyItem', { id: this.$route.params.item });
  },

  methods: {
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
  },
};
</script>

<style scoped></style>
