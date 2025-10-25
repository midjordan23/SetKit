// Global data storage
let allLenses = [];
let allCameras = [];
let allAccessories = [];
let compatibilityMatrix = [];
let currentPackage = [];
let manufacturers = new Set();
let cameraBrands = new Set();

// CSV file mapping
const csvFiles = [
    { file: 'Full Motion Picture Lens Database - 16mm primes.csv', category: '16mm primes', type: 'prime' },
    { file: 'Full Motion Picture Lens Database - 16mm zooms.csv', category: '16mm zooms', type: 'zoom' },
    { file: 'Full Motion Picture Lens Database - Arri _ Zeiss 35mm primes.csv', category: '35mm primes', type: 'prime' },
    { file: 'Full Motion Picture Lens Database - Cooke 35mm primes.csv', category: '35mm primes', type: 'prime' },
    { file: 'Full Motion Picture Lens Database - Panavision 35mm primes.csv', category: '35mm primes', type: 'prime' },
    { file: 'Full Motion Picture Lens Database - Modern 35mm primes.csv', category: '35mm primes', type: 'prime' },
    { file: 'Full Motion Picture Lens Database - Vintage 35mm primes.csv', category: '35mm primes', type: 'prime' },
    { file: 'Full Motion Picture Lens Database - 35mm zooms.csv', category: '35mm zooms', type: 'zoom' },
    { file: 'Full Motion Picture Lens Database - Panavision anamorphic.csv', category: 'anamorphic', type: 'prime' },
    { file: 'Full Motion Picture Lens Database - Hawk anamorphic.csv', category: 'anamorphic', type: 'prime' },
    { file: 'Full Motion Picture Lens Database - Other anamorphic.csv', category: 'anamorphic', type: 'prime' },
    { file: 'Full Motion Picture Lens Database - FF Anamorphic.csv', category: 'anamorphic', type: 'prime' },
    { file: 'Full Motion Picture Lens Database - Zeiss FF primes.csv', category: 'full frame primes', type: 'prime' },
    { file: 'Full Motion Picture Lens Database - Panavision FF Lenses.csv', category: 'full frame primes', type: 'prime' },
    { file: 'Full Motion Picture Lens Database - Other FF Primes.csv', category: 'full frame primes', type: 'prime' },
    { file: 'Full Motion Picture Lens Database - Converted 35mm stills.csv', category: 'full frame primes', type: 'prime' },
    { file: 'Full Motion Picture Lens Database - FF Zooms.csv', category: 'full frame zooms', type: 'zoom' },
    { file: 'Full Motion Picture Lens Database - 65mm lenses.csv', category: '65mm', type: 'prime' },
    { file: 'Full Motion Picture Lens Database - Secondary lenses.csv', category: 'special', type: 'special' },
    { file: 'Full Motion Picture Lens Database - PC _ Tilt lenses.csv', category: 'special', type: 'special' },
    { file: 'Full Motion Picture Lens Database - Relay lenses.csv', category: 'special', type: 'special' },
    { file: 'Full Motion Picture Lens Database - Effects lenses.csv', category: 'special', type: 'special' }
];

// Parse CSV data
function parseCSV(text) {
    const lines = text.split('\n');
    const headers = lines[0].split(',');
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;

        const values = [];
        let current = '';
        let inQuotes = false;

        for (let char of lines[i]) {
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        values.push(current.trim());

        if (values.length === headers.length) {
            const row = {};
            headers.forEach((header, index) => {
                row[header.trim()] = values[index];
            });
            data.push(row);
        }
    }

    return data;
}

// Load all CSV files
async function loadAllData() {
    try {
        const promises = csvFiles.map(async ({ file, category, type }) => {
            try {
                const response = await fetch(file);
                const text = await response.text();
                const data = parseCSV(text);

                return data.map(lens => ({
                    ...lens,
                    category,
                    type: lens['focal length'] && lens['focal length'].includes('-') ? 'zoom' : type,
                    id: `${lens.manufacturer}-${lens.name}-${lens['focal length']}`
                })).filter(lens => lens.manufacturer && lens.name);
            } catch (error) {
                console.error(`Error loading ${file}:`, error);
                return [];
            }
        });

        const results = await Promise.all(promises);
        allLenses = results.flat();

        // Extract unique manufacturers
        allLenses.forEach(lens => {
            if (lens.manufacturer) manufacturers.add(lens.manufacturer);
        });

        populateManufacturers();
        populateCompareSelects();
        searchLenses();

        document.getElementById('resultCount').textContent = `(${allLenses.length} total lenses)`;

        // Load cameras and accessories after lenses
        await loadCamerasAndAccessories();
    } catch (error) {
        console.error('Error loading data:', error);
        document.getElementById('resultCount').textContent = '(Error loading data)';
    }
}

