<template>
  <!-- begin::Scrolltop -->
  <div id="kt_scrolltop" ref="kt_scrolltop" class="scrolltop">
    <span class="svg-icon">
      <up-icon />
    </span>
  </div>
  <!-- end::Scrolltop -->
</template>

<script>
import KTLayoutScrolltop from '@/assets/js/layout/extended/scrolltop.js';
import UpIcon from '@/assets/icons/UpIcon.vue';

export default {
  name: 'KTScrollTop',
  components: { UpIcon },
  mounted() {
    // Init Scrolltop
    KTLayoutScrolltop.init(this.$refs['kt_scrolltop']);
  },
};
</script>
