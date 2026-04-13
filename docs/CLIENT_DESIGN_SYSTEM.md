# Client Design System

**Version**: 1.0.0  
**Created**: March 6, 2026  
**Owner**: @ui-ux-designer  
**Status**: DRAFT - Pending approval

---

## Overview

This document is the **single source of truth** for all UI patterns, components, and visual conventions in the EHMRS Vue 3 client.

**All pages must follow patterns defined in this document. New patterns must be added here before implementation.**

---

## Design Principles

### 1. Clinical Clarity
Healthcare data must be presented clearly and unambiguously. Prioritize readability over aesthetics.

### 2. Accessibility First
WCAG 2.1 AA compliance is mandatory. All components must be keyboard-navigable and screen-reader compatible.

### 3. Consistency
Use established patterns. Do not invent new patterns unless no existing pattern fits the need.

### 4. Efficiency
Healthcare workers are time-constrained. Minimize clicks, maximize information density without clutter.

### 5. Responsiveness
Support desktop (primary), tablet, and mobile views.

---

## Color System

### Primary Colors

```scss
// Primary brand color - To be finalized
$color-primary: #2563eb;        // Blue-600
$color-primary-hover: #1d4ed8;  // Blue-700
$color-primary-light: #dbeafe;  // Blue-100
$color-primary-dark: #1e40af;   // Blue-800
```

### Semantic Colors

```scss
// Success
$color-success: #10b981;        // Emerald-500
$color-success-light: #d1fae5;  // Emerald-100
$color-success-dark: #059669;   // Emerald-600

// Warning
$color-warning: #f59e0b;        // Amber-500
$color-warning-light: #fef3c7;  // Amber-100
$color-warning-dark: #d97706;   // Amber-600

// Error
$color-error: #ef4444;          // Red-500
$color-error-light: #fee2e2;    // Red-100
$color-error-dark: #dc2626;     // Red-600

// Info
$color-info: #3b82f6;           // Blue-500
$color-info-light: #dbeafe;     // Blue-100
$color-info-dark: #2563eb;      // Blue-600
```

### Neutral Colors

```scss
// Text
$color-text-primary: #111827;   // Gray-900
$color-text-secondary: #6b7280; // Gray-500
$color-text-tertiary: #9ca3af;  // Gray-400
$color-text-disabled: #d1d5db;  // Gray-300

// Borders
$color-border: #e5e7eb;         // Gray-200
$color-border-focus: #9ca3af;   // Gray-400

// Backgrounds
$color-background: #ffffff;     // White
$color-background-secondary: #f9fafb; // Gray-50
$color-background-tertiary: #f3f4f6;  // Gray-100

// Overlay
$color-overlay: rgba(0, 0, 0, 0.5);
```

### Usage Guidelines

| Use Case | Color |
|----------|-------|
| Primary actions | `$color-primary` |
| Success states | `$color-success` |
| Warnings/Alerts | `$color-warning` |
| Errors/Validation | `$color-error` |
| Informational | `$color-info` |
| Primary text | `$color-text-primary` |
| Secondary text | `$color-text-secondary` |
| Disabled text | `$color-text-disabled` |
| Borders | `$color-border` |
| Hover states | Darken by 10% |

---

## Typography

### Font Family

```scss
$font-family-base: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
$font-family-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

### Font Scale

| Name | Size | Line Height | Weight | Use Case |
|------|------|-------------|--------|----------|
| xs | 12px | 16px | 400 | Captions, labels |
| sm | 14px | 20px | 400 | Secondary text, form labels |
| base | 16px | 24px | 400 | Body text |
| lg | 18px | 28px | 500 | Subheadings |
| xl | 20px | 28px | 600 | Section titles |
| 2xl | 24px | 32px | 600 | Page titles |
| 3xl | 30px | 36px | 700 | Dashboard metrics |
| 4xl | 36px | 40px | 700 | Hero text |

### Font Weights

```scss
$font-weight-regular: 400;
$font-weight-medium: 500;
$font-weight-semibold: 600;
$font-weight-bold: 700;
```

### Usage Examples

```scss
.heading-xl {
  @include text-2xl;
  font-weight: $font-weight-bold;
  color: $color-text-primary;
}

