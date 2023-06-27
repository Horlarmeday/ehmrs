<template>
  <div class="text-center">
    <div class="empty-card">
      <span class="card-icon" @click="addNewData">&#x2B;</span>
      <span class="card-text"
        >There are no inventories, kindly click on the plus icon to create one.</span
      >
    </div>
  </div>
</template>

<script>
export default {
  name: 'EmptyDataCard',
  methods: {
    addNewData() {
      this.$emit('addData', true);
    },
  },
};
</script>

<style scoped>
.empty-card {
  height: 300px;
  background-color: #f2f2f2;
  border: 1px dashed #999999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.card-icon {
  font-size: 58px;
  color: #999999;
  cursor: pointer;
}

.card-text {
  font-size: 18px;
  color: #333333;
  margin-top: 10px;
}
</style>
