<template>
  <div class="action-button-group-update">
    <div class="action-buttons">
      <button class="action-btn save-btn" @click="handleSaveProgress" :disabled="isSaving">
        <span class="btn-icon">💾</span>
        <span class="btn-text">SAVE PROGRESS</span>
        <span class="btn-description">Auto-saved 2 min ago</span>
      </button>

      <button
        class="action-btn complete-btn"
        @click="handleCompleteDispense"
        :disabled="!canComplete"
      >
        <span class="btn-icon">✅</span>
        <span class="btn-text">COMPLETE DISPENSE</span>
        <span class="btn-description">Ready to complete</span>
      </button>

      <button class="action-btn history-btn" @click="handleViewHistory">
        <span class="btn-icon">📋</span>
        <span class="btn-text">HISTORY & NOTES</span>
        <span class="btn-description">View past prescriptions</span>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ActionButtonGroupUpdate',
  props: {
    prescription: {
      type: Object,
      default: () => ({}),
    },
    prescriptions: {
      type: Array,
      default: () => [],
    },
    items: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      isSaving: false,
    };
  },
  computed: {
    canComplete() {
      // Check if all drugs and items are dispensed
      const allDrugsDispensed = this.prescriptions.every((p) => p.dispense_status === 'Dispensed');
      const allItemsDispensed = this.items.every((i) => i.dispense_status === 'Dispensed');
      return allDrugsDispensed && allItemsDispensed;
    },

    canPrint() {
      // Can print if there's at least one item to dispense
      return this.prescriptions.length > 0 || this.items.length > 0;
    },

    completionStatus() {
      const totalItems = this.prescriptions.length + this.items.length;
      const completedItems =
        this.prescriptions.filter((p) => p.dispense_status === 'Dispensed').length +
        this.items.filter((i) => i.dispense_status === 'Dispensed').length;

      if (totalItems === 0) return { text: 'No items', percentage: 0 };
      if (completedItems === totalItems) return { text: 'All completed', percentage: 100 };

      return {
        text: `${completedItems}/${totalItems} completed`,
        percentage: Math.round((completedItems / totalItems) * 100),
      };
    },
  },
  methods: {
    async handleSaveProgress() {
      if (this.isSaving) return;

      this.isSaving = true;

      try {
        // Emit save event to parent
        this.$emit('save-progress', {
          prescription: this.prescription,
          prescriptions: this.prescriptions,
          items: this.items,
        });

        // Show success feedback
        this.showToast('Progress saved successfully', 'success');

        // Simulate auto-save delay
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        this.showToast('Failed to save progress', 'error');
        console.error('Save error:', error);
      } finally {
        this.isSaving = false;
      }
    },

    handleCompleteDispense() {
      if (!this.canComplete) return;

      // Emit complete event to parent
      this.$emit('complete-dispense', {
        prescription: this.prescription,
        prescriptions: this.prescriptions,
        items: this.items,
      });

      this.showToast('Dispense completed successfully', 'success');
    },

    handlePrintReceipt() {
      if (!this.canPrint) return;

      // Emit print event to parent
      this.$emit('print-receipt', {
        prescription: this.prescription,
        prescriptions: this.prescriptions,
        items: this.items,
      });

      this.showToast('Printing receipt...', 'info');
    },

    handleViewHistory() {
      // Emit history event to parent
      this.$emit('view-history', {
        prescription: this.prescription,
        visitId: this.prescription?.visit_id,
      });

      this.showToast('Opening history...', 'info');
    },

    showToast(message, type = 'info') {
      // This would integrate with your toast notification system
      // For now, we'll just log it
      console.log(`Toast [${type}]:`, message);

      // If you have a toast system, you could call it here:
      // this.$bvToast.toast(message, {
      //   title: type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Info',
      //   variant: type,
      //   solid: true,
      // });
    },
  },
};
</script>

<style scoped>
.action-button-group-update {
  width: 100%;
}

.action-buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1.5rem 1rem;
  border: none;
  border-radius: 1rem;
  font-weight: 700;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  position: relative;
  overflow: hidden;
  min-height: 120px;
  justify-content: center;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.action-btn:not(:disabled):hover {
  transform: translateY(-4px);
}

.action-btn:not(:disabled):active {
  transform: translateY(-2px);
}

/* Button Icons */
.btn-icon {
  font-size: 2rem;
  margin-bottom: 0.25rem;
  display: block;
}

.btn-text {
  font-size: 0.875rem;
  font-weight: 800;
  text-align: center;
  line-height: 1.2;
  margin-bottom: 0.25rem;
}

