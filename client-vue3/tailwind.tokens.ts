// ! GENERATED FILE — tools/token-pipeline (issue #40, ADR-0010/0009). Do not edit by hand.
// ! Single source: client-vue3/DESIGN.md. Regenerate: cd tools/token-pipeline && npm run generate.

export const EHMRS_TOKENS = {
  "palettes": {
    "blue": {
      "50": "#eff6ff",
      "100": "#dbeafe",
      "200": "#bfdbfe",
      "300": "#93c5fd",
      "400": "#60a5fa",
      "500": "#3b82f6",
      "600": "#2563eb",
      "700": "#1d4ed8",
      "800": "#1e40af",
      "900": "#1e3a8a",
      "950": "#172554"
    },
    "gray": {
      "50": "#f9fafb",
      "100": "#f3f4f6",
      "200": "#e5e7eb",
      "300": "#d1d5db",
      "400": "#9ca3af",
      "500": "#5f6775",
      "600": "#4b5563",
      "700": "#374151",
      "800": "#1f2937",
      "900": "#111827",
      "950": "#030712"
    },
    "red": {
      "50": "#fef2f2",
      "100": "#fee2e2",
      "200": "#fecaca",
      "300": "#fca5a5",
      "400": "#f87171",
      "500": "#ef4444",
      "600": "#dc2626",
      "700": "#b91c1c",
      "800": "#991b1b",
      "900": "#7f1d1d",
      "950": "#450a0a"
    },
    "green": {
      "50": "#f0fdf4",
      "100": "#dcfce7",
      "200": "#bbf7d0",
      "300": "#86efac",
      "400": "#4ade80",
      "500": "#22c55e",
      "600": "#16a34a",
      "700": "#15803d",
      "800": "#166534",
      "900": "#14532d",
      "950": "#052e16"
    },
    "amber": {
      "50": "#fffbeb",
      "100": "#fef3c7",
      "200": "#fde68a",
      "300": "#fcd34d",
      "400": "#fbbf24",
      "500": "#f59e0b",
      "600": "#d97706",
      "700": "#b45309",
      "800": "#92400e",
      "900": "#78350f",
      "950": "#451a03"
    }
  },
  "semantic": {
    "surface.0": "#ffffff",
    "surface.50": "{gray.50}",
    "surface.100": "{gray.100}",
    "surface.200": "{gray.200}",
    "surface.300": "{gray.300}",
    "text.primary": "{gray.900}",
    "text.secondary": "{gray.600}",
    "text.muted": "{gray.500}",
    "text.disabled": "{gray.400}",
    "text.on.primary": "#ffffff",
    "border.default": "{gray.300}",
    "border.subtle": "{gray.200}",
    "primary.color": "{blue.600}",
    "primary.hover": "{blue.700}",
    "primary.active": "{blue.800}",
    "primary.subtle.bg": "{blue.50}",
    "primary.subtle.text": "{blue.700}",
    "primary.on": "#ffffff",
    "danger.default": "{red.600}",
    "danger.hover": "{red.700}",
    "danger.active": "{red.800}",
    "danger.subtle.bg": "{red.50}",
    "danger.subtle.text": "{red.700}",
    "danger.on": "#ffffff",
    "success.default": "{green.700}",
    "success.hover": "{green.800}",
    "success.active": "{green.900}",
    "success.subtle.bg": "{green.50}",
    "success.subtle.text": "{green.700}",
    "success.on": "#ffffff",
    "warning.default": "{amber.600}",
    "warning.hover": "{amber.500}",
    "warning.active": "{amber.400}",
    "warning.subtle.bg": "{amber.50}",
    "warning.subtle.text": "{amber.800}",
    "warning.on": "{gray.900}",
    "control.height.xs": "24px",
    "control.height.sm": "28px",
    "control.height.md": "32px",
    "control.height.lg": "40px",
    "control.font.xs": "11px",
    "control.font.sm": "12px",
    "control.font.md": "13px",
    "control.font.lg": "14px",
    "control.font.xl": "16px",
    "control.padding.x": "8px",
    "control.padding.y.sm": "5px",
    "control.padding.y.xs": "4px",
    "control.padding.y.lg": "8px",
    "control.padding.x.xs": "6px",
    "table.row.height": "30px",
    "table.row.height.dense": "26px",
    "table.cell.padding": "4px 8px",
    "table.cell.padding.dense": "3px 5px",
    "table.header.cell.padding": "5px 8px",
    "icon.size.sm": "14px",
    "icon.size.md": "16px",
    "font.sans": "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif",
    "font.mono": "JetBrains Mono, Fira Code, ui-monospace, monospace",
    "font.weight.regular": "400",
    "font.weight.medium": "500",
    "font.weight.semibold": "600",
    "line.height": "1.4",
    "radius.none": "0px",
    "radius.sm": "3px",
    "radius.md": "4px",
    "radius.lg": "6px",
    "radius.pill": "9999px",
    "shadow.sm": "0 1px 2px rgba(16,24,40,0.06)",
    "shadow.md": "0 2px 6px rgba(16,24,40,0.08)",
    "shadow.lg": "0 4px 16px rgba(16,24,40,0.12)",
    "focus.ring.color": "{blue.600}",
    "focus.ring.width": "2px",
    "focus.ring.style": "solid",
    "focus.ring.offset": "1px"
  },
  "contrastPairs": [
    {
      "fg": "text.primary",
      "bg": "surface.0",
      "cls": "data-text",
      "min": 4.5
    },
    {
      "fg": "text.primary",
      "bg": "surface.50",
      "cls": "data-text",
      "min": 4.5
    },
    {
      "fg": "text.primary",
      "bg": "surface.100",
      "cls": "data-text",
      "min": 4.5
    },
    {
      "fg": "text.secondary",
      "bg": "surface.0",
      "cls": "data-text",
      "min": 4.5
    },
    {
      "fg": "text.secondary",
      "bg": "surface.50",
      "cls": "data-text",
      "min": 4.5
    },
    {
      "fg": "text.secondary",
      "bg": "surface.100",
      "cls": "data-text",
      "min": 4.5
    },
    {
      "fg": "text.primary",
      "bg": "blue.100",
      "cls": "data-text",
      "min": 4.5
    },
    {
      "fg": "text.secondary",
      "bg": "blue.100",
      "cls": "data-text",
      "min": 4.5
    },
    {
      "fg": "text.muted",
      "bg": "surface.0",
      "cls": "data-text",
      "min": 4.5
    },
    {
      "fg": "text.muted",
      "bg": "surface.50",
      "cls": "data-text",
      "min": 4.5
    },
    {
      "fg": "text.muted",
      "bg": "surface.100",
      "cls": "data-text",
      "min": 4.5
    },
    {
      "fg": "text.muted",
      "bg": "blue.100",
      "cls": "data-text",
      "min": 4.5
    },
    {
      "fg": "primary.color",
      "bg": "surface.0",
      "cls": "data-text",
      "min": 4.5
    },
    {
      "fg": "primary.color",
      "bg": "surface.50",
      "cls": "data-text",
      "min": 4.5
    },
    {
      "fg": "primary.color",
      "bg": "surface.100",
      "cls": "data-text",
      "min": 4.5
    },
    {
      "fg": "text.on.primary",
      "bg": "primary.color",
      "cls": "data-text",
      "min": 4.5
    },
    {
      "fg": "text.on.primary",
      "bg": "primary.hover",
      "cls": "data-text",
      "min": 4.5
    },
    {
      "fg": "text.on.primary",
      "bg": "primary.active",
      "cls": "data-text",
      "min": 4.5
    },
    {
      "fg": "danger.on",
      "bg": "danger.hover",
      "cls": "data-text",
      "min": 4.5
    },
    {
      "fg": "danger.on",
      "bg": "danger.active",
      "cls": "data-text",
      "min": 4.5
    },
    {
      "fg": "success.on",
      "bg": "success.hover",
      "cls": "data-text",
      "min": 4.5
    },
    {
      "fg": "success.on",
      "bg": "success.active",
      "cls": "data-text",
      "min": 4.5
    },
    {
      "fg": "warning.on",
      "bg": "warning.hover",
      "cls": "data-text",
      "min": 4.5
    },
    {
      "fg": "warning.on",
      "bg": "warning.active",
      "cls": "data-text",
      "min": 4.5
    },
    {
      "fg": "primary.subtle.text",
      "bg": "primary.subtle.bg",
      "cls": "data-text",
      "min": 4.5
    },
    {
      "fg": "danger.subtle.text",
      "bg": "danger.subtle.bg",
      "cls": "data-text",
      "min": 4.5
    },
    {
      "fg": "success.subtle.text",
      "bg": "success.subtle.bg",
      "cls": "data-text",
      "min": 4.5
    },
    {
      "fg": "warning.subtle.text",
      "bg": "warning.subtle.bg",
      "cls": "data-text",
      "min": 4.5
    },
    {
      "fg": "danger.on",
      "bg": "danger.default",
      "cls": "data-text",
      "min": 4.5
    },
    {
      "fg": "success.on",
      "bg": "success.default",
      "cls": "data-text",
      "min": 4.5
    },
    {
      "fg": "warning.on",
      "bg": "warning.default",
      "cls": "data-text",
      "min": 4.5
    },
    {
      "fg": "text.disabled",
      "bg": "surface.0",
      "cls": "decorative",
      "min": 0
    }
  ]
} as const;

