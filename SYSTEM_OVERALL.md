# 🏥 EHMRS Store & Inventory System Redesign

## 📋 **Project Overview**

**Project**: Electronic Health Management Resource System (EHMRS) - Store & Inventory Architecture Redesign  
**Context**: Nigerian Hospital Management System  
**Goal**: Transform rigid, duplicate-prone architecture into flexible, insurance-aware system  
**Timeline**: 10-12 weeks (Phased Rollout)  
**Current Status**: Planning Phase  

---

## 🔍 **Current System Issues**

### **Critical Problems Identified**
1. **🚫 Drug Duplication**: Same drug exists in multiple `PharmacyStore` entries with different `drug_type`
2. **🚫 Hardcoded Pricing**: NHIS patients pay hardcoded 10% instead of proper HMO pricing
3. **🚫 Missing Procurement**: No purchase order tracking or supplier management
4. **🚫 No Stock Auditing**: No inventory reconciliation or variance tracking
5. **🚫 Rigid Architecture**: Complex drug type management causing operational issues
6. **🚫 Missing Dialysis Module**: No dedicated dialysis visit management system
7. **🚫 Shared OPD Views**: Same patient view used for both Doctor and Nurse dashboards causing confusion

### **Current Architecture Flow**
```
PharmacyStore (Multiple entries per drug with different drug_type)
    ↓ (Manual Transfer)
InventoryItem (Dispensary - keeps drug_type for dispensing)
    ↓ (Pharmacist dispenses)
Patient
```

---

## 🏗️ **New System Architecture**

### **Redesigned Flow**
```
NEW PharmacyStore (One drug = One entry, no drug_type)
    ↓ (Store Manager transfers with specified drug_type)
InventoryItem (Dispensary - drug_type specified during transfer)
    ↓ (Pharmacist dispenses using HMO pricing)
Patient
```

### **Key Architectural Changes**
- **PharmacyStore**: Remove `drug_type` field, one entry per drug
- **HMO Pricing Models**: Dedicated pricing for drugs, tests, services, investigations
- **Procurement System**: Full purchase order lifecycle management
- **Stock Audit System**: Regular inventory reconciliation
- **Smart Pricing**: Insurance-aware pricing calculation
- **Dialysis Module**: Dedicated dialysis visit and treatment management
- **Role-Based Views**: Separate patient views for Doctors vs Nurses

---

## 📊 **Implementation Phases**

### **🏗️ Phase 1: Database Models & Migrations (Week 1-2)**
**Goal**: Create foundation for new system

**Tasks**:
- [x] Create `HMODrugPricing` model
- [x] Create `HMOTestPricing` model  
- [x] Create `HMOServicePricing` model
- [x] Create `HMOInvestigationPricing` model
- [x] Create `ProcurementOrder` model
- [x] Create `ProcurementOrderItem` model
- [x] Create `StockAudit` model
- [x] Create `StockAuditItem` model
- [x] Create `DialysisVisit` model
- [x] Create `DialysisTreatment` model
- [x] Update `PharmacyStore` model (remove drug_type)
- [x] Create database migrations for all new models

**Deliverables**:
- All new database models created
- Database migrations ready
- Updated PharmacyStore structure

---

### **🔄 Phase 2: Data Migration & Cleanup (Week 2-3)**
**Goal**: Consolidate existing data and setup new pricing

**Tasks**:
- [x] Create migration script to consolidate duplicate PharmacyStore entries
- [x] Create migration script to populate HMO pricing tables
- [x] Validate data integrity after migration
- [x] Setup initial HMO pricing with current 10% NHIS logic

**Deliverables**:
- Clean, consolidated PharmacyStore data
- Initial HMO pricing populated
- Data integrity verified

---

### **⚙️ Phase 3: Backend Services & Logic (Week 3-5)**
**Goal**: Implement new business logic and update existing services

**Tasks**:
- [x] Create `HMOPricingService` for insurance pricing management
- [x] Create `ProcurementService` for purchase order management
- [x] Create `StockAuditService` for inventory taking
- [x] Create `DialysisService` for dialysis visit management
- [x] Create `EmergencyService` for emergency management
- [ ] Update `PharmacyOrderService` to use HMO pricing
- [ ] Update `StoreService` for new PharmacyStore structure
- [ ] Update doctor drug search to use HMO pricing
- [ ] Update patient visit views for role-based access (Doctor vs Nurse)

**Deliverables**:
- All new services functional
- Existing services updated
- HMO pricing integration complete

---

### **🌐 Phase 4: API Controllers & Routes (Week 5-6)**
**Goal**: Expose new functionality through REST APIs

**Tasks**:
- [ ] Create `HMOPricing` controller and routes
- [ ] Create `Procurement` controller and routes
- [ ] Create `StockAudit` controller and routes
- [ ] Create `Dialysis` controller and routes
- [ ] Create `Emergency` controller and routes
- [ ] Update existing `Store` controller
- [ ] Update existing `Pharmacy` controller
- [ ] Update existing `Visit` controller for role-based access