// Load cameras and accessories
async function loadCamerasAndAccessories() {
    try {
        // Load camera data
        const cameraResponse = await fetch('setkit-cameras-data-clean.json');
        const cameraData = await cameraResponse.json();
        allCameras = cameraData.cameras || [];

        // Store camera data globally for compatibility engine
        window.currentCameraData = cameraData;

        // Extract camera brands
        allCameras.forEach(camera => {
            if (camera.brand) cameraBrands.add(camera.brand);
        });

        console.log(`Loaded ${allCameras.length} cameras`);

        // Load video/monitoring accessories
        const accessory1Response = await fetch('setkit-accessories-video-monitoring-clean.json');
        const accessory1Data = await accessory1Response.json();

        // Load support/power/media accessories
        const accessory2Response = await fetch('setkit-accessories-support-power-media-clean.json');
        const accessory2Data = await accessory2Response.json();

        // Combine all accessories
        allAccessories = [...accessory1Data, ...accessory2Data];

        console.log(`Loaded ${allAccessories.length} accessories`);

        // Load compatibility matrix
        const compatResponse = await fetch('setkit-compatibility-matrix.csv');
        const compatText = await compatResponse.text();
        compatibilityMatrix = parseCompatibilityCSV(compatText);

        console.log(`Loaded ${compatibilityMatrix.length} compatibility rules`);

        // Initialize displays after data is loaded
        initializeCamerasAndAccessories();

    } catch (error) {
        console.error('Error loading cameras/accessories:', error);
    }
}

// Parse compatibility CSV
function parseCompatibilityCSV(text) {
    const lines = text.split('\n');
    const data = [];

    // Skip header row (line 0) and info row (line 1)
    for (let i = 2; i < lines.length; i++) {
        if (!lines[i].trim()) continue;

        const parts = lines[i].split(',');
        if (parts.length >= 4) {
            data.push({
                camera_id: parts[0].trim(),
                accessory_id: parts[1].trim(),
                compatible: parts[2].trim().toLowerCase() === 'true',
                reason: parts[3].trim()
            });
        }
    }

    return data;
}

// ========================================
// COMPATIBILITY ENGINE
// ========================================

// Check if a lens is compatible with a camera
function checkLensCompatibility(lens, camera) {
    if (!lens || !camera) return null;

    const lensMount = lens.mount;
    const cameraMount = camera.native_mount;
    const acceptedMounts = camera.accepted_lens_mounts || [];

    // Native mount match
    if (lensMount === cameraMount) {
        return {
            compatible: true,
            status: 'native',
            message: `✓ Native ${lensMount} mount - direct compatibility`,
            adapter: null
        };
    }

    // Check accepted mounts (with adapter)
    if (acceptedMounts.includes(lensMount)) {
        return {
            compatible: true,
            status: 'adapter',
            message: `⚠ Requires ${lensMount}→${cameraMount} adapter`,
            adapter: `${lensMount}→${cameraMount}`
        };
    }

    // Check camera data for adapter rules
    const cameraData = window.currentCameraData || {};
    const adapterRules = cameraData.adapter_rules || [];

    const rule = adapterRules.find(r =>
        r.camera_mount === cameraMount && r.lens_mount === lensMount
    );

    if (rule) {
        if (rule.allowed) {
            return {
                compatible: true,
                status: 'adapter',
                message: `⚠ ${rule.notes || 'Adapter required'}`,
                adapter: `${lensMount}→${cameraMount}`
            };
        } else {
            return {
                compatible: false,
                status: 'incompatible',
                message: `✗ Incompatible: ${rule.notes || 'No adapter available'}`,
                adapter: null
            };
        }
    }

    // Default: incompatible
    return {
        compatible: false,
        status: 'incompatible',
        message: `✗ ${lensMount} lens incompatible with ${cameraMount} camera`,
        adapter: null
    };
}

// Check if an accessory is compatible with a camera
function checkAccessoryCompatibility(accessory, camera) {
    if (!accessory || !camera) return null;

    // Check compatibility matrix first
    const match = compatibilityMatrix.find(m =>
        m.camera_id === camera.id && m.accessory_id === accessory.id
    );

    if (match) {
        return {
            compatible: match.compatible,
            status: match.compatible ? 'compatible' : 'incompatible',
            message: match.compatible
                ? `✓ ${match.reason}`
                : `✗ ${match.reason}`,
            reason: match.reason
        };
    }

    // Fallback: check category-based compatibility
    const category = accessory.category;

    // Universal accessories (always compatible)
    if (category === 'cable' || category === 'rigging') {
        return {
            compatible: true,
            status: 'universal',
            message: '✓ Universal accessory',
            reason: 'Universal compatibility'
        };
    }

    // Monitors - check SDI compatibility
    if (category === 'monitor') {
        const cameraOutputs = camera.video_io || [];
        const monitorInputs = accessory.specs?.inputs || '';

        // Simple check: if camera has SDI and monitor accepts SDI
        const cameraHasSDI = cameraOutputs.some(o => o.includes('SDI'));
        const monitorHasSDI = monitorInputs.includes('SDI');

        if (cameraHasSDI && monitorHasSDI) {
            return {
                compatible: true,
                status: 'compatible',
                message: '✓ SDI compatible',
                reason: 'SDI video output supported'
            };
        }
    }

    // Power - check mount compatibility
    if (category === 'Power') {
        const cameraPower = camera.power?.mount || '';
        const accessoryMount = accessory.specs?.mount || '';

        if (cameraPower && accessoryMount && cameraPower.includes(accessoryMount)) {
            return {
                compatible: true,
                status: 'compatible',
                message: '✓ Power mount compatible',
                reason: `${accessoryMount} power compatible`
            };
        }
    }

    // Default: unknown compatibility
    return {
        compatible: null,
        status: 'unknown',
        message: '? Compatibility unknown',
        reason: 'Not in compatibility database'
    };
}

// Get all compatible lenses for a camera
function getCompatibleLenses(camera) {
    if (!camera) return [];

    return allLenses.map(lens => {
        const compat = checkLensCompatibility(lens, camera);
        return {
            ...lens,
            compatibility: compat
        };
    }).filter(lens => lens.compatibility && lens.compatibility.compatible);
}

