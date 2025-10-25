# SetKit - Complete User Workflow

## Overview
SetKit is a comprehensive cinema equipment database that helps DPs, ACs, and camera professionals build compatible equipment packages by providing smart compatibility matching between cameras, lenses, and accessories.

---

## User Workflows

### **Workflow 1: Camera-First (Most Common)**
*Best for: When you know what camera you're shooting with*

1. **Browse Cameras Tab**
   - Search or filter cameras by brand, sensor size, resolution
   - View camera specs: mount, sensor modes, power requirements, media

2. **Select Camera**
   - Click camera card to see full details
   - System automatically filters database to show compatible equipment

3. **View Compatible Lenses**
   - Click "Show Compatible Lenses"
   - See ONLY lenses that work with camera's mount (PL, LPL, E, etc.)
   - Filter by focal length, aperture, lens type
   - Yellow warning for adapter-required lenses

4. **View Compatible Accessories**
   - **Wireless Video**: Systems compatible with camera's SDI output
   - **Monitors**: Based on video I/O (3G-SDI, 12G-SDI, HDMI)
   - **Follow Focus**: Motor systems (ARRI L-Bus for ARRI cameras, Preston for universal)
   - **Power**: Batteries matching camera's voltage/mount (V-mount, Gold mount, B-mount)
   - **Media**: Compatible recording media (Codex, CFast, RED Mini-Mag, AXS)
   - **Support**: Baseplates, rods, tripods rated for camera weight

5. **Build Package**
   - Add camera, lenses, and accessories to package
   - System validates all compatibility
   - See total weight, power draw, cost estimate

6. **Export**
   - Download as PDF equipment list
   - Export to CSV for rental house
   - Save package for future use

---

### **Workflow 2: Lens-First**
*Best for: When you have specific lenses in mind*

1. **Search Lenses Tab**
   - Find desired lenses (e.g., "Cooke S4")
   - View specs, mount type, coverage

2. **Click "Show Compatible Cameras"**
   - See all cameras that accept this lens mount
   - Filter by resolution, budget, sensor size

3. **Select Camera**
   - System shows which accessories work with both camera AND lenses
   - Suggests matte boxes for lens diameter
   - Recommends follow focus based on lens gear specs

4. **Build Complete Package**
   - All items guaranteed compatible

---

### **Workflow 3: Project-Based (Recommendations)**
*Best for: Starting from scratch*

1. **Recommendations Tab**
   - Select project type (narrative, commercial, documentary)
   - Choose camera format (16mm, S35, Full Frame, 65mm)
   - Pick aesthetic (clean/modern, vintage, anamorphic)
   - Specify needs (focal range, budget)

2. **Get Camera Recommendations**
   - System suggests 5-10 cameras matching criteria
   - Shows key specs and why it's recommended

3. **Select Recommended Camera**
   - Automatically shows compatible lenses from recommendations

4. **Get Lens Recommendations**
   - Filtered to ONLY show lenses compatible with chosen camera
   - Sorted by relevance to project type

5. **Auto-Suggest Accessories**
   - System recommends complete accessory package:
     - Wireless video for camera's outputs
     - Batteries for camera's power needs
     - Media for camera's recording format
     - Support gear rated for total package weight

6. **Review & Export Package**

---

### **Workflow 4: Package Builder (Pro Users)**
*Best for: Experienced users who know exactly what they want*

1. **Go to Package Builder Tab**

2. **Add Camera**
   - Search and add camera to package
   - Package summary shows power requirements, media needs

3. **Smart Lens Suggestions**
   - System shows filtered lens list (only compatible mounts)
   - Can still search all lenses but incompatible ones show warning

4. **Add Accessories by Category**
   - **Monitoring**: Wireless TX + monitors
   - **Power**: Batteries + chargers + distribution
   - **Control**: Follow focus systems + motors
   - **Support**: Tripod/head rated for total weight
   - **Media**: Sufficient cards for shoot day

5. **Compatibility Validation**
   - Green checkmark: Fully compatible
   - Yellow warning: Needs adapter (shows which adapter)
   - Red X: Incompatible (shows reason)

