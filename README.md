# SetKit - Cinema Equipment Database (V1 - Vanilla)

> **Note**: This is the V1 vanilla JavaScript version. A new Next.js 15 version (V2) is currently in development. See [MIGRATION-GUIDE.md](MIGRATION-GUIDE.md) for details.

## Overview

SetKit is a comprehensive cinema equipment database and package builder designed for Directors of Photography (DPs), Assistant Cameras (ACs), and camera professionals. It helps build compatible equipment packages by providing smart compatibility matching between cameras, lenses, and accessories.

**Live Demo**: http://localhost:8000 (when running locally)

## Features

- **🎥 Camera Database**: Browse 50+ professional cinema cameras with detailed specs
- **🔍 Lens Search**: Search and filter through 1500+ cinema lenses
- **⚙️ Accessories**: Comprehensive accessory database (filters, monitors, wireless video, power, etc.)
- **✨ Smart Compatibility**: Automatic validation of lens/accessory compatibility with selected cameras
- **📦 Package Builder**: Build complete equipment lists with project details and contacts
- **💾 Templates**: Save equipment lists as reusable templates
- **🔄 Compare**: Side-by-side lens comparison
- **💡 Recommendations**: Get lens suggestions based on project type and aesthetic

## Tech Stack

### Core Technologies
- **HTML5** - Standard markup
- **Vanilla JavaScript (ES6+)** - No frameworks, zero dependencies
- **CSS3** - Custom styling with flexbox and grid
- **localStorage** - Client-side data persistence

### Architecture
- **Single Page Application (SPA)** - Tab-based navigation
- **Client-side rendering** - All UI updates in JavaScript
- **JSON data files** - Static equipment database
- **No build process** - Direct browser execution

## Project Structure

```
Camera List/
├── index.html                          # Main HTML file with all page structure
├── app.js                              # Main application logic (compatibility engine, UI)
├── camera-accessory-functions.js      # Helper functions for accessories
├── styles.css                          # All styling
│
├── Data Files/
│   ├── setkit-cameras-data-clean.json            # Camera database
│   ├── setkit-lenses-data-clean.json             # Lens database
│   ├── setkit-accessories-video-monitoring-clean.json  # Video/monitoring accessories
│   ├── setkit-accessories-support-power-media-clean.json  # Support/power/media
│   ├── setkit-compatibility-matrix.csv           # Camera-accessory compatibility rules
│   └── camera-images.json                        # Camera image mappings
│
├── CSV Data Sources/
│   └── Full Motion Picture Lens Database - *.csv # Original lens data
│
├── Documentation/
│   ├── README.md                       # This file
│   ├── SETKIT-WORKFLOW.md             # User workflows and use cases
│   ├── COMPATIBILITY-SYSTEM.md         # Technical compatibility engine docs
│   ├── PHASE-4-COMPLETE.md            # Development phase summary
│   ├── QUICK-START-COMPATIBILITY.md   # Quick start guide
│   ├── MIGRATION-GUIDE.md             # Migration to V2 guide
│   └── DATA-BACKUP-STRATEGY.md        # Data migration strategy
│
├── Legacy/Archive Files/
│   ├── index-old-dark-theme.html
│   ├── app-backup.js
│   └── Various mockup/test files
│
└── .github/                            # GitHub workflows and config
```

## Getting Started

### Prerequisites
- Any modern web browser (Chrome, Firefox, Safari, Edge)
- Python 3 (for local server) OR any static file server

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/midjordan23/SetKit.git
   cd SetKit
   ```

2. **Start a local server**

   Option A: Python (recommended)
   ```bash
   python -m http.server 8000
   ```

   Option B: Node.js (if you have it)
   ```bash
   npx serve
   ```

   Option C: Any other static server

3. **Open in browser**
   ```
   http://localhost:8000
   ```

That's it! No build process, no dependencies to install.

## How It Works

### Core Features

#### 1. Camera & Lens Browsing
- Filter by brand, mount, sensor size, aperture
- View detailed specifications
- Add to package with one click

#### 2. Smart Compatibility Engine
The app automatically validates equipment combinations:

**Lens Compatibility**
- Native mount matching (PL → PL camera)
- Adapter detection (PL lens → LPL camera via adapter)
- Incompatibility warnings (LPL lens → PL camera)

**Accessory Compatibility**
- Ecosystem validation (ARRI Hi-5 only works with ARRI cameras)
- Power mount matching (V-mount, Gold-mount, B-mount)
- I/O compatibility (SDI monitors with SDI cameras)

See [COMPATIBILITY-SYSTEM.md](COMPATIBILITY-SYSTEM.md) for technical details.

#### 3. Package Builder
- Add project name, dates, contacts
- Build equipment list with cameras, lenses, accessories
- Real-time compatibility validation
- Add custom items
- Export as formatted list

#### 4. Templates System
- Save packages as templates
- Categorize (Single Cam, Multi-Cam, Lighting, etc.)
- Load templates to quickly start new projects
- Includes Sam's 16mm template as reference

### Data Storage

All data is stored in browser localStorage:
- **Package data**: Current equipment list
- **Templates**: Saved templates
- **Project info**: Project name, dates, contacts

**Storage limits**: ~5-10MB depending on browser

### Compatibility Engine

Key functions in `app.js`:

```javascript
checkLensCompatibility(lens, camera)
// Returns: {compatible, status, message, adapter}
// Validates lens mount against camera mount

