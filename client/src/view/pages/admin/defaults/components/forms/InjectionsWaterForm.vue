<template>
  <div>
    <SectionTitle text="Injections Needing Water" />
    <div v-for="(item, i) in items" :key="i">
      <div class="form-group row">
        <div class="col-lg-6">
          <label>Item:</label>
          <v-select
            v-validate="'required'"
            data-vv-validate-on="blur"
            name="drug"
            @search="searchGenericDrugs"
            v-model="item.drug"
            label="name"
            :reduce="
              drugs => ({
                name: drugs.name,
                drug_id: drugs.id,
              })
            "
            :options="drugs"
          >
          </v-select>
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
      @click="submitForm"
      :disabled="isDisabled"
      ref="kt-injectionWaterForm"
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
  components: { SectionTitle, vSelect },
  data: () => ({
    items: [
      {
        id: randomId(),
        drug: '',
      },
    ],
    isDisabled: false,
  }),
  props: {
    type: {
      type: String,
      required: true,
    },
  },
  computed: {
    drugs() {
      return this.$store.state.pharmacy.drugs;
    },
  },
  methods: {
    searchGenericDrugs(search, loading) {
      if (search.length > 2) {
        loading(true);
        this.debounceSearch(search, this, loading);
      }
    },

    debounceSearch: debounce((search, vm, loading) => {
      vm.$store
        .dispatch('pharmacy/fetchGenericDrugs', {
          currentPage: 1,
          itemsPerPage: vm.itemsPerPage,
          search,
        })
        .then(() => loading(false))
        .catch(() => loading(false));
    }, 500),

    addItem() {
      this.items.push({
        id: randomId(),
        drug: '',
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
          id: randomId(),
          drug: '',
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
      const submitButton = this.$refs['kt-injectionWaterForm'];
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
