const map = L.map('map').setView([63.5, 10.5], 5); // Centered on Norway

// Base tile layer: OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Marker for user's current location
let userMarker = null;

// Function to get depth using OpenTopoData GEBCO 2020
async function getDepth(lat, lng) {
  const url = `https://api.opentopodata.org/v1/gebco2020?locations=${lat},${lng}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.results && data.results.length) {
    return data.results[0].elevation; // Negative values underwater
  }
  throw new Error('Depth not found');
}

// Handle map clicks for depth
map.on('click', async (e) => {
  const { lat, lng } = e.latlng;
  const info = document.getElementById('info');
  info.textContent = 'Loading depth...';
  try {
    const depth = await getDepth(lat, lng);
    info.innerHTML = `
      Latitude: ${lat.toFixed(4)}, Longitude: ${lng.toFixed(4)}<br>
      Approx. Depth: ${Math.abs(depth).toFixed(1)} meters
    `;
  } catch (error) {
    info.textContent = 'Depth data unavailable.';
  }
});

// Geolocation button logic
document.getElementById('locate-btn').addEventListener('click', () => {
  if (!navigator.geolocation) {
    alert('Geolocation not supported.');
    return;
  }

  navigator.geolocation.getCurrentPosition((pos) => {
    const { latitude, longitude } = pos.coords;

    // Add or update marker
    if (userMarker) {
      userMarker.setLatLng([latitude, longitude]);
    } else {
      userMarker = L.marker([latitude, longitude]).addTo(map)
        .bindPopup('You are here!').openPopup();
    }

    // Move map to user's position
    map.setView([latitude, longitude], 10);
  }, () => {
    alert('Unable to retrieve your location.');
  });
});
