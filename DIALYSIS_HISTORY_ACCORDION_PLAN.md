# Dialysis Integration into HistoryAccordion.vue - Implementation Plan

## Overview
Add Dialysis treatments, vitals, assessment, and notes to the HistoryAccordion.vue component tabs. The Dialysis vitals table should be integrated into the existing Vitals tab, while treatments, assessment, and notes should get their own dedicated tabs.

## Current State Analysis

### Existing HistoryAccordion.vue Structure
- **Vitals Tab**: Currently shows `TriageTable` or `AntenatalTriageTable` based on visit category
- **Other Tabs**: Consultation, ANC History, Diagnoses, Tests, Medications, Items, Radiology, Services, Clinical Notes, Ward Rounds
- **Pattern**: Each tab uses a dedicated table component that receives data via props

### Existing Dialysis Infrastructure
- **Database Models**: 
  - `DialysisVitals` - Blood flow rate, pulse, temperature, oxygen saturation, weight, blood pressure
  - `DialysisTreatment` - Treatment records with status, duration, parameters, outcome
  - `DialysisAssessment` - Pre/post dialysis assessments with various health indicators
  - `DialysisNotes` - Clinical notes with different types (pre-treatment, during, post-treatment)
- **Existing Components**: `DialysisTreatment.vue` (full management interface), `DialysisVisits.vue` (visit management)

## Implementation Plan

### Phase 1: Create Dialysis Table Components (Days 1-2)

#### 1.1 Create DialysisVitalsTable.vue
- **Location**: `client/src/view/components/table/DialysisVitalsTable.vue`
- **Purpose**: Display dialysis-specific vitals in the existing Vitals tab
- **Data Fields**: Blood flow rate, pulse, temperature, oxygen saturation, weight, blood pressure, time, recorded by
- **Pattern**: Follow `TriageTable.vue` structure with dialysis-specific columns
- **Features**: 
  - View details modal for individual vital records
  - Time-based sorting
  - Staff attribution display

#### 1.2 Create DialysisTreatmentTable.vue
- **Location**: `client/src/view/components/table/DialysisTreatmentTable.vue`
- **Purpose**: Display dialysis treatment records in dedicated tab
- **Data Fields**: Treatment type, date, duration, blood flow, outcome, status, parameters
- **Pattern**: Follow `DiagnosesTable.vue` structure with treatment-specific columns
- **Features**:
  - Status indicators (Not Started, In Progress, Completed, Interrupted, Paused)
  - Outcome color coding
  - View details modal

#### 1.3 Create DialysisAssessmentTable.vue
- **Location**: `client/src/view/components/table/DialysisAssessmentTable.vue`
- **Purpose**: Display pre/post dialysis assessments
- **Data Fields**: Assessment type, date, findings, recommendations, assessed by
- **Pattern**: Follow `ObservationsTable.vue` structure
- **Features**:
  - Pre/Post assessment differentiation
  - Assessment type indicators
  - Detailed findings display

#### 1.4 Create DialysisNotesTable.vue
- **Location**: `client/src/view/components/table/DialysisNotesTable.vue`
- **Purpose**: Display dialysis clinical notes
- **Data Fields**: Note type, content, date, author, priority
- **Pattern**: Follow `ClinicalNotesTable.vue` structure
- **Features**:
  - Note type categorization (pre-treatment, during, post-treatment)
  - Priority indicators
  - Rich text content display

### Phase 2: Update HistoryAccordion.vue (Days 3-4)

#### 2.1 Modify Vitals Tab
- **Current**: Shows `TriageTable` or `AntenatalTriageTable` based on category
- **New**: Add conditional rendering for dialysis vitals
- **Implementation**:
  ```vue
  <b-tab title="Vitals" active>
    <dialysis-vitals-table
      v-if="summary.category === DIALYSIS"
      :vitals="summary.dialysisVitals"
    />
    <antenatal-triage-table
      v-else-if="summary.category === ANTENATAL"
      :triages="summary.triages"
    />
    <triage-table v-else :triages="summary.triages" />
  </b-tab>
  ```

