# HMO Pricing Service - CSV Upload Guide

## Overview
The HMO Pricing Service now supports bulk creation of pricing data through CSV uploads, making it easy to set up pricing for multiple items across different insurance schemes.

## Features

### 1. Bulk Operations
- **Bulk Create**: Create multiple pricing entries at once
- **Bulk Update**: Update multiple pricing entries simultaneously
- **Validation**: Comprehensive validation with detailed error reporting

### 2. CSV Upload
- **Template Support**: Download CSV template for proper formatting
- **Auto-Processing**: Automatic item lookup by code/name
- **Error Handling**: Detailed error reporting with row numbers
- **Batch Processing**: Process large datasets efficiently

### 3. Export Functionality
- **CSV Export**: Export existing pricing data to CSV
- **Filtered Export**: Export by specific insurance scheme
- **Standard Format**: Compatible with spreadsheet applications

## CSV Format

### Required Columns
| Column | Description | Example | Required |
|--------|-------------|---------|----------|
| Item Type | Type of item (DRUG, TEST, SERVICE, INVESTIGATION) | DRUG | ✅ |
| Item Code | Unique identifier for the item | DRUG001 | ✅ |
| Item Name | Display name of the item | Paracetamol 500mg | ✅ |
| Insurance Name | Name of the insurance scheme | NHIS | ✅ |
| HMO Price | Base price for the item | 150.00 | ✅ |
| Patient Percentage | Patient's contribution percentage | 10.0 | ✅ |
| HMO Percentage | Insurance contribution percentage | 90.0 | ✅ |
| Effective From | Start date (YYYY-MM-DD) | 2024-01-01 | ✅ |
| Effective To | End date (YYYY-MM-DD) | 2024-12-31 | ✅ |
| Notes | Additional information | Standard NHIS pricing | ❌ |

### Item Type Values
- **DRUG**: Pharmaceutical products
- **TEST**: Laboratory tests
- **SERVICE**: Medical services (consultations, procedures)
- **INVESTIGATION**: Radiology and imaging services

### Date Format
Use ISO date format: `YYYY-MM-DD`
- Example: `2024-01-01` for January 1, 2024
- Example: `2024-12-31` for December 31, 2024

## Usage Examples

### 1. Basic CSV Upload
```typescript
import { HMOPricingService } from './hmoPricing.service';

const csvData = [
  {
    item_code: 'DRUG001',
    item_type: 'DRUG',
    insurance_name: 'NHIS',
    hmo_price: 150.00,
    patient_percentage: 10.0,
    hmo_percentage: 90.0,
    effective_from: '2024-01-01',
    effective_to: '2024-12-31',
    notes: 'Standard NHIS pricing'
  }
];

const result = await HMOPricingService.processCSVPricing(csvData);
console.log(`Success: ${result.success}, Failed: ${result.failed}`);
```

### 2. Bulk Create Pricing
```typescript
const bulkData = {
  items: [
    { drug_id: 1, hmo_price: 150.00, patient_percentage: 10.0, hmo_percentage: 90.0 },
    { test_id: 1, hmo_price: 2500.00, patient_percentage: 10.0, hmo_percentage: 90.0 }
  ],
  insurance_id: 1,
  effective_from: new Date('2024-01-01'),
  effective_to: new Date('2024-12-31'),
  status: 'Active',
  notes: 'Bulk NHIS pricing setup'
};

const result = await HMOPricingService.bulkCreatePricing(bulkData);
```

### 3. Export Pricing Data
```typescript
// Export all pricing
const allPricing = await HMOPricingService.exportPricingToCSV();

// Export by insurance
const nhisPricing = await HMOPricingService.exportPricingToCSV(1);
```

## Error Handling

### CSV Processing Errors
- **Missing Fields**: Required fields must be present
- **Invalid Dates**: Date format must be YYYY-MM-DD
- **Item Not Found**: Item code must exist in the system
- **Insurance Not Found**: Insurance name must exist

### Error Response Format
```typescript
{
  success: 5,
  failed: 2,
  results: [
    { success: true, data: {...}, row: 2, item_code: 'DRUG001' },
    { success: false, error: 'Row 3: Drug with code DRUG999 not found', row: 3, item_code: 'DRUG999' }
  ],
  errors: [
    'Row 3: Drug with code DRUG999 not found',
    'Row 7: Invalid date format'
  ]
}
```

## Best Practices

### 1. Data Preparation
- Use the provided CSV template
- Ensure all required fields are filled
- Validate dates before upload
- Check item codes exist in the system

### 2. Insurance Names
- Use exact insurance names as stored in the system
- Case-sensitive matching
- No abbreviations or variations

### 3. Item Codes
- Use existing item codes from the system
- Drug codes from Drug table
- Test codes from Test table
- Service codes from Service table
- Investigation names from Investigation table

### 4. Pricing Validation
- Patient percentage + HMO percentage should equal 100%
- HMO price should be positive
- Effective dates should be logical (from < to)

## Troubleshooting

### Common Issues

1. **"Insurance not found"**
   - Check insurance name spelling
   - Ensure insurance exists in the system
   - Use exact name from Insurance table

2. **"Item not found"**
   - Verify item code exists
   - Check item type matches the code
   - Ensure item is active in the system

3. **"Invalid date format"**
   - Use YYYY-MM-DD format
   - Ensure dates are valid calendar dates
   - Check for extra spaces or characters

4. **"Missing required fields"**
   - Ensure all required columns are present
   - Check for empty cells in required fields
   - Verify CSV format matches template

### Support
For technical support or questions about the CSV upload feature, please contact the development team or refer to the system documentation.
