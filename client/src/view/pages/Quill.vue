<template>
  <div class="flex-row-fluid ml-lg-8">
    <div class="card card-custom">
      <!--begin::Header-->
      <div class="card-header py-3">
        <div class="card-title align-items-start flex-column">
          <h3 class="card-label font-weight-bolder text-dark">System Settings</h3>
          <span class="text-muted font-weight-bold font-size-sm mt-1"
            >Update your system settings</span
          >
        </div>
      </div>
      <div class="card-body">
        <text-editor v-model="content" :disabled="true" />
        <div>
          <button @click="submit" class="btn btn-primary">Submit</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import TextEditor from '@/utils/TextEditor.vue';
export default {
  components: { TextEditor },
  data() {
    return {
      content: '<h1>Header1</h1><p>Hello <b>word</b></p>',
    };
  },
  methods: {
    submit() {
      console.log(this.content);
    },
  },
};
</script>

<style scoped>
.disabledCard {
  pointer-events: none;
  opacity: 0.4;
}
</style>
