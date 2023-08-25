<template>
  <div>
    <a
      v-for="(icon, i) in icons"
      :key="i"
      v-b-tooltip.hover
      :title="icon.title"
      href="#"
      :class="`btn-light-${icon.iconColor} pulse-${icon.iconColor}`"
      class="btn btn-icon pulse mr-2"
    >
      <i :class="icon.icon"></i>
      <span class="pulse-ring"></span>
    </a>
  </div>
</template>
<script>
export default {
  data: () => ({
    icons: [
      {
        title: 'General Information',
        url: '',
        icon: 'flaticon2-information',
        iconColor: 'primary',
      },
      {
        title: 'Admission Details',
        url: '',
        icon: 'fas fa-bed',
        iconColor: 'warning',
      },
      {
        title: 'Alerts',
        url: '',
        icon: 'fas fa-exclamation-triangle',
        iconColor: 'danger',
      },
      {
        title: 'Vitals',
        url: '',
        icon: 'fas fa-stethoscope',
        iconColor: 'info',
      },
    ],
  }),
};
</script>
