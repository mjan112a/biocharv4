# Data Layer Documentation

This document explains the new data-driven architecture for the biochar system diagrams.

## Overview

The data layer provides a comprehensive foundation for generating system diagrams automatically from the `system-comparison.json` file. It eliminates hardcoded flow paths and enables dynamic, data-driven visualizations.

## Architecture

```
data/system/system-comparison.json
         ↓
hooks/useSystemData.tsx (loads & queries data)
         ↓
lib/flowGeneration.ts (generates positions & flows)
         ↓
lib/iconMapping.ts (resolves icon paths)
         ↓
Components (SystemDiagram, SankeyDiagram, etc.)
```

## Files Created

### 1. Type Definitions (`types/system-comparison.ts`)
- **SystemComparison**: Main data structure
- **SystemComponent**: Individual component data
- **SystemView**: Current or proposed view
- **FlowPath**: Generated flow between components
- **ComponentPosition**: X/Y coordinates for layout
- **IconInfo**: Icon metadata and paths

### 2. Data Hook (`hooks/useSystemData.tsx`)
React hook that provides:
- **Component queries**: `getComponent()`, `getComponentView()`
- **Input/output access**: `getComponentInputs()`, `getComponentOutputs()`
- **Impact data**: `getComponentImpacts()`, `getFinancialImplications()`
- **Connection finding**: `findConnections()` - auto-detects material flows
- **Active components**: Lists components for current vs proposed view

### 3. Icon Mapping (`lib/iconMapping.ts`)
Maps material names to icon files:
- **iconMapping**: Complete registry of 25 icons
- **findIcon()**: Fuzzy search for icons
- **getIconPath()**: Get path with fallback
- **normalizeIconKey()**: Handle naming variations

### 4. Flow Generation (`lib/flowGeneration.ts`)
Auto-generates diagram layout:
- **generateComponentPositions()**: Calculate X/Y positions
- **generateFlowPaths()**: Create connections with colors
- **generateDiagram()**: Complete diagram generation
- **calculateFlowMetrics()**: Statistics (circular flows, waste, etc.)

## Usage Examples

### Example 1: Using the Data Hook

```typescript
import { useSystemData } from '@/hooks/useSystemData';

function MyComponent() {
  const {
    getActiveComponents,
    getComponentView,
    findConnections,
    currentView
  } = useSystemData();
  
  // Get all active components
  const components = getActiveComponents;
  // ['chicken-house', 'processing-plant', 'farm-waterways'] for current
  // ['chicken-house', 'processing-plant', 'anaerobic-digester', 'pyrolysis-unit', 'farm-waterways'] for proposed
  
  // Get component details
  const chickenHouse = getComponentView('chicken-house');
  console.log(chickenHouse?.inputs);   // ['Chickens', 'Fresh Pine Shavings', ...]
  console.log(chickenHouse?.outputs);  // ['Live Chickens', 'Dead Chickens', ...]
  console.log(chickenHouse?.impacts);  // { benefits: [...], detriments: [...] }
  
  // Find connections automatically
  const connections = findConnections;
  // [{ source: 'chicken-house', target: 'processing-plant', material: 'Live Chickens' }, ...]
}
```

### Example 2: Getting Icon Paths

```typescript
import { getIconPath, findIcon } from '@/lib/iconMapping';

// Get icon path
const biocharIcon = getIconPath('biochar');
// '/images/system-icons/outputs/biochar.png'

// Fuzzy search
const icon = findIcon('chicken feed');
// { name: 'Chicken Feed', path: '/images/system-icons/inputs/chicken-feed.png', ... }
```

### Example 3: Generating Diagram

```typescript
import { useSystemData } from '@/hooks/useSystemData';
import { generateDiagram } from '@/lib/flowGeneration';

function DiagramGenerator() {
  const {
    getActiveComponents,
    data,
    findConnections,
    currentView
  } = useSystemData();
  
  // Generate complete diagram
  const diagram = generateDiagram(
    currentView,
    getActiveComponents,
    data.components,
    findConnections
  );
  
  console.log(diagram.components);  // Array of positioned components
  console.log(diagram.flows);       // Array of flow paths with colors & icons
}
```

## Icon Organization

Icons should be placed in:
```
public/images/system-icons/
├── components/
│   ├── anaerobic-digester.png
│   ├── chicken-house.png
│   ├── farm-waterways.png
│   ├── processing-plant.png
│   └── pyrolysis-unit.png
├── inputs/
│   ├── chicken-feed.png
│   ├── fresh-pine-shavings.png
│   ├── water.png
│   └── ...
├── intermediate/
│   ├── used-poultry-litter.png
│   ├── litter-char-from-chicken-house.png
│   └── ...
├── outputs/
│   ├── biochar.png
│   ├── chicken-meat.png
│   ├── crops-corn.png
│   └── ...
└── energy/
    ├── bio-methane.png
    ├── syngas-energy.png
    └── renewable-biofuels.png
```

## Data Structure

The `system-comparison.json` file follows this structure:

```json
{
  "metadata": { "title": "...", "description": "...", "lastUpdated": "..." },
  "components": {
    "component-id": {
      "name": "Component Name",
      "order": 1,
      "current": {
        "actions": ["Action 1", "Action 2"],
        "inputs": ["Input 1", "Input 2"],
        "outputs": ["Output 1", "Output 2"],
        "impacts": {
          "benefits": ["Benefit 1"],
          "detriments": ["Detriment 1"]
        },
        "financialImplications": "Description..."
      },
      "proposed": { /* same structure */ }
    }
  },
  "summary": {
    "current": { "totalComponents": 3, "activeComponents": [...], ... },
    "proposed": { "totalComponents": 5, "activeComponents": [...], ... }
  }
}
```

## Next Steps

### Phase 2: Implement Visual Components
1. Refactor `SystemDiagram.tsx` to use `useSystemData()`
2. Update `SankeyDiagram.tsx` with generated flows
3. Create `ComparisonView.tsx` for side-by-side display

### Phase 3: Detail Pages
1. Update `[component]/page.tsx` to use data
2. Add input/output icon grids
3. Implement impact visualization

### Phase 4: Polish
1. Add animations for transitions
2. Enhance tooltips with data
3. Add metrics display

## Testing

To test the data layer:

```typescript
// 1. Test data loading
const { data } = useSystemData();
console.log(data.metadata);

// 2. Test component queries
const { getComponent } = useSystemData();
console.log(getComponent('chicken-house'));

// 3. Test connections
const { findConnections } = useSystemData();
console.log(findConnections);

// 4. Test icon mapping
import { getIconPath } from '@/lib/iconMapping';
console.log(getIconPath('biochar'));
```

## Benefits

✅ **Data-Driven**: Change JSON, diagrams update automatically  
✅ **Type-Safe**: Full TypeScript support  
✅ **Maintainable**: Single source of truth  
✅ **Flexible**: Easy to add new components or flows  
✅ **Scalable**: Handles any number of components  
✅ **Icon-Aware**: Automatic icon resolution  

## Migration Guide

### Before (Hardcoded):
```typescript
<AnimatedIcon
  startX="18"
  startY="40"
  endX="72"
  endY="15"
  iconPath="/images/flow-icons/fresh-litter.svg"
  label="Fresh Litter"
/>
```

### After (Data-Driven):
```typescript
const { findConnections } = useSystemData();
const flows = generateFlowPaths(findConnections, positions);

flows.map(flow => (
  <AnimatedIcon
    key={flow.id}
    iconPath={flow.iconPath}
    label={flow.label}
    color={flow.color}
    // positions calculated automatically
  />
))