// Get all compatible accessories for a camera
function getCompatibleAccessories(camera) {
    if (!camera) return [];

    return allAccessories.map(acc => {
        const compat = checkAccessoryCompatibility(acc, camera);
        return {
            ...acc,
            compatibility: compat
        };
    }).filter(acc => acc.compatibility && acc.compatibility.compatible);
}

// Validate entire package for compatibility issues
function validatePackage(packageItems) {
    const cameras = packageItems.filter(item => item.itemType === 'camera');
    const lenses = packageItems.filter(item => item.itemType === 'lens');
    const accessories = packageItems.filter(item => item.itemType === 'accessory');

    const warnings = [];
    const errors = [];

    // If no camera, can't validate
    if (cameras.length === 0) {
        return { warnings: ['Add a camera to validate compatibility'], errors: [] };
    }

    // If multiple cameras, just use first for validation
    const camera = cameras[0];

    // Check lens compatibility
    lenses.forEach(lens => {
        const compat = checkLensCompatibility(lens, camera);
        if (compat) {
            if (!compat.compatible) {
                errors.push(`${lens.manufacturer || lens.brand} ${lens.name || lens.model}: ${compat.message}`);
            } else if (compat.status === 'adapter') {
                warnings.push(`${lens.manufacturer || lens.brand} ${lens.name || lens.model}: ${compat.message}`);
            }
        }
    });

    // Check accessory compatibility
    accessories.forEach(acc => {
        const compat = checkAccessoryCompatibility(acc, camera);
        if (compat) {
            if (compat.compatible === false) {
                errors.push(`${acc.brand} ${acc.model}: ${compat.message}`);
            } else if (compat.status === 'unknown') {
                warnings.push(`${acc.brand} ${acc.model}: ${compat.message}`);
            }
        }
    });

    return { warnings, errors };
}

// Populate manufacturer dropdown
function populateManufacturers() {
    const select = document.getElementById('manufacturer');
    const sorted = Array.from(manufacturers).sort();

    sorted.forEach(manufacturer => {
        const option = document.createElement('option');
        option.value = manufacturer;
        option.textContent = manufacturer;
        select.appendChild(option);
    });
}

// Populate compare dropdowns
function populateCompareSelects() {
    const selects = ['compareLens1', 'compareLens2', 'compareLens3'];

    selects.forEach(selectId => {
        const select = document.getElementById(selectId);
        allLenses.forEach((lens, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `${lens.manufacturer} ${lens.name} ${lens['focal length']}`;
            select.appendChild(option);
        });
    });
}

// Search and filter lenses
function searchLenses() {
    const searchText = document.getElementById('searchText').value.toLowerCase();
    const category = document.getElementById('category').value;
    const manufacturer = document.getElementById('manufacturer').value;
    const mount = document.getElementById('mount').value;
    const lensType = document.getElementById('lensType').value;
    const maxAperture = parseFloat(document.getElementById('maxAperture').value);

    let filtered = allLenses.filter(lens => {
        // Text search
        if (searchText && !`${lens.manufacturer} ${lens.name} ${lens['focal length']}`.toLowerCase().includes(searchText)) {
            return false;
        }

        // Category filter
        if (category && lens.category !== category) {
            return false;
        }

        // Manufacturer filter
        if (manufacturer && lens.manufacturer !== manufacturer) {
            return false;
        }

        // Mount filter
        if (mount && lens['original mount'] && !lens['original mount'].includes(mount)) {
            return false;
        }

        // Type filter
        if (lensType && lens.type !== lensType) {
            return false;
        }

        // Aperture filter
        if (maxAperture) {
            const lensAperture = parseFloat(lens['max aperture (T)']);
            if (isNaN(lensAperture) || lensAperture > maxAperture) {
                return false;
            }
        }

        return true;
    });

    displayResults(filtered);
}

// Display search results
function displayResults(lenses) {
    const container = document.getElementById('lensResults');
    const count = document.getElementById('resultCount');

    count.textContent = `(${lenses.length} lenses)`;

    if (lenses.length === 0) {
        container.innerHTML = '<p class="empty-state">No lenses found matching your criteria</p>';
        return;
    }

    container.innerHTML = lenses.map(lens => `
        <div class="lens-card">
            <div class="lens-card-header">
                <div class="lens-manufacturer">${lens.manufacturer || 'Unknown'}</div>
                <div class="lens-name">${lens.name || 'Unnamed'}</div>
                <div class="lens-focal">${lens['focal length'] || 'N/A'}</div>
            </div>
            <div class="lens-details">
                ${lens['max aperture (T)'] ? `
                    <div class="lens-detail-row">
                        <span class="lens-detail-label">Max Aperture:</span>
                        <span class="lens-detail-value">T${lens['max aperture (T)']}</span>
                    </div>
                ` : ''}
                ${lens['original mount'] ? `
                    <div class="lens-detail-row">
                        <span class="lens-detail-label">Mount:</span>
                        <span class="lens-detail-value">${lens['original mount']}</span>
                    </div>
                ` : ''}
                ${lens['close focus'] ? `
                    <div class="lens-detail-row">
                        <span class="lens-detail-label">Close Focus:</span>
                        <span class="lens-detail-value">${lens['close focus']}</span>
                    </div>
                ` : ''}
                ${lens['image circle'] ? `
                    <div class="lens-detail-row">
                        <span class="lens-detail-label">Image Circle:</span>
                        <span class="lens-detail-value">${lens['image circle']}</span>
                    </div>
                ` : ''}
                ${lens['weight'] ? `
                    <div class="lens-detail-row">
                        <span class="lens-detail-label">Weight:</span>
                        <span class="lens-detail-value">${lens['weight']}</span>
                    </div>
                ` : ''}
                ${lens['front diameter'] ? `
                    <div class="lens-detail-row">
                        <span class="lens-detail-label">Front Diameter:</span>
                        <span class="lens-detail-value">${lens['front diameter']}</span>
                    </div>
                ` : ''}
            </div>
            ${lens['notes / comments'] || lens.notes ? `
                <div class="lens-detail-row" style="margin-top: 10px;">
                    <span class="lens-detail-label" style="font-style: italic; color: #999;">
                        ${lens['notes / comments'] || lens.notes}
                    </span>
                </div>
            ` : ''}
            <div class="lens-category">${lens.category}</div>
            <div class="lens-card-actions">
                <button class="btn-add-package" onclick='addToPackage(${JSON.stringify(lens).replace(/'/g, "&apos;")}, "lens", event.target)'>
                    Add to Package
                </button>
            </div>
        </div>
    `).join('');
}

