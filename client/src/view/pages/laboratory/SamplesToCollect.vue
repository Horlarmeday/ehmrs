<template>
  <div class="card card-custom gutter-b">
    <div class="card-body card-header-tabs-line">
      <h3 class="card-title align-items-start">
        <span class="card-label font-weight-bolder text-dark">Samples to Collect</span>
      </h3>
      <div class="card-toolbar">
        <div class="example">
          <b-tabs content-class="">
            <!-- This tabs content will always be mounted -->
            <b-tab title="Today" lazy>
              <samples-to-collect-table period="Today" />
            </b-tab>
            <!-- and will be un-mounted when hidden -->
            <b-tab title="Backlog" lazy>
              <samples-to-collect-table period="Backlog" />
            </b-tab>
          </b-tabs>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import SamplesToCollectTable from '@/view/pages/laboratory/samplesToCollect/SamplesToCollectTable.vue';

export default {
  components: { SamplesToCollectTable },
};
</script>