.body-base {
  @include text-base;
  font-weight: $font-weight-regular;
  color: $color-text-primary;
}

.label-sm {
  @include text-sm;
  font-weight: $font-weight-medium;
  color: $color-text-secondary;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
```

---

## Spacing System

### Base Scale

Based on 4px grid:

```scss
$spacing-0: 0;
$spacing-1: 4px;
$spacing-2: 8px;
$spacing-3: 12px;
$spacing-4: 16px;
$spacing-5: 20px;
$spacing-6: 24px;
$spacing-8: 32px;
$spacing-10: 40px;
$spacing-12: 48px;
$spacing-16: 64px;
$spacing-20: 80px;
$spacing-24: 96px;
```

### Component Spacing

| Component | Padding | Gap |
|-----------|---------|-----|
| Button | `spacing-3 spacing-4` | - |
| Input | `spacing-2 spacing-3` | - |
| Card | `spacing-6` | - |
| Modal | `spacing-6` | `spacing-4` |
| Table cell | `spacing-3 spacing-4` | - |
| Form field | - | `spacing-4` |

---

## Elevation & Shadows

### Shadow Scale

```scss
$shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
$shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
$shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
$shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
$shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
```

### Usage

| Element | Shadow |
|---------|--------|
| Cards | `$shadow-md` |
| Dropdowns | `$shadow-lg` |
| Modals | `$shadow-xl` |
| Hover states | `$shadow-sm` |
| Floating action button | `$shadow-lg` |

---

## Border Radius

```scss
$radius-sm: 4px;
$radius-md: 6px;
$radius-lg: 8px;
$radius-xl: 12px;
$radius-2xl: 16px;
$radius-full: 9999px;
```

### Usage

| Element | Radius |
|---------|--------|
| Buttons | `$radius-md` |
| Inputs | `$radius-md` |
| Cards | `$radius-lg` |
| Modals | `$radius-xl` |
| Badges | `$radius-full` |
| Avatars | `$radius-full` |

---

## Layout Patterns

### Application Layout

```
┌─────────────────────────────────────────────────────┐
│ Header (64px height)                                │
│ ┌─────────┐                         ┌─────────────┐ │
│ │ Logo    │    Search               │ User Menu   │ │
│ └─────────┘                         └─────────────┘ │
├──────────┬──────────────────────────────────────────┤
│ Sidebar  │ Main Content Area                        │
│ (256px)  │                                          │
│          │  ┌────────────────────────────────────┐  │
│ Nav Items│  │ Page Header                        │  │
│          │  └────────────────────────────────────┘  │
│          │  ┌────────────────────────────────────┐  │
│          │  │ Page Content                       │  │
│          │  │                                    │  │
│          │  └────────────────────────────────────┘  │
│          │                                          │
└──────────┴──────────────────────────────────────────┘
```

**Breakpoints**:
- Desktop: ≥ 1280px (sidebar visible)
- Tablet: 768px - 1279px (collapsible sidebar)
- Mobile: < 768px (hamburger menu)

### Page Layout Patterns

#### 1. List Page Pattern

**Used for**: Patient list, Appointment list, Employee list

```
┌─────────────────────────────────────────────────────┐
│ Page Title                              [+ Create]  │
├─────────────────────────────────────────────────────┤
│ [Search Input]  [Filters ▼]  [Export]  [Refresh]   │
├─────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────┐ │
│ │ Table                                           │ │
│ │ ┌─────┬─────────┬─────────┬─────────┬────────┐ │ │
│ │ │ ☐   │ Name    │ ID      │ Status  │ Actions│ │ │
│ │ ├─────┼─────────┼─────────┼─────────┼────────┤ │ │
│ │ │ ☐   │ John D. │ P-001   │ ● Active│ ⋮      │ │ │
│ │ │ ☐   │ Jane S. │ P-002   │ ● Active│ ⋮      │ │ │
│ │ └─────┴─────────┴─────────┴─────────┴────────┘ │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ Showing 1-20 of 100    [◀] [1] [2] [3] [...] [▶]   │
└─────────────────────────────────────────────────────┘
```

**Components**:
- Page header with title and primary action
- Search bar with filters
- Data table with sorting, selection
- Pagination

#### 2. Detail Page Pattern

**Used for**: Patient profile, Appointment details, Employee profile

```
┌─────────────────────────────────────────────────────┐
│ [← Back]  Patient Profile               [Edit] [⋮]  │
├─────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────┐ │
│ │ [Photo]  John Doe                    MRN: 001   │ │
│ │          Male, 34 years                         │ │
│ │          📞 +234 XXX XXX XXXX                   │ │
│ └─────────────────────────────────────────────────┘
│                                                     │
│ [Overview] [Visits] [Appointments] [Documents]     │
│ ─────────────────────────────────────────────────── │
│                                                     │
│ ┌─────────────────┐ ┌─────────────────────────────┐│
│ │ Demographics    │ │ Insurance Information       ││
│ │ - DOB           │ │ - Provider: NHIS            ││
│ │ - Gender        │ │ - Policy: XXXXX             ││
│ │ - Address       │ │ - Status: Active            ││
│ └─────────────────┘ └─────────────────────────────┘│
│                                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Recent Visits                                   │ │
│ │ ┌─────────────────────────────────────────────┐ │ │
│ │ │ Date       Type        Provider    Status   │ │ │
│ │ │ 2026-03-01 Consultation Dr. Smith  Completed│ │ │
│ │ └─────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────┘
```

**Components**:
- Header with back navigation and actions
- Summary card with key information
- Tab navigation for sections
- Content sections with related data

#### 3. Form Page Pattern

**Used for**: Create patient, Edit appointment, New visit

```
┌─────────────────────────────────────────────────────┐
│ [← Back]  Create Patient Account        [Save] [▼]  │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Step 1 of 3: Basic Information                      │
│ ─────────────────────────────────────────────────── │
│                                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Personal Details                                │ │
│ │ ┌──────────────────┐ ┌──────────────────┐      │ │
│ │ │ First Name *     │ │ Last Name *      │      │ │
│ │ │ [____________]   │ │ [____________]   │      │ │
│ │ └──────────────────┘ └──────────────────┘      │ │
│ │ ┌──────────────────┐ ┌──────────────────┐      │ │
│ │ │ Date of Birth *  │ │ Gender *         │      │ │
│ │ │ [DD/MM/YYYY]     │ │ [Select ▼]       │      │ │
│ │ └──────────────────┘ └──────────────────┘      │ │
│ └─────────────────────────────────────────────────┘
│                                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Contact Information                             │ │
│ │ ┌──────────────────┐ ┌──────────────────┐      │ │
│ │ │ Phone *          │ │ Email            │      │ │
│ │ │ [____________]   │ │ [____________]   │      │ │
│ │ └──────────────────┘ └──────────────────┘      │ │
│ └─────────────────────────────────────────────────┘
│                                                     │
│                    [Cancel] [Next →]                │
└─────────────────────────────────────────────────────┘
```

**Components**:
- Header with back, save, and menu
- Stepper for multi-step forms
- Form sections with clear headings
- Validation messages inline
- Action buttons at bottom

#### 4. Dashboard Pattern

**Used for**: Main dashboard, Department dashboards

```
┌─────────────────────────────────────────────────────┐
│ Dashboard                              [Refresh] [▼]│
├─────────────────────────────────────────────────────┤
│ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌──────┐│
│ │ Total     │ │ Today's   │ │ Pending   │ │      ││
│ │ Patients  │ │ Appts     │ │ Lab       │ │ ...  ││
│ │ 1,234     │ │ 45        │ │ Results   │ │      ││
│ │ ↑ 12%     │ │ ↑ 8%      │ │ 23        │ │      ││
│ └───────────┘ └───────────┘ └───────────┘ └──────┘│
│                                                     │
│ ┌─────────────────────────┐ ┌─────────────────────┐│
│ │ Appointment Trends      │ │ Department Stats    ││
│ │                         │ │                     ││
│ │    📈 Chart             │ │    📊 Chart         ││
│ │                         │ │                     ││
│ └─────────────────────────┘ └─────────────────────┘│
│                                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Recent Activity                                 │ │
│ │ ┌─────────────────────────────────────────────┐ │ │
│ │ │ Time    Activity          User              │ │ │
│ │ │ 10:30   New patient reg.  Nurse Jane        │ │ │
│ │ │ 10:25   Lab result        Dr. Smith         │ │ │
│ │ └─────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────┘
```

**Components**:
- Metric cards with trends
- Charts (line, bar, pie)
- Activity feed
- Quick actions

---

<!-- Version: 1.1.0 | Last Updated: 2026-04-11 | Updated By: @code-executor -->

## Component Library

### Installed Components

**Last Updated**: April 11, 2026
**Component Library**: shadcn-vue (Vega style)
**Headless Layer**: Reka UI
**Validation**: VeeValidate + Zod

| Component | Library | Import Path | Status |
|-----------|---------|-------------|--------|
| Button | shadcn-vue | `@/components/ui/button` | ✅ Installed |
| Input | shadcn-vue | `@/components/ui/input` | ✅ Installed |
| Label | shadcn-vue | `@/components/ui/label` | ✅ Installed |
| Textarea | shadcn-vue | `@/components/ui/textarea` | ✅ Installed |
| Select | shadcn-vue | `@/components/ui/select` | ✅ Installed |
| DatePicker | Custom | `@/components/ui/date-picker` | ✅ Installed |
| Tabs | shadcn-vue | `@/components/ui/tabs` | ✅ Installed |
| Badge | shadcn-vue | `@/components/ui/badge` | ✅ Installed |
| Card | shadcn-vue | `@/components/ui/card` | ✅ Installed |
| Table | shadcn-vue | `@/components/ui/table` | ✅ Installed |
| Dialog (Modal) | shadcn-vue | `@/components/ui/dialog` | ✅ Installed |
| Toast | vue-sonner | `vue-sonner` | ✅ Installed |
| Skeleton | shadcn-vue | `@/components/ui/skeleton` | ✅ Installed |
| Pagination | shadcn-vue | `@/components/ui/pagination` | ✅ Installed |
| DropdownMenu | shadcn-vue | `@/components/ui/dropdown-menu` | ✅ Installed |
| Popover | shadcn-vue | `@/components/ui/popover` | ✅ Installed |
| Checkbox | shadcn-vue | `@/components/ui/checkbox` | ✅ Installed |
| Switch | shadcn-vue | `@/components/ui/switch` | ✅ Installed |
| Avatar | shadcn-vue | `@/components/ui/avatar` | ✅ Installed |
| Separator | shadcn-vue | `@/components/ui/separator` | ✅ Installed |
| Alert | shadcn-vue | `@/components/ui/alert` | ✅ Installed |
| Form | VeeValidate | `vee-validate` | ✅ Installed |

### Dependencies Added

```json
{
  "reka-ui": "latest",
  "tailwindcss-animate": "latest",
  "class-variance-authority": "latest",
  "clsx": "latest",
  "tailwind-merge": "latest",
  "lucide-vue-next": "latest",
  "@vueuse/core": "latest",
  "vue-sonner": "latest",
  "vee-validate": "latest",
  "@vee-validate/zod": "latest",
  "zod": "latest"
}
```

### Component Specifications

#### Button

**Source**: `@/components/ui/button/Button.vue`

```vue
<script setup lang="ts">
import { Button } from '@/components/ui/button'
</script>

<template>
  <Button variant="default">Primary Action</Button>
  <Button variant="secondary">Cancel</Button>
  <Button variant="outline">Filter</Button>
  <Button variant="ghost">Icon Button</Button>
  <Button variant="destructive">Delete</Button>
  <Button variant="link">Link Style</Button>
  <Button size="sm">Small</Button>
  <Button size="lg">Large</Button>
  <Button :disabled="true">Disabled</Button>
</template>
```

**Variants**:
- `default`: Primary actions (Create, Save)
- `secondary`: Secondary actions (Cancel, Back)
- `outline`: Tertiary actions (filters, toggles)
- `ghost`: Minimal emphasis (icon buttons)
- `destructive`: Destructive actions (Delete, Remove)
- `link`: Text-style links

#### Input

**Source**: `@/components/ui/input/Input.vue`

```vue
<script setup lang="ts">
import { Input } from '@/components/ui/input'
</script>

<template>
  <Input type="text" placeholder="Enter name..." />
  <Input type="email" v-model="email" />
  <Input type="password" v-model="password" />
  <Input type="number" v-model="count" />
  <Input type="date" v-model="date" />
  <Input type="file" />
  <Input disabled placeholder="Disabled..." />
  <Input class="border-destructive" />
</template>
```

**States**:
- Default: Clean border
- Focus: Ring with primary color
- Error: Add `border-destructive` class
- Disabled: Gray background, no interaction

#### Label

**Source**: `@/components/ui/label/Label.vue`

```vue
<script setup lang="ts">
import { Label } from '@/components/ui/label'
</script>

<template>
  <Label for="email">Email Address</Label>
  <Label class="text-destructive">Required Field</Label>
</template>
```

#### Table

**Source**: `@/components/ui/table/*`

```vue
<script setup lang="ts">
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
</script>

<template>
  <Table>
    <TableCaption>List of patients</TableCaption>
    <TableHeader>
      <TableRow>
        <TableHead>Name</TableHead>
        <TableHead>ID</TableHead>
        <TableHead>Status</TableHead>
        <TableHead class="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow v-for="patient in patients" :key="patient.id">
        <TableCell>{{ patient.firstname }}</TableCell>
        <TableCell>{{ patient.hospital_id }}</TableCell>
        <TableCell><Badge>{{ patient.status }}</Badge></TableCell>
        <TableCell class="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem @click="edit(patient.id)">Edit</DropdownMenuItem>
              <DropdownMenuItem class="text-destructive" @click="remove(patient.id)">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
</template>
```

**Features**:
- Sorting (implement in data layer)
- Row selection (Checkbox integration)
- Loading state (Skeleton rows)
- Empty state (TableCaption or custom message)
- Pagination integration

#### Dialog (Modal)

**Source**: `@/components/ui/dialog/*`

```vue
<script setup lang="ts">
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
</script>

<template>
  <Dialog>
    <DialogTrigger as-child>
      <Button variant="outline">Open Dialog</Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete this patient?
        </DialogDescription>
      </DialogHeader>
      <div class="py-4">
        <p>This action cannot be undone.</p>
      </div>
      <DialogFooter>
        <Button variant="outline">Cancel</Button>
        <Button variant="destructive">Delete</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
```

**Sizes**: Use Tailwind max-width classes on `DialogContent`
- `sm`: `class="max-w-sm"`
- `md`: default
- `lg`: `class="max-w-lg"`
- `xl`: `class="max-w-xl"`
- Full screen (mobile): Add responsive classes
```

#### Badge

**Source**: `@/components/ui/badge/Badge.vue`

```vue
<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
</script>

<template>
  <Badge variant="default">Active</Badge>
  <Badge variant="secondary">Outpatient</Badge>
  <Badge variant="outline">Pending</Badge>
  <Badge variant="destructive">Deceased</Badge>
</template>
```

**Variants**:
- `default`: Success/active states
- `secondary`: Neutral/informational
- `outline`: Pending/neutral with emphasis
- `destructive`: Error/deceased/critical

#### Card

**Source**: `@/components/ui/card/*`

```vue
<script setup lang="ts">
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Patient Information</CardTitle>
      <CardDescription>Demographics and contact details</CardDescription>
    </CardHeader>
    <CardContent>
      <p>Content goes here...</p>
    </CardContent>
    <CardFooter>
      <Button>Save Changes</Button>
    </CardFooter>
  </Card>
</template>
```

#### Tabs

**Source**: `@/components/ui/tabs/*`

```vue
<script setup lang="ts">
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
</script>

<template>
  <Tabs default-value="overview">
    <TabsList>
      <TabsTrigger value="overview">Overview</TabsTrigger>
      <TabsTrigger value="visits">Visits</TabsTrigger>
      <TabsTrigger value="appointments">Appointments</TabsTrigger>
      <TabsTrigger value="insurance">Insurance</TabsTrigger>
    </TabsList>
    <TabsContent value="overview">
      <!-- Overview content -->
    </TabsContent>
    <TabsContent value="visits">
      <!-- Visit history -->
    </TabsContent>
    <TabsContent value="appointments">
      <!-- Appointment list -->
    </TabsContent>
    <TabsContent value="insurance">
      <!-- Insurance details -->
    </TabsContent>
  </Tabs>
</template>
```

#### Select

**Source**: `@/components/ui/select/*`

```vue
<script setup lang="ts">
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
</script>

<template>
  <Select v-model="gender">
    <SelectTrigger>
      <SelectValue placeholder="Select gender" />
    </SelectTrigger>
    <SelectContent>
      <SelectGroup>
        <SelectItem value="Male">Male</SelectItem>
        <SelectItem value="Female">Female</SelectItem>
        <SelectItem value="Other">Other</SelectItem>
      </SelectGroup>
    </SelectContent>
  </Select>
</template>
```

#### DatePicker

**Source**: `@/components/ui/date-picker/DatePicker.vue`

```vue
<script setup lang="ts">
import { DatePicker } from '@/components/ui/date-picker'
</script>

<template>
  <DatePicker v-model="dateOfBirth" label="Date of Birth" />
  <DatePicker
    v-model="appointmentDate"
    label="Appointment Date"
    :error="dateError"
  />
  <DatePicker
    v-model="startDate"
    label="Start Date"
    disabled
  />
</template>
```

**Note**: Uses native HTML date input with styled wrapper. For advanced date range pickers,
consider integrating `@vuepic/vue-datepicker` in the future.

#### Form (VeeValidate + Zod) — **STANDARD FORM PATTERN**

**Source**: `vee-validate` + `@vee-validate/zod`

> ⚠️ **MANDATORY**: ALL forms in this project MUST use VeeValidate + Zod for validation.
> Manual `errors` refs, `watch`-based error clearing, and custom validation functions are
> NOT allowed. This pattern is used by every form in the codebase for consistency.

**Why VeeValidate + Zod**:
- Errors auto-clear on valid input — no manual `watch` handlers needed
- Zod schemas provide full TypeScript type inference — validated values are typed
- Real-time feedback on every keystroke (configurable validation mode)
- Consistent API across all forms — single pattern to learn
- `Field` component handles `v-model`, `@blur`, `@input` automatically

**Standard Pattern** (copy this for every form):

```vue
<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm, Field } from 'vee-validate'
import * as z from 'zod'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { toast } from 'vue-sonner'

// 1. Define Zod schema — snake_case fields to match server
const schema = toTypedSchema(
  z.object({
    firstname: z.string().min(2, 'First name is required'),
    lastname: z.string().min(2, 'Last name is required'),
    gender: z.enum(['Male', 'Female', 'Other']),
    date_of_birth: z.string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format')
      .refine((val) => new Date(val) < new Date(), 'Date of birth must be in the past'),
    phone: z.string().min(10, 'Valid phone number required'),
  })
)

// 2. Create form instance
const { handleSubmit, errors, setValues } = useForm({ validationSchema: schema })

// 3. Handle submit — values are fully typed from Zod schema
const onSubmit = handleSubmit(async (values) => {
  // values.firstname — string (not unknown)
  // values.date_of_birth — string
  await createPatient(values)
  toast.success('Patient created successfully')
})

// 4. Pre-populate (for edit forms)
// setValues({ firstname: 'John', lastname: 'Doe', ... })
</script>

<template>
  <form @submit="onSubmit" class="space-y-4">
    <!-- Each field follows this exact structure -->
    <div class="space-y-2">
      <Label for="firstname">First Name</Label>
      <Field name="firstname" v-slot="{ componentField }">
        <Input
          id="firstname"
          v-bind="componentField"
          :class="{ 'border-destructive': errors.firstname }"
          :aria-invalid="!!errors.firstname"
          aria-describedby="firstname-error"
        />
      </Field>
      <p v-if="errors.firstname" id="firstname-error" class="text-sm text-destructive" role="alert">
        {{ errors.firstname }}
      </p>
    </div>

    <Button type="submit">Save</Button>
  </form>
</template>
```

**Field Wrapper Pattern** (reuse for every field):

```vue
<div class="space-y-2">
  <Label for="[fieldName]">[Display Label]</Label>
  <Field name="[fieldName]" v-slot="{ componentField }">
    <Input
      id="[fieldName]"
      v-bind="componentField"
      :class="{ 'border-destructive': errors.[fieldName] }"
      :aria-invalid="!!errors.[fieldName]"
      aria-describedby="[fieldName]-error"
    />
  </Field>
  <p v-if="errors.[fieldName]" id="[fieldName]-error" class="text-sm text-destructive" role="alert">
    {{ errors.[fieldName] }}
  </p>
</div>
```

**Zod Validation Patterns**:

```typescript
// Required text field
z.string().min(2, 'Field is required')

// Optional text field
z.string().optional().or(z.literal(''))

// Email
z.string().email('Invalid email address').optional().or(z.literal(''))

// Date in YYYY-MM-DD format, must be in past
z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format')
  .refine((val) => new Date(val) < new Date(), 'Date must be in the past')

// Date in YYYY-MM-DD format, must be future
z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format')
  .refine((val) => new Date(val) > new Date(), 'Date must be in the future')

// Enum
z.enum(['Male', 'Female', 'Other'])

// Phone (Nigeria)
z.string().min(10, 'Valid phone number required')

// Number
z.coerce.number().min(1, 'Must be positive')

// Boolean
z.boolean().default(false)
```

**Multi-Step Forms**:

For multi-step forms (like CreatePatientPage), use separate `useForm` instances per step:

```typescript
const step1Form = useForm({ validationSchema: step1Schema })
const step2Form = useForm({ validationSchema: step2Schema })
const step3Form = useForm({ validationSchema: step3Schema })

const nextStep = async () => {
  const { valid } = await currentForm.validate()
  if (valid) currentStep.value++
}

// At submit, read values from each form instance
const onSubmit = handleSubmit(async () => {
  const allData = {
    ...step1Form.values,
    ...step2Form.values,
    ...step3Form.values,
  }
  await submitAll(allData)
})
```

**What NOT to Do**:

```vue
<!-- ❌ DO NOT use manual errors ref + watch pattern -->
<script setup>
const errors = ref({})
const form = ref({ username: '' })

watch(() => form.value.username, (val) => {
  if (errors.value.username && val.length >= 3) {
    errors.value.username = undefined  // Manual clearing — fragile
  }
})
</script>

<!-- ❌ DO NOT use custom validate function -->
const validate = () => {
  if (!form.value.username) {
    errors.value.username = 'Required'
    return false
  }
  return true
}
```

---

## State Patterns

### Loading States

**Skeleton Loading**:

**Source**: `@/components/ui/skeleton/Skeleton.vue`

```vue
<script setup lang="ts">
import { Skeleton } from '@/components/ui/skeleton'
</script>

<template>
  <div class="flex items-center space-x-4">
    <Skeleton class="h-12 w-12 rounded-full" />
    <div class="space-y-2">
      <Skeleton class="h-4 w-[250px]" />
      <Skeleton class="h-4 w-[200px]" />
    </div>
  </div>
</template>
```

**Table Loading**:
- Use Skeleton for each cell in 3-5 rows
- Maintain column structure
- Wrap in Table components

**Page Loading**:
- Full page spinner for initial load
- Inline spinner for partial updates
- Use Button loading state for submit actions

### Empty States

```
┌─────────────────────────────┐
│         📋                  │
│     No Patients Found       │
│                             │
│  There are no patients to   │
│  display. Create a new one  │
│  to get started.            │
│                             │
│      [+ Create Patient]     │
└─────────────────────────────┘
```

**Components**:
- Icon
- Title
- Description
- Call-to-action button

### Error States

**Inline Error** (form fields):
```
┌──────────────────┐
│ Email *          │
│ [____________]   │ ← Red border
│ └─ Invalid format│   ← Red text
└──────────────────┘
```

**Page Error** (API failures):
```
┌─────────────────────────────┐
│         ⚠️                  │
│    Failed to Load Data      │
│                             │
│  We couldn't load the       │
│  patient list. Please try   │
│  again.                     │
│                             │
│      [🔄 Retry]             │
└─────────────────────────────┘
```

---

## Accessibility Requirements

### Keyboard Navigation

- All interactive elements must be focusable
- Tab order must be logical
- Focus must be visible (2px blue outline)
- Escape closes modals/dropdowns
- Enter submits forms

### Screen Reader Support

- All images have alt text
- All inputs have labels
- All buttons have accessible names
- ARIA live regions for dynamic content
- ARIA labels for icon-only buttons

### Color Contrast

- Text: 4.5:1 minimum ratio
- Large text: 3:1 minimum ratio
- UI components: 3:1 minimum ratio

### Focus Management

- Trap focus in modals
- Return focus on modal close
- Skip links for main content
- Focus indicators on all interactive elements

---

## Responsive Breakpoints

```scss
$breakpoint-sm: 640px;   // Mobile landscape
$breakpoint-md: 768px;   // Tablet
$breakpoint-lg: 1024px;  // Desktop
$breakpoint-xl: 1280px;  // Large desktop
$breakpoint-2xl: 1536px; // Extra large
```

### Component Behavior

| Component | Mobile (< 768px) | Tablet (768-1024px) | Desktop (> 1024px) |
|-----------|------------------|---------------------|-------------------|
| Sidebar | Hidden (drawer) | Collapsed | Full width (256px) |
| Table | Card view | Scrollable | Full table |
| Modals | Full screen | Centered, 90% | Centered, max-width |
| Forms | Single column | Single column | Multi-column |
| Dashboard | 1 column | 2 columns | 3-4 columns |

---

## Icon System

### Icon Library

**To be selected**: Options include:
- Heroicons (recommended)
- Heroicons Outline
- Material Icons
- Font Awesome

### Icon Usage

```vue
<!-- Inline icon -->
<Icon name="user" size="20" />

<!-- Button with icon -->
<AppButton>
  <Icon name="plus" />
  Create
</AppButton>

<!-- Icon only -->
<AppButton variant="ghost" aria-label="Settings">
  <Icon name="cog" />
</AppButton>
```

---

## Animation & Transitions

### Duration

```scss
$duration-fast: 150ms;
$duration-normal: 200ms;
$duration-slow: 300ms;
```

### Easing

```scss
$ease-in: cubic-bezier(0.4, 0, 1, 1);
$ease-out: cubic-bezier(0, 0, 0.2, 1);
$ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

### Common Transitions

```scss
// Fade
.transition-fade {
  transition: opacity $duration-normal $ease-in-out;
}

// Slide
.transition-slide {
  transition: transform $duration-normal $ease-out;
}

// Scale
.transition-scale {
  transition: transform $duration-fast $ease-in-out;
}
```

---

## Approval

**UI/UX Designer**: @ui-ux-designer  
**Date**: March 6, 2026  
**Status**: DRAFT

**Approvals Required**:
- [ ] @ui-ux-designer (Design system)
- [ ] @software-architect (Technical feasibility)
- [ ] @code-executor (Implementation review)
- [ ] @skeptical-verifier (Accessibility review)

---

**Next Step**: Define page-specific specs in `CLIENT_PAGE_SPECS.md`