**Deliverables**:
- All new API endpoints functional
- Existing APIs updated
- API documentation updated

---

### **💻 Phase 5: Frontend Components (Week 6-8)**
**Goal**: Create user interfaces for new functionality

**Tasks**:
- [ ] Create HMO Drug Pricing management pages
- [ ] Create HMO Test Pricing management pages
- [ ] Create HMO Service Pricing management pages
- [ ] Create HMO Investigation Pricing management pages
- [ ] Create Procurement Order management pages
- [ ] Create Stock Audit management pages
- [ ] Create Dialysis management pages
- [ ] Create Emergency management pages
- [ ] Update Store management pages
- [ ] Update doctor drug search interface
- [ ] Create separate OPD patient views for Doctors vs Nurses

**Deliverables**:
- All management interfaces created
- User experience optimized for Nigerian context
- Responsive and intuitive design

---

### **🧪 Phase 6: Testing & Validation (Week 8-10)**
**Goal**: Ensure system reliability and performance

**Tasks**:
- [ ] Test HMO pricing calculations for all insurance types
- [ ] Test procurement workflow end-to-end
- [ ] Test stock audit workflow and variance calculations
- [ ] Test store-to-dispensary transfer workflow
- [ ] Test dispensing workflow with new pricing
- [ ] Test dialysis workflow and treatment management
- [ ] Test emergency workflow and triage management
- [ ] Test role-based access control for Doctor vs Nurse views
- [ ] Performance testing and optimization

**Deliverables**:
- All functionality tested and validated
- Performance benchmarks met
- Bug fixes and optimizations complete

---

### **📚 Phase 7: Documentation & Deployment (Week 10-12)**
**Goal**: Prepare for production deployment

**Tasks**:
- [ ] Update API documentation
- [ ] Create user guides for new features
- [ ] Create training materials for dialysis module
- [ ] Create training materials for emergency module
- [ ] Create role-based access training materials
- [ ] Deploy to staging environment
- [ ] Final testing in staging
- [ ] Production deployment

**Deliverables**:
- Complete system documentation
- User training materials
- Production-ready system

---

## 🎯 **Key Benefits After Implementation**

### **Operational Improvements**
- ✅ **No More Drug Duplication**: One drug = One store entry
- ✅ **Flexible Pricing**: Each insurance can have different prices
- ✅ **Proper Procurement**: Full purchase order tracking
- ✅ **Stock Auditing**: Regular inventory reconciliation
- ✅ **Better Reporting**: Clear financial and inventory reports
- ✅ **Dialysis Management**: Dedicated dialysis visit and treatment tracking
- ✅ **Role-Based Access**: Separate views for Doctors vs Nurses

### **Nigerian Healthcare Context**
- ✅ **NHIS Integration**: Proper quota and pricing management
- ✅ **FHSS Support**: Federal health insurance compatibility
- ✅ **Private Insurance**: Support for various schemes
- ✅ **Regulatory Compliance**: Meet Nigerian standards

### **Technical Improvements**
- ✅ **Clean Architecture**: Separation of concerns
- ✅ **Better Performance**: Optimized database queries
- ✅ **Maintainability**: Easier to add new features
- ✅ **Scalability**: Support for growth

---

## ⚠️ **Risk Mitigation**

### **Data Safety**
- **Full Database Backup**: Before any migration
- **Rollback Strategy**: Ability to revert changes
- **Parallel Testing**: Test new system alongside old

### **User Training**
- **Phased Rollout**: Gradual introduction of new features
- **Training Sessions**: Comprehensive user training
- **Support Documentation**: Clear procedures and guides

### **Performance**
- **Database Indexing**: Optimize for new query patterns
- **Caching Strategy**: Cache frequently accessed data
- **Load Testing**: Ensure system handles expected load

---

## 🔧 **Technical Specifications**

### **Database Changes**
- **New Tables**: 15 new models
- **Updated Tables**: 1 existing table enhanced (Procurement_Orders)
- **Modified Tables**: 1 existing model (PharmacyStore)
- **Migrations**: Comprehensive data migration scripts

### **API Changes**
- **New Endpoints**: ~30 new REST endpoints
- **Modified Endpoints**: ~12 existing endpoints updated
- **Authentication**: Maintain existing JWT system

### **Frontend Changes**
- **New Pages**: ~15 new management interfaces
- **Modified Pages**: ~6 existing pages updated
- **Framework**: Continue using Vue.js 2

---

## 📅 **Timeline Summary**

| Phase | Duration | Key Milestone |
|-------|----------|---------------|
| 1-2   | Week 1-3 | Foundation Ready |
| 3-4   | Week 3-6 | Backend Complete |
| 5     | Week 6-8 | Frontend Ready |
| 6-7   | Week 8-12| Production Ready |

