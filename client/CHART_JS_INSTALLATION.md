# Chart.js Installation Guide


## Overview
The deceased patient management reporting components use Chart.js for data visualization. This guide explains how to install and configure Chart.js in the Vue.js client.

## Installation

### 1. Install Chart.js
```bash
cd client
npm install chart.js
```

### 2. Alternative: Install with Vue wrapper (optional)
```bash
npm install vue-chartjs chart.js
```

## Usage in Components

The components are already configured to use Chart.js directly:

```javascript
import Chart from 'chart.js';
```

## Features Used

- **Line Charts**: Monthly death trends
- **Doughnut Charts**: Department and status breakdowns
- **Bar Charts**: Cause of death and department statistics
- **Pie Charts**: Age group distributions

## Chart Types by Component

### Death Statistics Dashboard
- Monthly deaths (Line chart)
- Department breakdown (Doughnut chart)
- Cause of death (Bar chart)
- Age group distribution (Pie chart)

### Mortality Reports
- Monthly trends per department/condition (Line chart)
- Cause/department breakdown (Doughnut chart)

### Death Certificate Tracking
- Status distribution (Doughnut chart)
- Department breakdown (Bar chart)
- Monthly trends (Line chart)

## Configuration

Charts are configured with:
- Responsive design
- Custom colors
- Proper scaling
- Interactive tooltips
- Clean styling

## Troubleshooting

If charts don't render:
1. Ensure Chart.js is installed
2. Check browser console for errors
3. Verify data is loaded before chart rendering
4. Check that canvas elements have proper refs

## Performance Notes

- Charts are destroyed and recreated on data updates
- Large datasets are paginated
- Charts use `maintainAspectRatio: false` for responsive design
