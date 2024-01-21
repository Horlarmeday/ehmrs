<template>
  <b-popover size="xl" :show="activePrompt" :target="target" triggers="click blur">
    <b-button @click="onClose" class="close text-danger" aria-label="Close">
      <span class="d-inline-block" aria-hidden="true">&times;</span>
    </b-button>
    <table class="table table-sm">
      <tbody>
        <tr>
          <th scope="row">Sex</th>
          <td>
            <span>{{ pregnancy.sex || '-' }}</span>
          </td>
        </tr>
        <tr>
          <th scope="row">Fate</th>
          <td>
            <span>{{ pregnancy.fate || '-' }}</span>
          </td>
        </tr>
        <tr>
          <th scope="row">Baby Type</th>
          <td>
            <span>{{ pregnancy.baby_type || '-' }}</span>
          </td>
        </tr>
        <tr>
          <th scope="row">Puerperium</th>
          <td>
            <span>{{ pregnancy.puerperium || '-' }}</span>
          </td>
        </tr>
        <tr>
          <th scope="row">Weight</th>
          <td>
            <span>{{ pregnancy.weight || '-' }}</span>
          </td>
        </tr>
      </tbody>
    </table>
  </b-popover>
</template>

<script>
export default {
  props: {
    target: {
      type: String,
      required: true,
    },
    pregnancy: {
      type: Object,
      required: true,
      default: () => {},
    },
    show: {
      type: Boolean,
      required: true,
    },
  },
  computed: {
    activePrompt: {
      get() {
        return this.show;
      },
      set(value) {
        this.$emit('closePopover', value);
      },
    },
  },
  methods: {
    onClose() {
      this.$emit('closePopover', false);
    },
  },
};
</script>

<style scoped></style>