**Specific Changes to HistoryAccordion.vue:**
1. **Add Import Statements** (around line 130):
   ```vue
   <script>
   import DialysisVitalsTable from '@/view/components/table/DialysisVitalsTable.vue';
   import DialysisTreatmentTable from '@/view/components/table/DialysisTreatmentTable.vue';
   import DialysisAssessmentTable from '@/view/components/table/DialysisAssessmentTable.vue';
   import DialysisNotesTable from '@/view/components/table/DialysisNotesTable.vue';
   // ... existing imports
   ```

2. **Add to Components Registration** (around line 180):
   ```vue
   components: {
     // ... existing components
     DialysisVitalsTable,
     DialysisTreatmentTable,
     DialysisAssessmentTable,
     DialysisNotesTable,
   },
   ```

3. **Add DIALYSIS Constant** (around line 175):
   ```vue
   data: () => ({
     disabled: 'disabled',
     ANTENATAL: 'Antenatal',
     INPATIENT: 'Inpatient',
     FEMALE: 'Female',
     DIALYSIS: 'Dialysis', // NEW: Add dialysis constant
   }),
   ```

#### 2.2 Add New Dialysis Tabs
- **Dialysis Treatments Tab**: Show treatment records
- **Dialysis Assessment Tab**: Show pre/post assessments  
- **Dialysis Notes Tab**: Show clinical notes
- **Implementation**:
  ```vue
  <b-tab v-if="summary.category === DIALYSIS" title="Dialysis Treatments">
    <dialysis-treatment-table :treatments="summary.dialysisTreatments" />
  </b-tab>
  <b-tab v-if="summary.category === DIALYSIS" title="Dialysis Assessment">
    <dialysis-assessment-table :assessments="summary.dialysisAssessments" />
  </b-tab>
  <b-tab v-if="summary.category === DIALYSIS" title="Dialysis Notes">
    <dialysis-notes-table :notes="summary.dialysisNotes" />
  </b-tab>
  ```

#### 2.3 Update Component Imports and Data
- **Add Imports**: Import all new dialysis table components
- **Add Constants**: Add `DIALYSIS = 'Dialysis'` to data
- **Update Props**: Ensure summary object includes dialysis data

### Phase 3: Backend Data Integration (Days 5-6)

#### 3.1 Update Visit Summary Service
- **Location**: `server/src/modules/Consultation/consultation.repository.ts`
- **Function**: `getVisitPrescriptions()` - This is the main function that aggregates all visit data
- **Purpose**: Include dialysis data in visit summaries alongside existing data

#### 3.2 Create Dialysis Data Retrieval Functions
- **Location**: `server/src/modules/Dialysis/dialysis.repository.ts` (new file)
- **File Structure**:
  ```typescript
  import { Op } from 'sequelize';
  import {
    DialysisVitals,
    DialysisTreatment,
    DialysisAssessment,
    DialysisNotes,
    Staff,
    DialysisVisit,
  } from '../../database/models';
  import { staffAttributes } from '../../core/helpers/helper';

  // Export all functions for use in consultation.repository.ts
  ```
