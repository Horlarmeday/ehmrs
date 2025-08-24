<template>
  <div class="card card-custom gutter-b">
    <div class="card-header py-5">
      <h3 class="card-title align-items-start flex-column">
        <span class="card-label font-weight-bolder text-dark">Account Management</span>
      </h3>
    </div>
    <div class="card-body">
      <div class="row">
        <div
          v-for="item in accountDashboardItems"
          :key="item.title"
          class="col-12 col-sm-6 col-md-4 col-lg-3 mb-4"
        >
          <router-link :to="item.route" class="text-decoration-none">
            <div class="card h-100 dashboard-card" :class="`bg-${item.color}`">
              <div class="card-body text-white">
                <div class="d-flex align-items-center mb-3">
                  <i :class="item.icon" class="mr-3 fa-2x"></i>
                  <h5 class="card-title mb-0">{{ item.title }}</h5>
                </div>
                <p class="card-text">{{ item.description }}</p>
              </div>
            </div>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { accountDashboardItems } from './dashboardItems';

export default {
  name: 'AccountHome',
  data: () => ({
    accountDashboardItems,
  }),
};
</script>

<style scoped>
.dashboard-card {
  transition: transform 0.2s;
}
.dashboard-card:hover {
  transform: translateY(-5px);
}
</style>
