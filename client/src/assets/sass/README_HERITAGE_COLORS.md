# Heritage Hospital Brand Colors

This document explains how to use the Heritage Kidney & Medical Care brand colors throughout the system.

## Color Palette

### Primary Brand Colors
- **Heritage Maroon** (`#8B0000`) - Main brand color, used for primary buttons, headers, and important actions
- **Heritage Maroon Hover** (`#A0522D`) - Hover state for primary elements
- **Heritage Maroon Light** (`#F5F5DC`) - Light variant for backgrounds and subtle elements
- **Heritage Maroon Inverse** (`#FFFFFF`) - White text on primary backgrounds

### Secondary Brand Colors
- **Heritage Blue** (`#000080`) - Used for secondary elements, links, and navigation
- **Heritage Blue Hover** (`#191970`) - Hover state for secondary elements
- **Heritage Blue Light** (`#E6E6FA`) - Light variant for backgrounds
- **Heritage Blue Inverse** (`#FFFFFF`) - White text on secondary backgrounds

- **Heritage Green** (`#006400`) - Used for success states, health-related indicators, and medical elements
- **Heritage Green Hover** (`#228B22`) - Hover state for success elements
- **Heritage Green Light** (`#F0FFF0`) - Light variant for success backgrounds
- **Heritage Green Inverse** (`#FFFFFF`) - White text on success backgrounds

### Accent Colors
- **Heritage Light Green** (`#90EE90`) - Used for medical icons and health status indicators
- **Heritage Accent Red** (`#CD5C5C`) - Used for kidney-related elements and medical accents

## Usage Methods

### 1. SCSS Variables (Recommended for components)
```scss
.my-component {
  background-color: $heritage-maroon;
  color: $heritage-maroon-inverse;
  
  &:hover {
    background-color: $heritage-maroon-hover;
  }
  
  &.success {
    background-color: $heritage-green;
    color: $heritage-green-inverse;
  }
}
```

### 2. CSS Custom Properties (For inline styles and dynamic usage)
```vue
<template>
  <div class="heritage-card">
    <button class="btn-primary">Primary Action</button>
    <button class="btn-secondary">Secondary Action</button>
  </div>
</template>

<style scoped>
.heritage-card {
  border: 2px solid var(--heritage-maroon);
}

.btn-primary {
  background-color: var(--heritage-maroon);
  color: var(--heritage-maroon-inverse);
}

.btn-primary:hover {
  background-color: var(--heritage-maroon-hover);
}

.btn-secondary {
  background-color: var(--heritage-blue);
  color: var(--heritage-blue-inverse);
}
</style>
```

### 3. Bootstrap Utility Classes (Automatically updated)
The system now automatically uses Heritage colors for Bootstrap classes:
- `.btn-primary` → Heritage Maroon
- `.btn-secondary` → Heritage Blue
- `.btn-success` → Heritage Green
- `.btn-info` → Heritage Blue
- `.btn-warning` → Heritage Accent Red
- `.btn-danger` → Heritage Maroon

### 4. Semantic Color Usage
```scss
// Medical/Health elements
.medical-indicator {
  color: $heritage-medical; // Light green for medical elements
}

// Trust elements
.trust-badge {
  background-color: $heritage-trust; // Blue for trust
}

// Nature/Health elements
.health-status {
  color: $heritage-nature; // Green for health
}

// Traditional elements
.traditional-section {
  border-color: $heritage-tradition; // Maroon for traditional
}
```

## Color Accessibility

All Heritage brand colors have been tested for accessibility:
- **Primary Maroon** (`#8B0000`) - Meets WCAG AA contrast requirements on white backgrounds
- **Secondary Blue** (`#000080`) - High contrast for important information
- **Success Green** (`#006400`) - Clear visual feedback for positive actions
- **Accent Red** (`#CD5C5C`) - Distinct warning color that's not too harsh

## File Structure

```
client/src/assets/sass/
├── components/
│   ├── _variables.heritage.scss      # SCSS variables
│   └── _heritage-colors.scss         # CSS custom properties
├── _init.scss                        # Import order
└── style.vue.scss                    # Main style file
```

## Updating Colors

To update any Heritage brand color:

1. **SCSS Variables**: Edit `_variables.heritage.scss`
2. **CSS Custom Properties**: Edit `_heritage-colors.scss`
3. **Recompile**: Run `npm run serve` to see changes

## Best Practices

1. **Use semantic colors** when possible (e.g., `$success` instead of `$heritage-green`)
2. **Maintain consistency** across similar UI elements
3. **Test accessibility** when introducing new color combinations
4. **Document custom usage** in component files
5. **Use light variants** for backgrounds and subtle elements
6. **Use inverse colors** for text on colored backgrounds

## Examples

### Button Styles
```scss
.btn-heritage-primary {
  background-color: $heritage-maroon;
  color: $heritage-maroon-inverse;
  border: 1px solid $heritage-maroon;
  
  &:hover {
    background-color: $heritage-maroon-hover;
    border-color: $heritage-maroon-hover;
  }
}

.btn-heritage-medical {
  background-color: $heritage-light-green;
  color: $dark;
  border: 1px solid $heritage-green;
}
```

### Card Styles
```scss
.card-heritage {
  border-left: 4px solid $heritage-maroon;
  background: linear-gradient(135deg, $heritage-maroon-light 0%, $white 100%);
  
  .card-header {
    background-color: $heritage-maroon;
    color: $heritage-maroon-inverse;
  }
}
```

### Status Indicators
```scss
.status-healthy {
  color: $heritage-green;
  background-color: $heritage-green-light;
}

.status-warning {
  color: $heritage-accent-red;
  background-color: $warning-light;
}

.status-critical {
  color: $heritage-maroon;
  background-color: $danger-light;
}
```
