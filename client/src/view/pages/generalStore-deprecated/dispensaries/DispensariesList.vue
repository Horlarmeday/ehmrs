<template>
  <div class="dispensaries-list">
    <DispensaryManager
      store-type="general_store"
      :dispensaries="dispensaries"
      :loading="loading"
      @dispensary-saved="handleDispensarySaved"
      @dispensary-updated="fetchDispensaries"
      @transfer-to-dispensary="handleTransferToDispensary"
      @view-dispensary="handleViewDispensary"
    />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import DispensaryManager from '@/view/components/shared/DispensaryManager.vue';

export default {
  name: 'DispensariesList',
  components: {
    DispensaryManager,
  },
  data() {
    return {
      //
    };
  },
  computed: {
    ...mapState('generalStore', ['dispensaries', 'loading']),
  },
  async created() {
    await this.fetchDispensaries();
  },
  methods: {
    async fetchDispensaries() {
      try {
        await this.$store.dispatch('generalStore/fetchDispensaries', {
          page: 1,
          limit: 50,
        });
      } catch (error) {
        this.$toast.error('Failed to load dispensaries');
      }
    },

    handleDispensarySaved() {
      this.fetchDispensaries();
    },

    handleTransferToDispensary(dispensary) {
      this.$router.push({
        name: 'general-store-dispensary-stock',
        params: { id: dispensary.id },
        query: { action: 'transfer' },
      });
    },

    handleViewDispensary(dispensary) {
      this.$router.push({
        name: 'general-store-dispensary-details',
        params: { id: dispensary.id },
      });
    },
  },
};
</script>