- **Functions to create**:
  ```typescript
  // Get dialysis vitals for visits
  export const getDialysisVitals = async (visitIds: number[]) => {
    return DialysisVitals.findAll({
      where: { visit_id: { [Op.in]: visitIds } },
      include: [
        { model: Staff, attributes: staffAttributes },
        { model: DialysisVisit, attributes: ['id', 'dialysis_type'] }
      ],
      order: [['time', 'ASC']]
    });
  };

  // Get dialysis treatments for visits
  export const getDialysisTreatments = async (visitIds: number[]) => {
    return DialysisTreatment.findAll({
      where: { visit_id: { [Op.in]: visitIds } },
      include: [
        { model: Staff, attributes: staffAttributes },
        { model: DialysisVisit, attributes: ['id', 'dialysis_type', 'scheduled_date'] }
      ],
      order: [['actual_start_date', 'DESC']]
    });
  };

  // Get dialysis assessments for visits
  export const getDialysisAssessments = async (visitIds: number[]) => {
    return DialysisAssessment.findAll({
      where: { visit_id: { [Op.in]: visitIds } },
      include: [
        { model: Staff, attributes: staffAttributes },
        { model: DialysisVisit, attributes: ['id', 'dialysis_type'] }
      ],
      order: [['assessment_date', 'DESC']]
    });
  };

  // Get dialysis notes for visits
  export const getDialysisNotes = async (visitIds: number[]) => {
    return DialysisNotes.findAll({
      where: { visit_id: { [Op.in]: visitIds } },
      include: [
        { model: Staff, attributes: staffAttributes },
        { model: DialysisVisit, attributes: ['id', 'dialysis_type'] }
      ],
      order: [['created_at', 'DESC']]
    });
  };
  ```

#### 3.3 Update getVisitPrescriptions Function
- **Location**: `server/src/modules/Consultation/consultation.repository.ts`
- **Modification**: Add dialysis data retrieval to the existing Promise.all array
- **Implementation**:
  ```typescript
  export const getVisitPrescriptions = async (
    visitIds: number[],
    categories: VisitCategory[],
    antenatalIds: number[] = []
  ) => {
    const [
      tests,
      drugs,
      investigations,
      observations,
      triages,
      diagnoses,
      items,
      services,
      notes,
      wardRounds,
      // NEW: Add dialysis data
      dialysisVitals,
      dialysisTreatments,
      dialysisAssessments,
      dialysisNotes,
    ] = await Promise.all([
      getPrescriptionTests({ visit_id: visitIds }),
      getDrugsPrescribed({ visit_id: visitIds }),
      getPrescriptionInvestigations({ visit_id: visitIds }),
      getObservations(visitIds, categories, antenatalIds),
      getVisitTriages(visitIds, categories),
      getPatientDiagnoses({ visit_id: visitIds }),
      getAdditionalItems({ visit_id: visitIds }),
      getPrescriptionServices({ visit_id: visitIds }),
      getClinicalNotes(visitIds, categories),
      getVisitsWardRounds(visitIds, categories),
      // NEW: Add dialysis data calls
      getDialysisVitals(visitIds),
      getDialysisTreatments(visitIds),
      getDialysisAssessments(visitIds),
      getDialysisNotes(visitIds),
    ]);

    const data = {
      tests: getPrescriptionsByVisit(tests.map(prescription => prescription.toJSON())),
      drugs: getPrescriptionsByVisit(drugs.map(prescription => prescription.toJSON())),
      investigations: getPrescriptionsByVisit(
        investigations.map(prescription => prescription.toJSON())
      ),
      observations: getPrescriptionsByVisit(observations.map(prescription => prescription.toJSON())),
      triages: getPrescriptionsByVisit(triages.map(prescription => prescription.toJSON())),
      diagnoses: getPrescriptionsByVisit(diagnoses.map(prescription => prescription.toJSON())),
      items: getPrescriptionsByVisit(items.map(prescription => prescription.toJSON())),
      services: getPrescriptionsByVisit(services.map(prescription => prescription.toJSON())),
      notes: getPrescriptionsByVisit(notes.map(prescription => prescription.toJSON())),
      wardRounds: getPrescriptionsByVisit(wardRounds.map(prescription => prescription.toJSON())),
      // NEW: Add dialysis data processing
      dialysisVitals: getPrescriptionsByVisit(dialysisVitals.map(vital => vital.toJSON())),
      dialysisTreatments: getPrescriptionsByVisit(dialysisTreatments.map(treatment => treatment.toJSON())),
      dialysisAssessments: getPrescriptionsByVisit(dialysisAssessments.map(assessment => assessment.toJSON())),
      dialysisNotes: getPrescriptionsByVisit(dialysisNotes.map(note => note.toJSON())),
    };

    return visitIds.map(id => ({
      tests: data.tests[id] || [],
      drugs: data.drugs[id] || [],
      investigations: data.investigations[id] || [],
      observations: data.observations[id] || [],
      triages: data.triages[id] || [],
      diagnoses: data.diagnoses[id] || [],
      items: data.items[id] || [],
      services: data.services[id] || [],
      notes: data.notes[id] || [],
      wardRounds: data.wardRounds[id] || [],
      // NEW: Add dialysis data to return object
      dialysisVitals: data.dialysisVitals[id] || [],
      dialysisTreatments: data.dialysisTreatments[id] || [],
      dialysisAssessments: data.dialysisAssessments[id] || [],
      dialysisNotes: data.dialysisNotes[id] || [],
    }));
  };
  ```

