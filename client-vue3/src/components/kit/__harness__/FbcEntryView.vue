<script setup lang="ts">
import { computed, reactive } from 'vue';
import KitInput from '../KitInput.vue';
import KitTextarea from '../KitTextarea.vue';
import KitResultGrid from '../KitResultGrid.vue';
import { resultCell as cell, resultHead as head } from '../resultGridClasses';
import { differentialRows, morphologyRows, rows, type FbcRow } from './fbcRows';

const params = new URLSearchParams(window.location.search);
const section = params.get('section') ?? 'ResultSection';
const readOnly = section === 'ValidationSection' || section === 'ApprovalSection';

const fbc = reactive<Record<string, string>>({ comments: '' });
if (readOnly) {
  fbc.wbc = '7.1';
  fbc.neutrophils = '50';
  fbc.comments = 'Reviewed';
}

const showRow = (row: FbcRow): boolean => !readOnly || Boolean(fbc[row.model]);
const anyFilled = (group: FbcRow[]): boolean => group.some((row) => Boolean(fbc[row.model]));
const showDifferential = computed(() => !readOnly || anyFilled(differentialRows));
const showMorphology = computed(() => !readOnly || anyFilled(morphologyRows));
const showComments = computed(() => !readOnly || Boolean(fbc.comments));
</script>

<template>
  <div>
    <KitResultGrid label="Full blood count results">
      <template #head>
        <tr>
          <th scope="col" rowspan="2" :class="head">Test</th>
          <th scope="col" rowspan="2" :class="head">Result</th>
          <th scope="col" rowspan="2" :class="head">Children Range</th>
          <th scope="colgroup" colspan="2" :class="head">Adult Range</th>
          <th scope="col" rowspan="2" :class="head">Unit</th>
        </tr>
        <tr>
          <th scope="col" :class="head">Male</th>
          <th scope="col" :class="head">Female</th>
        </tr>
      </template>
      <template v-for="row in rows" :key="row.model">
        <tr v-if="showRow(row)" class="h-row" data-testid="result-row">
          <th scope="row" :class="cell" class="text-left font-medium">{{ row.label }}</th>
          <td :class="cell">
            <KitInput
              v-model="fbc[row.model]"
              :label="row.label"
              hide-label
              numeric
              :disabled="readOnly"
              data-grid-col="result"
            />
          </td>
          <td :class="cell">{{ row.childRange }}</td>
          <td :class="cell">{{ row.adultRangeMale }}</td>
          <td :class="cell">{{ row.adultRangeFemale }}</td>
          <td :class="cell">{{ row.unit }}</td>
        </tr>
      </template>
      <template v-if="showDifferential">
        <tr class="h-row">
          <th scope="colgroup" colspan="6" :class="head">Differential</th>
        </tr>
        <template v-for="row in differentialRows" :key="row.model">
          <tr v-if="showRow(row)" class="h-row" data-testid="result-row">
            <th scope="row" :class="cell" class="text-left font-medium">{{ row.label }}</th>
            <td :class="cell">
              <KitInput
                v-model="fbc[row.model]"
                :label="row.label"
                hide-label
                numeric
                :disabled="readOnly"
                data-grid-col="result"
              />
            </td>
            <td :class="cell">{{ row.childRange }}</td>
            <td colspan="2" :class="cell">{{ row.adultRangeMale }}</td>
            <td :class="cell">{{ row.unit }}</td>
          </tr>
        </template>
      </template>
      <template v-if="showMorphology">
        <tr class="h-row">
          <th scope="colgroup" colspan="6" :class="head">RBC Morphology</th>
        </tr>
        <template v-for="row in morphologyRows" :key="row.model">
          <tr v-if="showRow(row)" class="h-row" data-testid="result-row">
            <th scope="row" :class="cell" class="text-left font-medium">{{ row.label }}</th>
            <td colspan="5" :class="cell">
              <KitInput
                v-model="fbc[row.model]"
                :label="row.label"
                hide-label
                :disabled="readOnly"
                data-grid-col="result"
              />
            </td>
          </tr>
        </template>
      </template>
      <tr v-if="showComments">
        <th scope="row" :class="cell" class="text-left font-medium">Comments</th>
        <td colspan="5" class="px-2 py-1">
          <KitTextarea v-model="fbc.comments" label="Comments" hide-label :disabled="readOnly" />
        </td>
      </tr>
    </KitResultGrid>
    <output data-testid="model" class="sr-only">{{ JSON.stringify(fbc) }}</output>
  </div>
</template>
