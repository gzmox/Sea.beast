const map = L.map('map').setView([20, 0], 3);

// Base tile layer: OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Bathymetry overlay tile layer from OpenSeaMap
const bathymetryTiles = L.tileLayer('https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png', {
  attribution: 'Map data © OpenSeaMap contributors',
  opacity: 0.6
}).addTo(map);

// Function to get depth using Open-Elevation API
async function getDepth(lat, lng) {
  const response = await fetch(`https://api.opentopodata.org/v1/gebco2020?locations=${lat},${lng}`);
  const data = await response.json();
  if (data && data.results && data.results[0]) {
    return data.results[0].elevation; // Depth (negative values underwater)
  }
  throw new Error('No depth data');
}

map.on('click', async (e) => {
  const { lat, lng } = e.latlng;
  const infoBox = document.getElementById('info');
  infoBox.innerHTML = 'Loading depth...';
  try {
    const depth = await getDepth(lat, lng);
    infoBox.innerHTML = `
      Latitude: ${lat.toFixed(4)}, Longitude: ${lng.toFixed(4)}<br>
      Approx. Depth: ${Math.abs(depth).toFixed(1)} meters
    `;
  } catch (error) {
    infoBox.innerHTML = 'Depth data unavailable.';
  }
});