#### 3.4 Update Visit Category Enum
- **Location**: `server/src/database/models/visit.ts`
- **Purpose**: Add DIALYSIS category to VisitCategory enum
- **Implementation**:
  ```typescript
  export enum VisitCategory {
    OPD = 'OPD',
    IPD = 'IPD',
    EMERGENCY = 'EMERGENCY',
    ANC = 'ANC',
    DIALYSIS = 'DIALYSIS', // NEW: Add dialysis category
  }
  ```

#### 3.5 Update getVisitTriages Function
- **Location**: `server/src/modules/Consultation/consultation.repository.ts`
- **Purpose**: Include dialysis vitals in the triages data for the Vitals tab
- **Implementation**:
  ```typescript
  export const getVisitTriages = async (visitIds: number[], categories: VisitCategory[]) => {
    const ancVisitIds = visitIds.filter((_, index) => categories[index] === VisitCategory.ANC);
    const dialysisVisitIds = visitIds.filter((_, index) => categories[index] === VisitCategory.DIALYSIS);
    const nonAncVisitIds = visitIds.filter((_, index) => 
      categories[index] !== VisitCategory.ANC && categories[index] !== VisitCategory.DIALYSIS
    );

    const [ancTriages, regularTriages, dialysisVitals] = await Promise.all([
      ancVisitIds.length > 0 ? getAncTriages({ visit_id: ancVisitIds }) : [],
      nonAncVisitIds.length > 0 ? getTriages({ visit_id: nonAncVisitIds }) : [],
      dialysisVisitIds.length > 0 ? getDialysisVitals(dialysisVisitIds) : [],
    ]);

    return [...ancTriages, ...regularTriages, ...dialysisVitals];
  };
  ```

#### 3.6 Database Query Optimization

**Indexes to Verify/Add:**
```sql
-- DialysisVitals indexes
CREATE INDEX IF NOT EXISTS idx_dialysis_vitals_visit_id ON Dialysis_Vitals(visit_id);
CREATE INDEX IF NOT EXISTS idx_dialysis_vitals_dialysis_visit_id ON Dialysis_Vitals(dialysis_visit_id);
CREATE INDEX IF NOT EXISTS idx_dialysis_vitals_time ON Dialysis_Vitals(time);

-- DialysisTreatment indexes  
CREATE INDEX IF NOT EXISTS idx_dialysis_treatment_visit_id ON Dialysis_Treatments(visit_id);
CREATE INDEX IF NOT EXISTS idx_dialysis_treatment_dialysis_visit_id ON Dialysis_Treatments(dialysis_visit_id);
CREATE INDEX IF NOT EXISTS idx_dialysis_treatment_start_date ON Dialysis_Treatments(actual_start_date);

-- DialysisAssessment indexes
CREATE INDEX IF NOT EXISTS idx_dialysis_assessment_visit_id ON Dialysis_Assessments(visit_id);
CREATE INDEX IF NOT EXISTS idx_dialysis_assessment_dialysis_visit_id ON Dialysis_Assessments(dialysis_visit_id);
CREATE INDEX IF NOT EXISTS idx_dialysis_assessment_date ON Dialysis_Assessments(assessment_date);

-- DialysisNotes indexes
CREATE INDEX IF NOT EXISTS idx_dialysis_notes_visit_id ON Dialysis_Notes(visit_id);
CREATE INDEX IF NOT EXISTS idx_dialysis_notes_dialysis_visit_id ON Dialysis_Notes(dialysis_visit_id);
CREATE INDEX IF NOT EXISTS idx_dialysis_notes_created_at ON Dialysis_Notes(created_at);
```

