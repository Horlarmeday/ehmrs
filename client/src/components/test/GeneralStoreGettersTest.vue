<template>
  <div class="getters-test">
    <h3>General Store Getters Test</h3>
    
    <!-- Test filtered categories -->
    <div class="test-section">
      <h4>Filtered Categories ({{ filteredCategories.length }})</h4>
      <ul v-if="filteredCategories.length">
        <li v-for="category in filteredCategories.slice(0, 3)" :key="category.id">
          {{ category.name }}
        </li>
      </ul>
      <p v-else>No categories found</p>
    </div>

    <!-- Test loading states -->
    <div class="test-section">
      <h4>Loading States</h4>
      <p>Categories Loading: {{ isCategoriesLoading }}</p>
      <p>Items Loading: {{ isItemsLoading }}</p>
      <p>Any Loading: {{ isAnyLoading }}</p>
    </div>

    <!-- Test derived calculations -->
    <div class="test-section">
      <h4>Derived Data</h4>
      <p>Total Categories: {{ totalCategories }}</p>
      <p>Total Items: {{ totalItems }}</p>
      <p>Low Stock Items: {{ lowStockItemsCount }}</p>
    </div>

    <!-- Test entity getters -->
    <div class="test-section">
      <h4>Entity Getters</h4>
      <p>Get Category by ID (1): {{ getCategoryById(1) ? getCategoryById(1).name : 'Not found' }}</p>
      <p>Get Item by ID (1): {{ getItemById(1) ? getItemById(1).name : 'Not found' }}</p>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';

export default {
  name: 'GeneralStoreGettersTest',
  computed: {
    ...mapState('generalStore', ['categories', 'items']),
    ...mapGetters('generalStore', [
      'filteredCategories',
      'filteredSubcategories', 
      'filteredItems',
      'isCategoriesLoading',
      'isSubcategoriesLoading',
      'isItemsLoading',
      'isMovementsLoading',
      'isRequestsLoading',
      'isAnyLoading',
      'totalCategories',
      'totalSubcategories',
      'totalItems',
      'totalMovements',
      'totalRequests',
      'lowStockItemsCount',
      'expiringItemsCount',
      'getCategoryById',
      'getSubcategoryById',
      'getItemById',
      'getMovementById',
      'getRequestById'
    ])
  },
  mounted() {
    console.log('GeneralStore Getters Test Component Mounted');
    console.log('Available getters:', this.$store.getters);
    console.log('GeneralStore state:', this.$store.state.generalStore);
  }
};
</script>

<style scoped>
.getters-test {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.test-section {
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background-color: #f9f9f9;
}

.test-section h4 {
  margin-top: 0;
  color: #333;
}

.test-section ul {
  margin: 10px 0;
  padding-left: 20px;
}

.test-section p {
  margin: 5px 0;
}
</style>