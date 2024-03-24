<template>
  <div class="alert alert-custom alert-notice alert-light-danger fade show" role="alert">
    <div class="alert-icon"><i class="flaticon-warning"></i></div>
    <div class="alert-text">
      {{ message }}
    </div>
    <div class="alert-close">
      <button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true"><i class="ki ki-close"></i></span>
      </button>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    message: {
      type: String,
      required: true,
    },
  },
};
</script>
