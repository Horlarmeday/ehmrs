<template>
  <div
    v-bind:class="{ 'quick-search-has-result': hasResult() }"
    class="quick-search quick-search-dropdown quick-search-result-compact"
    id="kt_quick_search_dropdown"
  >
    <form method="get" class="quick-search-form">
      <div
        class="input-group spinner-input spinner-sm spinner-brand spinner-right"
        v-bind:class="{ spinner: loading }"
      >
        <div class="input-group-prepend">
          <span class="input-group-text">
            <i class="flaticon2-search-1"></i>
          </span>
        </div>
        <input
          v-on:keyup="onSearch"
          type="text"
          class="form-control quick-search-input"
          placeholder="Search..."
        />
        <div class="input-group-append">
          <span class="input-group-text">
            <i
              class="quick-search-close"
              v-on:click="reset"
              v-bind:style="{ display: hasResult() ? 'flex' : '' }"
            ></i>
          </span>
        </div>
      </div>
    </form>

    <KTSearchResult v-bind:data="data"></KTSearchResult>
  </div>
</template>

<script>
import KTSearchResult from '@/view/layout/extras/dropdown/SearchResult.vue';

export default {
  name: 'KTSearchDefault',
  components: { KTSearchResult },
  data() {
    return {
      data: [],
      loading: false,
      // dummy search result data
      result: [

      ],
    };
  },
  methods: {
    onSearch(event) {
      if (event.target.value.length > 2) {
        this.loading = true;
        // simulate getting search result
        setTimeout(() => {
          this.data = this.result;
          this.loading = false;
        }, 2000);
      }
    },
    /**
     * Check if the data has result
     * @returns {boolean}
     */
    hasResult() {
      return this.data.length || false;
    },
    /**
     * Reset search data
     */
    reset() {
      this.data = [];
    },
  },
};
</script>
