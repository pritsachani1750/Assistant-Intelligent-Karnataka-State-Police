// =====================================
// CREATE MAP
// =====================================

const map = L.map('map').setView([15.3173, 75.7139], 7);

// =====================================
// OPENSTREETMAP
// =====================================

L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
        attribution: '&copy; OpenStreetMap contributors'
    }
).addTo(map);

// =====================================
// TEST MARKER
// =====================================

L.marker([12.9716, 77.5946])
    .addTo(map)
    .bindPopup("<b>Bengaluru</b><br>Test Crime Location")
    .openPopup();