// Clear filters
function clearFilters() {
    document.getElementById('searchText').value = '';
    document.getElementById('category').value = '';
    document.getElementById('manufacturer').value = '';
    document.getElementById('mount').value = '';
    document.getElementById('lensType').value = '';
    document.getElementById('maxAperture').value = '';
    searchLenses();
}

// Tab switching is now handled in index.html inline script
// Old tab-btn code commented out - using nav-item now
/*
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tabId = btn.dataset.tab;

        // Update buttons
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Update content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabId).classList.add('active');
    });
});
*/

// Compare lenses
function updateComparison() {
    const lens1Index = document.getElementById('compareLens1').value;
    const lens2Index = document.getElementById('compareLens2').value;
    const lens3Index = document.getElementById('compareLens3').value;

    const lenses = [lens1Index, lens2Index, lens3Index]
        .filter(index => index !== '')
        .map(index => allLenses[parseInt(index)]);

    if (lenses.length === 0) {
        document.getElementById('comparisonTable').innerHTML = '<p class="empty-state">Select lenses to compare</p>';
        return;
    }

    const fields = [
        { key: 'manufacturer', label: 'Manufacturer' },
        { key: 'name', label: 'Name' },
        { key: 'focal length', label: 'Focal Length' },
        { key: 'max aperture (T)', label: 'Max Aperture' },
        { key: 'close focus', label: 'Close Focus' },
        { key: 'image circle', label: 'Image Circle' },
        { key: 'original mount', label: 'Mount' },
        { key: 'front diameter', label: 'Front Diameter' },
        { key: 'weight', label: 'Weight' },
        { key: 'length', label: 'Length' },
        { key: 'category', label: 'Category' }
    ];

    const table = `
        <table class="comparison-table">
            <thead>
                <tr>
                    <th>Specification</th>
                    ${lenses.map((lens, i) => `<th>Lens ${i + 1}</th>`).join('')}
                </tr>
            </thead>
            <tbody>
                ${fields.map(field => `
                    <tr>
                        <td><strong>${field.label}</strong></td>
                        ${lenses.map(lens => `<td>${lens[field.key] || 'N/A'}</td>`).join('')}
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    document.getElementById('comparisonTable').innerHTML = table;
}

