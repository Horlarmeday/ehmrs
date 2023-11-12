<template>
  <div>
    <div class="accordion accordion-solid accordion-panel accordion-svg-toggle">
      <div class="card">
        <div class="card-header" role="tab">
          <div class="card-title">
            <div class="card-label">Store Item</div>
            <accordion-icon />
          </div>
        </div>
        <div class="card-body">
          <div class="form-group row">
            <label class="col-lg-3 col-form-label">Name</label>
            <div class="col-lg-8">
              <textarea
                rows="20"
                cols="10"
                v-validate="'required'"
                data-vv-validate-on="blur"
                type="text"
                class="form-control form-control-sm"
                placeholder="Name"
                v-model="name"
                name="name"
              />
              <span class="text-danger text-sm">{{ errors.first('name') }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import AccordionIcon from '@/assets/icons/AccordionIcon.vue';

export default {
  components: { AccordionIcon },
};
</script>

<style scoped></style>