export const tokens = {
  colors: {
    amber: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
      950: '#451a03',
    },
    blue: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
      950: '#172554',
    },
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#5f6775',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
      950: '#030712',
    },
    green: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
      950: '#052e16',
    },
    red: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
      950: '#450a0a',
    },
    primary: { DEFAULT: '#2563eb', hover: '#1d4ed8', active: '#1e40af', on: '#ffffff', subtle: '#eff6ff', 'subtle-text': '#1d4ed8' },
    surface: { DEFAULT: '#ffffff', page: '#f9fafb', alt: '#f3f4f6' },
    line: { DEFAULT: '#d1d5db', subtle: '#e5e7eb' },
    ink: { DEFAULT: '#111827', secondary: '#4b5563', muted: '#5f6775', disabled: '#9ca3af' },
    danger: { DEFAULT: '#dc2626', hover: '#b91c1c', active: '#991b1b', on: '#ffffff', subtle: '#fef2f2', 'subtle-text': '#b91c1c' },
    success: { DEFAULT: '#15803d', hover: '#166534', active: '#14532d', on: '#ffffff', subtle: '#f0fdf4', 'subtle-text': '#15803d' },
    warning: { DEFAULT: '#d97706', hover: '#f59e0b', active: '#fbbf24', on: '#111827', subtle: '#fffbeb', 'subtle-text': '#92400e' },
  },
  fontFamily: { sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'], mono: ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'monospace'] },
  fontSize: { xs: '11px', sm: '12px', md: '13px', lg: '14px', xl: '16px' },
  minHeight: { xs: '24px', sm: '28px', md: '32px', lg: '40px' },
  height: { row: '30px', 'row-dense': '26px' },
  borderRadius: { none: '0px', sm: '3px', DEFAULT: '4px', lg: '6px', full: '9999px' },
  boxShadow: { sm: '0 1px 2px rgba(16,24,40,0.06)', md: '0 2px 6px rgba(16,24,40,0.08)', lg: '0 4px 16px rgba(16,24,40,0.12)' },
}

export default tokens;