// Get recommendations
function getRecommendations() {
    const projectType = document.getElementById('projectType').value;
    const cameraFormat = document.getElementById('cameraFormat').value;
    const aesthetic = document.getElementById('aesthetic').value;
    const focalNeed = document.getElementById('focalNeed').value;

    if (!projectType || !cameraFormat || !aesthetic || !focalNeed) {
        alert('Please fill in all fields to get recommendations');
        return;
    }

    console.log('Getting recommendations for:', { projectType, cameraFormat, aesthetic, focalNeed });
    console.log('Total lenses available:', allLenses.length);

    let recommendations = [];
    let filterSteps = [];

    // Format-based filtering
    let formatFiltered = allLenses.filter(lens => {
        const cat = lens.category ? lens.category.toLowerCase() : '';
        if (cameraFormat === '16mm') return cat.includes('16mm');
        if (cameraFormat === 'S35') return cat.includes('35mm') && !cat.includes('full frame');
        if (cameraFormat === 'FF') return cat.includes('full frame');
        if (cameraFormat === '65mm') return cat.includes('65mm');
        return true;
    });

    filterSteps.push(`After format filter (${cameraFormat}): ${formatFiltered.length} lenses`);
    console.log(filterSteps[filterSteps.length - 1]);

    // Aesthetic filtering
    let aestheticFiltered = formatFiltered;
    if (aesthetic === 'anamorphic') {
        aestheticFiltered = formatFiltered.filter(lens =>
            lens.category && lens.category.toLowerCase().includes('anamorphic')
        );
    } else if (aesthetic === 'vintage') {
        aestheticFiltered = formatFiltered.filter(lens =>
            (lens.category && lens.category.toLowerCase().includes('vintage')) ||
            (lens.name && lens.name.toLowerCase().includes('vintage')) ||
            lens.manufacturer === 'Cooke' ||
            (lens.notes && lens.notes.toLowerCase().includes('vintage'))
        );
    } else if (aesthetic === 'clean-modern') {
        aestheticFiltered = formatFiltered.filter(lens =>
            (lens.category && lens.category.toLowerCase().includes('modern')) ||
            lens.manufacturer === 'Arri' ||
            lens.manufacturer === 'Zeiss' ||
            lens.manufacturer === 'Leica'
        );
    } else if (aesthetic === 'neutral') {
        // For neutral, just use the format filtered lenses
        aestheticFiltered = formatFiltered;
    }

    // If aesthetic filtering removes everything, fall back to format filtering
    if (aestheticFiltered.length === 0) {
        console.log('No lenses after aesthetic filter, using format filtered');
        aestheticFiltered = formatFiltered;
    }

    filterSteps.push(`After aesthetic filter (${aesthetic}): ${aestheticFiltered.length} lenses`);
    console.log(filterSteps[filterSteps.length - 1]);

    // Focal length filtering and selection
    if (focalNeed === 'zoom') {
        recommendations = aestheticFiltered.filter(lens => lens.type === 'zoom');
    } else if (focalNeed === 'wide') {
        recommendations = aestheticFiltered.filter(lens => {
            const focal = lens['focal length'];
            if (!focal) return false;
            const num = parseInt(focal);
            return !isNaN(num) && num < 28;
        });
    } else if (focalNeed === 'standard') {
        recommendations = aestheticFiltered.filter(lens => {
            const focal = lens['focal length'];
            if (!focal) return false;
            const num = parseInt(focal);
            return !isNaN(num) && num >= 28 && num <= 50;
        });
    } else if (focalNeed === 'portrait') {
        recommendations = aestheticFiltered.filter(lens => {
            const focal = lens['focal length'];
            if (!focal) return false;
            const num = parseInt(focal);
            return !isNaN(num) && num > 50 && num <= 100;
        });
    } else if (focalNeed === 'telephoto') {
        recommendations = aestheticFiltered.filter(lens => {
            const focal = lens['focal length'];
            if (!focal) return false;
            const num = parseInt(focal);
            return !isNaN(num) && num > 100;
        });
    } else {
        recommendations = aestheticFiltered;
    }

    filterSteps.push(`After focal length filter (${focalNeed}): ${recommendations.length} lenses`);
    console.log(filterSteps[filterSteps.length - 1]);

    // If no results, fall back progressively
    if (recommendations.length === 0) {
        console.log('No lenses match all criteria, falling back to aesthetic filtered');
        recommendations = aestheticFiltered.slice(0, 15);
    }

    if (recommendations.length === 0) {
        console.log('Still no lenses, falling back to format filtered');
        recommendations = formatFiltered.slice(0, 15);
    }

    // Limit to 15 results
    recommendations = recommendations.slice(0, 15);

    console.log('Final recommendations:', recommendations.length);
    displayRecommendations(recommendations, projectType, aesthetic, focalNeed, filterSteps);
}

// Display recommendations
function displayRecommendations(lenses, projectType, aesthetic, focalNeed, filterSteps) {
    const container = document.getElementById('recommendationResults');

    if (lenses.length === 0) {
        container.innerHTML = `
            <div class="recommendation-section">
                <h3>No Recommendations Found</h3>
                <p>No lenses match your criteria. Try adjusting your selections.</p>
                ${filterSteps ? `
                    <div style="margin-top: 20px; padding: 15px; background: #1a1a1a; border-radius: 6px;">
                        <p style="color: #888; font-size: 0.9em;">Filter steps:</p>
                        ${filterSteps.map(step => `<p style="color: #666; font-size: 0.85em;">• ${step}</p>`).join('')}
                    </div>
                ` : ''}
            </div>
        `;
        return;
    }

    const projectTypeNames = {
        'narrative': 'Narrative Feature',
        'commercial': 'Commercial',
        'documentary': 'Documentary',
        'music-video': 'Music Video',
        'corporate': 'Corporate'
    };

    const aestheticNames = {
        'clean-modern': 'clean & modern',
        'vintage': 'vintage/character',
        'anamorphic': 'anamorphic',
        'neutral': 'neutral/versatile'
    };

    container.innerHTML = `
        <div class="recommendation-section">
            <h3>Recommended Lenses for ${projectTypeNames[projectType] || projectType}</h3>
            <p>Based on your <strong>${aestheticNames[aesthetic] || aesthetic}</strong> aesthetic and <strong>${focalNeed}</strong> focal length needs, here are ${lenses.length} recommended lenses:</p>
            <div class="lens-grid">
                ${lenses.map(lens => `
                    <div class="lens-card">
                        <div class="lens-card-header">
                            <div class="lens-manufacturer">${lens.manufacturer}</div>
                            <div class="lens-name">${lens.name}</div>
                            <div class="lens-focal">${lens['focal length']}</div>
                        </div>
                        <div class="lens-details">
                            ${lens['max aperture (T)'] ? `
                                <div class="lens-detail-row">
                                    <span class="lens-detail-label">Max Aperture:</span>
                                    <span class="lens-detail-value">T${lens['max aperture (T)']}</span>
                                </div>
                            ` : ''}
                            ${lens['original mount'] ? `
                                <div class="lens-detail-row">
                                    <span class="lens-detail-label">Mount:</span>
                                    <span class="lens-detail-value">${lens['original mount']}</span>
                                </div>
                            ` : ''}
                        </div>
                        <div class="lens-category">${lens.category}</div>
                        <div class="lens-card-actions">
                            <button class="btn-add-package" onclick='addToPackage(${JSON.stringify(lens).replace(/'/g, "&apos;")}, "lens", event.target)'>
                                Add to Package
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Package management
function addToPackage(item, itemType = 'lens', buttonElement = null) {
    // Add type to item if not present
    if (!item.itemType) {
        item.itemType = itemType;
    }

    // Check if already in package
    const itemId = item.id || `${item.brand || item.manufacturer}-${item.model || item.name}`;
    const alreadyExists = currentPackage.find(i => {
        const iId = i.id || `${i.brand || i.manufacturer}-${i.model || i.name}`;
        return iId === itemId;
    });

    if (!alreadyExists) {
        currentPackage.push(item);
        updatePackageDisplay();

        // Animate button if provided
        if (buttonElement) {
            showAddedFeedback(buttonElement);
        }

        // Open mini cart to show the added item
        openMiniCart();
    } else {
        // Item already in package - show feedback
        if (buttonElement) {
            showAlreadyAddedFeedback(buttonElement);
        }
    }
}

