<template>
  <!--begin::Card-->
  <div class="card card-custom card-stretch card-stretch-fourth gutter-b">
    <!-- <div class="card-body"> -->
    <div
      class="accordion accordion-solid accordion-panel accordion-svg-toggle"
      role="tablist"
    >
      <div class="card">
        <div
          class="card-header"
          header-tag="header"
          role="tab"
          style="background: blue"
        >
          <div class="card-title accord" v-b-toggle="'accordion-1'">
            <div class="card-label">02 Jan 2021 10:00am</div>
          </div>
        </div>
        <b-collapse id="accordion-1" accordion="my-accordion" role="tabpanel">
          <div class="card-body">
            <div class="form-group">
              <label>Registration Fee</label>
              <div class="radio-inline">
                <label class="radio radio-lg">
                  <input type="radio" checked="checked" name="Checkboxes3_1" />
                  <span></span>
                  Option 1
                </label>
                <label class="radio radio-lg">
                  <input type="radio" name="Checkboxes3_1" />
                  <span></span>
                  Option 2
                </label>
                <label class="radio radio-lg">
                  <input type="radio" name="Checkboxes3_1" />
                  <span></span>
                  Option 3
                </label>
              </div>
              <span class="form-text text-muted"
                >Choose appropriate registration type</span
              >
            </div>
            <div class="form-group">
              <label>Consultation Fee</label>
              <div class="radio-inline">
                <label class="radio radio-lg">
                  <input type="radio" checked="checked" name="radioes3_1" />
                  <span></span>
                  Option 1
                </label>
                <label class="radio radio-lg">
                  <input type="radio" name="radioes3_1" />
                  <span></span>
                  Option 2
                </label>
                <label class="radio radio-lg">
                  <input type="radio" name="radioes3_1" />
                  <span></span>
                  Option 3
                </label>
              </div>
              <span class="form-text text-muted"
                >Choose the appropriate consultation</span
              >
            </div>
          </div>
        </b-collapse>
      </div>
    </div>
    <!-- </div> -->
  </div>
  <!--end::Card-->
</template>

<script>
export default {};
</script>

<style>
.accord {
  background: #f1f1f1 !important;
  padding: 0.5rem 1.25rem !important;
}
</style>
