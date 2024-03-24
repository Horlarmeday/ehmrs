<template>
  <div>
    <SectionTitle text="Antenatal Routine Tests" />
    <div v-for="(item, i) in items" :key="i">
      <div class="form-group row">
        <div class="col-lg-6">
          <label>Test:</label>
          <v-select
            v-validate="'required'"
            data-vv-validate-on="blur"
            name="name"
            @search="searchTests"
            v-model="item.test"
            label="name"
            :reduce="
              tests => ({
                id: tests.id,
                name: tests.name,
                price: tests.price,
                sample_id: tests.sample_id,
              })
            "
            :options="labTests"
          />
        </div>
        <a href="#" class="col-lg-2 col-form-label mt-lg-5">
          <i v-if="i === 0" class="far fa-plus-square mr-3 text-primary icon-lg" @click="addItem" />
          <i
            class="far fa-trash-alt icon-md text-danger icon-lg mt-lg-3"
            v-if="i !== 0"
            @click="removeItem(i)"
          />
        </a>
      </div>
    </div>
    <button
      :disabled="isDisabled"
      @click="submitForm"
      ref="kt-ancRoutineTest"
      class="btn btn-primary float-right"
    >
      Submit
    </button>
  </div>
</template>
<script>
import SectionTitle from '@/utils/SectionTitle.vue';
import vSelect from 'vue-select';
import { debounce, randomId } from '@/common/common';

export default {
  components: { vSelect, SectionTitle },
  props: {
    type: {
      type: String,
      required: true,
    },
  },
  data: () => ({
    items: [
      {
        test: '',
        id: randomId(),
      },
    ],
    isDisabled: false,
  }),
  computed: {
    labTests() {
      return this.$store.state.laboratory.tests;
    },
  },
  methods: {
    searchTests(search, loading) {
      if (search.length > 2) {
        loading(true);
        this.debounceSearch(search, this, loading);
      }
    },

    debounceSearch: debounce((search, vm, loading) => {
      vm.$store
        .dispatch('laboratory/fetchTests', {
          currentPage: 1,
          itemsPerPage: vm.itemsPerPage,
          search,
        })
        .then(() => loading(false))
        .catch(() => loading(false));
    }, 500),

    addItem() {
      this.items.push({
        test: '',
        id: randomId(),
      });
    },

    removeItem(index) {
      this.items.splice(index, 1);
    },

    endRequest(button) {
      this.removeSpinner(button);
      this.initValues();
      this.$router.go(-1);
    },

    initValues() {
      this.items = [
        {
          test: '',
          id: randomId(),
        },
      ];
    },

    addSpinner(submitButton) {
      this.isDisabled = true;
      submitButton.classList.add('spinner', 'spinner-light', 'spinner-right');
    },

    removeSpinner(submitButton) {
      this.isDisabled = false;
      submitButton.classList.remove('spinner', 'spinner-light', 'spinner-right');
    },

    submitForm() {
      const submitButton = this.$refs['kt-ancRoutineTest'];
      this.addSpinner(submitButton);

      this.$store
        .dispatch('model/addDefault', {
          type: this.type,
          data: this.items,
        })
        .then(() => this.endRequest(submitButton))
        .catch(() => this.removeSpinner(submitButton));
    },
  },
};
</script>

<style scoped></style>
