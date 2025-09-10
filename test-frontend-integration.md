# Frontend Integration Test Guide

## Overview
This guide provides step-by-step instructions to test the deceased patient management frontend components.

## Prerequisites
1. ✅ Client server running (`yarn serve` or `npm run serve`)
2. ✅ Backend server running (`yarn start:dev` or `npm run start:dev`)
3. ✅ Chart.js dependency installed
4. ✅ User logged in with appropriate permissions

## Test Steps

### 1. Navigate to Deceased Patient Management
- URL: `http://localhost:8080/patient/deceased-management`
- Expected: Main interface with tabbed navigation loads
- Tabs should include:
  - Statistics Dashboard
  - Mortality Reports
  - Certificate Tracking
  - Deceased Patients

### 2. Test Death Statistics Dashboard
- Click on "Statistics Dashboard" tab
- Expected: Dashboard loads with summary cards and charts
- Test filters:
  - Date range selection
  - Department filter
  - Cause of death filter
- Expected: Charts update based on filters
- Verify charts render correctly:
  - Monthly deaths (line chart)
  - Department breakdown (doughnut chart)
  - Cause of death (bar chart)
  - Age group distribution (pie chart)

### 3. Test Mortality Reports
- Click on "Mortality Reports" tab
- Expected: Reports interface loads
- Test report types:
  - Department-based reports
  - Condition-based reports
- Expected: Each report shows detailed breakdowns
- Verify charts render for each department/condition

### 4. Test Death Certificate Tracking
- Click on "Certificate Tracking" tab
- Expected: Tracking interface loads with summary cards
- Test filters:
  - Date range
  - Status filter
  - Department filter
- Expected: Certificate table updates based on filters
- Test actions:
  - View certificate button
  - Download PDF button

### 5. Test Deceased Patients List
- Click on "Deceased Patients" tab
- Expected: Patient list loads with deceased patients
- Test search functionality
- Test pagination
- Test action buttons:
  - View patient details
  - Download certificate
  - View statistics

### 6. Test Responsive Design
- Resize browser window to mobile size
- Expected: All components adapt to smaller screens
- Charts should remain readable
- Tables should be horizontally scrollable

### 7. Test Error Handling
- Test with invalid date ranges
- Test with network disconnected
- Expected: Appropriate error messages display
- Loading states should show during API calls

## Expected Results

### ✅ Success Indicators
- All tabs load without errors
- Charts render correctly with data
- Filters work and update displays
- Search functionality works
- Pagination works correctly
- Responsive design works on mobile
- Error states display appropriately
- Loading states show during API calls

### ❌ Common Issues
- Charts not rendering: Check Chart.js installation
- API errors: Check backend server and authentication
- Styling issues: Check Bootstrap-Vue components
- Routing errors: Check router configuration

## Troubleshooting

### Charts Not Rendering
1. Check browser console for Chart.js errors
2. Verify Chart.js is installed: `yarn list chart.js`
3. Check that data is loaded before chart rendering

### API Errors
1. Check backend server is running
2. Verify authentication token is valid
3. Check API endpoints in browser network tab

### Styling Issues
1. Check Bootstrap-Vue components are imported
2. Verify CSS classes are correct
3. Check for conflicting styles

## Manual Testing Checklist

- [ ] Main interface loads
- [ ] All tabs are clickable
- [ ] Statistics dashboard displays data
- [ ] Charts render correctly
- [ ] Filters work
- [ ] Mortality reports show data
- [ ] Certificate tracking shows data
- [ ] Patient list shows data
- [ ] Search functionality works
- [ ] Pagination works
- [ ] Responsive design works
- [ ] Error handling works
- [ ] Loading states work

## Performance Testing

### Load Time
- Initial page load should be < 3 seconds
- Chart rendering should be < 2 seconds
- Filter updates should be < 1 second

### Memory Usage
- Check browser memory usage during chart rendering
- Verify charts are properly destroyed on component unmount

## Browser Compatibility

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile browsers

## Notes

- All components use Vue 2 and Bootstrap-Vue
- Charts are rendered using Chart.js
- API calls use Axios with authentication
- State management uses Vuex
- Routing uses Vue Router
