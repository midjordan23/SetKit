# SetKit Compatibility System Documentation

## Overview
The compatibility system automatically validates equipment combinations to prevent mismatches and suggest necessary adapters.

## Features Implemented

### 1. Camera-Lens Compatibility Engine
**Function:** `checkLensCompatibility(lens, camera)`

Checks if a lens works with a camera based on mount types:

- **Native Compatibility**: Lens mount matches camera mount exactly
  - Example: PL lens + PL camera = ✓ Native compatibility

- **Adapter Compatibility**: Lens can be adapted to camera
  - Example: PL lens + LPL camera = ⚠ Requires PL→LPL adapter

- **Incompatible**: No adapter available
  - Example: LPL lens + PL camera = ✗ Incompatible (no optical-free adapter)

**Mount Types Supported:**
- PL (Positive Lock)
- LPL (Large Positive Lock)
- E (Sony E-mount)
- EF (Canon EF)
- RF (Canon RF)
- PV (Panavision)
- XPL (ARRI 65mm)

### 2. Camera-Accessory Compatibility Engine
**Function:** `checkAccessoryCompatibility(accessory, camera)`

Validates accessories against cameras using multiple methods:

**Priority 1: Compatibility Matrix**
- Uses CSV database for explicit camera-accessory relationships
- Example: ARRI Hi-5 focus system only works with ARRI cameras

**Priority 2: Category-Based Rules**
- **Universal**: Cables, rigging always compatible
- **Monitors**: Checks SDI output compatibility
- **Power**: Validates V-mount, Gold-mount, B-mount matching
- **Follow Focus**: Checks protocol (L-BUS for ARRI, Preston RF universal)

### 3. Package Validation System
**Function:** `validatePackage(packageItems)`

Real-time validation when building packages:

**Validates:**
- All lenses against selected camera
- All accessories against selected camera
- Returns warnings (adapter needed) and errors (incompatible)

**Example Output:**
```
⚠ Compatibility Warnings:
  - Zeiss CP.3 25mm: Requires PL→LPL adapter
  - Cooke S4 35mm: Requires PL→LPL adapter

⚠ Compatibility Errors:
  - ARRI Hi-5: ARRI L-BUS ecosystem only (camera is Sony)
```

## How It Works

### When Adding to Package:
1. Item is added with `itemType` flag (lens/camera/accessory)
2. Package display is updated
3. `validatePackage()` runs automatically
4. Validation results show at top of package

### Validation Logic Flow:

```
User adds camera to package
    ↓
User adds lens
    ↓
System checks: lens.mount vs camera.native_mount
    ↓
    ├─ Match? → ✓ Native compatibility
    ├─ In accepted_mounts? → ⚠ Adapter required
    ├─ Check adapter_rules → ⚠ or ✗
    └─ No match → ✗ Incompatible
```

## Data Sources

### Camera Data
**File:** `setkit-cameras-data-clean.json`

Contains:
- Camera specifications (mount, sensor, power, I/O)
- `adapter_rules`: Mount compatibility matrix
- `media_rules`: Compatible media types
- `power_rules`: Power requirements
- `io_rules`: Video output specifications

### Compatibility Matrix
**File:** `setkit-compatibility-matrix.csv`

Format:
```csv
camera_id,accessory_id,compatible,reason
C-ARRI-A35,A-FF-ARRI-HI5,True,Standard accessory
C-SONY-VENICE,A-FF-ARRI-HI5,False,ARRI L-BUS ecosystem only
```

## Visual Indicators

### Package Items
Color-coded badges and borders:
- **Camera** = Blue badge + blue border
- **Lens** = Green badge + green border
- **Accessory** = Orange badge + orange border

### Validation Messages
- **Errors** (Red): Completely incompatible, will not work
- **Warnings** (Orange): Compatible but requires adapter or note
- **Success** (implicit): No messages = all compatible

## Example Workflows

### Workflow 1: Compatible Package
1. Add ARRI ALEXA Mini LF (LPL mount)
2. Add ARRI Signature Prime 47mm (LPL mount)
3. Result: ✓ No warnings (native compatibility)

### Workflow 2: Adapter Required
1. Add ARRI ALEXA Mini LF (LPL mount)
2. Add Zeiss Master Prime 35mm (PL mount)
3. Result: ⚠ "Requires PL→LPL adapter"