// Show success animation when item is added
function showAddedFeedback(button) {
    const originalText = button.textContent;
    button.textContent = 'Added ✓';
    button.style.background = '#10b981';
    button.style.transform = 'scale(0.95)';

    setTimeout(() => {
        button.style.transform = 'scale(1)';
    }, 100);

    setTimeout(() => {
        button.textContent = originalText;
        button.style.background = '';
    }, 1500);
}

// Show feedback when item is already in package
function showAlreadyAddedFeedback(button) {
    const originalText = button.textContent;
    button.textContent = 'Already Added';
    button.style.background = '#737373';

    setTimeout(() => {
        button.textContent = originalText;
        button.style.background = '';
    }, 1500);
}

// Helper function to add camera by ID
function addCameraToPackage(cameraId, event) {
    const camera = allCameras.find(c => c.id === cameraId);
    if (camera) {
        const button = event ? event.target : null;
        addToPackage(camera, 'camera', button);
    }
}

// Helper function to add accessory by ID
function addAccessoryToPackage(accessoryId, event) {
    const accessory = allAccessories.find(a => a.id === accessoryId);
    if (accessory) {
        const button = event ? event.target : null;
        addToPackage(accessory, 'accessory', button);
    }
}

function removeFromPackage(lensId) {
    currentPackage = currentPackage.filter(l => {
        const itemId = l.id || `${l.brand || l.manufacturer}-${l.model || l.name}`;
        return itemId !== lensId;
    });
    updatePackageDisplay();
}

function updatePackageDisplay() {
    const container = document.getElementById('packageItems');
    const count = document.getElementById('packageCount');
    const badge = document.getElementById('packageBadge');

    count.textContent = currentPackage.length;
    if (badge) {
        badge.textContent = currentPackage.length;
        // Hide badge when count is 0
        badge.style.display = currentPackage.length === 0 ? 'none' : 'inline-flex';
    }

    if (currentPackage.length === 0) {
        container.innerHTML = '<p class="empty-state">No items added yet. Search for lenses, cameras, and accessories, then click "Add to Package"</p>';
        return;
    }

    // Validate package
    const validation = validatePackage(currentPackage);

    // Build validation display
    let validationHTML = '';
    if (validation.errors.length > 0 || validation.warnings.length > 0) {
        validationHTML = '<div class="package-validation">';

        if (validation.errors.length > 0) {
            validationHTML += '<div class="validation-errors"><strong>⚠ Compatibility Errors:</strong><ul>';
            validation.errors.forEach(err => {
                validationHTML += `<li>${err}</li>`;
            });
            validationHTML += '</ul></div>';
        }

        if (validation.warnings.length > 0) {
            validationHTML += '<div class="validation-warnings"><strong>⚠ Compatibility Warnings:</strong><ul>';
            validation.warnings.forEach(warn => {
                validationHTML += `<li>${warn}</li>`;
            });
            validationHTML += '</ul></div>';
        }

        validationHTML += '</div>';
    }

    // Build items display
    const itemsHTML = currentPackage.map(item => {
        const itemType = item.itemType || 'lens';
        const itemId = item.id || `${item.brand || item.manufacturer}-${item.model || item.name}`;

        let displayHTML = '';

        if (itemType === 'camera') {
            displayHTML = `
                <div class="package-item package-item-camera">
                    <div class="package-item-info">
                        <span class="item-type-badge">Camera</span>
                        <h4>${item.brand} ${item.model}</h4>
                        <p>Mount: ${item.native_mount} | Sensor: ${item.sensor_modes?.[0]?.crop_class || 'N/A'}</p>
                    </div>
                    <button class="btn-remove" onclick="removeFromPackage('${itemId}')">Remove</button>
                </div>
            `;
        } else if (itemType === 'accessory') {
            displayHTML = `
                <div class="package-item package-item-accessory">
                    <div class="package-item-info">
                        <span class="item-type-badge">Accessory</span>
                        <h4>${item.brand} ${item.model}</h4>
                        <p>${item.category} - ${item.subtype || ''}</p>
                    </div>
                    <button class="btn-remove" onclick="removeFromPackage('${itemId}')">Remove</button>
                </div>
            `;
        } else {
            // Lens
            displayHTML = `
                <div class="package-item package-item-lens">
                    <div class="package-item-info">
                        <span class="item-type-badge">Lens</span>
                        <h4>${item.manufacturer} ${item.name} ${item['focal length'] || ''}</h4>
                        <p>${item.category} - ${item.mount || item['original mount'] || 'N/A'}</p>
                    </div>
                    <button class="btn-remove" onclick="removeFromPackage('${itemId}')">Remove</button>
                </div>
            `;
        }

        return displayHTML;
    }).join('');

    container.innerHTML = validationHTML + itemsHTML;

    // Update mini cart display as well
    if (typeof updateMiniCartDisplay === 'function') {
        updateMiniCartDisplay();
    }
}

