const map = L.map('map').setView([63.5, 10.5], 5); // Norway

// OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let userMarker = null;

// Get depth data from GEBCO
async function getDepth(lat, lng) {
  const url = `https://api.opentopodata.org/v1/gebco2020?locations=${lat},${lng}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.results && data.results.length) {
    return data.results[0].elevation;
  }
  throw new Error('Depth not found');
}

// Display depth on map click
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
  } catch {
    info.textContent = 'Depth data unavailable.';
  }
});

// Improved Geolocation handler
document.getElementById('locate-btn').onclick = () => {
  if (!navigator.geolocation) {
    alert('Geolocation not supported by your browser.');
    return;
  }

  // Explicitly request permission
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      map.setView([latitude, longitude], 10);

      if (userMarker) {
        userMarker.setLatLng([latitude, longitude]);
      } else {
        userMarker = L.marker([latitude, longitude]).addTo(map)
          .bindPopup('📍 You are here!').openPopup();
      }
    },
    (error) => {
      switch (error.code) {
        case error.PERMISSION_DENIED:
          alert('Location access denied by user.');
          break;
        case error.POSITION_UNAVAILABLE:
          alert('Position unavailable.');
          break;
        case error.TIMEOUT:
          alert('Geolocation request timed out.');
          break;
        default:
          alert('Unable to retrieve your location.');
      }
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  );
};
