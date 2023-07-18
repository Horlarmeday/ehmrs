<template>
  <div class="table-responsive">
    <table class="table table-head-custom table-vertical-center" id="kt_advance_table_widget_1">
      <thead>
        <tr class="text-left">
          <th class="pl-0" style="width: 20px">
            <label class="checkbox checkbox-md checkbox-inline">
              <input type="checkbox" />
              <span></span>
            </label>
          </th>
          <th class="pr-0" style="width: 300px">Name</th>
          <th style="min-width: 150px">Quantity Remaining</th>
          <th style="min-width: 50px">Shelf</th>
          <th style="min-width: 100px">Dosage Form</th>
          <th style="min-width: 50px">Strength/Volume</th>
          <th style="min-width: 150px">Date Created</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td colspan="7" align="center">
            <!-- Skeleton loader -->
            <div class="skeleton-loader">
              <div class="skeleton-line"></div>
              <div class="skeleton-line"></div>
              <div class="skeleton-line"></div>
              <div class="skeleton-line"></div>
              <div class="skeleton-line"></div>
              <div class="skeleton-line"></div>
              <div class="skeleton-line"></div>
              <!-- Add more skeleton lines for each row -->
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style>
/* Add styling for skeleton loader */
.skeleton-loader {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  height: 20px;
}

.skeleton-line {
  background-color: #f1f1f1;
  height: 100%;
  width: 100%;
}
</style>
