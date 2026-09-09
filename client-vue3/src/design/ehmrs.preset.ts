// ! GENERATED FILE — tools/token-pipeline (issue #40, ADR-0001/0009). Do not edit by hand.
// ! Single source: client-vue3/DESIGN.md. Regenerate: cd tools/token-pipeline && npm run generate.
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

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
      "500": "#6b7280",
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
    "danger.subtle.bg": "{red.50}",
    "danger.subtle.text": "{red.700}",
    "danger.on": "#ffffff",
    "success.default": "{green.700}",
    "success.hover": "{green.800}",
    "success.subtle.bg": "{green.50}",
    "success.subtle.text": "{green.700}",
    "success.on": "#ffffff",
    "warning.default": "{amber.600}",
    "warning.hover": "{amber.700}",
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
      "fg": "text.muted",
      "bg": "surface.0",
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

export const EhmrsPreset = definePreset(Aura, {
  primitive: {
    amber: { 50: "#fffbeb", 100: "#fef3c7", 200: "#fde68a", 300: "#fcd34d", 400: "#fbbf24", 500: "#f59e0b", 600: "#d97706", 700: "#b45309", 800: "#92400e", 900: "#78350f", 950: "#451a03" },
    blue: { 50: "#eff6ff", 100: "#dbeafe", 200: "#bfdbfe", 300: "#93c5fd", 400: "#60a5fa", 500: "#3b82f6", 600: "#2563eb", 700: "#1d4ed8", 800: "#1e40af", 900: "#1e3a8a", 950: "#172554" },
    gray: { 50: "#f9fafb", 100: "#f3f4f6", 200: "#e5e7eb", 300: "#d1d5db", 400: "#9ca3af", 500: "#6b7280", 600: "#4b5563", 700: "#374151", 800: "#1f2937", 900: "#111827", 950: "#030712" },
    green: { 50: "#f0fdf4", 100: "#dcfce7", 200: "#bbf7d0", 300: "#86efac", 400: "#4ade80", 500: "#22c55e", 600: "#16a34a", 700: "#15803d", 800: "#166534", 900: "#14532d", 950: "#052e16" },
    red: { 50: "#fef2f2", 100: "#fee2e2", 200: "#fecaca", 300: "#fca5a5", 400: "#f87171", 500: "#ef4444", 600: "#dc2626", 700: "#b91c1c", 800: "#991b1b", 900: "#7f1d1d", 950: "#450a0a" },
    borderRadius: { none: '0px', sm: '0.1875rem', md: '0.25rem', lg: '0.375rem' },
  },
  semantic: {
    typography: { fontFamily: "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif", fontWeight: '400', fontSize: '0.75rem', lineHeight: '1.4' },
    focusRing: { width: '0.125rem', style: 'solid', color: '{blue.600}', offset: '0.0625rem', shadow: 'none' },
    primary: { 50: '{blue.50}', 100: '{blue.100}', 200: '{blue.200}', 300: '{blue.300}', 400: '{blue.400}', 500: '{blue.500}', 600: '{blue.600}', 700: '{blue.700}', 800: '{blue.800}', 900: '{blue.900}', 950: '{blue.950}' },
    text: { color: '{gray.900}', hoverColor: '{gray.800}', mutedColor: '{gray.600}', hoverMutedColor: '{gray.700}' },
    surface: { 0: '#ffffff', 50: '{gray.50}', 100: '{gray.100}', 200: '{gray.200}', 300: '{gray.300}', 400: '{gray.400}', 500: '{gray.500}', 600: '{gray.600}', 700: '{gray.700}', 800: '{gray.800}', 900: '{gray.900}', 950: '{gray.950}' },
    content: { background: '{surface.0}', hoverBackground: '{surface.100}', borderColor: '{surface.200}', color: '{text.color}', hoverColor: '{text.hover.color}', borderRadius: '{border.radius.md}' },
    highlight: { background: '{primary.50}', focusBackground: '{primary.100}', color: '{primary.700}', focusColor: '{primary.800}' },
    formField: {
      fontSize: '0.75rem',
      fontWeight: '{typography.font.weight}',
      paddingX: '0.5rem',
      paddingY: '0.3125rem',
      borderRadius: '{border.radius.sm}',
      sm: { fontSize: '0.6875rem', paddingX: '0.375rem', paddingY: '0.25rem' },
      lg: { fontSize: '0.875rem', paddingX: '0.5rem', paddingY: '0.5rem' },
      focusRing: { width: '{focus.ring.width}', style: '{focus.ring.style}', color: '{focus.ring.color}', offset: '{focus.ring.offset}', shadow: 'none' },
    },
  },
  components: {
    button: { root: { gap: '0.375rem', roundedBorderRadius: '9999px', sm: { iconOnlyWidth: '1.5rem' } } },
    datatable: {
      bodyCell: { padding: '0.25rem 0.5rem', fontSize: '{typography.font.size}', fontWeight: '{typography.font.weight}', sm: { padding: '0.1875rem 0.3125rem' } },
      headerCell: { padding: '0.3125rem 0.5rem', sm: { padding: '0.1875rem 0.3125rem' } },
    },
  },
});

export default EhmrsPreset;