**Query Performance Optimizations:**
- Use `Promise.all()` for parallel data fetching
- Implement proper `include` statements to avoid N+1 queries
- Add `attributes` selection to limit data transfer
- Use `raw: false` for proper model instance handling
- Implement pagination for large datasets

**Error Handling:**
```typescript
// Add try-catch blocks to all repository functions
export const getDialysisVitals = async (visitIds: number[]) => {
  try {
    if (!visitIds || visitIds.length === 0) {
      return [];
    }
    
    return await DialysisVitals.findAll({
      where: { visit_id: { [Op.in]: visitIds } },
      include: [
        { model: Staff, attributes: staffAttributes },
        { model: DialysisVisit, attributes: ['id', 'dialysis_type'] }
      ],
      order: [['time', 'ASC']],
      raw: false
    });
  } catch (error) {
    console.error('Error fetching dialysis vitals:', error);
    throw new BadException('DATABASE_ERROR', 500, 'Failed to fetch dialysis vitals');
  }
};
```

**Caching Strategy:**
- Cache dialysis data for 5 minutes using Redis
- Cache key format: `dialysis:visit:{visitId}:vitals`
- Invalidate cache when dialysis data is updated
- Use cache-aside pattern for read operations

#### 3.7 API Endpoint Updates
- **Location**: `server/src/modules/Consultation/consultation.routes.ts`
- **Purpose**: Ensure existing visit history endpoints return dialysis data
- **Implementation**: No changes needed - existing endpoints will automatically include dialysis data through the updated repository functions

### Phase 4: Testing and Validation (Days 7-8)

#### 4.1 Component Testing
- **Unit Tests**: Test each new table component
- **Integration Tests**: Test HistoryAccordion with dialysis data
- **UI Testing**: Verify proper display and interactions

#### 4.2 Data Flow Testing
- **Backend**: Test visit summary includes dialysis data
- **Frontend**: Test data flows correctly to components
- **Performance**: Ensure no performance degradation

#### 4.3 User Experience Testing
- **Navigation**: Test tab switching and data display
- **Responsiveness**: Ensure mobile compatibility
- **Accessibility**: Verify proper ARIA labels and keyboard navigation

## Technical Considerations

### Data Structure Requirements

#### Frontend Data Structure
```javascript
// Summary object should include:
summary: {
  category: 'Dialysis',
  dialysisVitals: [...],      // For Vitals tab
  dialysisTreatments: [...],  // For Dialysis Treatments tab
  dialysisAssessments: [...], // For Dialysis Assessment tab
  dialysisNotes: [...]        // For Dialysis Notes tab
}
```

#### Backend Data Structure Details

**DialysisVitals Data Structure:**
```typescript
interface DialysisVitalData {
  id: number;
  visit_id: number;
  dialysis_visit_id: number;
  recorded_by: number;
  time: string;
  blood_flow_rate: number;
  pulse: number;
  temperature: number;
  oxygen_saturation: number;
  weight: number;
  blood_pressure: string;
  ultrafiltration_rate: number;
  ap: string;
  venous_pressure: number;
  ivf: number;
  hep_hr: number;
  remarks: string;
  recorded_at: Date;
  status: string;
  staff: { fullname: string; id: number };
  dialysis_visit: { id: number; dialysis_type: string };
}
```

