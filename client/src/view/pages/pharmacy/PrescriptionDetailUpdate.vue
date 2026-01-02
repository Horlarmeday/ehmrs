<template>
  <div class="prescription-detail-update">
    <!-- Hero Section & Patient Overview -->
    <div class="hero-section">
      <div class="hero-header">
        <div class="brand-section">
          <h1 class="brand-title">🏥 EHRS</h1>
          <h2 class="page-title">✨ Prescription Dispensing</h2>
        </div>
        <div class="header-actions">
          <button
            class="history-btn"
            @click="showModal"
            v-b-tooltip.hover
            title="View Past Prescriptions"
          >
            <span class="btn-icon">📋</span>
            <span class="btn-text">Past Prescriptions</span>
          </button>
          <div class="user-info">
            <span class="doctor-name">👤{{ prescription?.examiner?.fullname }}</span>
          </div>
        </div>
      </div>

      <!-- Patient Spotlight Card -->
      <div class="patient-spotlight-card">
        <div class="patient-header">
          <h3 class="spotlight-title">🌟 PATIENT SPOTLIGHT</h3>
        </div>
        <div class="patient-content">
          <div class="patient-photo-section">
            <div class="patient-photo">
              <span class="photo-placeholder">📸</span>
            </div>
          </div>
          <div class="patient-details">
            <div class="patient-name-section">
              <h2 class="patient-name">{{ prescription?.patient?.fullname || 'Loading...' }}</h2>
              <div class="patient-badges">
                <span class="age-badge"
                  >🎂 {{ prescription?.patient.date_of_birth | dayjs('from', 'now', true) }}</span
                >
                <span class="gender-badge"
                  >♂️ {{ prescription?.patient?.gender || 'Unknown' }}</span
                >
              </div>
            </div>
            <div class="patient-info-grid">
              <div class="info-item">
                <span class="info-label">🆔 Patient ID</span>
                <span class="info-value">{{
                  prescription?.patient?.hospital_id || 'Loading...'
                }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">📞 Phone</span>
                <span class="info-value">{{ prescription?.patient?.phone || 'Not provided' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">🏠 Address</span>
                <span class="info-value">{{
                  prescription?.patient?.address || 'Not provided'
                }}</span>
              </div>
            </div>
            <div class="patient-status-section">
              <div v-if="!isEmpty(prescription?.insurance)" class="insurance-status">
                <h4 class="status-title">🏥 INSURANCE STATUS</h4>
                <div class="status-card active">
                  <div class="status-icon">✅</div>
                  <div class="status-content">
                    <div class="status-main">
                      {{ prescription.insurance?.insurance?.name || 'Insurance Active' }}
                    </div>
                    <div class="status-details" v-if="prescription?.insurance?.hmo">
                      HMO: {{ prescription.insurance?.hmo.name }}
                    </div>
                    <div class="status-plan">Coverage Available</div>
                  </div>
                </div>
              </div>
              <div v-else class="insurance-status">
                <h4 class="status-title">💳 PAYMENT METHOD</h4>
                <div class="status-card">
                  <div class="status-icon">💰</div>
                  <div class="status-content">
                    <div class="status-main">Cash Payment</div>
                    <div class="status-details">No insurance coverage</div>
                    <div class="status-plan">Full payment required</div>
                  </div>
                </div>
              </div>
              <div class="payment-method">
                <h4 class="status-title">💰 TOTAL ESTIMATED</h4>
                <div class="payment-card">
                  <div class="payment-icon">💳</div>
                  <div class="payment-content">
                    <div class="payment-main">
                      ₦{{ formatCurrency(totalDrugsPrice + totalItemsPrice) }}
                    </div>
                    <div class="payment-details">
                      {{
                        !isEmpty(prescription?.insurance)
                          ? 'NHIS Coverage Available'
                          : 'Full Cash Payment'
                      }}
                    </div>
                    <div class="payment-note">
                      {{
                        !isEmpty(prescription?.insurance)
                          ? '90% covered + 10% cash'
                          : '100% cash payment'
                      }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Dashboard Cards Section -->
    <div class="dashboard-section">
      <h3 class="section-title">📊 PRESCRIPTION OVERVIEW</h3>
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-icon">💊</div>
          <div class="metric-content">
            <div class="metric-label">TOTAL DRUGS</div>
            <div class="metric-value">{{ prescriptions?.length || 0 }}</div>
            <div class="metric-description">
              Prescribed by {{ prescription?.examiner?.fullname }}
            </div>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-icon">📦</div>
          <div class="metric-content">
            <div class="metric-label">ADDITIONAL ITEMS</div>
            <div class="metric-value">{{ items?.length || 0 }}</div>
            <div class="metric-description">Medical supplies & equipment</div>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-icon">💰</div>
          <div class="metric-content">
            <div class="metric-label">TOTAL VALUE</div>
            <div class="metric-value">
              ₦{{ formatCurrency(totalDrugsPrice + totalItemsPrice || 0) }}
            </div>
            <div class="metric-description">
              {{
                !isEmpty(prescription?.insurance)
                  ? 'NHIS Coverage 90% + 10% cash'
                  : 'Full Cash Payment'
              }}
            </div>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-icon">📅</div>
          <div class="metric-content">
            <div class="metric-label">DATE PRESCRIBED</div>
            <div class="metric-value">{{ formatDate(prescription?.createdAt) }}</div>
            <div class="metric-description">by {{ prescription?.examiner?.fullname }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="main-content">
      <div class="content-left">
        <!-- Tab Navigation -->
        <div class="tab-navigation">
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'drugs' }"
            @click="activeTab = 'drugs'"
          >
            <span class="tab-icon">💊</span>
            <span class="tab-text">Drugs ({{ prescriptions?.length || 0 }})</span>
          </button>
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'items' }"
            @click="activeTab = 'items'"
            v-if="items?.length"
          >
            <span class="tab-icon">📦</span>
            <span class="tab-text">Additional Items ({{ items?.length || 0 }})</span>
          </button>
        </div>

        <!-- Drug Dispensing Section -->
        <div v-show="activeTab === 'drugs'" class="dispensing-section">
          <div class="section-header">
            <h3 class="section-title">💊 DRUG DISPENSING CENTER</h3>
            <div class="section-actions">
              <div class="search-box">
                <input
                  type="text"
                  placeholder="🔍 Search drugs..."
                  class="search-input"
                  v-model="drugSearchTerm"
                />
              </div>
              <div class="filter-dropdown">
                <select class="filter-select" v-model="drugFilterStatus">
                  <option value="">📊 All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Dispensed">Dispensed</option>
                  <option value="Partial">Partially Dispensed</option>
                </select>
              </div>
            </div>
          </div>

          <div class="cards-container">
            <DrugDispenseCardUpdate
              v-for="(prescription, index) in filteredDrugs"
              :key="`drug-${index}`"
              :prescription="prescription"
              :index="index"
              @dispense-drug="handleDispenseDrug"
              @return-drug="handleReturnDrug"
            />
          </div>
        </div>

        <!-- Additional Items Section -->
        <div v-show="activeTab === 'items'" class="dispensing-section" v-if="items?.length">
          <div class="section-header">
            <h3 class="section-title">📦 ADDITIONAL MEDICAL ITEMS</h3>
            <div class="section-actions">
              <div class="search-box">
                <input
                  type="text"
                  placeholder="🔍 Search items..."
                  class="search-input"
                  v-model="itemSearchTerm"
                />
              </div>
              <div class="filter-dropdown">
                <select class="filter-select" v-model="itemFilterStatus">
                  <option value="">📊 All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Dispensed">Dispensed</option>
                  <option value="Partial">Partially Dispensed</option>
                </select>
              </div>
            </div>
          </div>

          <div class="cards-container">
            <AdditionalItemCardUpdate
              v-for="(item, index) in filteredItems"
              :key="`item-${index}`"
              :item="item"
              :index="index"
              @dispense-item="handleDispenseItem"
              @return-item="handleReturnItem"
            />
          </div>
        </div>
      </div>

      <!-- Right Sidebar -->
      <div class="content-right">
        <PricingSummaryCardUpdate
          :total-drugs-price="totalDrugsPrice"
          :total-items-price="totalItemsPrice"
          :nhis-ten-percent="nhis10PercentDrugsPrice"
          :nhis-ninety-percent="nhis90PercentDrugsPrice"
          :prescription="prescription"
        />
      </div>
    </div>

    <!-- History Modal -->
    <history-modal :visit-id="visitId" :display-prompt="displayPrompt" @closeModal="hideModal" />

    <!-- Loading State -->
    <prescription-skeleton v-if="!prescription" title="Dispense Drug" />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { isEmpty } from '@/common/common';
import HistoryModal from '@/view/pages/pharmacy/history/HistoryModal.vue';
import PrescriptionSkeleton from '@/view/pages/pharmacy/components/skeleton/PrescriptionSkeleton.vue';

// Import new components
import DrugDispenseCardUpdate from '@/view/pages/pharmacy/components/prescriptionUpdate/DrugDispenseCardUpdate.vue';
import AdditionalItemCardUpdate from '@/view/pages/pharmacy/components/prescriptionUpdate/AdditionalItemCardUpdate.vue';
import PricingSummaryCardUpdate from '@/view/pages/pharmacy/components/prescriptionUpdate/PricingSummaryCardUpdate.vue';

export default {
  name: 'PrescriptionDetailUpdate',
  components: {
    HistoryModal,
    PrescriptionSkeleton,
    DrugDispenseCardUpdate,
    AdditionalItemCardUpdate,
    PricingSummaryCardUpdate,
  },
  data: () => ({
    prescriptions: [],
    items: [],
    COMPLETE_DISPENSE: 'Complete Dispense',
    showHistory: false,
    displayPrompt: false,
    activeTab: 'drugs',
    drugSearchTerm: '',
    drugFilterStatus: '',
    itemSearchTerm: '',
    itemFilterStatus: '',
  }),
  computed: {
    ...mapState('pharmacy', ['prescription']),

    prescriptionKey() {
      return this.$route.params.id + Date.now();
    },

    visitId() {
      return this.prescription?.visit_id || 0;
    },

    totalDrugsPrice() {
      if (!this.prescription?.drugs) return 0;
      const totalPrice = this.prescription.drugs.map((pres) => pres.total_price);
      return totalPrice.reduce((acc, cur) => acc + +cur, 0);
    },

    totalItemsPrice() {
      if (!this.prescription?.items) return 0;
      const totalPrice = this.prescription.items.map((pres) => pres.total_price);
      return totalPrice.reduce((acc, cur) => acc + +cur, 0);
    },

    nhisMappedTotalPrice() {
      if (!this.prescription?.drugs) return [];
      return this.prescription.drugs
        ?.filter((drug) => drug?.drug_type === 'NHIS')
        .map((pres) => pres.total_price);
    },

    nhis90PercentDrugsPrice() {
      const mappedTotal10PercentPrice = this.nhisMappedTotalPrice.reduce(
        (acc, cur) => acc + +cur,
        0
      );
      const totalActualPrice = mappedTotal10PercentPrice / 0.1;
      const sum = totalActualPrice * 0.9;
      console.log(sum, 'sum');
      return sum;
    },

    nhis10PercentDrugsPrice() {
      return this.nhisMappedTotalPrice.reduce((acc, cur) => acc + +cur, 0);
    },

    insuranceStatusClass() {
      return this.prescription?.insurance ? 'active' : 'inactive';
    },

    completedCount() {
      const drugsCompleted =
        this.prescriptions?.filter((p) => p.dispense_status === 'Dispensed').length || 0;
      const itemsCompleted =
        this.items?.filter((i) => i.dispense_status === 'Dispensed').length || 0;
      return drugsCompleted + itemsCompleted;
    },

    pendingCount() {
      const drugsPending =
        this.prescriptions?.filter((p) => p.dispense_status !== 'Dispensed').length || 0;
      const itemsPending = this.items?.filter((i) => i.dispense_status !== 'Dispensed').length || 0;
      return drugsPending + itemsPending;
    },

    filteredDrugs() {
      let filtered = this.prescriptions || [];

      // Filter by search term
      if (this.drugSearchTerm) {
        filtered = filtered.filter((drug) =>
          drug.drug_name.toLowerCase().includes(this.drugSearchTerm.toLowerCase())
        );
      }

      // Filter by status
      if (this.drugFilterStatus) {
        filtered = filtered.filter((drug) => drug.dispense_status === this.drugFilterStatus);
      }

      return filtered;
    },

    filteredItems() {
      let filtered = this.items || [];

      // Filter by search term
      if (this.itemSearchTerm) {
        filtered = filtered.filter((item) =>
          item.item_name.toLowerCase().includes(this.itemSearchTerm.toLowerCase())
        );
      }

      // Filter by status
      if (this.itemFilterStatus) {
        filtered = filtered.filter((item) => item.dispense_status === this.itemFilterStatus);
      }

      return filtered;
    },
  },
  methods: {
    isEmpty,
    formatCurrency(amount) {
      if (typeof amount !== 'number') return '0.00';
      return amount.toLocaleString('en-NG', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    },
    hideModal() {
      this.displayPrompt = false;
    },
    showModal() {
      this.displayPrompt = true;
    },
    formatDate(dateString) {
      if (!dateString) return 'Unknown';
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    },

    canComplete() {
      // Check if all drugs and items are dispensed
      const allDrugsDispensed = this.prescriptions.every((p) => p.dispense_status === 'Dispensed');
      const allItemsDispensed = this.items.every((i) => i.dispense_status === 'Dispensed');
      return allDrugsDispensed && allItemsDispensed;
    },

    handleSaveProgress() {
      // Emit save event or handle save logic
      this.$bvToast.toast('Progress saved successfully', {
        title: 'Success',
        variant: 'success',
        solid: true,
      });
    },

    handleCompleteDispense() {
      if (!this.canComplete) return;

      // Emit complete event or handle complete logic
      this.$bvToast.toast('Dispense completed successfully', {
        title: 'Success',
        variant: 'success',
        solid: true,
      });
    },

    // Dispense drug handler
    handleDispenseDrug(event) {
      const { prescription, index, quantity } = event;
      const obj = {
        prescription_id: prescription.id,
        quantity_to_dispense: quantity,
      };

      this.$store
        .dispatch('pharmacy/dispenseDrug', { id: this.$route.params.id, data: obj })
        .then(() => {
          this.$bvToast.toast('Drug dispensed successfully', {
            title: 'Success',
            variant: 'success',
            solid: true,
          });
          this.fetchPrescription();
        })
        .catch((error) => {
          this.$bvToast.toast('Failed to dispense drug', {
            title: 'Error',
            variant: 'danger',
            solid: true,
          });
          console.error('Dispense error:', error, index);
        });
    },

    // Return drug handler
    handleReturnDrug(event) {
      const { prescription, index, quantity, reason } = event;
      const obj = {
        prescription_id: prescription.id,
        quantity_to_return: quantity,
        reason_for_return: reason,
      };

      this.$store
        .dispatch('pharmacy/returnDrug', { id: this.$route.params.id, data: obj })
        .then(() => {
          this.$bvToast.toast('Drug returned successfully', {
            title: 'Success',
            variant: 'success',
            solid: true,
          });
          this.fetchPrescription();
        })
        .catch((error) => {
          this.$bvToast.toast('Failed to return drug', {
            title: 'Error',
            variant: 'danger',
            solid: true,
          });
          console.error('Return error:', error, index);
        });
    },

    // Dispense item handler
    handleDispenseItem(event) {
      const { item, index, quantity } = event;
      const obj = {
        additional_item_id: item.id,
        quantity_to_dispense: quantity,
      };

      this.$store
        .dispatch('pharmacy/dispenseDrug', { id: this.$route.params.id, data: obj })
        .then(() => {
          this.$bvToast.toast('Item dispensed successfully', {
            title: 'Success',
            variant: 'success',
            solid: true,
          });
          this.fetchPrescription();
        })
        .catch((error) => {
          this.$bvToast.toast('Failed to dispense item', {
            title: 'Error',
            variant: 'danger',
            solid: true,
          });
          console.error('Dispense error:', error, index);
        });
    },

    // Return item handler
    handleReturnItem(event) {
      const { item, index, quantity, reason } = event;
      const obj = {
        additional_item_id: item.id,
        quantity_to_return: quantity,
        reason_for_return: reason,
      };

      this.$store
        .dispatch('pharmacy/returnDrug', { id: this.$route.params.id, data: obj })
        .then(() => {
          this.$bvToast.toast('Item returned successfully', {
            title: 'Success',
            variant: 'success',
            solid: true,
          });
          this.fetchPrescription();
        })
        .catch((error) => {
          this.$bvToast.toast('Failed to return item', {
            title: 'Error',
            variant: 'danger',
            solid: true,
          });
          console.error('Return error:', error, index);
        });
    },

    fetchPrescription() {
      this.$store.dispatch('pharmacy/fetchOnePrescription', this.$route.params.id);
    },
  },
  watch: {
    prescription(val) {
      if (!val) return;

      this.prescriptions =
        val.drugs?.map((drug) => ({
          id: drug.id,
          drug_name: drug.drug.name,
          drug_type: drug.drug_type,
          quantity_to_dispense: drug.quantity_to_dispense,
          quantity_remaining_to_dispense: drug.quantity_to_dispense - drug.quantity_dispensed,
          quantity_remaining_to_return: drug.quantity_to_dispense - drug.quantity_returned,
          quantity_to_return:
            drug.quantity_to_dispense - drug.quantity_dispensed || drug.quantity_to_dispense,
          quantity_remaining: drug.quantity_to_dispense - drug.quantity_dispensed,
          dosage_form: drug?.dosage_form?.name,
          strength: drug?.strength?.name,
          quantity_prescribed: drug.quantity_to_dispense,
          route: drug?.route?.name,
          prescribed_strength: drug.prescribed_strength,
          duration: drug.duration,
          duration_unit: drug.duration_unit,
          total_price: drug.total_price,
          quantity: drug.quantity_prescribed,
          start_date: drug.start_date,
          frequency: drug.frequency,
          date_prescribed: drug.date_prescribed,
          date_dispensed: drug.date_dispensed,
          notes: drug.notes,
          dispense_status: drug.dispense_status,
          disabledReturn: val.status === this.COMPLETE_DISPENSE,
          payment_status: drug.payment_status,
          reason_for_return: drug.reason_for_return,
          staff: drug.requester,
          dispenser: drug?.dispenser,
          shouldDisableDispense:
            drug.quantity_dispensed === drug.quantity_to_dispense ||
            drug.quantity_returned === drug.quantity_to_dispense,
        })) || [];

      this.items =
        val.items?.map((item) => ({
          id: item.id,
          item_name: item.drug.name,
          drug_type: item.drug_type,
          quantity_to_dispense: item.quantity_to_dispense,
          quantity_remaining_to_dispense: item.quantity_to_dispense - item.quantity_dispensed,
          quantity_remaining_to_return: item.quantity_to_dispense - item.quantity_returned,
          quantity_to_return:
            item.quantity_to_dispense - item.quantity_dispensed || item.quantity_to_dispense,
          quantity_remaining: item.quantity_to_dispense - item.quantity_dispensed,
          payment_status: item.payment_status,
          dispense_status: item.dispense_status,
          date_prescribed: item.date_prescribed,
          date_dispensed: item.date_dispensed,
          unit: item.unit.name,
          total_price: item.total_price,
          reason_for_return: item.reason_for_return,
          disabledReturn: val.status === this.COMPLETE_DISPENSE,
          staff: item.requester,
          dispenser: item?.dispenser,
          shouldDisableDispense:
            item.quantity_dispensed === item.quantity_to_dispense ||
            item.quantity_returned === item.quantity_to_dispense,
        })) || [];

      // Set active tab based on available data
      const hasPrescriptions = this.prescriptions && this.prescriptions.length > 0;
      const hasItems = this.items && this.items.length > 0;

      if (!hasPrescriptions && hasItems) {
        // No prescriptions but items exist → show items tab
        this.activeTab = 'items';
      } else if (hasPrescriptions && !hasItems) {
        // Prescriptions exist but no items → show drugs tab
        this.activeTab = 'drugs';
      } else if (hasPrescriptions && hasItems) {
        // Both exist → default to drugs tab (can be switched)
        this.activeTab = 'drugs';
      }
    },
  },
  created() {
    this.$store.dispatch('pharmacy/fetchOnePrescription', this.$route.params.id);
  },
};
</script>

<style scoped>
.prescription-detail-update {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 2rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Hero Section */
.hero-section {
  margin-bottom: 2rem;
}

.hero-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 0 1rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.history-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 14px 0 rgba(139, 92, 246, 0.3);
}

.history-btn:hover {
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px 0 rgba(139, 92, 246, 0.4);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.75rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 14px 0 rgba(0, 0, 0, 0.1);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.action-btn:not(:disabled):hover {
  transform: translateY(-1px);
}

.save-btn {
  background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
  color: white;
}

.save-btn:not(:disabled):hover {
  background: linear-gradient(135deg, #4b5563 0%, #374151 100%);
  box-shadow: 0 6px 20px 0 rgba(107, 114, 128, 0.4);
}

.complete-btn {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.complete-btn:not(:disabled):hover {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  box-shadow: 0 6px 20px 0 rgba(16, 185, 129, 0.4);
}

.complete-btn:disabled {
  background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
}

.btn-icon {
  font-size: 1rem;
}

.btn-text {
  font-weight: 600;
}

.brand-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.brand-title {
  font-size: 2rem;
  font-weight: 800;
  color: #1f2937;
  margin: 0;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #6b7280;
  margin: 0;
}

.doctor-name {
  font-size: 1rem;
  font-weight: 500;
  color: #374151;
  background: #f3f4f6;
  padding: 0.5rem 1rem;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
}

/* Patient Spotlight Card */
.patient-spotlight-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 1.5rem;
  padding: 2rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border: 1px solid #e5e7eb;
}

.spotlight-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  text-align: center;
  margin-bottom: 1.5rem;
  letter-spacing: 0.05em;
}

.patient-content {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
}

.patient-photo-section {
  flex-shrink: 0;
}

.patient-photo {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.3);
}

.photo-placeholder {
  font-size: 2rem;
  color: white;
}

.patient-details {
  flex: 1;
}

.patient-name-section {
  margin-bottom: 1.5rem;
}

.patient-name {
  font-size: 2rem;
  font-weight: 800;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
  line-height: 1.2;
}

.patient-badges {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.age-badge,
.gender-badge {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
}

.patient-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
}

.info-value {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
}

.patient-status-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.status-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-card,
.payment-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.status-card.active {
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  border-color: #10b981;
}

.status-icon,
.payment-icon {
  font-size: 1.5rem;
}

.status-content,
.payment-content {
  flex: 1;
}

.status-main,
.payment-main {
  font-size: 1rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.status-details,
.payment-details {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.125rem;
}

.status-plan,
.payment-note {
  font-size: 0.75rem;
  color: #9ca3af;
}

/* Dashboard Section */
.dashboard-section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1.5rem;
  text-align: center;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.metric-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.metric-icon {
  font-size: 2rem;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.metric-content {
  flex: 1;
}

.metric-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.metric-value {
  font-size: 1.875rem;
  font-weight: 800;
  color: #1f2937;
  margin-bottom: 0.25rem;
  line-height: 1;
}

.metric-description {
  font-size: 0.75rem;
  color: #9ca3af;
  line-height: 1.4;
}

/* Main Content */
.main-content {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;
  margin-bottom: 2rem;
}

/* Tab Navigation */
.tab-navigation {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  background: #f8fafc;
  padding: 0.5rem;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: transparent;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #6b7280;
  flex: 1;
  justify-content: center;
}

.tab-btn.active {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  box-shadow: 0 4px 14px 0 rgba(59, 130, 246, 0.3);
}

.tab-btn:hover:not(.active) {
  background: #e5e7eb;
  color: #374151;
}

.tab-icon {
  font-size: 1rem;
}

.tab-text {
  font-weight: 600;
}

.content-left {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Section Headers */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.section-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.search-box {
  position: relative;
}

.search-input {
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  width: 200px;
  background: white;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.filter-select {
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Dispensing Section */
.dispensing-section {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border: 1px solid #e5e7eb;
}

.cards-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .main-content {
    grid-template-columns: 1fr;
  }

  .content-right {
    order: -1;
  }
}

@media (max-width: 768px) {
  .prescription-detail-update {
    padding: 1rem;
  }

  .hero-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .patient-content {
    flex-direction: column;
    text-align: center;
  }

  .patient-status-section {
    grid-template-columns: 1fr;
  }

  .metrics-grid {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    align-items: stretch;
  }

  .section-actions {
    justify-content: center;
  }
}
</style>
