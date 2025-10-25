# Quick Start: Testing the Compatibility System

## How to Test Right Now

### Test 1: Compatible Setup (No Warnings)
1. Open `index.html` in browser
2. Click **Cameras** tab
3. Search and click "Add to Package" on **ARRI ALEXA Mini**
4. Click **Lenses** tab
5. Search for "Master Prime" and add a PL lens
6. Click **Build Package** tab
7. ✅ **Expected**: No warnings (both are PL mount)

### Test 2: Adapter Required (Warning)
1. Clear your package (or start fresh)
2. Click **Cameras** tab
3. Add **ARRI ALEXA 35** to package
4. Click **Lenses** tab
5. Add any **PL mount** lens (e.g., Zeiss Master Prime)
6. Click **Build Package** tab
7. ⚠️ **Expected**: Warning "Requires PL→LPL adapter"
   - This is because ALEXA 35 uses LPL mount, lens is PL

### Test 3: Incompatible Accessory (Error)
1. Start with **Sony VENICE** in package
2. Click **Accessories** tab
3. Filter by "Follow Focus"
4. Add **ARRI Hi-5 + Cforce Mini**
5. Click **Build Package** tab
6. ❌ **Expected**: Error "ARRI L-BUS ecosystem only"
   - ARRI Hi-5 only works with ARRI cameras

### Test 4: Universal Accessory (Compatible)
1. Have any camera in package
2. Click **Accessories** tab
3. Filter by "Wireless Video"
4. Add **Teradek Bolt 6 LT 750**
5. Click **Build Package** tab
6. ✅ **Expected**: No errors (universal SDI accessory)

## What You'll See

### Package Display Features:
- **Color-coded badges**: CAMERA (blue), LENS (green), ACCESSORY (orange)
- **Colored borders**: Items have matching colored left border
- **Validation box**: Orange box at top showing warnings/errors

### Validation Messages:
- **⚠ Compatibility Warnings** (Orange)
  - Item works but needs adapter or special note
  - Example: "Requires PL→LPL adapter"

- **⚠ Compatibility Errors** (Red)
  - Item completely incompatible
  - Example: "ARRI L-BUS ecosystem only"

## Common Mount Combinations

### ✅ Native (No Adapter Needed)
- PL camera + PL lens
- LPL camera + LPL lens
- E camera + E lens
- PV camera + PV lens

### ⚠️ Adapter Required
- LPL camera + PL lens (Use PL→LPL adapter)
- Example cameras: ALEXA 35, Mini LF, LF

### ❌ Incompatible
- PL camera + LPL lens (No adapter available)
- Any camera + Panavision lens (PV ecosystem locked)
- Small camera + ALEXA 65 lens (Coverage issues)

## Camera Mounts in Database

| Camera | Mount | Notes |
|--------|-------|-------|
| ARRI ALEXA 35 | LPL | Accepts PL with adapter |
| ARRI ALEXA Mini LF | LPL | Accepts PL with adapter |
| ARRI ALEXA LF | LPL | Accepts PL with adapter |
| ARRI ALEXA Mini | PL | Native PL only |
| ARRI ALEXA SXT | PL | Native PL only |
| ARRI ALEXA 65 | XPL | Dedicated 65mm lenses |
| ARRI AMIRA | PL | Native PL only |
| Panavision DXL2 | PV | Panavision ecosystem only |
| Sony VENICE | PL | Can swap to E-mount |
| Sony VENICE 2 | PL | Can swap to E-mount |

## Accessory Compatibility Types

### Universal (Works with Everything)
- Wireless video (Teradek, etc.)
- Monitors (as long as SDI compatible)
- Cables, rigging, clamps
- Tripods, sliders, gimbals

### Camera-Specific
- **ARRI Hi-5**: Only ARRI cameras (L-BUS protocol)
- **Preston FIZ**: Universal (any camera with motors)
- **B-mount batteries**: Only ALEXA 35
- **V-mount batteries**: Most cameras with V-mount plates
- **Gold-mount batteries**: Cameras with Gold-mount plates

### Power Mount Types
- **V-mount**: Most common (Mini, Mini LF, LF, etc.)
- **Gold-mount**: Older standard (still common)
- **B-mount**: New ARRI standard (ALEXA 35)

## Quick Troubleshooting

### "No warnings showing"
- Make sure you have a **camera** in package first
- System needs camera to validate against

### "Getting incompatible errors"
- Check camera mount vs lens mount
- LPL cameras can accept PL lenses (with adapter)
- PL cameras CANNOT accept LPL lenses

### "Accessory shows as compatible but shouldn't be"
- Not all accessories are in compatibility matrix yet
- Universal accessories (cables, rigging) always show compatible
- Check documentation for edge cases

## Files to Reference

- **COMPATIBILITY-SYSTEM.md**: Full technical documentation
- **PHASE-4-COMPLETE.md**: Summary of what was built
- **setkit-cameras-data-clean.json**: Camera specs and adapter rules
- **setkit-compatibility-matrix.csv**: Explicit camera-accessory rules

## Next Features (Not Yet Implemented)

These would be future enhancements:
- ❌ "Show only compatible" filter toggle
- ❌ Compatibility badges in search results
- ❌ Click item to see why incompatible
- ❌ Auto-add required adapters
- ❌ Multi-camera package validation

Current system validates packages in **Build Package** tab only.