**Total Duration**: 10-12 weeks  
**Go-Live Target**: Week 12  

---

## 👥 **Stakeholders & Responsibilities**

### **Development Team**
- **Backend Developers**: Phases 1-4
- **Frontend Developers**: Phase 5
- **QA Engineers**: Phase 6
- **DevOps Engineers**: Phase 7

### **Business Users**
- **Store Managers**: Procurement and stock audit training
- **Pharmacists**: New dispensing workflow training
- **Doctors**: Updated drug search training, dialysis management
- **Nurses**: Dialysis treatment management, role-specific patient views
- **Administrators**: HMO pricing management training, dialysis module setup

### **Project Management**
- **Project Manager**: Overall coordination and timeline
- **Business Analyst**: Requirements and user acceptance
- **Technical Lead**: Architecture and technical decisions

---

## 🚨 **Emergency Module Implementation (Final Architecture)**

### **Architecture Decision**
**✅ Proper Ward-Bed Relationship Maintained**
- **`EmergencyBed` model** properly belongs to Emergency Ward (maintains ward-bed integrity)
- **`EmergencyVisit` model** extends Visit model with emergency-specific fields
- **`EmergencyTriage` and `EmergencyProcedure`** as supporting models
- **Ward-based bed management** ensures proper organizational structure

### **Benefits of Final Architecture**
- **🏥 Proper Hospital Structure**: Emergency beds belong to Emergency Ward
- **🔗 Maintains Data Integrity**: Ward-bed relationships preserved
- **📊 Clear Resource Allocation**: Emergency beds clearly separated from regular beds
- **🛠️ Logical Organization**: Follows standard hospital ward structure
- **💰 Better Resource Management**: Clear separation of emergency vs. regular care areas

### **Emergency Module Features**
- **🚨 Emergency Triage**: Patient assessment & priority classification (Red/Orange/Yellow/Green/Blue)
- **⚡ Rapid Registration**: Quick patient entry for emergencies with priority scoring (using EmergencyVisit model)
- **🛏️ Emergency Bed Management**: Dedicated emergency beds in Emergency Ward with equipment tracking
- **💊 Emergency Procedures**: Emergency treatment protocols and tracking
- **📊 Real-time Monitoring**: Live emergency statistics and bed occupancy
- **🚑 Ambulance Integration**: Emergency transport tracking and coordination
- **🏥 Ward-Based Organization**: Emergency beds properly organized within Emergency Ward

### **Emergency Workflow**
```
Patient Arrival → Triage Assessment → Priority Classification → Bed Assignment → Treatment → Disposition
     ↓                ↓                    ↓                    ↓              ↓           ↓
  Quick Entry    Vital Signs &      Red/Orange/Yellow/    Available Bed   Procedures   Discharge/
                 Assessment         Green/Blue Priority    with Equipment               Admission
```

### **Emergency Bed Types**
- **🩸 Resuscitation**: Critical care with full monitoring
- **📊 Monitoring**: Continuous vital signs monitoring
- **👀 Observation**: Short-term emergency observation
- **🦠 Isolation**: Infectious disease isolation
- **👶 Pediatric**: Child-specific emergency care
- **🤱 Obstetric**: Pregnancy-related emergencies
- **🧠 Psychiatric**: Mental health emergencies
- **🦴 Trauma**: Injury and trauma care

---

## 🩺 **Dialysis Module & Role-Based Access**

### **Dialysis Module Features**
- **Dialysis Visit Management**: Create, schedule, and track dialysis sessions
- **Treatment Tracking**: Monitor dialysis parameters, duration, and outcomes
- **Patient History**: Complete dialysis treatment history and progress
- **HMO Integration**: Insurance-aware pricing for dialysis services
- **Reporting**: Dialysis-specific reports and analytics

### **Role-Based Access Control**
- **Doctor Dashboard**: Clinical decision-making, diagnosis, treatment planning
- **Nurse Dashboard**: Patient care, treatment administration, monitoring
- **Separate Views**: Different patient information displayed based on role
- **Permission Management**: Granular access control for different user types
- **Audit Trail**: Track who accessed what patient information

### **Benefits of Role-Based Views**
- ✅ **Reduced Confusion**: Clear separation of concerns
- ✅ **Better Workflow**: Role-appropriate information display
- ✅ **Security**: Users only see relevant patient data
- ✅ **Efficiency**: Faster access to role-specific information
- ✅ **Compliance**: Better adherence to healthcare privacy standards

---

## 📞 **Contact & Support**

**Project Manager**: [To be assigned]  
**Technical Lead**: [To be assigned]  
**Business Analyst**: [To be assigned]  

**Document Version**: 1.0  
**Last Updated**: [Current Date]  
**Next Review**: [Weekly during implementation]