**DialysisTreatment Data Structure:**
```typescript
interface DialysisTreatmentData {
  id: number;
  dialysis_visit_id: number;
  visit_id: number;
  actual_start_date: Date;
  actual_end_date?: Date;
  current_duration?: number;
  blood_flow_rate?: number;
  treatment_status: TreatmentStatus;
  treatment_notes?: string;
  staff: { fullname: string; id: number };
  dialysis_visit: { 
    id: number; 
    dialysis_type: string; 
    scheduled_date: Date 
  };
}
```

**DialysisAssessment Data Structure:**
```typescript
interface DialysisAssessmentData {
  id: number;
  dialysis_visit_id: number;
  visit_id: number;
  assessment_type: 'PRE_DIALYSIS' | 'POST_DIALYSIS' | 'DURING_DIALYSIS';
  assessment_date: Date;
  findings: string;
  recommendations: string;
  staff: { fullname: string; id: number };
  dialysis_visit: { id: number; dialysis_type: string };
}
```

**DialysisNotes Data Structure:**
```typescript
interface DialysisNotesData {
  id: number;
  dialysis_visit_id: number;
  visit_id: number;
  staff_id: number;
  type: 'PRE_TREATMENT' | 'DURING_TREATMENT' | 'POST_TREATMENT' | 'NURSING' | 'CLINICAL';
  content: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  staff: { fullname: string; id: number };
  dialysis_visit: { id: number; dialysis_type: string };
}
```

### Component Dependencies
- All new table components should follow existing patterns
- Use Bootstrap-Vue components for consistency
- Implement proper loading states and empty data handling
- Add proper error handling and validation

### Performance Considerations
- Lazy load dialysis data only when needed
- Implement pagination for large datasets
- Use efficient database queries with proper indexing
- Consider caching for frequently accessed data

## Success Criteria

### Functional Requirements
- [ ] Dialysis vitals display in existing Vitals tab
- [ ] New Dialysis Treatments tab shows treatment records
- [ ] New Dialysis Assessment tab shows pre/post assessments
- [ ] New Dialysis Notes tab shows clinical notes
- [ ] All tabs work correctly for dialysis visits
- [ ] Data loads efficiently without performance issues

### Technical Requirements
- [ ] Components follow existing code patterns
- [ ] Proper TypeScript typing throughout
- [ ] Responsive design maintained
- [ ] Accessibility standards met
- [ ] No breaking changes to existing functionality

### User Experience Requirements
- [ ] Intuitive navigation between tabs
- [ ] Clear data presentation
- [ ] Consistent styling with existing components
- [ ] Proper loading and error states
- [ ] Mobile-friendly interface

## Risk Mitigation

### Potential Issues
1. **Data Volume**: Dialysis data might be extensive - implement pagination
2. **Performance**: Multiple database queries - optimize with proper joins
3. **UI Complexity**: Too many tabs - consider tab grouping or collapsible sections
4. **Data Consistency**: Ensure dialysis data is properly linked to visits

### Mitigation Strategies
1. Implement efficient pagination and lazy loading
2. Use database views or optimized queries
3. Consider tab organization and user feedback
4. Add proper data validation and error handling

## Review Section
*To be completed after implementation*

### Changes Made
- [ ] Created 4 new dialysis table components
- [ ] Updated HistoryAccordion.vue with dialysis tabs
- [ ] Modified backend to include dialysis data in summaries
- [ ] Added proper testing and validation

### Lessons Learned
- [ ] Performance considerations for large datasets
- [ ] UI/UX improvements for complex data display
- [ ] Backend optimization techniques

### Future Enhancements
- [ ] Real-time updates for dialysis data
- [ ] Advanced filtering and search capabilities
- [ ] Export functionality for dialysis reports
- [ ] Integration with dialysis scheduling system
