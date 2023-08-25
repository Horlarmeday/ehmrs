<template>
  <div class="mt-3">
    <div class="card" v-for="(result, i) in results" :key="i">
      <div class="card-title section-title p-5">
        <span class="mr-5 text-black-50">Investigation:</span>
        <span class="mr-5 text-dark-75 font-weight-boldest">{{ result.investigation.investigation.name }}</span>
      </div>
      <div>
        <b-card>
          <div v-html="result.result"></div>
        </b-card>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    results: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
  methods: {
    convertStringToHTML(htmlString) {
      const parser = new DOMParser();
      const html = parser.parseFromString(htmlString, 'text/html');

      return html.body;
    },
  },
};
</script>
<style>
.section-title {
  cursor: pointer;
  margin: 0;
  border-bottom: 0;
  padding: 0;
  background-color: #f3f6f9;
  border-radius: 0;
}
</style>