checkAccessoryCompatibility(accessory, camera)
// Returns: {compatible, status, message, reason}
// Validates accessory against camera using matrix + rules

validatePackage(packageItems)
// Returns: {warnings: [], errors: []}
// Validates entire package, returns all issues
```

## Data Files

### Camera Data
**File**: `setkit-cameras-data-clean.json`

Contains:
- Camera specifications (sensor, mount, power, I/O)
- `adapter_rules`: Mount compatibility matrix
- `media_rules`: Compatible recording media
- `power_rules`: Power requirements
- `io_rules`: Video output specs

### Lens Data
**File**: `setkit-lenses-data-clean.json`

Contains minimal data, full lens database loaded from CSVs.

### Accessories Data
**Files**:
- `setkit-accessories-video-monitoring-clean.json`
- `setkit-accessories-support-power-media-clean.json`

### Compatibility Matrix
**File**: `setkit-compatibility-matrix.csv`

Explicit camera-accessory compatibility rules:
```csv
camera_id,accessory_id,compatible,reason
C-ARRI-A35,A-FF-ARRI-HI5,True,Standard accessory
C-SONY-VENICE,A-FF-ARRI-HI5,False,ARRI L-BUS ecosystem only
```

## Development

### Making Changes

1. **Edit files directly** - No build process needed
2. **Refresh browser** - Changes appear immediately
3. **Check browser console** - For JavaScript errors

### Adding Equipment

**To add a camera:**
1. Edit `setkit-cameras-data-clean.json`
2. Add camera object with all required fields
3. Update `adapter_rules` if new mount type
4. Add compatibility matrix entries

**To add a lens:**
1. Add to appropriate CSV file (or `setkit-lenses-data-clean.json`)
2. Ensure `mount` field is accurate
3. No compatibility matrix needed (auto-detected)

**To add an accessory:**
1. Add to appropriate accessories JSON file
2. Add compatibility entries to CSV (if not universal)

### Code Organization

**app.js** (~2500 lines) contains:
- Data loading functions
- Compatibility engine
- UI update functions
- Package management
- Template system
- Search and filter logic
- Export functionality

**camera-accessory-functions.js** contains:
- Helper functions for accessory filtering
- Category-based logic

**styles.css** contains:
- All styling (no preprocessor)
- Responsive design (mobile-first)
- Modal and overlay styles
- Component-specific styles

## Browser Compatibility

Tested and working on:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

Requires ES6+ support (arrow functions, template literals, etc.)

## Known Limitations

1. **localStorage limits** - Can store ~5-10MB of data
2. **No user accounts** - Data stored locally only
3. **No backend** - Can't sync across devices
4. **Single camera validation** - Multi-camera packages need manual checking
5. **No offline mode** - Requires initial page load
6. **No search indexing** - SEO is limited

## Future Plans

See [MIGRATION-GUIDE.md](MIGRATION-GUIDE.md) for V2 roadmap.

V2 (Next.js) will include:
- User accounts and cloud sync
- Real database (PostgreSQL via Supabase)
- Server-side rendering for SEO
- TypeScript for type safety
- Component architecture
- Testing framework
- Mobile app (React Native)

## Contributing

This V1 version is in **maintenance mode**. Critical bugs will be fixed, but new features will be added to V2.

To report bugs:
1. Open an issue on GitHub
2. Include browser version and steps to reproduce

## License

[Add your license here]

## Credits

Created for DPs and ACs who need reliable equipment compatibility information.

**Lens data source**: Compiled from manufacturer specifications and industry databases.

---

**Version**: 1.0.0 (Vanilla)
**Last Updated**: October 2025
**Status**: Stable, maintenance mode
