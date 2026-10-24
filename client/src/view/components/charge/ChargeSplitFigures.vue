<template>
  <div class="charge-figures" :class="{ 'charge-figures--compact': compact }">
    <div class="charge-figure">
      <span class="charge-figure__label">Total</span>
      <span class="charge-figure__value">₦{{ formatNaira(chargeTotal(line)) }}</span>
    </div>

    <div class="charge-figure">
      <span class="charge-figure__label">Patient pays</span>
      <span v-if="state === 'awaiting'" class="charge-figure__pending">Awaiting split</span>
      <span v-else class="charge-figure__value">₦{{ formatNaira(chargePatient(line)) }}</span>
      <span v-if="patientShareDiffers" class="charge-figure__secondary">
        Share ₦{{ formatNaira(chargePatientShare(line)) }}
      </span>
    </div>

    <div class="charge-figure">
      <span class="charge-figure__label">Payer covers</span>
      <span v-if="state === 'awaiting'" class="charge-figure__pending">Awaiting split</span>
      <span v-else-if="payerParts && payerParts.length === 0" class="charge-figure__value">
        ₦{{ formatNaira(0) }}
      </span>
      <span v-for="part in payerParts" :key="part.label" class="charge-figure__payer">
        <span v-if="part.amount > 0"> {{ part.label }} ₦{{ formatNaira(part.amount) }} </span>
        <span v-else class="charge-figure__pending">{{ part.label }}</span>
        <span v-if="capturedDiffers(part)" class="charge-figure__secondary">
          Captured ₦{{ formatNaira(part.captured) }}
        </span>
      </span>
    </div>
  </div>
</template>

<script>
import chargeSplit from '@/common/chargeSplit';

export default {
  name: 'ChargeSplitFigures',
  mixins: [chargeSplit],
  props: {
    line: {
      type: Object,
      required: true,
    },
    compact: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    state() {
      return this.chargeSplitState(this.line);
    },
    payerParts() {
      return this.chargePayerParts(this.line);
    },
    patientShareDiffers() {
      const share = this.chargePatientShare(this.line);
      const net = this.chargePatient(this.line);
      return share !== null && net !== null && Number(share) !== Number(net);
    },
  },
  methods: {
    capturedDiffers(part) {
      return part.captured !== null && Number(part.captured) !== Number(part.amount);
    },
  },
};
</script>

<style scoped>
.charge-figures {
  display: grid;
  grid-template-columns: repeat(3, minmax(120px, 1fr));
  gap: 12px;
}

.charge-figure {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.charge-figure__label {
  font-size: 11px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #7e8299;
  font-weight: 600;
}

.charge-figure__value {
  font-size: 15px;
  font-weight: 600;
  color: #3f4254;
}

.charge-figure__secondary {
  font-size: 11px;
  color: #7e8299;
}

.charge-figure__pending {
  font-size: 12px;
  color: #b98900;
  font-weight: 600;
}

.charge-figure__payer {
  display: flex;
  flex-direction: column;
  font-size: 13px;
  color: #3f4254;
}

.charge-figures--compact {
  grid-template-columns: 1fr;
  gap: 2px;
}

.charge-figures--compact .charge-figure {
  flex-direction: row;
  align-items: baseline;
  gap: 6px;
}

.charge-figures--compact .charge-figure__label {
  font-size: 10px;
  min-width: 76px;
}

.charge-figures--compact .charge-figure__value {
  font-size: 12px;
}

.charge-figures--compact .charge-figure__secondary,
.charge-figures--compact .charge-figure__pending,
.charge-figures--compact .charge-figure__payer {
  font-size: 10px;
}
</style>
