<template>
  <div class="d-flex justify-content-between align-items-center flex-wrap pb-2">
    <div class="d-flex flex-wrap py-2 mr-3">
      <a
        href="#"
        class="btn btn-icon btn-sm btn-light-primary mr-2 my-1"
        :class="isInFirstPage ? disabled : ''"
        @click="onClickFirstPage"
        :disabled="isInFirstPage"
        ><i class="ki ki-bold-double-arrow-back icon-xs"></i
      ></a>
      <a
        href="#"
        class="btn btn-icon btn-sm btn-light-primary mr-2 my-1"
        @click="onClickPreviousPage"
        :disabled="isInFirstPage"
        :class="isInFirstPage ? disabled : ''"
        ><i class="ki ki-bold-arrow-back icon-xs"></i
      ></a>

      <a
        v-for="page in pages"
        :key="page.name"
        @click="onClickPage(page.name)"
        :disabled="page.isDisabled"
        :class="isPageActive(page.name) ? active : ''"
        href="#"
        class="btn btn-icon btn-sm border-0 btn-hover-primary mr-2 my-1"
        >{{ page.name }}</a
      >

      <a
        href="#"
        class="btn btn-icon btn-sm btn-light-primary mr-2 my-1"
        :class="isInLastPage ? disabled : ''"
        @click="onClickNextPage"
        :disabled="isInLastPage"
        ><i class="ki ki-bold-arrow-next icon-xs"></i
      ></a>
      <a
        href="#"
        class="btn btn-icon btn-sm btn-light-primary mr-2 my-1"
        @click="onClickLastPage"
        :disabled="isInLastPage"
        :class="isInLastPage ? disabled : ''"
        ><i class="ki ki-bold-double-arrow-next icon-xs"></i
      ></a>
    </div>
    <div class="d-flex align-items-center py-3">
      <select
        class="form-control form-control-sm text-primary font-weight-bold mr-4 border-0 bg-light-primary"
        style="width: 75px;"
        @change="onChangePageCount"
        v-model="pageCount"
      >
        <option value="10">10</option>
        <option value="20">20</option>
        <option value="30">30</option>
        <option value="50">50</option>
        <option value="100">100</option>
      </select>
      <span class="text-muted"
        >Displaying {{ perPage }} of {{ total }} records</span
      >
    </div>
  </div>
</template>

<script>
export default {
  props: {
    maxVisibleButtons: {
      type: Number,
      required: false,
      default: 6
    },
    totalPages: {
      type: Number,
      required: true
    },
    total: {
      type: Number,
      required: true
    },
    currentPage: {
      type: Number,
      required: true
    },
    perPage: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      disabled: "disabled",
      active: "active",
      pageCount: 10
    };
  },
  computed: {
    startPage() {
      // When on the first page
      if (this.currentPage === 1) {
        return 1;
      }
      // When on the last page
      if (this.currentPage === this.totalPages) {
        return this.totalPages - this.maxVisibleButtons;
      }
      // When in between
      return this.currentPage - 1;
    },
    pages() {
      const range = [];

      for (
        let i = this.startPage;
        i <=
        Math.min(this.startPage + this.maxVisibleButtons - 1, this.totalPages);
        i += 1
      ) {
        range.push({
          name: i,
          isDisabled: i === this.currentPage
        });
      }

      return range;
    },
    isInFirstPage() {
      return this.currentPage === 1;
    },
    isInLastPage() {
      return this.currentPage === this.totalPages;
    }
  },
  methods: {
    isPageActive(page) {
      return this.currentPage === page;
    },
    onClickFirstPage() {
      this.$emit("pagechanged", 1);
    },
    onClickPreviousPage() {
      this.$emit("pagechanged", this.currentPage - 1);
    },
    onClickPage(page) {
      this.$emit("pagechanged", page);
    },
    onClickNextPage() {
      this.$emit("pagechanged", this.currentPage + 1);
    },
    onClickLastPage() {
      this.$emit("pagechanged", this.totalPages);
    },
    onChangePageCount() {
      this.$emit("changepagecount", this.pageCount);
    }
  }
};
</script>

<style></style>
