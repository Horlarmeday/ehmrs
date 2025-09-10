# LaboratoryStore Deprecation Notice

## Overview
As part of Phase 4 of the comprehensive store standardization project, the `LaboratoryStore` model and its associated functionality are being **deprecated** in favor of the unified General Store system.

## Deprecation Date
- **Effective Date**: Phase 4 Implementation (January 2025)
- **Full Removal Date**: Phase 6 (Scheduled for March 2025)

## Reason for Deprecation
Analysis of the codebase revealed that `LaboratoryStore` had minimal usage:
- Only basic CRUD operations implemented
- No complex business logic or workflows
- Limited integration with other systems
- Redundant functionality that can be better handled through General Store

## Migration Path

### Current State
```typescript
// OLD: Laboratory items routed to LaboratoryStore
{
  item_type: 'laboratory_item',
  store_destination: 'laboratory'
}
```

### New State
```typescript
// NEW: Laboratory items routed through General Store with laboratory category
{
  item_type: 'general_store_item',
  store_destination: 'general',
  category: 'laboratory'
}
```

## What's Changed

### 1. Item Type Detection
- Laboratory items are now detected as `general_store_item` with category `laboratory`
- Maintains backward compatibility by detecting existing LaboratoryStore items
- Routes them through the General Store system

### 2. Procurement Routing
- All laboratory items route to General Store with `category: 'laboratory'`
- Auto-distribution to laboratory dispensaries still works
- Enhanced dispensary management for laboratory items

### 3. Inventory Management
- Laboratory items managed through Universal Inventory Service
- Better integration with dispensary system
- Improved reporting and analytics

## Benefits of Migration

### 1. **Unified System**
- Single store management system for all non-pharmacy items
- Consistent APIs and workflows
- Reduced code duplication

### 2. **Enhanced Features**
- Advanced dispensary management for laboratory items
- Better workflow management and approval processes
- Comprehensive audit trails

### 3. **Improved Performance**
- Optimized queries through single store system
- Better caching strategies
- Reduced database complexity

### 4. **Better Maintainability**
- Single codebase to maintain for store operations
- Consistent data models and validation
- Simplified testing and deployment

## Backward Compatibility

### Phase 4 (Current)
- ✅ Existing LaboratoryStore data remains intact
- ✅ APIs continue to work with deprecation warnings
- ✅ Automatic routing through General Store
- ⚠️ New laboratory items route to General Store

### Phase 5 (Future)
- 📋 Data migration utilities provided
- 📋 Optional migration of existing data
- ⚠️ Deprecation warnings in API responses

### Phase 6 (Final)
- ❌ LaboratoryStore model removed
- ❌ Laboratory-specific APIs removed
- ✅ Full General Store integration

## Developer Guidelines

### For New Development
```typescript
// ✅ DO: Use General Store APIs for laboratory items
await GeneralStoreService.createItem({
  name: 'Blood Test Kit',
  category: 'laboratory',
  // ... other fields
});

// ❌ DON'T: Use LaboratoryStore APIs
await LaboratoryStoreService.createItem({...}); // DEPRECATED
```

### For Existing Code
```typescript
// ✅ Update to use General Store
const labItems = await GeneralStoreService.getItemsByCategory('laboratory');

// ⚠️ Deprecated but still works
const labItems = await LaboratoryStoreService.getAllItems(); // Will show warning
```

## Migration Utilities

### Data Migration Script
A migration script is available to move existing LaboratoryStore data to General Store:

```bash
# Run migration script (optional)
npm run migrate:laboratory-to-general

# Verify migration
npm run verify:laboratory-migration
```

### API Compatibility Layer
Existing LaboratoryStore APIs will continue to work with deprecation warnings:

```typescript
// These APIs still work but log deprecation warnings
LaboratoryStoreService.createItem()    // → Routes to General Store
LaboratoryStoreService.getAllItems()   // → Queries General Store with laboratory filter
LaboratoryStoreService.updateItem()    // → Updates in General Store
```

## Testing Strategy

### Phase 4 Testing
- ✅ All existing tests pass with deprecation warnings
- ✅ New integration tests for General Store laboratory items
- ✅ Performance benchmarks for unified system

### Regression Testing
- All laboratory workflows tested through General Store
- Dispensary management for laboratory items verified
- Reporting and analytics functionality confirmed

## Communication Plan

### Internal Teams
- Development team notified of deprecation
- Testing team updated on new test strategies  
- DevOps team informed of deployment changes

### External Dependencies
- Frontend team notified of API changes
- Integration partners informed of deprecation timeline
- Documentation updated across all platforms

## Support and Questions

For questions about this deprecation:
- **Technical Questions**: Contact development team
- **Business Impact**: Contact system administrators
- **Migration Support**: Dedicated migration support available

## Files Affected

### Deprecated Files (Phase 6 removal)
- `src/database/models/laboratoryStore.ts`
- `src/modules/Store/laboratoryStore.service.ts`
- Laboratory-specific controllers and routes

### Modified Files (Phase 4 updates)
- `src/modules/Procurement/services/itemTypeDetection.service.ts`
- `src/modules/Procurement/services/procurementRouting.service.ts`
- `src/core/services/universalInventory.service.ts`

### New Files
- This deprecation documentation
- Migration utilities (Phase 5)
- Integration tests for laboratory items via General Store

---

**Last Updated**: Phase 4 Implementation
**Next Review**: Phase 5 Planning