6. **Package Summary Shows:**
   - Total equipment count
   - Total weight
   - Power consumption estimate
   - Daily rental cost estimate
   - Compatibility status

7. **Export Options:**
   - PDF with specs and notes
   - CSV for rental house ordering
   - JSON for importing later

---

## Smart Compatibility Rules

### **Lens-Camera Matching**
- **Mount Compatibility**:
  - PL lenses → PL cameras (native)
  - PL lenses → LPL cameras (via PL-to-LPL adapter)
  - LPL lenses → LPL cameras only (no adapter available)
  - E-mount lenses → Sony E cameras (native)

- **Coverage Check**:
  - S35 lenses → S35 cameras ✓
  - S35 lenses → Full Frame cameras (vignetting warning)
  - Full Frame lenses → S35 cameras ✓ (crop factor noted)

### **Accessory-Camera Matching**
- **Wireless Video**: Matches camera's video outputs (SDI, HDMI)
- **Monitors**: Compatible with wireless TX or direct connection
- **Follow Focus**:
  - ARRI Hi-5 → ARRI cameras only (L-Bus)
  - Preston/cMotion → Universal (fits any camera)
- **Power**:
  - Checks voltage match (12V, 14V, 24V)
  - Checks mount type (V-mount, Gold mount, B-mount)
- **Media**:
  - Codex Compact → ARRI Alexa 35/Mini LF
  - CFast → ARRI Alexa Mini/Amira
  - RED Mini-Mag → RED DSMC2 cameras
  - AXS cards → Sony VENICE

### **Support-Weight Matching**
- Calculates total package weight (camera + lens + accessories)
- Recommends tripod/head with sufficient payload capacity
- Warns if exceeding recommended weight limits

---

## Key Features

### **Search & Filter**
- Full-text search across all equipment
- Filter by multiple criteria simultaneously
- Saved filter presets

### **Compare**
- Side-by-side comparison up to 3 items
- Highlights differences
- Export comparison chart

### **Package Validation**
- Real-time compatibility checking
- Warns about missing essentials (batteries, media, etc.)
- Suggests complete packages

### **Smart Suggestions**
- "People who used this camera also chose..."
- "Complete this package with..."
- "Alternative options at lower cost..."

---

## Example Use Cases

### **Use Case 1: Music Video Shoot**
1. Recommendations → Music Video + S35 + Clean/Modern + Standard focal
2. System suggests: ARRI Alexa Mini, Sony VENICE, RED Komodo
3. Select ARRI Alexa Mini
4. System shows Zeiss CP.3, Sigma Cine lenses (PL mount)
5. Auto-adds: CFast cards, V-mount batteries, Teradek wireless, SmallHD monitor
6. Export package list

### **Use Case 2: Documentary on Sony FX9**
1. Cameras → Search "FX9"
2. Click FX9 → Show compatible lenses
3. See E-mount and PL lenses (with adapter)
4. Add Sony G Master and Zeiss Compact Primes
5. System suggests: SxS cards, V-mount batteries, lightweight tripod
6. Build package

### **Use Case 3: Feature Film Package**
1. Package Builder → Add ARRI Alexa 35
2. System filters to LPL/PL lenses
3. Add ARRI Signature Primes (LPL)
4. System auto-suggests:
   - Codex Compact Drives (required media)
   - B-mount batteries (required power)
   - ARRI Hi-5 (native control)
   - Heavy-duty O'Connor tripod head
5. Review compatibility (all green)
6. Export professional equipment list

---

## Technical Implementation

### **Database Structure**
- **Lenses**: ~1500+ cinema lenses with full specs
- **Cameras**: 50+ modern cinema cameras
- **Accessories**: 100+ items across categories
- **Compatibility Rules**: Mount adapters, power, media, I/O matching

### **Compatibility Engine**
- Checks mount compatibility using adapter rules
- Validates power requirements
- Ensures media compatibility
- Calculates weight and balance
- Warns about missing essentials

### **Future Enhancements**
- User accounts and saved packages
- Rental house integration (check availability)
- Pricing data from rental houses
- Shooting day calculator (media/battery needs)
- Weather sealing compatibility
- Lens performance database (sharpness charts, etc.)

---

*SetKit - Built for DPs and ACs, by people who understand the workflow*