function clearPackage() {
    if (confirm('Clear all items from package?')) {
        currentPackage = [];
        updatePackageDisplay();
        updateMiniCartDisplay();
    }
}

function exportPackage() {
    if (currentPackage.length === 0) {
        alert('No items in package to export');
        return;
    }

    const text = 'Camera Package List\n\n' +
        currentPackage.map((lens, i) =>
            `${i + 1}. ${lens.manufacturer} ${lens.name} ${lens['focal length']}\n` +
            `   Category: ${lens.category}\n` +
            `   Mount: ${lens['original mount'] || 'N/A'}\n` +
            `   Aperture: T${lens['max aperture (T)'] || 'N/A'}\n`
        ).join('\n');

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'camera-package.txt';
    a.style.display = 'none';

    // Must append to DOM for mobile browsers
    document.body.appendChild(a);
    a.click();

    // Clean up
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
}

// Initialize on load
window.addEventListener('DOMContentLoaded', loadAllData);

// ========================================
// MINI CART FUNCTIONS
// ========================================

// Open mini cart
function openMiniCart(event) {
    if (event) {
        event.stopPropagation(); // Prevent nav item click
    }
    const miniCart = document.getElementById('miniCart');
    const overlay = document.getElementById('miniCartOverlay');

    miniCart.classList.add('active');
    overlay.classList.add('active');
    updateMiniCartDisplay();
}

// Close mini cart
function closeMiniCart() {
    const miniCart = document.getElementById('miniCart');
    const overlay = document.getElementById('miniCartOverlay');

    miniCart.classList.remove('active');
    overlay.classList.remove('active');
}

// Update mini cart display
function updateMiniCartDisplay() {
    const container = document.getElementById('miniCartItems');
    const countElement = document.getElementById('miniCartCount');

    if (!container) return;

    countElement.textContent = currentPackage.length;

    if (currentPackage.length === 0) {
        container.innerHTML = '<div class="mini-cart-empty">No items in package</div>';
        return;
    }

    container.innerHTML = currentPackage.map(item => {
        const itemType = item.itemType || 'lens';
        const itemId = item.id || `${item.brand || item.manufacturer}-${item.model || item.name}`;

        let icon = '📦';
        let name = '';
        let meta = '';

        if (itemType === 'camera') {
            icon = '🎥';
            name = `${item.brand} ${item.model}`;
            meta = `${item.native_mount || 'N/A'}`;
        } else if (itemType === 'lens') {
            icon = '🔍';
            name = `${item.manufacturer} ${item.name}`;
            meta = `${item['focal length'] || 'N/A'}`;
        } else if (itemType === 'accessory') {
            icon = '⚙️';
            name = `${item.brand} ${item.model}`;
            meta = `${item.category || 'N/A'}`;
        }

        return `
            <div class="mini-cart-item">
                <div class="mini-cart-item-image">${icon}</div>
                <div class="mini-cart-item-details">
                    <div class="mini-cart-item-name">${name}</div>
                    <div class="mini-cart-item-meta">${meta}</div>
                </div>
                <button class="mini-cart-item-remove" onclick="removeFromPackageAndUpdateMiniCart('${itemId}')" title="Remove">×</button>
            </div>
        `;
    }).join('');
}

// Remove from package and update mini cart
function removeFromPackageAndUpdateMiniCart(itemId) {
    removeFromPackage(itemId);
    updateMiniCartDisplay();
}

// View cart - navigate to package tab
function viewCart() {
    closeMiniCart();

    // Click the package nav item
    const packageNav = document.querySelector('.nav-item[data-tab="package"]');
    if (packageNav) {
        packageNav.click();
    }
}

// Checkout placeholder
function checkout() {
    if (currentPackage.length === 0) {
        alert('Your package is empty. Add items to continue.');
        return;
    }

    alert('Checkout functionality coming soon!\n\nYour package contains:\n' +
        currentPackage.map((item, i) => {
            const name = item.model || item.name || 'Unknown';
            const brand = item.brand || item.manufacturer || 'Unknown';
            return `${i + 1}. ${brand} ${name}`;
        }).join('\n')
    );
}

// ========================================
// CAMERA FUNCTIONS
// ========================================

// Search and display cameras
function searchCameras() {
    const searchText = document.getElementById('cameraSearch')?.value.toLowerCase() || '';
    const brand = document.getElementById('cameraBrand')?.value || '';
    const mount = document.getElementById('cameraMount')?.value || '';
    const sensor = document.getElementById('cameraSensor')?.value || '';

    let filtered = allCameras.filter(camera => {
        // Text search
        if (searchText && !`${camera.brand} ${camera.model}`.toLowerCase().includes(searchText)) {
            return false;
        }

        // Brand filter
        if (brand && camera.brand !== brand) {
            return false;
        }

        // Mount filter
        if (mount && camera.native_mount !== mount) {
            return false;
        }

        // Sensor filter
        if (sensor) {
            const hasSensorMode = camera.sensor_modes && camera.sensor_modes.some(mode =>
                mode.crop_class && mode.crop_class.includes(sensor)
            );
            if (!hasSensorMode) return false;
        }

        return true;
    });

    displayCameras(filtered);
}

