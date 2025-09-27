/**
 * Pagination Mixin
 * Provides standardized pagination management for Vue components
 */
export default {
  data() {
    return {
      // Component-specific pagination settings
      componentPagination: {
        currentPage: 1,
        pageLimit: 20,
      },
    };
  },

  computed: {
    // Global pagination state from store
    globalPagination() {
      return this.$store.state.generalStore.pagination;
    },

    // Current page
    currentPage() {
      return this.globalPagination.currentPage || 1;
    },

    // Items per page
    pageLimit() {
      return this.globalPagination.pageLimit || 20;
    },

    // Total items
    totalItems() {
      return this.globalPagination.totalItems || 0;
    },

    // Total pages
    totalPages() {
      return this.globalPagination.totalPages || 0;
    },

    // Has next page
    hasNextPage() {
      return this.globalPagination.hasNextPage || false;
    },

    // Has previous page
    hasPrevPage() {
      return this.globalPagination.hasPrevPage || false;
    },

    // Pagination info for display
    paginationInfo() {
      const start = (this.currentPage - 1) * this.pageLimit + 1;
      const end = Math.min(this.currentPage * this.pageLimit, this.totalItems);
      return {
        start,
        end,
        total: this.totalItems,
        currentPage: this.currentPage,
        totalPages: this.totalPages,
        pageLimit: this.pageLimit,
      };
    },

    // Visible page numbers for pagination component
    visiblePages() {
      const pages = [];
      const maxVisible = 5;
      let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
      let end = Math.min(this.totalPages, start + maxVisible - 1);

      if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1);
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      return pages;
    },
  },

  methods: {
    // Update pagination in store
    updatePagination(pagination) {
      this.$store.commit('generalStore/UPDATE_PAGINATION', pagination);
    },

    // Reset pagination to first page
    resetPagination() {
      this.$store.commit('generalStore/RESET_PAGINATION');
    },

    // Change to specific page
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.updatePagination({ currentPage: page });
        this.onPageChange(page);
      }
    },

    // Change page limit
    changePageLimit(limit) {
      this.updatePagination({
        currentPage: 1, // Reset to first page when changing limit
        pageLimit: limit,
      });
      this.onPageLimitChange(limit);
    },

    // Go to next page
    nextPage() {
      if (this.hasNextPage) {
        this.changePage(this.currentPage + 1);
      }
    },

    // Go to previous page
    prevPage() {
      if (this.hasPrevPage) {
        this.changePage(this.currentPage - 1);
      }
    },

    // Go to first page
    firstPage() {
      this.changePage(1);
    },

    // Go to last page
    lastPage() {
      this.changePage(this.totalPages);
    },

    // Get request parameters for API calls
    getPaginationParams() {
      return {
        currentPage: this.currentPage,
        pageLimit: this.pageLimit,
      };
    },

    // Get request parameters with filters
    getRequestParams(filters = {}) {
      return {
        ...this.getPaginationParams(),
        ...filters,
      };
    },

    // Hook methods that can be overridden in components
    onPageChange(page) {
      // Override in component to handle page changes
      console.log(`Page changed to: ${page}`);
    },

    onPageLimitChange(limit) {
      // Override in component to handle page limit changes
      console.log(`Page limit changed to: ${limit}`);
    },
  },
};
