<template>
  <div class="table-responsive">
    <table class="table table-head-custom table-vertical-center">
      <thead>
        <tr class="text-left">
          <th v-for="column in columns" :key="column.key" class="font-weight-bold text-muted text-uppercase">
            {{ column.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in data" :key="index">
          <td v-for="column in columns" :key="column.key">
            <slot :name="column.key" :item="item" :value="item[column.key]">
              {{ formatValue(item[column.key], column.type) }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: 'DataTable',
  props: {
    columns: {
      type: Array,
      required: true
    },
    data: {
      type: Array,
      required: true
    }
  },
  methods: {
    formatValue(value, type) {
      if (!value && value !== 0) return '-'
      
      switch (type) {
        case 'currency':
          return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
          }).format(value)
        case 'number':
          return new Intl.NumberFormat().format(value)
        case 'date':
          return new Date(value).toLocaleDateString()
        case 'percentage':
          return `${value}%`
        default:
          return value
      }
    }
  }
}
</script>

<style scoped>
.table th {
  border-top: none;
  font-size: 12px;
}

.table td {
  vertical-align: middle;
}
</style>