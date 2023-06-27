<template>
  <div class="flex-row-auto offcanvas-mobile w-xl-250px" id="kt_profile_aside">
    <div class="card card-custom">
      <div class="card-body pt-4 p-0">
        <div class="form">
          <div class="card-body">
            <div class="form-group row">
              <label class="col-lg-3 col-form-label">Dosage:</label>
              <div class="col-lg-9">
                <select
                  v-validate="'required'"
                  class="form-control form-control-sm"
                  v-model="dosage_form"
                  name="dosage_form"
                  @change="getRoutes"
                >
                  <option
                    :value="dosageForm.id"
                    v-for="dosageForm in dosageForms"
                    :key="dosageForm.id"
                    >{{ dosageForm.name }}</option
                  >
                </select>
                <span class="form-text text-danger text-muted">{{
                  errors.first('dosage_form')
                }}</span>
              </div>
            </div>
            <div class="form-group row">
              <label class="col-lg-3 col-form-label">Route:</label>
              <div class="col-lg-9">
                <select
                  class="form-control form-control-sm"
                  name="route"
                  v-model="route"
                  v-validate="'route'"
                >
                  <option :value="route.id" v-for="route in routes" :key="route.id">{{
                    route.name
                  }}</option>
                </select>
                <span class="form-text text-danger text-muted">{{ errors.first('route') }}</span>
              </div>
            </div>
            <div class="form-group row">
              <label class="col-lg-3 col-form-label">Drug:</label>
              <div class="col-lg-9">
                <select class="form-control form-control-sm" name="drug" v-validate="'required'">
                  <option>IM</option>
                  <option>IV</option>
                </select>
                <span class="form-text text-muted">{{ errors.first('drug') }}</span>
                <!--                <span class="form-text text-muted">Available Strength:</span>-->
                <!--                <span class="form-text text-muted">Quantity Remaining</span>-->
                <!--                <span class="form-text text-muted">Price: </span>-->
              </div>
            </div>
            <div class="form-group row">
              <label class="col-lg-3 col-form-label">Start Date:</label>
              <div class="col-lg-9">
                <datepicker
                  name="start_date"
                  v-validate="'required'"
                  data-vv-validate-on="blur"
                  v-model="start_date"
                  input-class="form-control form-control-sm"
                  placeholder="Starting Date"
                />
                <span class="form-text text-muted">{{ errors.first('start_date') }}</span>
              </div>
            </div>
            <div class="form-group row">
              <label class="col-lg-3 col-form-label">Strength:</label>
              <div class="col-lg-9">
                <select class="form-control form-control-sm" name="presc_strength">
                  <option>IM</option>
                  <option>IV</option>
                </select>
                <span class="form-text text-muted">{{ errors.first('presc_strength') }}</span>
              </div>
            </div>
            <div class="form-group row">
              <label class="col-lg-3 col-form-label">Frequency:</label>
              <div class="col-lg-9">
                <select class="form-control form-control-sm" name="frequency">
                  <option>IM</option>
                  <option>IV</option>
                </select>
                <span class="form-text text-muted">{{ errors.first('frequency') }}</span>
              </div>
            </div>
            <div class="form-group row">
              <label class="col-lg-3 col-form-label">Duration:</label>
              <div class="col-lg-9">
                <input class="form-control-sm form-control" type="number" name="duration" />
                <span class="form-text text-muted">{{ errors.first('duration') }}</span>
              </div>
            </div>
            <div class="form-group row">
              <label class="col-lg-3 col-form-label">Unit:</label>
              <div class="col-lg-9">
                <select class="form-control form-control-sm" name="unit">
                  <option>IM</option>
                  <option>IV</option>
                </select>
                <span class="form-text text-muted">{{ errors.first('unit') }}</span>
              </div>
            </div>
            <div class="form-group row">
              <label class="col-lg-3 col-form-label">Qty to dispense:</label>
              <div class="col-lg-9">
                <input class="form-control-sm form-control" type="number" name="qty_to_dispense" />
                <span class="form-text text-muted">{{ errors.first('qty_to_dispense') }}</span>
              </div>
            </div>
            <div class="form-group row">
              <label class="col-lg-3 col-form-label">Notes:</label>
              <div class="col-lg-9">
                <textarea name="notes" cols="5" class="form-control form-control-sm" rows="2" />
                <span class="form-text text-muted">{{ errors.first('notes') }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MedicationSideBar',
  data: () => ({
    dosage_form: '',
    route: '',
    start_date: '',
    dosageForms: [],
    routes: [],
  }),
  methods: {
    getRoutes() {
      this.$store.dispatch('pharmacy/fetchRoutesAndMeasurements', {
        dosage_form_id: this.dosage_form,
      });
    },
  },
  created() {
    this.$store.dispatch('pharmacy/fetchDosageForms');
  },
};
</script>

<style scoped>
.flex-row-auto {
  -webkit-box-flex: 0;
  -ms-flex: 0 0 auto;
  flex: 1 auto;
}
.form-group {
  margin-bottom: 0.15rem;
}

.form-group label {
  font-size: 0.9rem;
  font-weight: 400;
  color: #3f4254;
}
</style>
