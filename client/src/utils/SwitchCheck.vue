<template>
  <div class="body-switch">
    <div class="switch-container">
      <input type="checkbox" id="switch" class="switch-input" />
      <label for="switch" class="switch-label">
        <span class="switch-text">ON</span>
        <span class="switch-handle"></span>
        <span class="switch-text">OFF</span>
      </label>
    </div>
  </div>
</template>
<script>
export default {};
</script>

<style scoped>
.body-switch {
  font-family: Arial, sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f0f0;
  margin: 0;
}

.switch-container {
  position: relative;
}

.switch-input {
  display: none;
}

.switch-label {
  cursor: pointer;
  user-select: none;
  padding: 4px;
  display: flex;
  align-items: center;
  border-radius: 20px;
  background-color: #dddddd;
  position: relative;
}

.switch-text {
  padding: 0 8px;
}

.switch-handle {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease;
}

.switch-input:checked + .switch-label .switch-handle {
  transform: translateX(24px);
}

.switch-input:checked + .switch-label .switch-text:nth-child(1) {
  opacity: 0;
}

.switch-input:checked + .switch-label .switch-text:nth-child(3) {
  opacity: 1;
}

.switch-text {
  transition: opacity 0.3s ease;
}
</style>
