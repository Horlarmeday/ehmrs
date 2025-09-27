<template>
  <div class="payment-processing-page">
    <!-- Header Section -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <div class="breadcrumb">
            <b-button variant="link" @click="goBack" class="back-btn">
              <i class="fas fa-arrow-left mr-2"></i>Back to Bill Items
            </b-button>
          </div>
          <h1 class="page-title">
            <i class="fas fa-credit-card text-primary mr-3"></i>
            Payment Processing
          </h1>
          <div class="payment-summary">
            <div class="summary-item">
              <span class="text-dark-50 font-weight-bold font-size-md">Bill #:</span>
              <span class="value">{{ bill?.bill_number || bill?.id || 'N/A' }}</span>
            </div>
            <div class="summary-item">
              <span class="text-dark-50 font-weight-bold font-size-md">Patient:</span>
              <span class="value">
                {{
                  bill?.patient?.fullname ||
                  (bill?.patient?.firstname && bill?.patient?.lastname
                    ? `${bill.patient.firstname} ${bill.patient.lastname}`
                    : 'N/A')
                }}
              </span>
            </div>
            <div class="summary-item">
              <span class="text-dark-50 font-weight-bold font-size-md">Deposit Status:</span>
              <span class="value">
                <span v-if="isLoadingDeposit" class="text-muted">
                  <i class="fas fa-spinner fa-spin mr-1"></i>Loading...
                </span>
                <span v-else-if="canUseDeposit" class="text-success">
                  <i class="fas fa-check-circle mr-1"></i
                  >{{ formatCurrency(patientDeposit.balance) }} Available
                </span>
                <span v-else class="text-muted">
                  <i class="fas fa-times-circle mr-1"></i>No Deposit
                </span>
              </span>
            </div>
            <div class="summary-item">
              <span class="text-dark-50 font-weight-bold font-size-md">Selected Items:</span>
              <span class="value">{{ selectedItemsData.length }}</span>
            </div>
            <div class="summary-item">
              <span class="text-dark-50 font-weight-bold font-size-md">Total Amount:</span>
              <span class="value amount">{{ formatCurrency(selectedItemsTotal) }}</span>
            </div>
            <div v-if="paidItemsCount > 0" class="summary-item">
              <span class="text-dark-50 font-weight-bold font-size-md">Already Paid:</span>
              <span class="value text-success">{{ paidItemsCount }} items</span>
            </div>
          </div>
        </div>
        <div class="header-actions">
          <b-button
            variant="success"
            @click="processPayment"
            :disabled="!canProcessPayment || processing"
          >
            <span v-if="processing">
              <i class="fas fa-spinner fa-spin mr-2"></i>Processing...
            </span>
            <span v-else> <i class="fas fa-credit-card mr-2"></i>Complete Payment </span>
          </b-button>
          <b-button variant="outline-secondary" @click="goBack"> Cancel </b-button>
          <b-button
            variant="outline-info"
            @click="refreshPaymentStatus"
            :disabled="processing"
            class="ml-2"
          >
            <i class="fas fa-sync-alt mr-2"></i>Refresh Status
          </b-button>
        </div>
      </div>

      <!-- Warning for Already Paid Items -->
      <div v-if="paidItemsCount > 0" class="alert alert-info mt-3">
        <div class="d-flex align-items-center">
          <i class="fas fa-info-circle mr-3 text-info" style="font-size: 1.5rem"></i>
          <div>
            <strong>Payment Status Information:</strong>
            <div class="mt-1">
              <span class="text-success">{{ paidItemsCount }} item(s) are already paid</span> •
              <span class="text-primary">{{ unpaidItemsCount }} item(s) remain unpaid</span>
            </div>
            <small class="text-muted d-block mt-1">
              Only unpaid items are shown for payment processing. Already paid items have been
              automatically filtered out.
            </small>
          </div>
        </div>
      </div>
    </div>

    <!-- Payment Progress Steps -->
    <div class="payment-steps mb-4">
      <div class="steps-container">
        <div
          v-for="(step, index) in paymentSteps"
          :key="step.id"
          class="step-item"
          :class="{
            active: currentStep === step.id,
            completed: completedSteps.includes(step.id),
          }"
        >
          <div class="step-number">
            <span v-if="completedSteps.includes(step.id)">
              <i class="fas fa-check"></i>
            </span>
            <span v-else>{{ index + 1 }}</span>
          </div>
          <div class="step-label">{{ step.label }}</div>
        </div>
      </div>
    </div>

    <!-- Debug Information (Development Only) -->
    <div v-if="showDebugInfo" class="debug-section mb-4">
      <div class="card">
        <div class="card-body">
          <h6 class="card-title text-muted"><i class="fas fa-bug mr-2"></i>Debug Information</h6>
          <div class="row">
            <div class="col-md-6">
              <small class="text-muted">Bill Data:</small>
              <pre class="debug-pre">{{ JSON.stringify(bill, null, 2) }}</pre>
            </div>
            <div class="col-md-6">
              <small class="text-muted">Selected Items Data:</small>
              <pre class="debug-pre">{{ JSON.stringify(selectedItemsData, null, 2) }}</pre>
            </div>
          </div>
          <div class="row mt-2">
            <div class="col-md-4">
              <small class="text-muted">Selected Items Total:</small>
              <div class="text-primary font-weight-bold">{{ selectedItemsTotal }}</div>
            </div>
            <div class="col-md-4">
              <small class="text-muted">Payment Form Amount:</small>
              <div class="text-success font-weight-bold">{{ paymentForm.amount }}</div>
            </div>
            <div class="col-md-4">
              <small class="text-muted">Payment Type:</small>
              <div class="text-info font-weight-bold">{{ paymentForm.payment_type }}</div>
            </div>
          </div>
          <div class="row mt-2">
            <div class="col-md-6">
              <small class="text-muted">Payment Status Summary:</small>
              <div class="mt-1">
                <span class="badge badge-success mr-2">Paid: {{ paidItemsCount }}</span>
                <span class="badge badge-primary mr-2">Unpaid: {{ unpaidItemsCount }}</span>
                <span class="badge badge-info">Selected: {{ selectedItemsData.length }}</span>
              </div>
            </div>
            <div class="col-md-6">
              <small class="text-muted">Item Payment Status:</small>
              <div class="mt-1">
                <div v-for="item in selectedItemsData" :key="item.id" class="small">
                  <span class="text-muted">Item {{ item.id }}:</span>
                  <span
                    v-if="item.payment_status"
                    class="badge badge-sm"
                    :class="item.payment_status === 'PAID' ? 'badge-success' : 'badge-warning'"
                  >
                    {{ item.payment_status }}
                  </span>
                  <span v-else class="badge badge-secondary badge-sm">No Status</span>
                  <span v-if="item.paid_amount" class="text-muted ml-1">
                    (₦{{ formatCurrency(item.paid_amount) }})
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Debug Toggle Button (Always visible for troubleshooting) -->
    <div class="text-center mb-3">
      <b-button
        variant="outline-info"
        size="sm"
        @click="showDebugInfo = !showDebugInfo"
        class="debug-toggle-btn"
      >
        <i class="fas fa-bug mr-2"></i>
        {{ showDebugInfo ? 'Hide' : 'Show' }} Debug Info
      </b-button>
      <small class="text-muted d-block mt-2">
        <i class="fas fa-info-circle mr-1"></i>
        Use this to troubleshoot payment data issues
      </small>
    </div>

    <!-- Step 1: Payment Method Selection -->
    <div v-if="currentStep === 'payment-method'" class="step-content">
      <div class="card">
        <div class="card-body">
          <h5 class="card-title mb-4">
            <i class="fas fa-credit-card text-primary mr-2"></i>
            Select Payment Method
          </h5>

          <div class="payment-methods-grid">
            <div
              v-for="method in paymentMethods"
              :key="method.id"
              class="payment-method-card"
              :class="{ selected: selectedPaymentMethod === method.id }"
              @click="selectPaymentMethod(method.id)"
            >
              <div class="method-icon">
                <i :class="method.icon"></i>
              </div>
              <div class="method-content">
                <h6 class="method-name">{{ method.name }}</h6>
                <p class="method-description">{{ method.description }}</p>
                <div class="method-features">
                  <span v-for="feature in method.features" :key="feature" class="feature-tag">
                    {{ feature }}
                  </span>
                </div>
              </div>
              <div class="method-radio">
                <b-form-radio
                  :value="method.id"
                  v-model="selectedPaymentMethod"
                  name="payment-method"
                ></b-form-radio>
              </div>
            </div>
          </div>

          <div class="step-actions mt-4">
            <b-button variant="primary" @click="nextStep" :disabled="!selectedPaymentMethod">
              Continue
              <i class="fas fa-arrow-right ml-2"></i>
            </b-button>
          </div>
        </div>
      </div>
    </div>

    <!-- Step 2: Payment Details -->
    <div v-if="currentStep === 'payment-details'" class="step-content">
      <div class="card">
        <div class="card-body">
          <h5 class="card-title mb-4">
            <i class="fas fa-edit text-primary mr-2"></i>
            Payment Details
          </h5>

          <div class="row">
            <div class="col-md-4">
              <b-form-group label="Payment Type" label-for="payment-type" required>
                <b-form-select
                  id="payment-type"
                  v-model="paymentForm.payment_type"
                  :options="paymentTypeOptions"
                  required
                >
                  <template #first>
                    <option value="">Select Payment Type</option>
                  </template>
                </b-form-select>
                <small class="form-text text-muted">
                  Select the type of payment being processed
                </small>
              </b-form-group>
            </div>

            <div class="col-md-4">
              <b-form-group label="Payment Amount" label-for="payment-amount" required>
                <b-form-input
                  id="payment-amount"
                  v-model.number="paymentForm.amount"
                  type="number"
                  step="0.01"
                  :min="0.01"
                  :max="selectedItemsTotal"
                  required
                  @input="validateAmount"
                ></b-form-input>
                <small class="form-text text-muted">
                  Maximum: {{ formatCurrency(selectedItemsTotal) }}
                </small>
              </b-form-group>
            </div>

            <div class="col-md-4">
              <b-form-group label="Payment Date" label-for="payment-date" required>
                <b-form-input
                  id="payment-date"
                  v-model="paymentForm.payment_date"
                  type="date"
                  required
                ></b-form-input>
              </b-form-group>
            </div>
          </div>

          <!-- Method-specific fields -->
          <div v-if="selectedPaymentMethod === 'cash'" class="method-specific-fields">
            <h6 class="text-primary mb-3">Cash Payment Details</h6>
            <div class="row">
              <div class="col-md-6">
                <b-form-group label="Cash Register" label-for="cash-register" required>
                  <!-- Cash Register Loading State -->
                  <div v-if="isLoadingCashRegisters" class="text-center py-2">
                    <div class="spinner-border spinner-border-sm text-primary" role="status">
                      <span class="sr-only">Loading cash registers...</span>
                    </div>
                    <small class="text-muted ml-2">Loading cash registers...</small>
                  </div>

                  <!-- Cash Register Selection -->
                  <b-form-select
                    v-else
                    id="cash-register"
                    v-model="paymentForm.cash_register_id"
                    :options="cashRegisterOptions"
                    required
                    placeholder="Select cash register"
                  >
                    <template #first>
                      <option value="" disabled>Select a cash register</option>
                    </template>
                  </b-form-select>

                  <!-- No Cash Registers Available -->
                  <div
                    v-if="!isLoadingCashRegisters && cashRegisters.length === 0"
                    class="alert alert-warning mt-2"
                  >
                    <i class="fas fa-exclamation-triangle mr-2"></i>
                    <strong>No Cash Registers Available</strong><br />
                    <small
                      >No open cash registers found. Please contact the administrator to set up cash
                      registers.</small
                    >
                  </div>

                  <small class="form-text text-muted">
                    Select the cash register where this payment will be processed
                  </small>
                </b-form-group>
              </div>
              <div class="col-md-6">
                <b-form-group label="Cash Received" label-for="cash-received">
                  <b-form-input
                    id="cash-received"
                    v-model.number="paymentForm.cash_received"
                    type="number"
                    step="0.01"
                    min="0.01"
                    @input="calculateChange"
                  ></b-form-input>
                </b-form-group>
              </div>
            </div>
            <div class="row">
              <div class="col-md-6">
                <b-form-group label="Change Given" label-for="change-given">
                  <b-form-input
                    id="change-given"
                    v-model="paymentForm.change_given"
                    readonly
                    class="bg-light"
                  ></b-form-input>
                </b-form-group>
              </div>
              <div class="col-md-6">
                <div v-if="selectedCashRegister" class="register-info">
                  <small class="text-muted">
                    <strong>Register:</strong> {{ selectedCashRegister.register_name }} ({{
                      selectedCashRegister.register_code
                    }})<br />
                    <strong>Current Balance:</strong> ₦{{
                      formatCurrency(selectedCashRegister.current_balance)
                    }}
                  </small>
                </div>
              </div>
            </div>
          </div>

          <div v-if="selectedPaymentMethod === 'card'" class="method-specific-fields">
            <h6 class="text-primary mb-3">Card Payment Details</h6>

            <!-- POS Terminal Loading State -->
            <div v-if="isLoadingBankData" class="text-center py-3">
              <div class="spinner-border text-primary" role="status">
                <span class="sr-only">Loading POS terminals...</span>
              </div>
              <p class="mt-2 text-muted">Loading available POS terminals...</p>
            </div>

            <!-- Card Payment Form -->
            <div v-else class="row">
              <div class="col-md-6">
                <b-form-group label="POS Terminal" label-for="pos-terminal">
                  <b-form-select
                    id="pos-terminal"
                    v-model="paymentForm.pos_terminal_id"
                    :options="posTerminalOptions"
                    :disabled="isLoadingBankData"
                    required
                  >
                    <template #first>
                      <option value="">Select POS Terminal</option>
                    </template>
                  </b-form-select>
                  <small class="text-muted"
                    >Select the POS terminal used for this transaction</small
                  >
                </b-form-group>
              </div>
              <div class="col-md-6">
                <b-form-group label="Transaction Reference" label-for="transaction-ref">
                  <b-form-input
                    id="transaction-ref"
                    v-model="paymentForm.transaction_reference"
                    placeholder="e.g., POS123456789"
                  ></b-form-input>
                  <small class="text-muted">Card transaction reference number</small>
                </b-form-group>
              </div>
            </div>

            <!-- POS Terminal Information -->
            <div v-if="selectedPOSTerminal" class="pos-terminal-info mt-3">
              <div class="alert alert-info-light">
                <div class="row">
                  <div class="col-md-4">
                    <strong>Terminal ID:</strong><br />
                    <span class="text-primary">{{ selectedPOSTerminal.terminal_id }}</span>
                  </div>
                  <div class="col-md-4">
                    <strong>Location:</strong><br />
                    <span class="text-info">{{ selectedPOSTerminal.location }}</span>
                  </div>
                  <div class="col-md-4">
                    <strong>Bank:</strong><br />
                    <span class="text-success">{{
                      selectedPOSTerminal.bankAccount?.bank_name || 'N/A'
                    }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- No POS Terminals Available -->
            <div
              v-else-if="!isLoadingBankData && posTerminals.length === 0"
              class="alert alert-warning"
            >
              <i class="fas fa-exclamation-triangle mr-2"></i>
              <strong>No POS Terminals Available</strong><br />
              <small>No active POS terminals found. Please contact the administrator.</small>
            </div>
          </div>

          <div v-if="selectedPaymentMethod === 'bank_transfer'" class="method-specific-fields">
            <h6 class="text-primary mb-3">Bank Transfer Details</h6>

            <!-- Bank Data Loading State -->
            <div v-if="isLoadingBankData" class="text-center py-3">
              <div class="spinner-border text-primary" role="status">
                <span class="sr-only">Loading bank accounts...</span>
              </div>
              <p class="mt-2 text-muted">Loading hospital bank accounts...</p>
            </div>

            <!-- Bank Transfer Form -->
            <div v-else class="row">
              <div class="col-md-6">
                <b-form-group label="Hospital Bank Account" label-for="bank-account">
                  <b-form-select
                    id="bank-account"
                    v-model="paymentForm.bank_account_id"
                    :options="bankAccountOptions"
                    :disabled="isLoadingBankData"
                    required
                  >
                    <template #first>
                      <option value="">Select Bank Account</option>
                    </template>
                  </b-form-select>
                  <small class="text-muted"
                    >Select the hospital bank account for this transfer</small
                  >
                </b-form-group>
              </div>
              <div class="col-md-6">
                <b-form-group label="Bank Reference Number" label-for="bank-reference">
                  <b-form-input
                    id="bank-reference"
                    v-model="paymentForm.bank_reference"
                    placeholder="e.g., TRX123456789"
                    required
                  ></b-form-input>
                  <small class="text-muted">Bank transfer reference/transaction number</small>
                </b-form-group>
              </div>
            </div>

            <!-- Bank Account Information -->
            <div v-if="selectedBankAccount" class="bank-account-info mt-3">
              <div class="alert alert-info-light">
                <div class="row">
                  <div class="col-md-4">
                    <strong>Bank:</strong><br />
                    <span class="text-primary">{{ selectedBankAccount.bank_name }}</span>
                  </div>
                  <div class="col-md-4">
                    <strong>Account:</strong><br />
                    <span class="text-info">{{ selectedBankAccount.account_name }}</span>
                  </div>
                  <div class="col-md-4">
                    <strong>Type:</strong><br />
                    <span class="text-success">{{ selectedBankAccount.account_type }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- No Bank Accounts Available -->
            <div
              v-else-if="!isLoadingBankData && bankAccounts.length === 0"
              class="alert alert-warning"
            >
              <i class="fas fa-exclamation-triangle mr-2"></i>
              <strong>No Bank Accounts Available</strong><br />
              <small>No active bank accounts found. Please contact the administrator.</small>
            </div>
          </div>

          <div v-if="selectedPaymentMethod === 'insurance'" class="method-specific-fields">
            <h6 class="text-primary mb-3">Insurance Details</h6>

            <!-- Insurance Loading State -->
            <div v-if="isLoadingInsurance" class="text-center py-3">
              <div class="spinner-border text-primary" role="status">
                <span class="sr-only">Loading insurance information...</span>
              </div>
              <p class="mt-2 text-muted">Loading insurance providers and patient information...</p>
            </div>

            <!-- Insurance Form -->
            <div v-else class="row">
              <div class="col-md-6">
                <b-form-group label="Insurance Provider" label-for="insurance-provider">
                  <b-form-select
                    id="insurance-provider"
                    v-model="paymentForm.insurance_provider"
                    :options="insuranceProviders"
                    required
                  >
                    <template #first>
                      <option value="">Select Insurance Provider</option>
                    </template>
                  </b-form-select>
                  <small class="text-muted">Select the insurance provider or HMO</small>
                </b-form-group>
              </div>
              <div class="col-md-6">
                <b-form-group label="Policy Number" label-for="policy-number">
                  <b-form-input
                    id="policy-number"
                    v-model="paymentForm.policy_number"
                    placeholder="Insurance policy number"
                    required
                  ></b-form-input>
                  <small class="text-muted">Patient's insurance policy number</small>
                </b-form-group>
              </div>
            </div>
            <div class="row mt-3">
              <div class="col-md-6">
                <b-form-group label="Co-pay Amount" label-for="copay-amount">
                  <b-form-input
                    id="copay-amount"
                    v-model.number="paymentForm.copay_amount"
                    type="number"
                    step="0.01"
                    min="0"
                    :max="selectedItemsTotal"
                    @input="calculateInsuranceAmount"
                  ></b-form-input>
                  <small class="text-muted">Patient's co-payment amount (if any)</small>
                </b-form-group>
              </div>
              <div class="col-md-6">
                <b-form-group label="Insurance Covers" label-for="insurance-covers">
                  <b-form-input
                    id="insurance-covers"
                    v-model="paymentForm.insurance_covers"
                    readonly
                    class="bg-light"
                  ></b-form-input>
                  <small class="text-muted">Amount covered by insurance</small>
                </b-form-group>
              </div>
            </div>

            <!-- Patient Insurance Information -->
            <div v-if="patientInsuranceInfo" class="patient-insurance-info mt-3">
              <div class="alert alert-success">
                <div class="row">
                  <div class="col-md-4">
                    <strong>Provider:</strong><br />
                    <span class="text-primary">{{ patientInsuranceInfo.provider_name }}</span>
                  </div>
                  <div class="col-md-4">
                    <strong>Policy:</strong><br />
                    <span class="text-info">{{ patientInsuranceInfo.policy_number }}</span>
                  </div>
                  <div class="col-md-4">
                    <strong>Status:</strong><br />
                    <span class="text-success">{{ patientInsuranceInfo.status || 'Active' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- No Insurance Providers Available -->
            <div
              v-else-if="!isLoadingInsurance && insuranceProviders.length <= 1"
              class="alert alert-warning"
            >
              <i class="fas fa-exclamation-triangle mr-2"></i>
              <strong>No Insurance Providers Available</strong><br />
              <small>No insurance providers found. Please contact the administrator.</small>
            </div>
          </div>

          <div v-if="selectedPaymentMethod === 'deposit'" class="method-specific-fields">
            <h6 class="text-primary mb-3">Deposit Payment Details</h6>

            <!-- Deposit Loading State -->
            <div v-if="isLoadingDeposit" class="text-center py-3">
              <div class="spinner-border text-primary" role="status">
                <span class="sr-only">Loading deposit information...</span>
              </div>
              <p class="mt-2 text-muted">Loading patient deposit information...</p>
            </div>

            <!-- Deposit Information -->
            <div v-else-if="patientDeposit" class="row">
              <div class="col-md-6">
                <b-form-group label="Available Deposit Balance" label-for="available-deposit">
                  <b-form-input
                    id="available-deposit"
                    :value="formatCurrency(patientDeposit.current_balance || 0)"
                    readonly
                    class="bg-light"
                  >
                    <template #append>
                      <b-badge variant="success">{{ patientDeposit.currency || 'NGN' }}</b-badge>
                    </template>
                  </b-form-input>
                  <small class="text-muted">Current available balance</small>
                </b-form-group>
              </div>
              <div class="col-md-6">
                <b-form-group label="Deposit Usage Amount" label-for="deposit-usage">
                  <b-form-input
                    id="deposit-usage"
                    v-model.number="paymentForm.deposit_usage"
                    type="number"
                    step="0.01"
                    min="0"
                    :max="Math.min(patientDeposit.current_balance, selectedItemsTotal)"
                    @input="validateDepositUsage"
                  >
                    <template #append>
                      <b-button
                        variant="outline-primary"
                        size="sm"
                        @click="setMaxDepositUsage"
                        :disabled="patientDeposit.current_balance <= 0"
                      >
                        Max
                      </b-button>
                    </template>
                  </b-form-input>
                  <small class="text-muted">Amount to use from deposit</small>
                </b-form-group>
              </div>
            </div>

            <!-- Deposit Summary -->
            <div
              v-if="patientDeposit && paymentForm.deposit_usage > 0"
              class="deposit-summary mt-3"
            >
              <div class="alert alert-success-light">
                <div class="row">
                  <div class="col-md-4">
                    <strong>Deposit Used:</strong><br />
                    <span class="text-success">{{
                      formatCurrency(paymentForm.deposit_usage)
                    }}</span>
                  </div>
                  <div class="col-md-4">
                    <strong>Remaining Balance:</strong><br />
                    <span class="text-info">{{ formatCurrency(remainingDepositBalance) }}</span>
                  </div>
                  <div class="col-md-4">
                    <strong>Payment Required:</strong><br />
                    <span class="text-primary">{{
                      formatCurrency(selectedItemsTotal - paymentForm.deposit_usage)
                    }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Mixed Payment Suggestion -->
            <div
              v-if="canUseMixedPayment && selectedPaymentMethod !== 'deposit'"
              class="mixed-payment-suggestion mt-3"
            >
              <div class="alert alert-warning">
                <div class="row align-items-center">
                  <div class="col-md-8">
                    <i class="fas fa-lightbulb mr-2"></i>
                    <strong>Mixed Payment Available!</strong><br />
                    <small
                      >This patient has a deposit balance. You can use
                      {{ formatCurrency(patientDeposit.balance) }} from deposit and collect the
                      remaining
                      {{ formatCurrency(selectedItemsTotal - patientDeposit.balance) }} through
                      {{
                        selectedPaymentMethod === 'cash'
                          ? 'cash'
                          : selectedPaymentMethod === 'card'
                          ? 'card'
                          : 'bank transfer'
                      }}.</small
                    >
                  </div>
                  <div class="col-md-4 text-right">
                    <b-button variant="outline-warning" size="sm" @click="enableMixedPayment">
                      <i class="fas fa-layer-group mr-1"></i>Enable Mixed
                    </b-button>
                  </div>
                </div>
              </div>
            </div>

            <!-- No Deposit Available -->
            <div
              v-else-if="!isLoadingDeposit && (!patientDeposit || patientDeposit.balance <= 0)"
              class="alert alert-warning"
            >
              <i class="fas fa-exclamation-triangle mr-2"></i>
              <strong>No Deposit Available</strong><br />
              <small
                >This patient has no available deposit balance. Please select a different payment
                method.</small
              >
            </div>

            <!-- Deposit History Link -->
            <div v-if="patientDeposit" class="mt-3">
              <b-button variant="outline-info" size="sm" @click="showDepositHistory">
                <i class="fas fa-history mr-2"></i>View Deposit History
              </b-button>
            </div>
          </div>

          <!-- Validation Errors -->
          <div v-if="getValidationErrors().length > 0" class="validation-errors mt-3">
            <div class="alert alert-danger">
              <i class="fas fa-exclamation-triangle mr-2"></i>
              <strong>Please fix the following errors:</strong>
              <ul class="mb-0 mt-2">
                <li v-for="error in getValidationErrors()" :key="error">{{ error }}</li>
              </ul>
            </div>
          </div>

          <div class="step-actions mt-4">
            <b-button variant="outline-secondary" @click="previousStep">
              <i class="fas fa-arrow-left mr-2"></i>Back
            </b-button>
            <b-button variant="primary" @click="nextStep" :disabled="!canProceedToNext">
              Continue
              <i class="fas fa-arrow-right ml-2"></i>
            </b-button>
          </div>
        </div>
      </div>
    </div>

    <!-- Step 3: Payment Summary & Confirmation -->
    <div v-if="currentStep === 'confirmation'" class="step-content">
      <div class="card">
        <div class="card-body">
          <h5 class="card-title mb-4">
            <i class="fas fa-clipboard-check text-primary mr-2"></i>
            Payment Summary & Confirmation
          </h5>

          <div class="payment-summary-details">
            <div class="row">
              <div class="col-md-8">
                <h6 class="text-primary mb-3">Selected Items</h6>
                <div class="selected-items-list">
                  <div v-for="item in selectedItemsData" :key="item.id" class="selected-item">
                    <div class="item-info">
                      <strong>{{ item.item_name || item.name || `Item ${item.id}` }}</strong>
                      <small class="text-muted d-block">{{ item.item_type || 'N/A' }}</small>
                    </div>
                    <div class="item-amount">
                      {{ formatCurrency(item.total_price || item.unit_price || 0) }}
                    </div>
                  </div>
                </div>
              </div>

              <div class="col-md-4">
                <div class="payment-breakdown">
                  <h6 class="text-primary mb-3">Payment Breakdown</h6>
                  <table class="table table-borderless">
                    <tr>
                      <td><strong>Payment Type:</strong></td>
                      <td class="text-right">
                        <span class="badge badge-info">{{ paymentForm.payment_type }}</span>
                      </td>
                    </tr>
                    <tr>
                      <td>Items Total:</td>
                      <td class="text-right">{{ formatCurrency(selectedItemsTotal) }}</td>
                    </tr>
                    <tr v-if="paymentForm.copay_amount > 0">
                      <td>Co-pay:</td>
                      <td class="text-right text-danger">
                        +{{ formatCurrency(paymentForm.copay_amount) }}
                      </td>
                    </tr>
                    <tr v-if="paymentForm.deposit_usage > 0">
                      <td>From Deposit:</td>
                      <td class="text-right text-success">
                        -{{ formatCurrency(paymentForm.deposit_usage) }}
                      </td>
                    </tr>
                    <tr v-if="paymentForm.deposit_usage > 0" class="border-top">
                      <td><strong>Remaining Payment:</strong></td>
                      <td class="text-right">
                        <strong class="text-warning">{{
                          formatCurrency(remainingPaymentAfterDeposit)
                        }}</strong>
                      </td>
                    </tr>
                    <tr class="border-top">
                      <td><strong>Total Payment:</strong></td>
                      <td class="text-right">
                        <strong class="text-primary">{{
                          formatCurrency(paymentForm.amount)
                        }}</strong>
                      </td>
                    </tr>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <!-- Cash Register Information (for cash payments) -->
          <div
            v-if="selectedPaymentMethod === 'cash' && selectedCashRegister"
            class="cash-register-info mt-4"
          >
            <div class="alert alert-info">
              <h6 class="alert-heading">
                <i class="fas fa-cash-register mr-2"></i>Cash Register Details
              </h6>
              <div class="row">
                <div class="col-md-6">
                  <strong>Register:</strong> {{ selectedCashRegister.register_name }} ({{
                    selectedCashRegister.register_code
                  }})<br />
                  <strong>Location:</strong> {{ selectedCashRegister.location || 'N/A' }}
                </div>
                <div class="col-md-6">
                  <strong>Current Balance:</strong> ₦{{
                    formatCurrency(selectedCashRegister.current_balance)
                  }}<br />
                  <strong>Status:</strong>
                  <b-badge variant="success">{{ selectedCashRegister.status }}</b-badge>
                </div>
              </div>
            </div>
          </div>

          <div class="payment-notes mt-4">
            <b-form-group label="Payment Notes" label-for="payment-notes">
              <b-form-textarea
                id="payment-notes"
                v-model="paymentForm.notes"
                rows="3"
                placeholder="Additional notes about this payment..."
              ></b-form-textarea>
            </b-form-group>
          </div>

          <div class="step-actions mt-4">
            <b-button variant="outline-secondary" @click="previousStep">
              <i class="fas fa-arrow-left mr-2"></i>Back
            </b-button>
            <b-button variant="success" @click="processPayment" :disabled="processing">
              <span v-if="processing">
                <i class="fas fa-spinner fa-spin mr-2"></i>Processing Payment...
              </span>
              <span v-else> <i class="fas fa-check mr-2"></i>Confirm & Process Payment </span>
            </b-button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading Overlay -->
    <div v-if="processing" class="loading-overlay">
      <div class="loading-content">
        <b-spinner variant="primary" style="width: 3rem; height: 3rem"></b-spinner>
        <h5 class="mt-3">Processing Payment...</h5>
        <p class="text-muted">Please wait while we complete your payment</p>
      </div>
    </div>

    <!-- Receipt Options Modal -->
    <b-modal
      v-model="showReceiptOptions"
      title="Payment Successful!"
      size="lg"
      :hide-footer="true"
      :hide-header-close="true"
      :no-close-on-backdrop="true"
      :no-close-on-esc="true"
      centered
    >
      <div class="text-center">
        <div class="success-icon mb-4">
          <i class="fas fa-check-circle text-success" style="font-size: 4rem"></i>
        </div>

        <h4 class="text-success mb-3">Payment Processed Successfully!</h4>
        <p class="text-muted mb-4">Your payment has been processed and recorded in the system.</p>

        <div class="receipt-options">
          <h6 class="mb-3">What would you like to do next?</h6>

          <div class="row">
            <div class="col-md-6 mb-3">
              <b-button
                variant="primary"
                size="lg"
                block
                @click="downloadReceipt"
                :disabled="isDownloadingReceipt"
              >
                <i class="fas fa-download mr-2"></i>
                <span v-if="isDownloadingReceipt">
                  <i class="fas fa-spinner fa-spin mr-2"></i>Downloading...
                </span>
                <span v-else>Download Receipt</span>
              </b-button>
            </div>

            <div class="col-md-6 mb-3">
              <b-button
                variant="outline-primary"
                size="lg"
                block
                @click="printReceipt"
                :disabled="isDownloadingReceipt"
              >
                <i class="fas fa-print mr-2"></i>Print Receipt
              </b-button>
            </div>
          </div>

          <div class="mt-4">
            <b-button variant="outline-secondary" @click="closeReceiptOptions">
              <i class="fas fa-times mr-2"></i>Close & Return to Bills
            </b-button>
          </div>
        </div>
      </div>
    </b-modal>
  </div>
</template>

<script>
export default {
  name: 'PaymentProcessingPage',
  data() {
    return {
      bill: null,
      selectedItems: [],
      selectedItemsData: [],
      currentStep: 'payment-method',
      completedSteps: [],
      processing: false,
      selectedPaymentMethod: null,
      patientDeposit: null,
      showDebugInfo: false, // Debug toggle state
      paymentForm: {
        amount: 0,
        payment_type: 'FULL',
        payment_date: new Date().toISOString().split('T')[0],
        cash_received: 0,
        change_given: 0,
        cash_register_id: null,
        pos_terminal_id: null,
        bank_account_id: null,
        bank_reference: '',
        transaction_reference: '',
        insurance_provider: '',
        policy_number: '',
        copay_amount: 0,
        insurance_covers: 0,
        deposit_usage: 0,
        notes: '',
      },
      paymentSteps: [
        { id: 'payment-method', label: 'Payment Method' },
        { id: 'payment-details', label: 'Payment Details' },
        { id: 'confirmation', label: 'Confirmation' },
      ],
      paymentMethods: [
        {
          id: 'cash',
          name: 'Cash Payment',
          description: 'Pay with physical cash',
          icon: 'fas fa-money-bill-wave',
          features: ['Immediate', 'No Fees', 'Change Given'],
        },
        {
          id: 'card',
          name: 'Card Payment',
          description: 'Pay with debit or credit card',
          icon: 'fas fa-credit-card',
          features: ['Secure', 'Digital Receipt', 'Multiple Cards'],
        },
        {
          id: 'bank_transfer',
          name: 'Bank Transfer',
          description: 'Pay via bank transfer',
          icon: 'fas fa-university',
          features: ['Electronic', 'Reference Number', 'Bank Statement'],
        },
        {
          id: 'insurance',
          name: 'Insurance Claim',
          description: 'Submit insurance claim',
          icon: 'fas fa-shield-alt',
          features: ['Coverage Check', 'Claim Processing', 'Co-pay'],
        },
        {
          id: 'deposit',
          name: 'Patient Deposit',
          description: 'Use available deposit balance',
          icon: 'fas fa-piggy-bank',
          features: ['Pre-paid', 'Balance Check', 'Instant'],
        },
        {
          id: 'other',
          name: 'Other Payment',
          description: 'Other payment methods (checks, vouchers, etc.)',
          icon: 'fas fa-ellipsis-h',
          features: ['Flexible', 'Custom', 'Documentation'],
        },
      ],

      insuranceProviders: [],
      isLoadingInsurance: false,
      bankAccounts: [],
      posTerminals: [],
      cashRegisters: [],
      isLoadingBankData: false,
      isLoadingDeposit: false,
      isLoadingCashRegisters: false,
      paymentTypeOptions: [
        { value: 'FULL', text: 'Full Payment' },
        { value: 'PARTIAL', text: 'Partial Payment' },
        { value: 'DEPOSIT', text: 'Deposit Payment' },
        { value: 'POINT_OF_SERVICE', text: 'Point of Service' },
      ],

      // Receipt functionality
      showReceiptOptions: false,
      lastProcessedPaymentId: null,
      isDownloadingReceipt: false,
    };
  },
  computed: {
    selectedItemsTotal() {
      const total = this.selectedItemsData.reduce((sum, item) => {
        const price = parseFloat(item.total_price) || parseFloat(item.unit_price) || 0;
        return sum + price;
      }, 0);
      console.log('Computed selectedItemsTotal:', total, 'from items:', this.selectedItemsData);
      return total;
    },
    canProcessPayment() {
      return (
        this.currentStep === 'confirmation' &&
        this.paymentForm.amount > 0 &&
        this.selectedItemsData.length > 0
      );
    },
    canProceedToNext() {
      if (this.currentStep === 'payment-method') {
        return this.selectedPaymentMethod;
      }
      if (this.currentStep === 'payment-details') {
        if (
          this.paymentForm.amount <= 0 ||
          !this.paymentForm.payment_date ||
          !this.paymentForm.payment_type
        ) {
          return false;
        }

        // Validate method-specific required fields
        switch (this.selectedPaymentMethod) {
          case 'cash':
            return (
              this.paymentForm.cash_register_id &&
              this.paymentForm.cash_received > 0 &&
              this.paymentForm.cash_received >= this.paymentForm.amount
            );
          case 'card':
            return this.paymentForm.pos_terminal_id;
          case 'bank_transfer':
            return this.paymentForm.bank_account_id && this.paymentForm.bank_reference;
          case 'insurance':
            return this.paymentForm.insurance_provider;
          case 'deposit':
            return this.paymentForm.deposit_usage > 0;
          default:
            return true;
        }
      }
      return true;
    },
    remainingDepositBalance() {
      if (!this.patientDeposit) return 0;
      return (this.patientDeposit.current_balance || 0) - (this.paymentForm.deposit_usage || 0);
    },

    posTerminalOptions() {
      return this.posTerminals.map((terminal) => ({
        value: terminal.id,
        text: `${terminal.terminal_id} - ${terminal.location}`,
        description: `Bank: ${terminal.bank_account?.bank_name || 'Unknown'}`,
      }));
    },

    bankAccountOptions() {
      return this.bankAccounts.map((account) => ({
        value: account.id,
        text: `${account.bank_name} - ${account.account_number}`,
        description: `Account: ${account.account_name}`,
      }));
    },

    cashRegisterOptions() {
      return this.cashRegisters
        .filter((register) => register.status === 'OPEN' && register.is_active)
        .map((register) => ({
          value: register.id,
          text: `${register.register_code} - ${register.register_name}`,
          description: `Location: ${register.location || 'N/A'}`,
        }));
    },

    selectedCashRegister() {
      if (!this.paymentForm.cash_register_id) return null;
      return this.cashRegisters.find(
        (register) => register.id === this.paymentForm.cash_register_id
      );
    },

    // Payment calculation helpers
    remainingPaymentAfterDeposit() {
      if (!this.paymentForm.deposit_usage || this.paymentForm.deposit_usage <= 0) {
        return this.selectedItemsTotal;
      }
      return Math.max(0, this.selectedItemsTotal - this.paymentForm.deposit_usage);
    },

    canUseDeposit() {
      return this.patientDeposit && this.patientDeposit.balance > 0;
    },

    selectedBankAccount() {
      if (!this.paymentForm.bank_account_id) return null;
      return this.bankAccounts.find((account) => account.id === this.paymentForm.bank_account_id);
    },

    selectedPOSTerminal() {
      if (!this.paymentForm.pos_terminal_id) return null;
      return this.posTerminals.find((terminal) => terminal.id === this.paymentForm.pos_terminal_id);
    },

    patientInsuranceInfo() {
      if (!this.paymentForm.insurance_provider) return null;

      const provider = this.insuranceProviders.find(
        (p) => p.value === this.paymentForm.insurance_provider
      );
      if (!provider) return null;

      return {
        provider_name: provider.text,
        policy_number: this.paymentForm.policy_number,
        type: provider.type,
        status: 'Active',
      };
    },

    // Payment status information
    paidItemsCount() {
      if (!this.bill || !this.bill.items) return 0;

      const allItems = this.bill.items;
      return allItems.filter((item) => {
        const isPaid =
          item.payment_status === 'PAID' ||
          item.payment_status === 'FULLY_PAID' ||
          item.is_paid === true ||
          (item.paid_amount && item.paid_amount >= item.total_price);
        return isPaid;
      }).length;
    },

    unpaidItemsCount() {
      if (!this.bill || !this.bill.items) return 0;
      return this.paidItemsCount > 0 ? this.bill.items.length - this.paidItemsCount : 0;
    },
  },
  watch: {
    selectedItemsTotal: {
      handler(newTotal) {
        console.log('selectedItemsTotal changed to:', newTotal);
        if (newTotal > 0 && this.paymentForm.amount === 0) {
          this.paymentForm.amount = newTotal;
          console.log('Updated payment form amount to:', this.paymentForm.amount);

          // Auto-update cash received if cash payment method is selected
          if (this.selectedPaymentMethod === 'cash') {
            this.paymentForm.cash_received = newTotal;
            this.calculateChange();
          }
        }
      },
      immediate: true,
    },
  },
  async mounted() {
    await this.initializePage();
    await this.loadInsuranceProviders();
  },

  methods: {
    async initializePage() {
      try {
        const { billId } = this.$route.params;
        const { selectedItems } = this.$route.query;
        console.log('Route params - billId:', billId);
        console.log('Route query - selectedItems:', selectedItems);

        if (!billId) {
          throw new Error('Bill ID is required');
        }

        // Load bill with items using the correct method
        const billResponse = await this.$store.dispatch(
          'accounting/getClinicalBillWithItems',
          billId
        );
        console.log('Bill response:', billResponse);

        if (billResponse.success) {
          this.bill = billResponse.data.bill;
          const allBillItems = billResponse.data.items || [];
          console.log('Loaded bill:', this.bill);
          console.log('Loaded all bill items:', allBillItems);

          // Filter out already paid items first
          const unpaidItems = allBillItems.filter((item) => {
            // Check if item is already fully paid
            const isPaid =
              item.payment_status === 'PAID' ||
              item.payment_status === 'FULLY_PAID' ||
              item.is_paid === true ||
              (item.paid_amount && item.paid_amount >= item.total_price);

            return !isPaid;
          });

          console.log('Unpaid items:', unpaidItems);
          console.log('All bill items:', allBillItems);

          // Parse selected items from query params
          if (selectedItems) {
            const itemIds = selectedItems.split(',').map((id) => parseInt(id.trim()));
            console.log('Parsed selected item IDs:', itemIds);

            // Filter selected items to only include unpaid items
            const validSelectedItems = itemIds.filter((id) =>
              unpaidItems.some((item) => item.id === id)
            );

            if (validSelectedItems.length !== itemIds.length) {
              const removedItems = itemIds.filter((id) => !validSelectedItems.includes(id));
              console.warn('Removed already paid items from selection:', removedItems);

              // Show warning to user about removed items
              this.$bvToast.toast(
                `Some selected items were already paid and have been removed from payment: ${removedItems.join(
                  ', '
                )}`,
                {
                  title: 'Items Already Paid',
                  variant: 'warning',
                  solid: true,
                }
              );
            }

            this.selectedItems = validSelectedItems;
            this.selectedItemsData = unpaidItems.filter((item) =>
              validSelectedItems.includes(item.id)
            );
            console.log('Filtered selected items data (unpaid only):', this.selectedItemsData);
          } else {
            // If no selected items in query, show all unpaid items
            this.selectedItemsData = unpaidItems;
            this.selectedItems = unpaidItems.map((item) => item.id);
            console.log('No selected items in query, showing all unpaid items');
          }

          // Check if there are any items to pay
          if (this.selectedItemsData.length === 0) {
            throw new Error(
              'No unpaid items found for payment. All items in this bill appear to be already paid.'
            );
          }

          // Set initial payment amount - use nextTick to ensure computed property is updated
          this.$nextTick(() => {
            this.paymentForm.amount = this.selectedItemsTotal;
            console.log('Set initial payment amount:', this.paymentForm.amount);
          });

          // Load patient deposit if available
          if (this.bill?.patient_id) {
            await this.loadPatientDeposit();
          }

          // Load bank accounts, POS terminals, and cash registers
          await Promise.all([
            this.loadBankAccounts(),
            this.loadPOSTerminals(),
            this.loadCashRegisters(),
          ]);

          // Load payment options from API
          await this.loadPaymentOptions();
        } else {
          throw new Error(billResponse.error || 'Failed to load bill data');
        }
      } catch (error) {
        console.error('Failed to initialize payment page:', error);
        this.$bvToast.toast(`Failed to load payment information: ${error.message}`, {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      }
    },

    // Method to handle back navigation
    goBack() {
      this.$router.go(-1);
    },

    // Build payment data with only relevant fields for the selected payment method
    buildPaymentData() {
      // Base payment data (always required)
      const baseData = {
        bill_id: this.bill.id,
        patient_id: this.bill.patient_id,
        selected_items: this.selectedItems,
        amount: this.paymentForm.amount,
        payment_method: this.selectedPaymentMethod.toUpperCase(),
        payment_type: this.paymentForm.payment_type,
        payment_date: this.paymentForm.payment_date || new Date().toISOString(),
        notes: this.paymentForm.notes || '',
      };

      // Add method-specific fields based on payment method
      switch (this.selectedPaymentMethod) {
        case 'cash':
          return {
            ...baseData,
            cash_received: this.paymentForm.cash_received || 0,
            change_given: this.paymentForm.change_given || 0,
            cash_register_id: this.paymentForm.cash_register_id || null,
          };

        case 'card':
          return {
            ...baseData,
            pos_terminal_id: this.paymentForm.pos_terminal_id || null,
            transaction_reference: this.paymentForm.transaction_reference || '',
          };

        case 'bank_transfer':
          return {
            ...baseData,
            bank_account_id: this.paymentForm.bank_account_id || null,
            bank_reference: this.paymentForm.bank_reference || '',
          };

        case 'insurance':
          return {
            ...baseData,
            insurance_provider: this.paymentForm.insurance_provider || '',
            policy_number: this.paymentForm.policy_number || '',
            copay_amount: this.paymentForm.copay_amount || 0,
          };

        case 'deposit':
          return {
            ...baseData,
            deposit_usage: this.paymentForm.deposit_usage || 0,
          };

        case 'other':
          return baseData;

        default:
          return baseData;
      }
    },

    async loadPatientDeposit() {
      try {
        if (!this.bill?.patient_id) return;

        this.isLoadingDeposit = true;

        // Fetch patient deposit from accounting API
        const response = await this.$store.dispatch(
          'accounting/getPatientDepositByPatientId',
          this.bill.patient_id
        );

        if (response && response.data) {
          this.patientDeposit = response.data;
          // Auto-set deposit usage to maximum available if deposit method is selected
          if (this.selectedPaymentMethod === 'deposit') {
            this.setMaxDepositUsage();
          }
        } else {
          this.patientDeposit = null;
        }
      } catch (error) {
        console.error('Failed to load patient deposit:', error);
        this.patientDeposit = null;
        this.$bvToast.toast('Failed to load patient deposit information', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      } finally {
        this.isLoadingDeposit = false;
      }
    },

    async loadInsuranceProviders() {
      try {
        this.isLoadingInsurance = true;

        // Use existing insurance module to get providers
        await Promise.all([
          this.$store.dispatch('insurance/fetchInsurances', {
            currentPage: 1,
            itemsPerPage: 100,
            search: '',
          }),
          this.$store.dispatch('insurance/fetchHMOs', {
            currentPage: 1,
            itemsPerPage: 100,
            search: '',
            filter: '',
          }),
        ]);

        // Get data from store
        const insurances = this.$store.getters['insurance/getInsurances'] || [];
        const hmos = this.$store.getters['insurance/getHMOs'] || [];

        // Format insurance providers for select
        this.insuranceProviders = [
          { value: '', text: 'Select Insurance Provider' },
          ...insurances.map((insurance) => ({
            value: insurance.id.toString(),
            text: insurance.name,
            description: insurance.description,
            type: 'insurance',
          })),
          ...hmos.map((hmo) => ({
            value: hmo.id.toString(),
            text: hmo.name,
            description: hmo.insurance?.name || '',
            type: 'hmo',
          })),
        ];
      } catch (error) {
        console.error('Error loading insurance providers:', error);
        // If API fails, show empty list with error message
        this.insuranceProviders = [{ value: '', text: 'Failed to load insurance providers' }];
      } finally {
        this.isLoadingInsurance = false;
      }
    },

    async loadPatientInsuranceInfo() {
      try {
        if (!this.bill?.patient_id) return;

        this.isLoadingInsurance = true;

        // Use existing insurance module to get patient insurance
        await this.$store.dispatch('insurance/fetchPatientInsurances', this.bill.patient_id);
        const patientInsurances = this.$store.getters['insurance/getPatientInsurances'] || [];

        if (patientInsurances.length > 0) {
          // Auto-populate insurance fields if patient has insurance
          const defaultInsurance =
            patientInsurances.find((pi) => pi.is_default) || patientInsurances[0];
          if (defaultInsurance) {
            // Find the provider in our list and set it
            const provider = this.insuranceProviders.find(
              (p) =>
                p.value === defaultInsurance.insurance_id?.toString() ||
                p.value === defaultInsurance.hmo_id?.toString()
            );
            if (provider) {
              this.paymentForm.insurance_provider = provider.value;

              // Set other insurance details
              this.paymentForm.policy_number = defaultInsurance.enrollee_code || '';
              this.paymentForm.copay_amount = defaultInsurance.co_pay_amount || 0;
              this.calculateInsuranceAmount();

              // Show success message
              this.$bvToast.toast(`Auto-populated insurance: ${provider.text}`, {
                title: 'Insurance Found',
                variant: 'success',
                solid: true,
              });
            }
          }
        } else {
          // No insurance found for patient
          this.$bvToast.toast('No insurance found for this patient', {
            title: 'Insurance Info',
            variant: 'info',
            solid: true,
          });
        }
      } catch (error) {
        console.error('Error loading patient insurance information:', error);
        this.$bvToast.toast('Failed to load patient insurance information', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      } finally {
        this.isLoadingInsurance = false;
      }
    },

    async loadBankAccounts() {
      try {
        this.isLoadingBankData = true;

        // Fetch active bank accounts from accounting API
        const response = await this.$store.dispatch('accounting/getActiveBankAccounts');

        if (response && response.data) {
          this.bankAccounts = response.data;
          console.log('Loaded bank accounts:', this.bankAccounts);
        } else {
          this.bankAccounts = [];
          console.warn('No bank accounts data received');
        }
      } catch (error) {
        console.error('Failed to load bank accounts:', error);
        this.bankAccounts = [];
        this.$bvToast.toast('Failed to load bank accounts. Please try again.', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      } finally {
        this.isLoadingBankData = false;
      }
    },

    async loadPOSTerminals() {
      try {
        this.isLoadingBankData = true;

        // Fetch active POS terminals from accounting API
        const response = await this.$store.dispatch('accounting/getActivePOSTerminals');

        if (response && response.data) {
          this.posTerminals = response.data;
          console.log('Loaded POS terminals:', this.posTerminals);
        } else {
          this.posTerminals = [];
          console.warn('No POS terminals data received');
        }
      } catch (error) {
        console.error('Failed to load POS terminals:', error);
        this.posTerminals = [];
        this.$bvToast.toast('Failed to load POS terminals. Please try again.', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      } finally {
        this.isLoadingBankData = false;
      }
    },

    async loadCashRegisters() {
      try {
        this.isLoadingCashRegisters = true;

        // Fetch active cash registers from accounting API
        const response = await this.$store.dispatch('accounting/getCashRegisters', {
          page: 1,
          limit: 100,
          filters: { status: 'OPEN' },
        });

        if (response && response.data) {
          this.cashRegisters = response.data;
          console.log('Loaded cash registers:', this.cashRegisters);
        } else {
          this.cashRegisters = [];
          console.warn('No cash registers data received');
        }
      } catch (error) {
        console.error('Failed to load cash registers:', error);
        this.cashRegisters = [];
        this.$bvToast.toast('Failed to load cash registers. Please try again.', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      } finally {
        this.isLoadingCashRegisters = false;
      }
    },

    async loadPaymentOptions() {
      try {
        if (!this.bill?.id || !this.bill?.patient_id) return;

        // Fetch payment options from the new payment processing API
        const response = await this.$store.dispatch('accounting/getPaymentOptions', {
          billId: this.bill.id,
          patientId: this.bill.patient_id,
        });

        if (response && response.data) {
          // Update payment methods based on API response
          this.updatePaymentMethodsFromAPI(response.data);
        }
      } catch (error) {
        console.error('Failed to load payment options:', error);
        // Fallback to default payment methods if API fails
      }
    },

    updatePaymentMethodsFromAPI(apiData) {
      // Update payment methods availability based on API response
      if (apiData.payment_methods) {
        this.paymentMethods.forEach((method) => {
          const apiMethod = apiData.payment_methods.find(
            (m) => m.value === method.id.toUpperCase()
          );
          if (apiMethod) {
            method.available = apiMethod.available;
            method.requires_additional_info = apiMethod.requires_additional_info;
            method.additional_fields = apiMethod.additional_fields;
          }
        });
      }
    },

    getValidationErrors() {
      const errors = [];

      if (this.currentStep === 'payment-details') {
        if (this.paymentForm.amount <= 0) {
          errors.push('Payment amount must be greater than zero');
        }
        if (!this.paymentForm.payment_date) {
          errors.push('Payment date is required');
        }
        if (!this.paymentForm.payment_type) {
          errors.push('Payment type is required');
        }

        // Method-specific validation
        switch (this.selectedPaymentMethod) {
          case 'cash':
            if (!this.paymentForm.cash_register_id) {
              errors.push('Cash register selection is required for cash payments');
            }
            if (!this.paymentForm.cash_received || this.paymentForm.cash_received <= 0) {
              errors.push('Cash received amount must be greater than zero');
            }
            if (this.paymentForm.cash_received < this.paymentForm.amount) {
              errors.push('Cash received must be greater than or equal to payment amount');
            }
            break;
          case 'card':
            if (!this.paymentForm.pos_terminal_id) {
              errors.push('POS terminal selection is required for card payments');
            }
            break;
          case 'bank_transfer':
            if (!this.paymentForm.bank_account_id) {
              errors.push('Bank account selection is required for bank transfers');
            }
            if (!this.paymentForm.bank_reference) {
              errors.push('Bank reference number is required for bank transfers');
            }
            break;
          case 'insurance':
            if (!this.paymentForm.insurance_provider) {
              errors.push('Insurance provider selection is required');
            }
            break;
          case 'deposit':
            if (this.paymentForm.deposit_usage <= 0) {
              errors.push('Deposit usage amount must be greater than zero');
            }
            break;
        }
      }

      return errors;
    },

    async selectPaymentMethod(methodId) {
      this.selectedPaymentMethod = methodId;

      // Auto-set deposit usage if deposit method selected
      if (methodId === 'deposit') {
        // Load deposit if not already loaded
        if (!this.patientDeposit && this.bill?.patient_id) {
          await this.loadPatientDeposit();
        }
        // Set deposit usage to maximum available
        this.setMaxDepositUsage();
      }

      // Auto-fetch patient insurance if insurance method selected
      if (methodId === 'insurance' && this.bill?.patient_id) {
        await this.loadPatientDeposit();
      }

      // Reset deposit usage if switching away from deposit method
      if (methodId !== 'deposit') {
        this.paymentForm.deposit_usage = 0;
      }

      // Auto-populate cash received for cash payments
      if (methodId === 'cash') {
        this.paymentForm.cash_received = this.paymentForm.amount;
        this.calculateChange();
      }
    },

    nextStep() {
      if (this.currentStep === 'payment-method') {
        this.currentStep = 'payment-details';
        this.completedSteps.push('payment-method');
      } else if (this.currentStep === 'payment-details') {
        this.currentStep = 'confirmation';
        this.completedSteps.push('payment-details');
      }
    },

    previousStep() {
      if (this.currentStep === 'confirmation') {
        this.currentStep = 'payment-details';
        this.completedSteps = this.completedSteps.filter((step) => step !== 'confirmation');
      } else if (this.currentStep === 'payment-details') {
        this.currentStep = 'payment-method';
        this.completedSteps = this.completedSteps.filter((step) => step !== 'payment-details');
      }
    },

    validateAmount() {
      if (this.paymentForm.amount > this.selectedItemsTotal) {
        this.paymentForm.amount = this.selectedItemsTotal;
      }
      if (this.paymentForm.amount < 0) {
        this.paymentForm.amount = 0;
      }
    },

    calculateChange() {
      if (this.selectedPaymentMethod === 'cash') {
        this.paymentForm.change_given =
          (this.paymentForm.cash_received || 0) - (this.paymentForm.amount || 0);
      }
    },

    calculateInsuranceAmount() {
      if (this.selectedPaymentMethod === 'insurance') {
        this.paymentForm.insurance_covers =
          this.selectedItemsTotal - (this.paymentForm.copay_amount || 0);
      }
    },

    // Deposit helper methods
    setMaxDepositUsage() {
      if (this.patientDeposit && this.patientDeposit.balance > 0) {
        this.paymentForm.deposit_usage = Math.min(
          this.selectedItemsTotal,
          this.patientDeposit.balance
        );
      }
    },

    validateDepositUsage() {
      if (this.paymentForm.deposit_usage > this.patientDeposit?.current_balance) {
        this.paymentForm.deposit_usage = this.patientDeposit.current_balance;
        this.$bvToast.toast('Deposit usage cannot exceed available balance', {
          title: 'Warning',
          variant: 'warning',
          solid: true,
        });
      }
      if (this.paymentForm.deposit_usage > this.selectedItemsTotal) {
        this.paymentForm.deposit_usage = this.selectedItemsTotal;
        this.$bvToast.toast('Deposit usage cannot exceed payment amount', {
          title: 'Warning',
          variant: 'warning',
          solid: true,
        });
      }
      if (this.paymentForm.deposit_usage < 0) {
        this.paymentForm.deposit_usage = 0;
      }
    },

    showDepositHistory() {
      if (this.bill?.patient_id) {
        // Navigate to deposit history page or show modal
        this.$bvToast.toast('Deposit history feature coming soon', {
          title: 'Info',
          variant: 'info',
          solid: true,
        });
      }
    },

    // Mixed payment handling
    canUseMixedPayment() {
      return this.canUseDeposit && this.selectedItemsTotal > (this.patientDeposit?.balance || 0);
    },

    getMixedPaymentBreakdown() {
      if (!this.canUseMixedPayment) return null;

      const depositAmount = Math.min(this.selectedItemsTotal, this.patientDeposit.balance);
      const remainingAmount = this.selectedItemsTotal - depositAmount;

      return {
        depositAmount,
        remainingAmount,
        depositPercentage: Math.round((depositAmount / this.selectedItemsTotal) * 100),
        remainingPercentage: Math.round((remainingAmount / this.selectedItemsTotal) * 100),
      };
    },

    // Payment method specific helpers
    getPaymentMethodRequirements() {
      const requirements = {
        cash: ['Amount', 'Cash Received', 'Change Given'],
        card: ['Amount', 'POS Terminal', 'Transaction Reference'],
        bank_transfer: ['Amount', 'Bank Account', 'Bank Reference'],
        insurance: ['Amount', 'Insurance Provider', 'Policy Number', 'Co-pay'],
        deposit: ['Amount', 'Deposit Usage'],
        other: ['Amount', 'Payment Description'],
      };

      return requirements[this.selectedPaymentMethod] || [];
    },

    enableMixedPayment() {
      if (this.canUseMixedPayment) {
        const breakdown = this.getMixedPaymentBreakdown();
        this.paymentForm.deposit_usage = breakdown.depositAmount;
        this.paymentForm.amount = breakdown.remainingAmount;

        this.$bvToast.toast(
          `Mixed payment enabled: ${this.formatCurrency(
            breakdown.depositAmount
          )} from deposit, ${this.formatCurrency(breakdown.remainingAmount)} to collect`,
          {
            title: 'Mixed Payment Enabled',
            variant: 'success',
            solid: true,
          }
        );
      }
    },

    async processPayment() {
      try {
        // Validation
        if (!this.bill?.id) {
          throw new Error('Bill information is missing');
        }

        if (this.selectedItemsData.length === 0) {
          throw new Error('No items selected for payment');
        }

        // Double-check that no paid items are being processed
        const paidItems = this.selectedItemsData.filter((item) => {
          const isPaid =
            item.payment_status === 'PAID' ||
            item.payment_status === 'FULLY_PAID' ||
            item.is_paid === true ||
            (item.paid_amount && item.paid_amount >= item.total_price);
          return isPaid;
        });

        if (paidItems.length > 0) {
          throw new Error(
            `Cannot process payment for already paid items: ${paidItems
              .map((item) => item.id)
              .join(', ')}`
          );
        }

        if (this.paymentForm.amount <= 0) {
          throw new Error('Payment amount must be greater than zero');
        }

        // Cash register validation for cash payments
        if (this.selectedPaymentMethod === 'cash') {
          if (!this.paymentForm.cash_register_id) {
            throw new Error('Cash register selection is required for cash payments');
          }

          if (!this.selectedCashRegister) {
            throw new Error('Selected cash register not found');
          }

          if (this.selectedCashRegister.status !== 'OPEN') {
            throw new Error(
              `Cash register ${this.selectedCashRegister.register_code} is not open. Current status: ${this.selectedCashRegister.status}`
            );
          }
        }

        if (!this.selectedPaymentMethod) {
          throw new Error('Please select a payment method');
        }

        if (!this.paymentForm.payment_type) {
          throw new Error('Please select a payment type');
        }

        this.processing = true;

        // Pre-validate payment data with server
        const validationResult = await this.$store.dispatch(
          'accounting/validatePaymentData',
          this.buildPaymentData()
        );

        if (!validationResult.success) {
          throw new Error(`Payment validation failed: ${validationResult.error}`);
        }

        // Build payment data with only relevant fields for the selected payment method
        const paymentData = this.buildPaymentData();

        // Debug: Log the payment data being sent
        console.log('Payment data being sent to server:', paymentData);
        console.log('Selected payment method:', this.selectedPaymentMethod);

        const result = await this.$store.dispatch('accounting/createClinicalPayment', paymentData);

        if (result.success) {
          this.$bvToast.toast('Payment processed successfully', {
            title: 'Success',
            variant: 'success',
            solid: true,
          });

          // Store payment ID for receipt generation
          this.lastProcessedPaymentId = result.data?.id || result.data?.payment?.id;

          // Show receipt options modal
          this.showReceiptOptions = true;
        } else {
          throw new Error(result.error || 'Failed to process payment');
        }
      } catch (error) {
        console.error('Payment processing error:', error);
        this.$bvToast.toast(error.message || 'Failed to process payment', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      } finally {
        this.processing = false;
      }
    },

    formatCurrency(amount) {
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
      }).format(amount || 0);
    },

    async refreshPaymentStatus() {
      try {
        this.$bvToast.toast('Refreshing payment status...', {
          title: 'Refreshing',
          variant: 'info',
          solid: true,
        });

        // Reload bill data to get updated payment status
        await this.initializePage();

        this.$bvToast.toast('Payment status refreshed successfully', {
          title: 'Success',
          variant: 'success',
          solid: true,
        });
      } catch (error) {
        console.error('Failed to refresh payment status:', error);
        this.$bvToast.toast(`Failed to refresh payment status: ${error.message}`, {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      }
    },

    // Receipt methods
    async downloadReceipt() {
      if (!this.lastProcessedPaymentId) {
        this.$bvToast.toast('No payment ID available for receipt', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
        return;
      }

      try {
        this.isDownloadingReceipt = true;

        const result = await this.$store.dispatch(
          'accounting/downloadPaymentReceipt',
          this.lastProcessedPaymentId
        );

        if (result.success) {
          this.$bvToast.toast('Receipt downloaded successfully', {
            title: 'Success',
            variant: 'success',
            solid: true,
          });
        } else {
          throw new Error(result.error || 'Failed to download receipt');
        }
      } catch (error) {
        console.error('Receipt download error:', error);
        this.$bvToast.toast(`Failed to download receipt: ${error.message}`, {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      } finally {
        this.isDownloadingReceipt = false;
      }
    },

    closeReceiptOptions() {
      this.showReceiptOptions = false;
      this.lastProcessedPaymentId = null;

      // Navigate back to bill items page
      this.$router.push({
        name: 'bill-items',
        params: { billId: this.bill.id },
      });
    },

    printReceipt() {
      // For now, just download the receipt
      // In the future, this could open a print dialog
      this.downloadReceipt();
    },
  },
};
</script>

<style scoped>
.payment-processing-page {
  padding: 2rem;
  background: #f8f9fa;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.header-left {
  flex: 1;
}

.breadcrumb {
  margin-bottom: 1rem;
}

.back-btn {
  color: #6c757d;
  text-decoration: none;
  padding: 0;
}

.back-btn:hover {
  color: #007bff;
}

.page-title {
  font-size: 2rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 1rem 0;
}

.payment-summary {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.payment-summary .summary-item .value.text-success {
  color: #28a745 !important;
}

.payment-summary .summary-item .value.text-primary {
  color: #007bff !important;
}

.summary-item {
  display: flex;
  flex-direction: column;
}

.summary-item .label {
  font-size: 0.8rem;
  color: #6c757d;
  text-transform: uppercase;
  font-weight: 600;
}

.summary-item .value {
  font-size: 1rem;
  color: #2c3e50;
  font-weight: 600;
}

.summary-item .amount {
  color: #28a745;
}

.header-actions {
  display: flex;
  gap: 1rem;
  flex-shrink: 0;
}

/* Payment Steps */
.payment-steps {
  margin-bottom: 2rem;
}

.steps-container {
  display: flex;
  justify-content: center;
  gap: 2rem;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  position: relative;
}

.step-item:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 25px;
  left: 50%;
  width: 2rem;
  height: 2px;
  background: #e9ecef;
  transform: translateX(-50%);
}

.step-item.completed:not(:last-child)::after {
  background: #28a745;
}

.step-number {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #e9ecef;
  color: #6c757d;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.2rem;
  transition: all 0.3s ease;
}

.step-item.active .step-number {
  background: #007bff;
  color: white;
  transform: scale(1.1);
}

.step-item.completed .step-number {
  background: #28a745;
  color: white;
}

.step-label {
  font-size: 0.9rem;
  color: #6c757d;
  font-weight: 500;
  text-align: center;
}

.step-item.active .step-label {
  color: #007bff;
  font-weight: 600;
}

.step-item.completed .step-label {
  color: #28a745;
  font-weight: 600;
}

/* Step Content */
.step-content {
  margin-bottom: 2rem;
}

.step-content .card {
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.step-content .card-title {
  color: #2c3e50;
  font-weight: 600;
}

/* Payment Methods Grid */
.payment-methods-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.payment-method-card {
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.payment-method-card:hover {
  border-color: #007bff;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.payment-method-card.selected {
  border-color: #28a745;
  background: #f8fff9;
}

.method-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background: linear-gradient(135deg, #007bff, #0056b3);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.payment-method-card.selected .method-icon {
  background: linear-gradient(135deg, #28a745, #1e7e34);
}

.method-content {
  flex: 1;
  min-width: 0;
}

.method-name {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

.method-description {
  color: #6c757d;
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
  line-height: 1.4;
}

.method-features {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.feature-tag {
  background: #e9ecef;
  color: #6c757d;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.method-radio {
  flex-shrink: 0;
}

/* Method Specific Fields */
.method-specific-fields {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  margin: 1.5rem 0;
  border-left: 4px solid #007bff;
}

.method-specific-fields h6 {
  color: #2c3e50;
  font-weight: 600;
}

/* Payment Summary Details */
.payment-summary-details {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.selected-items-list {
  max-height: 300px;
  overflow-y: auto;
}

.selected-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: white;
  border-radius: 6px;
  margin-bottom: 0.5rem;
  border: 1px solid #e9ecef;
}

.item-info strong {
  color: #2c3e50;
}

.item-amount {
  font-weight: 600;
  color: #28a745;
}

.payment-breakdown {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.payment-breakdown h6 {
  color: #2c3e50;
  font-weight: 600;
}

.payment-breakdown .table td {
  padding: 0.5rem 0;
  border: none;
}

/* Step Actions */
.step-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1.5rem;
  border-top: 1px solid #e9ecef;
}

/* Debug Section */
.debug-section {
  border: 2px dashed #dee2e6;
}

.debug-pre {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 0.5rem;
  font-size: 0.75rem;
  max-height: 200px;
  overflow-y: auto;
  margin: 0;
}

.badge-sm {
  font-size: 0.7rem;
  padding: 0.2rem 0.4rem;
}

.badge-success {
  background-color: #28a745;
  color: white;
}

.badge-warning {
  background-color: #ffc107;
  color: #212529;
}

.badge-secondary {
  background-color: #6c757d;
  color: white;
}

.badge-info {
  background-color: #17a2b8;
  color: white;
}

.debug-toggle-btn {
  opacity: 0.7;
  transition: opacity 0.3s ease;
}

.debug-toggle-btn:hover {
  opacity: 1;
}

/* Loading Overlay */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-content {
  text-align: center;
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.loading-content h5 {
  color: #2c3e50;
  font-weight: 600;
}

/* Receipt Modal Styles */
.success-icon {
  animation: bounceIn 0.6s ease-out;
}

.receipt-options {
  max-width: 500px;
  margin: 0 auto;
}

.receipt-options .btn {
  transition: all 0.3s ease;
}

.receipt-options .btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .payment-processing-page {
    padding: 1rem;
  }

  .header-content {
    flex-direction: column;
    gap: 1rem;
  }

  .header-actions {
    flex-wrap: wrap;
    justify-content: center;
  }

  .payment-summary {
    flex-direction: column;
    gap: 1rem;
  }

  .steps-container {
    flex-direction: column;
    gap: 1rem;
  }

  .step-item:not(:last-child)::after {
    display: none;
  }

  .payment-methods-grid {
    grid-template-columns: 1fr;
  }

  .payment-method-card {
    flex-direction: column;
    text-align: center;
  }

  .method-icon {
    width: 50px;
    height: 50px;
    font-size: 1.25rem;
  }

  .step-actions {
    flex-direction: column;
    gap: 1rem;
  }

  .step-actions .btn {
    width: 100%;
  }
}

@media (max-width: 576px) {
  .payment-method-card {
    padding: 1rem;
  }

  .method-specific-fields {
    padding: 1rem;
  }

  .payment-summary-details {
    padding: 1rem;
  }
}
</style>
