
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
        const cameraJson = JSON.stringify(camera).replace(/'/g, '&apos;');
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
                <button class="btn-add-package" onclick="addToPackage(${cameraJson}, 'camera')">
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

// Filter and display accessories
function filterAccessories(category) {
    let filtered = allAccessories;

    if (category !== 'all') {
        filtered = allAccessories.filter(acc => acc.category === category);
    }

    displayAccessories(filtered);

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
        const accJson = JSON.stringify(acc).replace(/'/g, '&apos;');
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
                <button class="btn-add-package" onclick="addToPackage(${accJson}, 'accessory')">
                    Add to Package
                </button>
            </div>
        </div>
    `}).join('');
}

// Initialize accessories and cameras on load
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (document.getElementById('accessoryResults')) {
            filterAccessories('all');
        }
        if (document.getElementById('cameraResults')) {
            searchCameras();
        }
    }, 1500);
});