// Display cameras
function displayCameras(cameras) {
    const container = document.getElementById('cameraResults');
    const count = document.getElementById('cameraResultCount');

    if (!container) return;

    count.textContent = `(${cameras.length} cameras)`;

    if (cameras.length === 0) {
        container.innerHTML = '<p class="empty-state">No cameras found matching your criteria</p>';
        return;
    }

    container.innerHTML = cameras.map(camera => {
        return `
        <div class="lens-card camera-card">
            <div class="lens-card-header">
                <div class="lens-manufacturer">${camera.brand}</div>
                <div class="lens-name">${camera.model}</div>
            </div>
            <div class="lens-details">
                <div class="lens-detail-row">
                    <span class="lens-detail-label">Mount:</span>
                    <span class="lens-detail-value">${camera.native_mount}</span>
                </div>
                ${camera.sensor_modes && camera.sensor_modes[0] ? `
                    <div class="lens-detail-row">
                        <span class="lens-detail-label">Sensor:</span>
                        <span class="lens-detail-value">${camera.sensor_modes[0].crop_class}</span>
                    </div>
                    <div class="lens-detail-row">
                        <span class="lens-detail-label">Resolution:</span>
                        <span class="lens-detail-value">${camera.sensor_modes[0].resolution}</span>
                    </div>
                ` : ''}
                ${camera.power ? `
                    <div class="lens-detail-row">
                        <span class="lens-detail-label">Power:</span>
                        <span class="lens-detail-value">${camera.power.mount} ${camera.power.voltage}</span>
                    </div>
                ` : ''}
                ${camera.media_slots ? `
                    <div class="lens-detail-row">
                        <span class="lens-detail-label">Media:</span>
                        <span class="lens-detail-value">${camera.media_slots.join(', ')}</span>
                    </div>
                ` : ''}
            </div>
            ${camera.flags && camera.flags.length > 0 ? `
                <div class="lens-category">${camera.flags.join(' • ')}</div>
            ` : ''}
            <div class="lens-card-actions">
                <button class="btn-add-package" onclick="addCameraToPackage('${camera.id}', event)">
                    Add to Package
                </button>
            </div>
        </div>
    `}).join('');
}

function clearCameraFilters() {
    if (document.getElementById('cameraSearch')) document.getElementById('cameraSearch').value = '';
    if (document.getElementById('cameraBrand')) document.getElementById('cameraBrand').value = '';
    if (document.getElementById('cameraMount')) document.getElementById('cameraMount').value = '';
    if (document.getElementById('cameraSensor')) document.getElementById('cameraSensor').value = '';
    searchCameras();
}

// ========================================
// ACCESSORY FUNCTIONS
// ========================================

// Current accessory filter state
let currentAccessoryCategory = 'all';

// Search accessories with text and category filter
function searchAccessories() {
    const searchText = document.getElementById('accessorySearch')?.value.toLowerCase() || '';

    let filtered = allAccessories;

    // Apply category filter
    if (currentAccessoryCategory !== 'all') {
        filtered = filtered.filter(acc => acc.category === currentAccessoryCategory);
    }

    // Apply search text filter
    if (searchText) {
        filtered = filtered.filter(acc => {
            const brand = (acc.brand || '').toLowerCase();
            const model = (acc.model || '').toLowerCase();
            const category = (acc.category || '').toLowerCase();
            const subtype = (acc.subtype || '').toLowerCase();

            return brand.includes(searchText) ||
                   model.includes(searchText) ||
                   category.includes(searchText) ||
                   subtype.includes(searchText);
        });
    }

    displayAccessories(filtered);
}

// Filter and display accessories
function filterAccessories(category) {
    currentAccessoryCategory = category;
    searchAccessories(); // Use the combined search function

    // Update active button
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.category === category) {
            btn.classList.add('active');
        }
    });
}

// Display accessories
function displayAccessories(accessories) {
    const container = document.getElementById('accessoryResults');
    const count = document.getElementById('accessoryResultCount');

    if (!container) return;

    count.textContent = `(${accessories.length} items)`;

    if (accessories.length === 0) {
        container.innerHTML = '<p class="empty-state">No accessories found</p>';
        return;
    }

    container.innerHTML = accessories.map(acc => {
        const specsHtml = acc.specs ? Object.entries(acc.specs).slice(0, 4).map(([key, value]) => `
            <div class="lens-detail-row">
                <span class="lens-detail-label">${key.replace(/_/g, ' ')}:</span>
                <span class="lens-detail-value">${value}</span>
            </div>
        `).join('') : '';

        return `
        <div class="lens-card accessory-card">
            <div class="lens-card-header">
                <div class="lens-manufacturer">${acc.brand}</div>
                <div class="lens-name">${acc.model}</div>
            </div>
            <div class="lens-details">
                ${specsHtml}
                ${acc.compatible_with ? `
                    <div class="lens-detail-row" style="margin-top: 10px;">
                        <span class="lens-detail-label" style="font-style: italic; color: #999;">
                            ${acc.compatible_with}
                        </span>
                    </div>
                ` : ''}
            </div>
            <div class="lens-category">${acc.category.replace(/_/g, ' ')}</div>
            <div class="lens-card-actions">
                <button class="btn-add-package" onclick="addAccessoryToPackage('${acc.id}', event)">
                    Add to Package
                </button>
            </div>
        </div>
    `}).join('');
}

// Initialize cameras and accessories after data loads
function initializeCamerasAndAccessories() {
    console.log('Initializing cameras and accessories...');
    console.log('Cameras loaded:', allCameras.length);
    console.log('Accessories loaded:', allAccessories.length);

    if (document.getElementById('cameraResults')) {
        searchCameras();
    }
    if (document.getElementById('accessoryResults')) {
        filterAccessories('all');
    }
}