### Workflow 3: Incompatible
1. Add Sony VENICE (PL mount)
2. Add ARRI Hi-5 Focus System
3. Result: ✗ "ARRI L-BUS ecosystem only"

## Technical Implementation

### Key Functions

1. **checkLensCompatibility(lens, camera)**
   - Returns: `{compatible, status, message, adapter}`
   - Statuses: 'native', 'adapter', 'incompatible'

2. **checkAccessoryCompatibility(accessory, camera)**
   - Returns: `{compatible, status, message, reason}`
   - Statuses: 'compatible', 'universal', 'incompatible', 'unknown'

3. **validatePackage(packageItems)**
   - Returns: `{warnings: [], errors: []}`
   - Runs automatically on package updates

4. **getCompatibleLenses(camera)**
   - Returns: Array of lenses that work with camera
   - Useful for future "show only compatible" filter

5. **getCompatibleAccessories(camera)**
   - Returns: Array of accessories that work with camera

### Global Variables

```javascript
allCameras          // All camera data
allLenses           // All lens data
allAccessories      // All accessory data
compatibilityMatrix // Camera-accessory compatibility rules
currentPackage      // Items in current package
window.currentCameraData // Full camera JSON (adapter_rules, etc.)
```

## Future Enhancements

### Planned Features:
1. **Smart Filter Mode**
   - Toggle "Show only compatible items" based on selected camera
   - Grays out incompatible items

2. **Adapter Suggestions**
   - Link to specific adapter products when needed
   - "Add PL→LPL adapter to package" quick button

3. **Multi-Camera Support**
   - Validate against multiple cameras in package
   - Show which items work with which camera

4. **Detailed Compatibility View**
   - Click item to see full compatibility breakdown
   - "Why is this incompatible?" explanations

5. **Export with Adapters**
   - Auto-generate adapter list when exporting
   - "You need: 2x PL→LPL adapters for this package"

## Testing

### Test Scenarios:

**Test 1: Native Compatibility**
- Camera: ARRI ALEXA Mini (PL)
- Lens: Zeiss Master Prime 35mm (PL)
- Expected: ✓ No warnings

**Test 2: Adapter Required**
- Camera: ARRI ALEXA 35 (LPL)
- Lens: Cooke S4 50mm (PL)
- Expected: ⚠ "Requires PL→LPL adapter"

**Test 3: Incompatible Mount**
- Camera: ARRI ALEXA Mini (PL)
- Lens: Signature Prime 47mm (LPL)
- Expected: ✗ "No optical-free path"

**Test 4: Accessory Ecosystem Lock**
- Camera: Sony VENICE
- Accessory: ARRI Hi-5
- Expected: ✗ "ARRI L-BUS ecosystem only"

**Test 5: Universal Accessory**
- Camera: Any
- Accessory: Teradek Bolt (wireless video)
- Expected: ✓ "Universal SDI accessory"

## Maintenance

### Adding New Cameras:
1. Add to `setkit-cameras-data-clean.json` cameras array
2. Update `adapter_rules` if introducing new mount type
3. Add entries to `setkit-compatibility-matrix.csv`

### Adding New Lenses:
1. Add to appropriate lens CSV file
2. Ensure `mount` field is accurate (PL, LPL, E, etc.)
3. No compatibility matrix needed (auto-detected via mount)

### Adding New Accessories:
1. Add to `setkit-accessories-*-clean.json`
2. Add compatibility entries to CSV for non-universal items
3. Update category-based rules if new category type

## API Reference

### Compatibility Status Types

**Lens Compatibility:**
- `native`: Direct mount match, no adapter
- `adapter`: Works with adapter
- `incompatible`: Cannot be used

**Accessory Compatibility:**
- `compatible`: Explicitly compatible (in matrix)
- `universal`: Works with everything
- `incompatible`: Explicitly incompatible
- `unknown`: Not in database (may or may not work)

### Return Objects

**checkLensCompatibility():**
```javascript
{
  compatible: true/false,
  status: 'native' | 'adapter' | 'incompatible',
  message: "User-facing message",
  adapter: "PL→LPL" or null
}
```

**checkAccessoryCompatibility():**
```javascript
{
  compatible: true/false/null,
  status: 'compatible' | 'universal' | 'incompatible' | 'unknown',
  message: "User-facing message",
  reason: "Technical reason"
}
```

---

## Version History
- v1.0 (Current): Initial compatibility system with lens/accessory validation
- Future: Smart filtering, adapter management, multi-camera support
