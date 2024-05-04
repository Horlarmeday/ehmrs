<template>
  <div class="form-group mb-8">
    <history-modal :visit-id="visitId" :display-prompt="displayPrompt" @closeModal="hideModal" />
    <div class="alert alert-custom alert-default" role="alert">
      <div class="alert-icon">
        <i class="flaticon-information text-primary"></i>
      </div>
      <div class="alert-text">
        <div style="margin-left: 45%">
          <i class="flaticon2-warning text-warning icon-lg" /> = Validation failed <br />
          <i class="fas fa-flag-checkered text-danger icon-lg" /> = Non-conformity
        </div>
      </div>
      <div class="alert-text">
        <div>
          <a
            v-b-tooltip.hover
            title="View diagnosis and history"
            href="#"
            @click="showModal"
            class="btn btn-icon btn-light-primary pulse pulse-primary"
          >
            <i class="flaticon2-document"></i>
            <span class="pulse-ring"></span>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import HistoryModal from '@/view/pages/pharmacy/history/HistoryModal.vue';

export default {
  name: 'Banner',
  components: { HistoryModal },
  data: () => ({
    displayPrompt: false,
  }),
  props: {
    visitId: {
      type: Number,
      required: true,
    },
  },
  methods: {
    hideModal() {
      this.displayPrompt = false;
    },

    showModal() {
      this.displayPrompt = true;
    },
  },
};
</script>

<style scoped>
.alert.alert-custom {
  padding: 0;
}
</style>