.btn-description {
  font-size: 0.75rem;
  font-weight: 500;
  text-align: center;
  opacity: 0.8;
  line-height: 1.2;
}

/* Save Button */
.save-btn {
  background: linear-gradient(135deg, #000080 0%, #191970 100%);
  color: white;
  box-shadow: 0 4px 14px 0 rgba(0, 0, 128, 0.3);
}

.save-btn:not(:disabled):hover {
  background: linear-gradient(135deg, #191970 0%, #000080 100%);
  box-shadow: 0 8px 25px 0 rgba(0, 0, 128, 0.4);
}

.save-btn:not(:disabled):active {
  box-shadow: 0 4px 14px 0 rgba(0, 0, 128, 0.3);
}

/* Complete Button */
.complete-btn {
  background: linear-gradient(135deg, #006400 0%, #228b22 100%);
  color: white;
  box-shadow: 0 4px 14px 0 rgba(0, 100, 0, 0.3);
}

.complete-btn:not(:disabled):hover {
  background: linear-gradient(135deg, #228b22 0%, #006400 100%);
  box-shadow: 0 8px 25px 0 rgba(0, 100, 0, 0.4);
}

.complete-btn:not(:disabled):active {
  box-shadow: 0 4px 14px 0 rgba(0, 100, 0, 0.3);
}

.complete-btn:disabled {
  background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
  box-shadow: 0 4px 14px 0 rgba(156, 163, 175, 0.3);
}

/* Print Button */
.print-btn {
  background: linear-gradient(135deg, #000080 0%, #191970 100%);
  color: white;
  box-shadow: 0 4px 14px 0 rgba(0, 0, 128, 0.3);
}

.print-btn:not(:disabled):hover {
  background: linear-gradient(135deg, #191970 0%, #000080 100%);
  box-shadow: 0 8px 25px 0 rgba(0, 0, 128, 0.4);
}

.print-btn:not(:disabled):active {
  box-shadow: 0 4px 14px 0 rgba(0, 0, 128, 0.3);
}

.print-btn:disabled {
  background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
  box-shadow: 0 4px 14px 0 rgba(156, 163, 175, 0.3);
}

/* History Button */
.history-btn {
  background: linear-gradient(135deg, #8b0000 0%, #a0522d 100%);
  color: white;
  box-shadow: 0 4px 14px 0 rgba(139, 0, 0, 0.3);
}

.history-btn:not(:disabled):hover {
  background: linear-gradient(135deg, #a0522d 0%, #8b0000 100%);
  box-shadow: 0 8px 25px 0 rgba(139, 0, 0, 0.4);
}

.history-btn:not(:disabled):active {
  box-shadow: 0 4px 14px 0 rgba(139, 0, 0, 0.3);
}

/* Loading State */
.action-btn.loading {
  position: relative;
  color: transparent;
}

.action-btn.loading::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 1.5rem;
  height: 1.5rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  100% {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

/* Ripple Effect */
.action-btn:not(:disabled)::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.action-btn:not(:disabled):active::before {
  width: 300px;
  height: 300px;
}

/* Focus States for Accessibility */
.action-btn:focus {
  outline: 2px solid #8b0000;
  outline-offset: 2px;
}

/* High Contrast Mode Support */
@media (prefers-contrast: high) {
  .action-btn {
    border: 2px solid currentColor;
  }
}

/* Reduced Motion Support */
@media (prefers-reduced-motion: reduce) {
  .action-btn {
    transition: none;
  }

  .action-btn:not(:disabled):hover {
    transform: none;
  }

  .action-btn:not(:disabled):active {
    transform: none;
  }

  .action-btn.loading::after {
    animation: none;
  }

  .action-btn:not(:disabled)::before {
    transition: none;
  }
}

/* Responsive Design */
@media (max-width: 1024px) {
  .action-buttons {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .action-buttons {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .action-btn {
    min-height: 100px;
    padding: 1rem 0.75rem;
  }

  .btn-icon {
    font-size: 1.5rem;
  }

  .btn-text {
    font-size: 0.75rem;
  }

  .btn-description {
    font-size: 0.625rem;
  }
}

@media (max-width: 480px) {
  .action-btn {
    min-height: 80px;
    padding: 0.75rem 0.5rem;
  }

  .btn-icon {
    font-size: 1.25rem;
  }

  .btn-text {
    font-size: 0.625rem;
  }

  .btn-description {
    display: none;
  }
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
  .action-btn {
    box-shadow: 0 4px 14px 0 rgba(0, 0, 0, 0.3);
  }

  .action-btn:not(:disabled):hover {
    box-shadow: 0 8px 25px 0 rgba(0, 0, 0, 0.4);
  }
}
</style>
